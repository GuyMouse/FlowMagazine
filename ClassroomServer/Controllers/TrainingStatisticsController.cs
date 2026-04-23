using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    [ApiController]
    [Route("api/trainingStatistics")]
    public class TrainingStatisticsController : ControllerBase
    {
        private readonly TrainingStatisticsService _trainingStatisticsService;

        public TrainingStatisticsController(TrainingStatisticsService trainingStatisticsService)
        {
            _trainingStatisticsService = trainingStatisticsService;
        }

        // POST: api/trainings
        [HttpPost]
        public async Task<IActionResult> CreateTrainingStatistics([FromBody] TrainingStatistics newTrainingStatistics)
        {
            var trainingStatistics = await _trainingStatisticsService.CreateTrainingStatistics(
                newTrainingStatistics.TrainingId,
                newTrainingStatistics.GradeAverage
            );
            return Ok(trainingStatistics);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditTrainingStatistics(string id, [FromBody] TrainingStatisticsUpdateDTO updatedTrainingStatistics)
        {
            var trainingStatistics = await _trainingStatisticsService.EditTrainingStatistics(
                id,
                updatedTrainingStatistics.TrainingId,
                updatedTrainingStatistics.GradeAverage,
                updatedTrainingStatistics.TaskStatisticsIds
            );
            if (trainingStatistics == null)
            {
                return NotFound("Training Statistics not found or is not editable.");
            }
            return Ok(trainingStatistics);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTrainingStatistics()
        {
            var trainingStatistics = await _trainingStatisticsService.GetAllTrainingStatisticsAsync();
            return Ok(trainingStatistics);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var trainingStatistics = await _trainingStatisticsService.GetTrainingStatisticsByIdAsync(id);
            if (trainingStatistics == null)
            {
                return NotFound();
            }
            return Ok(trainingStatistics);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrainingStatistics(string id)
        {
            var trainingStatistics = await _trainingStatisticsService.DeleteTrainingStatisticsAsync(id);
            if (trainingStatistics == null)
            {
                return NotFound("Training Statistics not found.");
            }
            return Ok(trainingStatistics);
        }
    }
}
