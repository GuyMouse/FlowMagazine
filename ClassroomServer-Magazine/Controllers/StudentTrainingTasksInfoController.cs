using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    [ApiController]
    [Route("api/studentTrainingTasksInfo")]
    public class StudentTrainingTasksInfoController : ControllerBase
    {
        private readonly StudentTrainingTasksInfoService _studentTrainingTasksInfoService;

        public StudentTrainingTasksInfoController(StudentTrainingTasksInfoService studentTrainingTasksInfoService)
        {
            _studentTrainingTasksInfoService = studentTrainingTasksInfoService;
        }
        
        [HttpPost]
        public async Task<IActionResult> CreateStudentTrainingTasksInfo([FromBody] StudentTrainingTaskInfo newStudentTrainingTasksInfo)
        {
            var studentTrainingTasksInfo = await _studentTrainingTasksInfoService.CreateStudentTrainingTasksInfo(
                newStudentTrainingTasksInfo.StudentTrainingGradeId.Value,
                newStudentTrainingTasksInfo.AnswerId,
                newStudentTrainingTasksInfo.IsCorrect
            );
            return Ok(newStudentTrainingTasksInfo);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditStudentTrainingTasksInfo(string id, [FromBody] StudentTrainingTasksInfoUpdateDTO updatedStudentTrainingTasksInfo)
        {
            var studentTrainingTasksInfo = await _studentTrainingTasksInfoService.EditStudentTrainingTasksInfo(
                id,
                updatedStudentTrainingTasksInfo.StudentTrainingGradeId,
                updatedStudentTrainingTasksInfo.AnswerId,
                updatedStudentTrainingTasksInfo.IsCorrect
            );
            if (studentTrainingTasksInfo == null)
            {
                return NotFound();
            }
            return Ok(studentTrainingTasksInfo);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTrainingTasks()
        {
            var studentTrainingTasksInfos = await _studentTrainingTasksInfoService.GetAllStudentTrainingTasksInfosAsync();
            return Ok(studentTrainingTasksInfos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var studentTrainingTasksInfo = await _studentTrainingTasksInfoService.GetStudentTrainingTasksInfoByIdAsync(id);
            if (studentTrainingTasksInfo == null)
            {
                return NotFound();
            }
            return Ok(studentTrainingTasksInfo);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrainingTask(string id)
        {
            var studentTrainingTasksInfo = await _studentTrainingTasksInfoService.DeleteStudentTrainingTasksInfoAsync(id);
            if (studentTrainingTasksInfo == null)
            {
                return NotFound("Student Training Tasks Info not found.");
            }
            return Ok(studentTrainingTasksInfo);
        }

    }
}
