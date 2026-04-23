using Microsoft.AspNetCore.Mvc;
using ClassroomServer.Services;
using ClassroomServer.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using ClassroomServer.DTOs;

namespace ClassroomServer.Controllers
{
    [ApiController]
    [Route("api/trainings")]
    public class TrainingsController : ControllerBase
    {
        private readonly TrainingService _trainingService;

        public TrainingsController(TrainingService trainingService)
        {
            _trainingService = trainingService;
        }

        // POST: api/trainings
        [HttpPost]
        public async Task<IActionResult> CreateTraining([FromBody] Training newTraining)
        {
            var training = await _trainingService.CreateTraining(
                newTraining.Location,
                newTraining.Title,
                newTraining.IsLive,
                newTraining.CourseId,
                newTraining.InstructorId
            );
            return Ok(training);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> EditTraining(string id, [FromBody] TrainingUpdateDTO updatedTraining)
        {
            var training = await _trainingService.EditTraining(
                id,
                updatedTraining.Location,
                updatedTraining.Title,
                updatedTraining.IsLive,
                updatedTraining.CourseId,
                updatedTraining.InstructorId,
                updatedTraining.StationIds,
                updatedTraining.TrainingStatisticsId,
                updatedTraining.StudentsData,
                updatedTraining.StudyUnitId,
                updatedTraining.Version
            );
            if (training == null)
            {
                return NotFound("Training not found or is not editable.");
            }
            return Ok(training);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTrainings()
        {
            var trainings = await _trainingService.GetAllTrainingsAsync();
            return Ok(trainings);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var training = await _trainingService.GetTrainingByIdAsync(id);
            if (training == null)
            {
                return NotFound();
            }
            return Ok(training);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTraining(string id)
        {
            var training = await _trainingService.DeleteTrainingAsync(id);
            if (training == null)
            {
                return NotFound("Training not found.");
            }
            return Ok(training);
        }
    }
}
