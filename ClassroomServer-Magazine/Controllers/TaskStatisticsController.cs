using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    [ApiController]
    [Route("api/taskStatistics")]
    public class TaskStatisticsController : ControllerBase
    {
        private readonly TaskStatisticsService _taskStatisticsService;

        public TaskStatisticsController(TaskStatisticsService taskStatisticsService)
        {
            _taskStatisticsService = taskStatisticsService;
        }
        
        [HttpPost]
        public async Task<IActionResult> CreateTaskStatistics([FromBody] TaskStatistics newTaskStatistics)
        {
            var taskStatistics = await _taskStatisticsService.CreateTaskStatistics(
                newTaskStatistics.TrainingStatisticsId,
                newTaskStatistics.TaskId,
                newTaskStatistics.SuccessfulAttempts,
                newTaskStatistics.FailedAttempts
            );
            return Ok(taskStatistics);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditTaskStatistics(string id, [FromBody] TaskStatisticsUpdateDTO updatedTaskStatistics)
        {
            var taskStatistics = await _taskStatisticsService.EditTaskStatistics(
                id,
                updatedTaskStatistics.TrainingStatisticsId,
                updatedTaskStatistics.TaskId,
                updatedTaskStatistics.SuccessfulAttempts,
                updatedTaskStatistics.FailedAttempts
            );
            if (taskStatistics == null)
            {
                return NotFound();
            }
            return Ok(taskStatistics);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTaskStatistics()
        {
            var taskStatistics = await _taskStatisticsService.GetAllTaskStatisticsAsync();
            return Ok(taskStatistics);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var taskStatistics = await _taskStatisticsService.GetTaskStatisticsByIdAsync(id);
            if (taskStatistics == null)
            {
                return NotFound();
            }
            return Ok(taskStatistics);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTaskStatistics(string id)
        {
            var taskStatistics = await _taskStatisticsService.DeleteTaskStatisticsAsync(id);
            if (taskStatistics == null)
            {
                return NotFound("Task Statistics not found.");
            }
            return Ok(taskStatistics);
        }

    }
}
