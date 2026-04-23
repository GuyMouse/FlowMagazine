using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomServer.Models.ContentManagement;
using ClassroomServer.Services.ContentManagement;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    

    [ApiController]
    [Route("api/lessons")]
    public class LessonsController : ControllerBase
    {
        private readonly LessonService _lessonService;

        public LessonsController(LessonService lessonService)
        {
            _lessonService = lessonService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateLesson([FromBody] Lesson newLesson)
        {
            var lesson = await _lessonService.CreateLesson(
                newLesson.Title,
                newLesson.Description,
                newLesson.SubjectId
            );
            return Ok(lesson);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditLesson(string id, [FromBody] LessonUpdateDTO updatedLesson)
        {
            var lesson = await _lessonService.EditLesson(
                id,
                updatedLesson.Title,
                updatedLesson.Description,
                updatedLesson.SubjectId
            );
            
            if (lesson == null)
            {
                return NotFound();
            }
            return Ok(lesson);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllLessons()
        {
            var lessons = await _lessonService.GetAllLessonsAsync();
            return Ok(lessons);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var lesson = await _lessonService.GetLessonByIdAsync(id);
            if (lesson == null)
            {
                return NotFound();
            }
            return Ok(lesson);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLesson(string id)
        {
            var lesson = await _lessonService.DeleteLesson(id);
            if (lesson == null)
            {
                return NotFound();
            }
            return Ok(lesson);
        }

    }
}
