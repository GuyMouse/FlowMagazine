using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    

    [ApiController]
    [Route("api/instructors")]
    public class InstructorsController : ControllerBase
    {
        private readonly InstructorService _instructorService;

        public InstructorsController(InstructorService instructorService)
        {
            _instructorService = instructorService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateInstructor([FromBody] Instructor newInstructor)
        {
             if (!Enum.IsDefined(typeof(AuthorityRank), newInstructor.AuthRank))
            {
                return BadRequest("Invalid authRank value.");
            }

            var instructor = await _instructorService.CreateInstructor(
                newInstructor.FirstName,
                newInstructor.LastName,
                newInstructor.AuthRank,
                newInstructor.CourseIds
            );
            return Ok(instructor);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditInstructor(string id, [FromBody] InstructorUpdateDTO updatedInstructor)
        {
            var instructor = await _instructorService.EditInstructor(
                id,
                updatedInstructor.FirstName,
                updatedInstructor.LastName,
                updatedInstructor.AuthRank,
                updatedInstructor.CourseIds
            );
            
            if (instructor == null)
            {
                return NotFound();
            }
            return Ok(instructor);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllInstructors()
        {
            var instructors = await _instructorService.GetAllInstructorsAsync();
            return Ok(instructors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var instructor = await _instructorService.GetInstructorByIdAsync(id);
            if (instructor == null)
            {
                return NotFound();
            }
            return Ok(instructor);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInstructor(string id)
        {
            var instructor = await _instructorService.DeleteInstructor(id);
            if (instructor == null)
            {
                return NotFound();
            }
        
            return Ok(instructor);
        }
    }
}
