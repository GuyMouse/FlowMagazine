using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomServer.Models.ContentManagement;
using ClassroomServer.Services.ContentManagement;
using System.Text.Json;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    /// <summary>
    /// DTO for creating a task base, according to the type of task
    /// </summary>
    public class BaseTaskRequest
    {
        public string Title { get; set; } = null!;
        public TaskType Type { get; set; }

        public string LessonId { get; set; } = null!;
        public JsonElement Data { get; set; }
    }

    

    [ApiController]
    [Route("api/allTasks")]
    public class TaskBaseController : ControllerBase
    {
        private readonly TaskBaseService _taskBaseService;

        public TaskBaseController(TaskBaseService taskBaseService)
        {
            _taskBaseService = taskBaseService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] BaseTaskRequest request)
        {
            var taskBase = await _taskBaseService.CreateTask(
                request.Title,
                request.Type,
                request.LessonId,
                request.Data
            );
            return Ok(taskBase);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditTask(string id, [FromBody] BaseTaskUpdateDTO updatedTaskBase)
        {
            var taskBase = await _taskBaseService.EditTaskBase(
                id,
                updatedTaskBase.Type,
                updatedTaskBase.Title,
                updatedTaskBase.LessonId,
                updatedTaskBase.Data
            );
            
            if (taskBase == null)
            {
                return NotFound();
            }
            return Ok(taskBase);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTasks()
        {
            var tasks = await _taskBaseService.GetAllTasksAsync();
            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var task = await _taskBaseService.GetTaskByIdAsync(id);
            if (task == null)
            {
                return NotFound();
            }
            return Ok(task);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(string id)
        {
            var task = await _taskBaseService.DeleteTask(id);
            if (task == null)
            {
                return NotFound();
            }
        
            return Ok(task);
        }       

    }
}
