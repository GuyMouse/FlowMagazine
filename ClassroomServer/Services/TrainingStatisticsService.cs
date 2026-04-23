using ClassroomServer.Models;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace ClassroomServer.Services
{
    public class TrainingStatisticsService
    {
        private readonly ClassroomDbContext _dbContext;

        public TrainingStatisticsService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TrainingStatistics> CreateTrainingStatistics(Guid trainingId, float gradeAverage)
        {
            var newTrainingStatistics = new TrainingStatistics
            {
                TrainingId = trainingId,
                GradeAverage = gradeAverage
            };

            _dbContext.TrainingStatistics.Add(newTrainingStatistics);
            await _dbContext.SaveChangesAsync();

            return newTrainingStatistics;
        }

        public async Task<TrainingStatistics> EditTrainingStatistics(string id, Guid? trainingId = null, float? gradeAverage = null, List<Guid>? taskStatisticsIds = null)
        {
            var trainingStatisticsId = Guid.Parse(id);
            var trainingStatistics = await _dbContext.TrainingStatistics.FindAsync(trainingStatisticsId);
            if (trainingStatistics == null)
            {
                return null;
            }

            trainingStatistics.TrainingId = trainingId ?? trainingStatistics.TrainingId;
            trainingStatistics.GradeAverage = gradeAverage ?? trainingStatistics.GradeAverage;
            trainingStatistics.TaskStatisticsIds = taskStatisticsIds ?? trainingStatistics.TaskStatisticsIds;

            await _dbContext.SaveChangesAsync();
            return trainingStatistics;
        }

        public async Task<List<TrainingStatistics>> GetAllTrainingStatisticsAsync()
        {
            return await _dbContext.TrainingStatistics.ToListAsync();
        }

        public async Task<TrainingStatistics> GetTrainingStatisticsByIdAsync(string id)
        {
            var trainingStatisticsId = Guid.Parse(id);
            var trainingStatistics = await _dbContext.TrainingStatistics.FindAsync(trainingStatisticsId);
            if (trainingStatistics == null)
            {
                return null;
            }
            trainingStatistics.TaskStatistics = await _dbContext.TaskStatistics.Where(t => t.TrainingStatisticsId == trainingStatisticsId).ToListAsync();

            foreach (var taskStatistics in trainingStatistics.TaskStatistics)
            {
                taskStatistics.Task = await _dbContext.Tasks.FindAsync(taskStatistics.TaskId);
            }
            return trainingStatistics;
        }
        

        public async Task<TrainingStatistics> DeleteTrainingStatisticsAsync(string id)
        {
            var trainingStatisticsId = Guid.Parse(id);
            var trainingStatistics = await _dbContext.TrainingStatistics.FindAsync(trainingStatisticsId);
            if (trainingStatistics == null)
            {
                return null;
            }
            
            _dbContext.TrainingStatistics.Remove(trainingStatistics);
            await _dbContext.SaveChangesAsync();

            return trainingStatistics;
        }
    }
}
