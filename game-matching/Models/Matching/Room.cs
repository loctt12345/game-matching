﻿using System.Text.Json.Serialization;

namespace game_matching.Models.Matching
{
    public class Room
    {
        public Room(string name)
        {
            Name = name;
        }

        public Guid Id { get; set; }
        public string Name { get; set; }
        [JsonIgnore]
        public ICollection<Player> Players { get; set; } = new List<Player>();
    }
}
