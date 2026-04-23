using ClassroomServer.Models;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace ClassroomServer.Services
{
    public class TrainingService
    {
        private readonly ClassroomDbContext _dbContext;

        public TrainingService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Training> CreateTraining(string location, string title, bool isLive, Guid? courseId = null, Guid? instructorId = null)
        {
            var newTraining = new Training
            {
                Location = location,
                Title = title,
                IsLive = isLive,
                CourseId = courseId,
                InstructorId = instructorId,
                CreationDate = DateTime.UtcNow
            };

            _dbContext.Trainings.Add(newTraining);
            await _dbContext.SaveChangesAsync();
            return newTraining;
        }

        public async Task<Training> EditTraining(string id, string? location = null, string? title = null, bool? isLive = null, Guid? courseId = null, Guid? instructorId = null, List<Guid>? stationIds = null, Guid? trainingStatisticsId = null, List<Guid>? studentsData = null, Guid? studyUnitId = null, int? version = null)
        {
            var trainingId = Guid.Parse(id);
            var training = await _dbContext.Trainings.FindAsync(trainingId);
            if (training == null || !training.IsLive)
            {
                return null;
            }

            training.Location = location ?? training.Location;
            training.Title = title ?? training.Title;
            training.IsLive = isLive ?? training.IsLive;
            training.CourseId = courseId ?? training.CourseId;
            training.InstructorId = instructorId ?? training.InstructorId;
            training.StationIds = stationIds ?? training.StationIds;
            training.TrainingStatisticsId = trainingStatisticsId ?? training.TrainingStatisticsId;
            training.StudyUnitId = studyUnitId ?? training.StudyUnitId;
            training.Version = version ?? training.Version;

            await _dbContext.SaveChangesAsync();
            return training;
        }

        public async Task<List<Training>> GetAllTrainingsAsync()
        {
            return await _dbContext.Trainings.ToListAsync();
        }

        public async Task<Training> GetTrainingByIdAsync(string id)
        {
            var trainingId = Guid.Parse(id);
            var training = await _dbContext.Trainings.FindAsync(trainingId);
            if (training == null)
            {
                return null;
            }
            training.Stations = await _dbContext.Stations.Where(s => s.TrainingId == trainingId).ToListAsync();

            foreach (var station in training.Stations)
            {
                station.TrainingTasks = await _dbContext.TrainingTasks.Where(t => t.TrainingId == training.Id).ToListAsync();
                foreach (var trainingTask in station.TrainingTasks)
                {
                    trainingTask.Task = await _dbContext.Tasks.FindAsync(trainingTask.TaskId);
                    trainingTask.Answer = await _dbContext.Answers.FindAsync(trainingTask.AnswerId);
                }
            }

            var trainingStatistics = await _dbContext.TrainingStatistics.FindAsync(training.TrainingStatisticsId);
            if (trainingStatistics == null)
            {
                return null;
            }
            trainingStatistics.TaskStatistics = await _dbContext.TaskStatistics.Where(t => t.TrainingStatisticsId == training.TrainingStatisticsId).ToListAsync();

            foreach (var taskStatistics in trainingStatistics.TaskStatistics)
            {
                taskStatistics.Task = await _dbContext.Tasks.FindAsync(taskStatistics.TaskId);
            }
            training.TrainingStatistics = trainingStatistics;

            return training;
        }
        

        public async Task<Training> DeleteTrainingAsync(string id)
        {
            var trainingId = Guid.Parse(id);
            var training = await _dbContext.Trainings.FindAsync(trainingId);
            if (training == null)
            {
                return null;
            }
            
            _dbContext.Trainings.Remove(training);
            await _dbContext.SaveChangesAsync();

            return training;
        }
    }
}
