using System.Collections.Generic;
using System.Net.Http.Headers;
using Microsoft.Graph;
using Microsoft.Identity.Web;

namespace Devoirs.Services
{
    public class GraphServiceClientProvider : IGraphServiceClientProvider
    {
        private const string TokenScheme = "Bearer";
        
        private readonly ITokenAcquisition _acquisition;
        
        public GraphServiceClientProvider(ITokenAcquisition acquisition)
        {
            _acquisition = acquisition;
        }
        
        public IGraphServiceClient Get(IEnumerable<string> scopes)
        {
            return new GraphServiceClient(new DelegateAuthenticationProvider(async message =>
            {
                message.Headers.Authorization = new AuthenticationHeaderValue(
                    TokenScheme, 
                    await _acquisition.GetAccessTokenForUserAsync(scopes)
                );
            }));
        }
    }
}
