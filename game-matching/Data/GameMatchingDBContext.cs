using game_matching.Models;
using game_matching.Models.Matching;
using Microsoft.EntityFrameworkCore;

namespace game_matching.Data
{
    public class GameMatchingDBContext : DbContext
    {
        public GameMatchingDBContext(DbContextOptions options) : base(options) 
        {
        }

        public DbSet<Player> Players { get; set; }

        public DbSet<Room> Rooms { get; set; }
    }
}
