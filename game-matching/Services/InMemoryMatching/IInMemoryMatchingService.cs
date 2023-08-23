using game_matching.Models;
using game_matching.Models.Matching;

namespace game_matching.Services.Matching
{
    public interface IInMemoryMatchingService
    {
        public Player? Matching(Player user);
        public bool CloseConnection(string userId);
        public Player? ReMatching(string playerId, string socketId);
        public Room? GetRoom(Guid roomId);
        public Player? GetPlayerBySocketId(string socketId);
    }
}
