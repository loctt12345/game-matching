﻿using game_matching.Data;
using game_matching.Models;
using game_matching.Models.Matching;
using Microsoft.EntityFrameworkCore;

namespace game_matching.Services.Matching
{
    public class InMemoryMatchingService : IInMemoryMatchingService
    {
        private readonly List<Player> PlayerList = new List<Player>();
        private readonly List<Room> RoomList = new List<Room>();

        public InMemoryMatchingService() 
        {
        }

        public Player? Matching(Player user)
        {
            Player? result = null;
            if (user != null) 
            {
                user.ChangeNumber = 1;
                user.Id = Guid.NewGuid();
                this.PlayerList.Add(user);

                var roomList = this.RoomList;
                var flag = false;
                foreach (var room in roomList)
                {
                    if (room.IsBlock == false)
                    {
                        var userInRoom = room.Players.FirstOrDefault();
                        if (userInRoom != null)
                        {
                            if ((userInRoom.Game.Equals(user.Game))
                                && (userInRoom.TeamSize == user.TeamSize)
                                && (room.Players.Count < userInRoom.TeamSize)
                                )
                            {
                                room.Players.Add(user);
                                user.Room = room;
                                flag = true;
                                break;
                            }
                        }
                    }
                }
                
                if (flag == false)
                {
                    var room = new Room("");
                    room.Id = Guid.NewGuid();
                    room.Players.Add(user);
                    user.Room = room;
                    this.RoomList.Add(room);
                }

                result = this.PlayerList.FirstOrDefault(p => p.Id == user.Id);
            }
            return result;
        }

        public Player? Matching(Player user, string roomId)
        {
            user.Id = Guid.NewGuid();
            user.ChangeNumber = 1;
            var room = this.GetRoom(new Guid(roomId));
            if (room != null)
            {
                room.Players.Add(user);
                user.Room = room;
                this.PlayerList.Add(user);
            }
            var result = this.PlayerList.FirstOrDefault(p => p.Id == user.Id);
            return result;
        }

        public bool CloseConnection(string socketId)
        {
            var result = false;
            var user = this.PlayerList.FirstOrDefault(p => p.SocketId == socketId);
            if ((user != null) && (user.Room != null))
            {
                if (user.ChangeNumber == 1)
                {
                    user.ChangeNumber = 2;
                }
                else 
                {
                    var roomId = user.Room.Id;
                    var room = this.RoomList.FirstOrDefault(p => p.Id == roomId);
                    if (room != null && room.Players != null)
                    {
                        var removedUser = this.PlayerList.Remove(user);
                        room.Players.Remove(user);
                        if (room.Players.Count == 0)
                        {
                            this.RoomList.Remove(room);
                        }
                        if (removedUser)
                        {
                            result = true;
                        }
                    }
                }
            }
            return result;
        }

        public Player? ReMatching(string playerId, string socketId)
        {
            var player = this.PlayerList.FirstOrDefault(p => p.Id == new Guid(playerId));
            if (player != null)
            {
                player.SocketId = socketId;
            }
            return player;
        }

        public Room? GetRoom(Guid roomId)
        {
            var room = this.RoomList.FirstOrDefault(p => p.Id == roomId);
            return room;
        }

        public Player? GetPlayerBySocketId(string socketId)
        {
            var player = this.PlayerList.FirstOrDefault(p => p.SocketId == socketId);
            return player;
        }

        public bool LockRoom(Guid roomId)
        {
            var room = GetRoom(roomId);
            if (room != null)
            {
                room.IsBlock = true;
                return true;
            }
            return false;
        }

        public bool UnlockRoom(Guid roomId)
        {
            var room = GetRoom(roomId);
            if (room != null)
            {
                room.IsBlock = false;
                return true;
            }
            return false;
        }

    }
}
