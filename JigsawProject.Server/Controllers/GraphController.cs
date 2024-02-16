using JigsawProject.Server;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class GraphController : ControllerBase
{


    private readonly JigsawProjectDBContext dBContext;

    public GraphController(JigsawProjectDBContext dBContext) {
        this.dBContext = dBContext;
    }

    

    [HttpGet]
    public ActionResult<IEnumerable<Node>> GetGraphData()
    {
        var allNodes = dBContext.Nodes.ToList();
        var filteredNodes = new List<Node>();

        foreach (var node in allNodes)
        {
            if (node.ParentId == "0")
            {
                filteredNodes.Add(node);
            }
        }

        return Ok(filteredNodes);
    }

    [HttpPost]
    public ActionResult<Node> AddNode(Node newNodeRequest)
    {
        Node newNode = new Node()
        {
            Id = (dBContext.Nodes.Count() + 1).ToString(),
            ParentId = newNodeRequest.ParentId,
            Children = newNodeRequest.Children
        };

        var parentNode = FindParentNode(dBContext.Nodes.ToList(), newNode.ParentId);
        

        if (parentNode != null)
        {
            parentNode.Children.Add(newNode);

            dBContext.SaveChanges();

            return Ok(newNode);
        }
        else if(newNode.ParentId == "0")
        {
            dBContext.Nodes.Add(newNode);

            dBContext.SaveChanges();

            return Ok(newNode);
        }
        else
        {
            return BadRequest("Parent node not found.");
        }
    }

  
    private Node FindParentNode(List<Node> nodes, string parentId)
    {
        foreach (var node in nodes)
        {
            if (node.Id == parentId)
            {
                return node;
            }

            var foundInChild = FindParentNode(node.Children, parentId);
            if (foundInChild != null)
            {
                return foundInChild;
            }
        }

        return null;
    }
}
