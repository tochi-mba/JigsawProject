using Microsoft.EntityFrameworkCore;
public class JigsawProjectDBContext : DbContext
{
    public JigsawProjectDBContext(DbContextOptions options) : base(options)
    {

    }

    public DbSet<Node> Nodes { get; set; }
}