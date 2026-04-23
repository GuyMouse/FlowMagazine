using ClassroomServer.Models;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace ClassroomServer.Services
{
    public class TrainingTaskStatusService
    {
        private readonly ClassroomDbContext _dbContext;

        public TrainingTaskStatusService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<TrainingTaskStatus> CreateTrainingTaskStatus(AssigneeTaskRole assigneeRole, Guid trainingTaskId, Status status)
        {
            var newTrainingTaskStatus = new TrainingTaskStatus
            {
                AssigneeRole = assigneeRole,
                TrainingTaskId = trainingTaskId,
                Status = status
            };

            _dbContext.TrainingTaskStatuses.Add(newTrainingTaskStatus);
            await _dbContext.SaveChangesAsync();
            return newTrainingTaskStatus;
        }

        public async Task<TrainingTaskStatus> EditTrainingTaskStatus(string id, AssigneeTaskRole? assigneeRole = null, Guid? trainingTaskId = null, Status? status = null)
        {
            var trainingTaskStatusId = Guid.Parse(id);
            var trainingTaskStatus = await _dbContext.TrainingTaskStatuses.FindAsync(trainingTaskStatusId);
            
            if (trainingTaskStatus == null)
            {
                return null;
            }

            trainingTaskStatus.AssigneeRole = assigneeRole ?? trainingTaskStatus.AssigneeRole;
            trainingTaskStatus.TrainingTaskId = trainingTaskId ?? trainingTaskStatus.TrainingTaskId;
            trainingTaskStatus.Status = status ?? trainingTaskStatus.Status;
            
            
            await _dbContext.SaveChangesAsync();
            return trainingTaskStatus;
        }

        public async Task<List<TrainingTaskStatus>> GetAllTrainingTaskStatusesAsync()
        {
            return await _dbContext.TrainingTaskStatuses.ToListAsync();
        }

        public async Task<TrainingTaskStatus> GetTrainingTaskStatusByIdAsync(string id)
        {
            var trainingTaskStatusId = Guid.Parse(id);
            var trainingTaskStatus = await _dbContext.TrainingTaskStatuses.FindAsync(trainingTaskStatusId);
            return trainingTaskStatus;
        }
    }
}
