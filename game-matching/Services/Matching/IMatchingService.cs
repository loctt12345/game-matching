using game_matching.Models;
using game_matching.Models.Matching;

namespace game_matching.Services.Matching
{
    public interface IMatchingService
    {
        public Task<Player?> Matching(Player user);
        public bool CloseConnection(string userId);
        public Task<Player?> ReMatching(string playerId, string socketId);
        public Room? GetRoom(Guid roomId);
        public Player? GetPlayerBySocketId(string socketId);
    }
}
