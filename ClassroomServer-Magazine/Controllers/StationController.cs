using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    

    [ApiController]
    [Route("api/stations")]
    public class StationController : ControllerBase
    {
        private readonly StationMonitorService _stationMonitorService;

        public StationController(StationMonitorService stationMonitorService)
        {
            _stationMonitorService = stationMonitorService;
        }

        // GET: api/station/{stationId}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStation(string id)
        {
            var station = await _stationMonitorService.GetStation(id);
            if (station == null)
            {
                return NotFound(new { error = $"Station {id} not found." });
            }

            return Ok(station);
        }

        // POST: api/station/update
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStationStatus(string id, [FromBody] StationUpdateDTO stationState)
        {
            var station = await _stationMonitorService.UpdateStation(
                id,
                stationState.StudentIds,
                stationState.TrainingId,
                stationState.StudyUnitId,
                stationState.StationName,
                stationState.TrainingTaskIds,
                stationState.CurrentTaskIndex
            );

            if (station == null)
            {
                return NotFound(new { error = $"Station {id} not found." });
            }

            return Ok(station);
        }
    }
}
