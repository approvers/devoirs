using System.Collections.Generic;
using Microsoft.Graph;

namespace Devoirs.Services
{
    public interface IGraphServiceClientProvider
    {
        public IGraphServiceClient Get(IEnumerable<string> scopes);
    }
}
