using System.Text.Json.Serialization;

public class Node
{
    public string Id { get; set; }
    public string ParentId { get; set; }
    public List<Node> Children { get; set; } = new List<Node>();
}