using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    [ApiController]
    [Route("api/studentTrainingGrades")]
    public class StudentTrainingGradesController : ControllerBase
    {
        private readonly StudentTrainingGradesService _studentTrainingGradesService;

        public StudentTrainingGradesController(StudentTrainingGradesService studentTrainingGradesService)
        {
            _studentTrainingGradesService = studentTrainingGradesService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateStudentTrainingGrade([FromBody] StudentTrainingGrade newStudentTrainingGrade)
        {
            var studentTrainingGrade = await _studentTrainingGradesService.CreateStudentTrainingGrade(
                newStudentTrainingGrade.StudentHistoryId,
                newStudentTrainingGrade.TrainingId,
                newStudentTrainingGrade.Grade
            );
            return Ok(studentTrainingGrade);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditStudentTrainingGrade(string id, [FromBody] StudentTrainingGradeUpdateDTO updatedStudentTrainingGrade)
        {
            var studentTrainingGrade = await _studentTrainingGradesService.EditStudentTrainingGrade(
                id,
                updatedStudentTrainingGrade.StudentHistoryId,
                updatedStudentTrainingGrade.TrainingId,
                updatedStudentTrainingGrade.Grade
            );
            if (studentTrainingGrade == null)
            {
                return NotFound("Student training grade not found or is not editable.");
            }
            return Ok(studentTrainingGrade);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStudentTrainingGrades()
        {
            var studentTrainingGrades = await _studentTrainingGradesService.GetAllStudentTrainingGradesAsync();
            return Ok(studentTrainingGrades);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var studentTrainingGrade = await _studentTrainingGradesService.GetStudentTrainingGradeByIdAsync(id);
            if (studentTrainingGrade == null)
            {
                return NotFound();
            }
            return Ok(studentTrainingGrade);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudentTrainingGrade(string id)
        {
            var studentTrainingGrade = await _studentTrainingGradesService.DeleteStudentTrainingGradeAsync(id);
            if (studentTrainingGrade == null)
            {
                return NotFound("Student training grade not found.");
            }
            return Ok(studentTrainingGrade);
        }

    }
}
