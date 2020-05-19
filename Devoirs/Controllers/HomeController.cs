using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Devoirs.Models;
using Devoirs.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Identity.Web;

namespace Devoirs.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IGraphServiceClientProvider _graph;

        public HomeController(ILogger<HomeController> logger, IGraphServiceClientProvider graph)
        {
            _logger = logger;
            _graph = graph;
        }

        [Authorize]
        [AuthorizeForScopes(Scopes = new[] {"user.read"})]
        public async Task<IActionResult> Index()
        {
            var client = _graph.Get(new[] {"user.read"});
            var user = await client.Me.Request().GetAsync();
            
            ViewData["Email"] = user.UserPrincipalName;

            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel {RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier});
        }
    }
}
