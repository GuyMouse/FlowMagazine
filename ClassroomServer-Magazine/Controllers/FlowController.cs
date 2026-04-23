using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ClassroomServer.Controllers
{
    public class StartFlowTrainingRequest
    {
        public string StudyUnitId { get; set; }
        public int NumberOfStations { get; set; }
    }

    [ApiController]
    [Route("api/flow")]
    public class FlowController : ControllerBase
    {
        private readonly FlowService _flowService;

        public FlowController(FlowService flowService)
        {
            _flowService = flowService;
        }

        [HttpGet("initializeNewStation")]
        public async Task<IActionResult> InitializeNewStation()
        {
            if (!await _flowService.IsTrainingLive())
            {
                return BadRequest(new { error = "No Live Training is available" });
            }
            
            var station = _flowService.InitializeStation();
            if (station == null)
            {
                return BadRequest(new { error = "No stations available" });
            }
            return Ok(station);
        }

        [HttpGet("activeStations")]
        public async Task<IActionResult> GetActiveStations()
        {
            if (!await _flowService.IsTrainingLive())
            {
                return BadRequest(new { error = "No Live Training is available" });
            }
            
            var stations = _flowService.GetActiveStations().ToList();
           
            return Ok(stations);
        }
    }
}