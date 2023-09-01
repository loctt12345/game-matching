using game_matching.Data;
using game_matching.Models;
using game_matching.Models.Matching;
using Microsoft.EntityFrameworkCore;

namespace game_matching.Services.Matching
{
    public class MatchingService : IMatchingService
    {
        private readonly GameMatchingDBContext _gameMatchingDBContext;

        public MatchingService(GameMatchingDBContext gameMatchingDBContext) 
        {
            _gameMatchingDBContext = gameMatchingDBContext;
        }

        public async Task<Player?> Matching(Player user)
        {
            Player? result = null;
            if (user != null) 
            {
                user.ChangeNumber = 1;
                await _gameMatchingDBContext.Players.AddAsync(user);
                await _gameMatchingDBContext.SaveChangesAsync();

                var roomList = await _gameMatchingDBContext.Rooms.Include(p => p.Players).ToListAsync();
                var flag = false;
                foreach (var room in roomList)
                {
                    var userInRoom = room.Players.FirstOrDefault();
                    if (userInRoom != null)
                    {
                        if ((userInRoom.Game.Equals(user.Game))
                            && (userInRoom.TeamSize == user.TeamSize)
                            && (room.Players.Count < userInRoom.TeamSize)
                            )
                        {
                            _gameMatchingDBContext.Attach(room);
                            room.Players.Add(user);
                            await _gameMatchingDBContext.SaveChangesAsync();
                            flag = true;
                            break;
                        }
                    }
                }
                
                if (flag == false)
                {
                    var room = new Room("", user);
                    room.Players.Add(user);
                    await _gameMatchingDBContext.Rooms.AddAsync(room);
                    await _gameMatchingDBContext.SaveChangesAsync();
                }

                result = await _gameMatchingDBContext.Players.FindAsync(user.Id);
            }
            return result;
        }

        public bool CloseConnection(string socketId)
        {
            var result = false;
            var user = _gameMatchingDBContext.Players.Include(p => p.Room)
                                                           .FirstOrDefault(p => p.SocketId == socketId);
            if ((user != null) && (user.Room != null))
            {
                if (user.ChangeNumber == 1)
                {
                    _gameMatchingDBContext.Attach(user);
                    user.ChangeNumber = 2;
                    _gameMatchingDBContext.SaveChanges();
                }
                else 
                {
                    var roomId = user.Room.Id;
                    var room = _gameMatchingDBContext.Rooms.Include(p => p.Players)
                                                                 .FirstOrDefault(p => p.Id == roomId);
                    if (room != null && room.Players != null)
                    {
                        var removedUser = _gameMatchingDBContext.Players.Remove(user);
                        if (room.Players.Count == 1)
                        {
                            _gameMatchingDBContext.Rooms.Remove(room);
                        }
                        _gameMatchingDBContext.SaveChanges();
                        if (removedUser != null)
                        {
                            result = true;
                        }
                    }
                }
            }
            return result;
        }

        public async Task<Player?> ReMatching(string playerId, string socketId)
        {
            var player = _gameMatchingDBContext.Players.Include(p => p.Room).FirstOrDefault(p => p.Id == new Guid(playerId));
            if (player != null)
            {
                _gameMatchingDBContext.Attach(player);
                player.SocketId = socketId;
                await _gameMatchingDBContext.SaveChangesAsync();
            }
            return player;
        }

        public Room? GetRoom(Guid roomId)
        {
            var room = _gameMatchingDBContext.Rooms.Include(p => p.Players).FirstOrDefault(p => p.Id == roomId);
            return room;
        }

        public Player? GetPlayerBySocketId(string socketId)
        {
            var player = _gameMatchingDBContext.Players.Include(p => p.Room).FirstOrDefault(p => p.SocketId == socketId);
            return player;
        }

    }
}
