using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    [ApiController]
    [Route("api/studentHistories")]
    public class StudentHistoriesController : ControllerBase
    {
        private readonly StudentHistoriesService _studentHistoriesService;

        public StudentHistoriesController(StudentHistoriesService studentHistoryService)
        {
            _studentHistoriesService = studentHistoryService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateStudentHistory([FromBody] StudentHistory newStudentHistory)
        {
            var studentHistory = await _studentHistoriesService.CreateStudentHistory(
                newStudentHistory.StudentId
            );
            return Ok(studentHistory);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditStudentHistory(string id, [FromBody] StudentHistoryUpdateDTO updatedStudentHistory)
        {
            var studentHistory = await _studentHistoriesService.EditStudentHistory(
                id,
                updatedStudentHistory.StudentId,
                updatedStudentHistory.StudentTrainingGradeIds
            );
            if (studentHistory == null)
            {
                return NotFound();
            }
            return Ok(studentHistory);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStudentHistories()
        {
            var studentHistories = await _studentHistoriesService.GetAllStudentHistoriesAsync();
            return Ok(studentHistories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var studentHistory = await _studentHistoriesService.GetStudentHistoryByIdAsync(id);
            if (studentHistory == null)
            {
                return NotFound();
            }
            return Ok(studentHistory);
        }

        // TODO: implement these as well
        // [HttpGet("student/{id}")]
    }
}
