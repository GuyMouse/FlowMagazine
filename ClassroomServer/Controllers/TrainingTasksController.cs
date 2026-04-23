using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    [ApiController]
    [Route("api/trainingTasks")]
    public class TrainingTasksController : ControllerBase
    {
        private readonly TrainingTaskService _trainingTaskService;

        public TrainingTasksController(TrainingTaskService trainingTaskService)
        {
            _trainingTaskService = trainingTaskService;
        }
        
        [HttpPost]
        public async Task<IActionResult> CreateTrainingTask([FromBody] TrainingTask newTrainingTask)
        {
            var trainingTask = await _trainingTaskService.CreateTrainingTask(
                newTrainingTask.Type,
                newTrainingTask.TrainingId,
                newTrainingTask.TaskId
                // newTrainingTask.Content,
                // newTrainingTask.Answer
            );
            return Ok(trainingTask);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditTrainingTask(string id, [FromBody] TrainingTaskUpdateDTO updatedTrainingTask)
        {
            var trainingTask = await _trainingTaskService.EditTrainingTask(
                id,
                updatedTrainingTask.Type,
                updatedTrainingTask.TrainingId//,
                // updatedTrainingTask.Content,
                // updatedTrainingTask.Answer
            );
            if (trainingTask == null)
            {
                return NotFound();
            }
            return Ok(trainingTask);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTrainingTasks()
        {
            var trainingTasks = await _trainingTaskService.GetAllTrainingTasksAsync();
            return Ok(trainingTasks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var trainingTask = await _trainingTaskService.GetTrainingTaskByIdAsync(id);
            if (trainingTask == null)
            {
                return NotFound();
            }
            return Ok(trainingTask);
        }

    }
}
