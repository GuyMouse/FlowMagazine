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
    [Route("api/subjects")]
    public class SubjectsController : ControllerBase
    {
        private readonly SubjectService _subjectService;

        public SubjectsController(SubjectService subjectService)
        {
            _subjectService = subjectService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateSubject([FromBody] Subject newSubject)
        {
            var subject = await _subjectService.CreateSubject(
                newSubject.Title,
                newSubject.Description
            );
            return Ok(subject);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditSubject(string id, [FromBody] SubjectUpdateDTO updatedSubject)
        {
            var subject = await _subjectService.EditSubject(
                id,
                updatedSubject.Title,
                updatedSubject.Description
            );
            
            if (subject == null)
            {
                return NotFound();
            }
            return Ok(subject);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSubjects()
        {
            var subjects = await _subjectService.GetAllSubjectsAsync();
            return Ok(subjects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var subject = await _subjectService.GetSubjectByIdAsync(id);
            if (subject == null)
            {
                return NotFound();
            }
            return Ok(subject);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubject(string id)
        {
            var subject = await _subjectService.DeleteSubject(id);
            if (subject == null)
            {
                return NotFound();
            }
            return Ok(subject);
        }

    }
}
