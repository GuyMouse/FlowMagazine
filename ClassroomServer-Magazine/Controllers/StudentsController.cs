using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    

    [ApiController]
    [Route("api/students")]
    public class StudentsController : ControllerBase
    {
        private readonly StudentService _studentService;

        public StudentsController(StudentService studentService)
        {
            _studentService = studentService;
        }
        
        [HttpPost]
        public async Task<IActionResult> CreateStudent([FromBody] Student newStudent)
        {
            var student = await _studentService.CreateStudent(
                newStudent.FirstName,
                newStudent.LastName,
                newStudent.StudentId
            );

            if (student == null)
            {
                return BadRequest("Student with this id number already exists");
            }
            return Ok(student);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditStudent(string id, [FromBody] StudentUpdateDTO updatedStudent)
        {
            var student = await _studentService.EditStudent(
                id,
                updatedStudent.FirstName,
                updatedStudent.LastName,
                updatedStudent.StudentId
            );
            
            if (student == null)
            {
                return BadRequest("Error editing student: Student not found, or student with this id number already exists");
            }
            return Ok(student);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStudents()
        {
            var students = await _studentService.GetAllStudentsAsync();
            return Ok(students);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var student = await _studentService.GetStudentByIdAsync(id);
            if (student == null)
            {
                return NotFound();
            }
            return Ok(student);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(string id)
        {
            var student = await _studentService.DeleteStudent(id);
            if (student == null)
            {
                return NotFound();
            }
        
            return Ok(student);
        }

        [HttpGet("idNumber/{idNumber}")]
        public async Task<IActionResult> GetByIdNumber(string idNumber)
        {
            var student = await _studentService.GetStudentByIdNumberAsync(idNumber);
            if (student == null)
            {
                return NotFound();
            }
            return Ok(student);
        }


    }
}
