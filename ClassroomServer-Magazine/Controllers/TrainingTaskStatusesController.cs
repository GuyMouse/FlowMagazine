using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    [ApiController]
    [Route("api/trainingTaskStatuses")]
    public class TrainingTaskStatusesController : ControllerBase
    {
        private readonly TrainingTaskStatusService _trainingTaskStatusService;

        public TrainingTaskStatusesController(TrainingTaskStatusService trainingTaskStatusService)
        {
            _trainingTaskStatusService = trainingTaskStatusService;
        }
        
        [HttpPost]
        public async Task<IActionResult> CreateTrainingTask([FromBody] TrainingTaskStatus newTrainingTaskStatus)
        {
            var trainingTask = await _trainingTaskStatusService.CreateTrainingTaskStatus(
                newTrainingTaskStatus.AssigneeRole,
                newTrainingTaskStatus.TrainingTaskId,
                newTrainingTaskStatus.Status
            );
            return Ok(trainingTask);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditTrainingTaskStatus(string id, [FromBody] TrainingTaskStatusUpdateDTO updatedTrainingTaskStatus)
        {
            var trainingTaskStatus = await _trainingTaskStatusService.EditTrainingTaskStatus(
                id,
                updatedTrainingTaskStatus.AssigneeRole,
                updatedTrainingTaskStatus.TrainingTaskId,
                updatedTrainingTaskStatus.Status
            );
            if (trainingTaskStatus == null)
            {
                return NotFound();
            }
            return Ok(trainingTaskStatus);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTrainingTaskStatuses()
        {
            var trainingTaskStatuses = await _trainingTaskStatusService.GetAllTrainingTaskStatusesAsync();
            return Ok(trainingTaskStatuses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var trainingTaskStatus = await _trainingTaskStatusService.GetTrainingTaskStatusByIdAsync(id);
            if (trainingTaskStatus == null)
            {
                return NotFound();
            }
            return Ok(trainingTaskStatus);
        }

    }
}
