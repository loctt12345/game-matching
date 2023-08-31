using game_matching.Data;
using game_matching.Models;
using game_matching.Models.Matching;
using game_matching.Services.Matching;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace game_matching.Hubs
{
    public class MatchingHub : Hub
    {
        private readonly ILogger<MatchingHub> _logger;
        private readonly InMemoryMatchingService _matchingService;

        public MatchingHub(ILogger<MatchingHub> logger, InMemoryMatchingService matchingService)
        {
            _logger = logger;
            _matchingService = matchingService;
        }

        public override async Task<Object> OnDisconnectedAsync(Exception? exception)
        {
            var thisPlayer = _matchingService.GetPlayerBySocketId(Context.ConnectionId);
            if (thisPlayer != null && thisPlayer.Room != null)
            {
                if (thisPlayer.ChangeNumber == 2)
                {
                    var room = _matchingService.GetRoom(thisPlayer.Room.Id);
                    if (room != null)
                    {
                        var playerList = room.Players;
                        foreach (var player in playerList)
                        {
                            if (player.Id != thisPlayer.Id)
                            {
                                await Clients.Client(player.SocketId).SendAsync("PlayerDisconnected", thisPlayer);
                            }
                        }
                    }

                }
            }
            _matchingService.CloseConnection(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }

        public async Task Matching(Object messageObject)
        {
            if (messageObject != null)
            {
                string? message = messageObject.ToString();
                if (message != null)
                {
                    var user = JsonConvert.DeserializeObject<Player>(message);
                    if (user != null)
                    {
                        user.SocketId = Context.ConnectionId;
                        var result = _matchingService.Matching(user);
                        if (result != null)
                        {
                            if (result.Room != null)
                            {
                                await Clients.Caller.SendAsync("Matched", result.Room, result.Id);
                            }
                        }
                        else
                        {
                            await Clients.Caller.SendAsync("Match fail");
                        }
                    }
                }
            }
        }

        public async Task MatchingWithRoomId(string roomId, string name)
        {
            if (roomId != null && name != null)
            {
                var room = _matchingService.GetRoom(new Guid(roomId));
                if (room != null)
                {
                    var anyUser = room.Players.FirstOrDefault();
                    if (anyUser != null)
                    {
                        var thisUser = new Player(Context.ConnectionId, name, anyUser.Game, anyUser.TeamSize);
                        var result = _matchingService.Matching(thisUser, roomId);
                        if (result != null)
                        {
                            await Clients.Caller.SendAsync("Matched", result.Room, result.Id);
                        }
                    }
                }
            }
        }

        public async Task ReMatching(string playerId)
        {
            var thisPlayer = _matchingService.ReMatching(playerId, Context.ConnectionId);
            if (thisPlayer != null)
            {
                if (thisPlayer.Room != null)
                {
                    var room = _matchingService.GetRoom(thisPlayer.Room.Id);
                    if (room != null)
                    {
                        await Clients.Caller.SendAsync("ReMatched", room.Players);
                        var playerList = room.Players;
                        foreach (var player in playerList)
                        {
                            if (player.Id != thisPlayer.Id)
                            {
                                await Clients.Client(player.SocketId).SendAsync("PlayerAdded", thisPlayer);
                            }
                        }

                    }
                }
            }
            else
            {
                await Clients.Caller.SendAsync("ReMatchedFail");
            }
        }

        public async Task ChatRequest(string message)
        {
            var thisPlayer = _matchingService.GetPlayerBySocketId(Context.ConnectionId);
            if ((thisPlayer != null) && (thisPlayer.Room != null))
            {
                var room = _matchingService.GetRoom(thisPlayer.Room.Id);
                if (room != null)
                {
                    var playerList = room.Players;
                    foreach (var player in playerList)
                    {
                        if (player.Id != thisPlayer.Id)
                        {
                            await Clients.Clients(player.SocketId).SendAsync("MessageCome", message, thisPlayer.Name);
                        }
                    }
                }
            }
            else
            {
                await Clients.Caller.SendAsync("ReMatchedFail");
            }
        }

        public async Task MicRequest(string data, string type, string toSocketId)
        {
            var thisPlayer = _matchingService.GetPlayerBySocketId(Context.ConnectionId);
            if (thisPlayer != null)
            {
                await Clients.Clients(toSocketId).SendAsync("MicResponse", data, type, Context.ConnectionId);
            }
            else
            {
                await Clients.Caller.SendAsync("ReMatchedFail");
            }
        }

        public async Task OnChatting()
        {
            var thisPlayer = _matchingService.GetPlayerBySocketId(Context.ConnectionId);
            if ((thisPlayer != null) && (thisPlayer.Room != null))
            {
                var room = _matchingService.GetRoom(thisPlayer.Room.Id);
                if (room != null)
                {
                    var playerList = room.Players;
                    foreach (var player in playerList)
                    {
                        if (player.Id != thisPlayer.Id)
                        {
                            await Clients.Clients(player.SocketId).SendAsync("IsChatting");
                        }
                    }
                }
            }
        }

        public async Task GetRoomId()
        {
            var thisPlayer = _matchingService.GetPlayerBySocketId(Context.ConnectionId);
            if ((thisPlayer != null) && (thisPlayer.Room != null))
            {
                await Clients.Caller.SendAsync("ReceiveRoom", thisPlayer.Room.Id);
            }
        }

        public async Task LockRoom()
        {
            var thisPlayer = _matchingService.GetPlayerBySocketId(Context.ConnectionId);
            if ((thisPlayer != null) && (thisPlayer.Room != null))
            {
                var result = _matchingService.LockRoom(thisPlayer.Room.Id);
                if (result)
                {
                    await Clients.Caller.SendAsync("LockedRoom");
                }
            }
        }

        public async Task UnLockRoom()
        {
            var thisPlayer = _matchingService.GetPlayerBySocketId(Context.ConnectionId);
            if ((thisPlayer != null) && (thisPlayer.Room != null))
            {
                var result = _matchingService.UnlockRoom(thisPlayer.Room.Id);
                if (result)
                {
                    await Clients.Caller.SendAsync("UnlockedRoom");
                }
            }
        }

    }
}
