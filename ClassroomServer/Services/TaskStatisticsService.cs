using ClassroomServer.Models;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
// using System.Threading.Tasks;
using System.Linq;

namespace ClassroomServer.Services
{
    public class TaskStatisticsService
    {
        private readonly ClassroomDbContext _dbContext;

        public TaskStatisticsService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TaskStatistics> CreateTaskStatistics(Guid trainingStatisticsId, Guid taskId, int successfulAttempts, int failedAttempts)
        {
            var newTaskStatistics = new TaskStatistics
            {
                TrainingStatisticsId = trainingStatisticsId,
                TaskId = taskId,
                SuccessfulAttempts = successfulAttempts,
                FailedAttempts = failedAttempts
            };

            _dbContext.TaskStatistics.Add(newTaskStatistics);
            await _dbContext.SaveChangesAsync();
            newTaskStatistics.Task = await _dbContext.Tasks.FindAsync(taskId);

            if (newTaskStatistics.Task == null)
            {
                throw new Exception($"Task with id {taskId} not found");
            }

            return newTaskStatistics;
        }

        public async Task<TaskStatistics> EditTaskStatistics(string id, Guid? trainingStatisticsId = null, Guid? taskId = null, int? successfulAttempts = null, int? failedAttempts = null)
        {
            var taskStatisticsId = Guid.Parse(id);
                var taskStatistics = await _dbContext.TaskStatistics.FindAsync(taskStatisticsId);
            
            if (taskStatistics == null)
            {
                return null;
            }

            taskStatistics.TrainingStatisticsId = trainingStatisticsId ?? taskStatistics.TrainingStatisticsId;
            taskStatistics.TaskId = taskId ?? taskStatistics.TaskId;
            taskStatistics.SuccessfulAttempts = successfulAttempts ?? taskStatistics.SuccessfulAttempts;
            taskStatistics.FailedAttempts = failedAttempts ?? taskStatistics.FailedAttempts;
            
            await _dbContext.SaveChangesAsync();
            return taskStatistics;
        }

        public async Task<List<TaskStatistics>> GetAllTaskStatisticsAsync()
        {
            return await _dbContext.TaskStatistics.ToListAsync();
        }

        public async Task<TaskStatistics> GetTaskStatisticsByIdAsync(string id)
        {
            var taskStatisticsId = Guid.Parse(id);
            var taskStatistics = await _dbContext.TaskStatistics.FindAsync(taskStatisticsId);

            taskStatistics.Task = await _dbContext.Tasks.FindAsync(taskStatistics.TaskId);
            
            return taskStatistics;
        }

        public async Task<TaskStatistics> DeleteTaskStatisticsAsync(string id)
        {
            var taskStatisticsId = Guid.Parse(id);
            var taskStatistics = await _dbContext.TaskStatistics.FindAsync(taskStatisticsId);
            if (taskStatistics == null)
            {
                return null;
            }

            _dbContext.TaskStatistics.Remove(taskStatistics);
            await _dbContext.SaveChangesAsync();

            return taskStatistics;
        }
    }
}
