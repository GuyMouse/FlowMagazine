using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    

    [ApiController]
    [Route("api/courses")]
    public class CoursesController : ControllerBase
    {
        private readonly CourseService _courseService;

        public CoursesController(CourseService courseService)
        {
            _courseService = courseService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateCourse([FromBody] Course newCourse)
        {
            var course = await _courseService.CreateCourse(
                newCourse.Name,
                newCourse.Status,
                newCourse.StudyUnitIds,
                newCourse.TrainingIds,
                newCourse.InstructorId,
                newCourse.StudentIds,
                newCourse.Location
            );
            return Ok(course);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditCourse(string id, [FromBody] CourseUpdateDTO updatedCourse)
        {
            var course = await _courseService.EditCourse(
                id,
                updatedCourse.Name,
                updatedCourse.Status,
                updatedCourse.StudyUnitIds,
                updatedCourse.TrainingIds,
                updatedCourse.InstructorId,
                updatedCourse.StudentIds,
                updatedCourse.Location
            );
            if (course == null)
            {
                return NotFound();
            }
            return Ok(course);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCourses()
        {
            var courses = await _courseService.GetAllCoursesAsync();
            return Ok(courses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var course = await _courseService.GetCourseByIdAsync(id);
            if (course == null)
            {
                return NotFound();
            }
            return Ok(course);
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourse(string id)
        {
            var course = await _courseService.DeleteCourse(id);
            if (course == null)
            {
                return NotFound();
            }
            return Ok(course);
        }
    }
}
