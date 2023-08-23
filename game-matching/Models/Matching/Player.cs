using System.Text.Json.Serialization;

namespace game_matching.Models.Matching
{
    public class Player
    {
        public Player(string socketId, string name, string game, int teamSize)
        {
            SocketId = socketId;
            Name = name;
            Game = game;
            TeamSize = teamSize;
        }

        public Guid Id { get; set; }
        public string SocketId { get; set; }
        public string Name { get; set; }
        public string Game { get; set; }
        public int TeamSize { get; set; }
        public int ChangeNumber { get; set; } = 0;
        [JsonIgnore]
        public Room? Room { get; set; }
    }
}
