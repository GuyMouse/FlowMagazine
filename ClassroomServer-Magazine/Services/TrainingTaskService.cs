using ClassroomServer.Models;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
// using System.Threading.Tasks;
using System.Linq;

namespace ClassroomServer.Services
{
    public class TrainingTaskService
    {
        private readonly ClassroomDbContext _dbContext;

        public TrainingTaskService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TrainingTask> CreateTrainingTask(TaskType type, Guid training, Guid task)
        {
            var newTrainingTask = new TrainingTask
            {
                Type = type,
                TrainingId = training,
                TaskId = task,
                // Content = content,
                // Answer = answer
            };

            _dbContext.TrainingTasks.Add(newTrainingTask);
            await _dbContext.SaveChangesAsync();
            newTrainingTask.Task = await _dbContext.Tasks.FindAsync(task);

            if (newTrainingTask.Task == null)
            {
                throw new Exception($"Task with id {task} not found");
            }

            return newTrainingTask;
        }

        public async Task<TrainingTask> EditTrainingTask(string id, TaskType? type = null, Guid? training = null, Guid? task = null, Guid? answer = null, Guid? status = null)
        {
            var trainingTaskId = Guid.Parse(id);
            var trainingTask = await _dbContext.TrainingTasks.FindAsync(trainingTaskId);
            
            if (trainingTask == null)
            {
                return null;
            }

            trainingTask.Type = type ?? trainingTask.Type;
            trainingTask.TrainingId = training ?? trainingTask.TrainingId;
            trainingTask.TaskId = task ?? trainingTask.TaskId;
            trainingTask.AnswerId = answer ?? trainingTask.AnswerId;
            trainingTask.StatusId = status ?? trainingTask.StatusId;
            
            await _dbContext.SaveChangesAsync();
            return trainingTask;
        }

        public async Task<List<TrainingTask>> GetAllTrainingTasksAsync()
        {
            return await _dbContext.TrainingTasks.ToListAsync();
        }

        public async Task<TrainingTask> GetTrainingTaskByIdAsync(string id)
        {
            var trainingTaskId = Guid.Parse(id);
            var trainingTask = await _dbContext.TrainingTasks.FindAsync(trainingTaskId);

            trainingTask.Task = await _dbContext.Tasks.FindAsync(trainingTask.TaskId);
            trainingTask.Answer = await _dbContext.Answers.FindAsync(trainingTask.AnswerId);
            
            return trainingTask;
        }

        public async Task<TrainingTask> DeleteTrainingTaskAsync(string id)
        {
            var trainingTaskId = Guid.Parse(id);
            var trainingTask = await _dbContext.TrainingTasks.FindAsync(trainingTaskId);
            if (trainingTask == null)
            {
                return null;
            }

            _dbContext.TrainingTasks.Remove(trainingTask);
            await _dbContext.SaveChangesAsync();

            return trainingTask;
        }
    }
}
