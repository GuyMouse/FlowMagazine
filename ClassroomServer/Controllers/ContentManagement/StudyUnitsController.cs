using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using ClassroomServer.Services.ContentManagement;
using ClassroomServer.Models.ContentManagement;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers.ContentManagement
{
    

    [ApiController]
    [Route("api/studyUnits")]
    public class StudyUnitsController : ControllerBase
    {
        private readonly StudyUnitService _studyUnitService;

        public StudyUnitsController(StudyUnitService studyUnitService)
        {
            _studyUnitService = studyUnitService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateStudyUnit([FromBody] StudyUnit newStudyUnit)
        {
            try
            {
                var studyUnit = await _studyUnitService.CreateStudyUnit(
                    newStudyUnit.Title,
                    newStudyUnit.TaskIds,
                    newStudyUnit.CourseId
                );
                return Ok(studyUnit);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while creating the study unit.", details = ex.Message });
            }
        }
        

        [HttpPut("{id}")]
        public async Task<IActionResult> EditStudyUnit(string id, [FromBody] StudyUnitUpdateDTO updatedStudyUnit)
        {
            var studyUnit = await _studyUnitService.EditStudyUnit(
                id,
                updatedStudyUnit.Title,
                updatedStudyUnit.Description,
                updatedStudyUnit.TrainingId,
                updatedStudyUnit.TaskIds
            );
            if (studyUnit == null)
            {
                return NotFound();
            }
            return Ok(studyUnit);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllStudyUnits()
        {
            var studyUnits = await _studyUnitService.GetAllStudyUnitsAsync();
            return Ok(studyUnits);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var studyUnit = await _studyUnitService.GetStudyUnitByIdAsync(id);
            if (studyUnit == null)
            {
                return NotFound();
            }
            return Ok(studyUnit);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudyUnit(string id)
        {
            var studyUnit = await _studyUnitService.DeleteStudyUnit(id);
            if (studyUnit == null)
            {
                return NotFound();
            }
        
            return Ok(studyUnit);
        }

    }
}
