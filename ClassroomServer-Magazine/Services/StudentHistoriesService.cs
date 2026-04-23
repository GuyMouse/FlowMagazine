using ClassroomServer.Models;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace ClassroomServer.Services
{
    public class StudentHistoriesService
    {
        private readonly ClassroomDbContext _dbContext;

        public StudentHistoriesService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<StudentHistory> CreateStudentHistory(Guid studentId)
        {
            var newStudentHistory = new StudentHistory
            {
                StudentId = studentId
            };

            _dbContext.StudentHistories.Add(newStudentHistory);
            await _dbContext.SaveChangesAsync();
            return newStudentHistory;
        }

        public async Task<StudentHistory> EditStudentHistory(string id, Guid? studentId = null, List<Guid>? studentTrainingGradeIds = null)
        {
            var historyId = Guid.Parse(id);
            var history = await _dbContext.StudentHistories.FindAsync(historyId);
            
            if (history == null)
            {
                return null;
            }

            history.StudentId = studentId ?? history.StudentId;
            history.StudentTrainingGradeIds = studentTrainingGradeIds ?? history.StudentTrainingGradeIds;

            await _dbContext.SaveChangesAsync();
            return history;
        }

        public async Task<List<StudentHistory>> GetAllStudentHistoriesAsync()
        {
            var histories = await _dbContext.StudentHistories.ToListAsync();
            foreach (var history in histories)
            {
                history.StudentTrainingGrades = await _dbContext.StudentTrainingGrades.Where(sg => sg.StudentHistoryId == history.Id).ToListAsync();
            }
            return histories;
        }

        public async Task<StudentHistory> GetStudentHistoryByIdAsync(string id)
        {
            var historyId = Guid.Parse(id);
            var history = await _dbContext.StudentHistories.FindAsync(historyId);
            if (history == null) return null;
            history.StudentTrainingGrades = await _dbContext.StudentTrainingGrades.Where(sg => sg.StudentHistoryId == history.Id).ToListAsync();
            foreach (var studentTrainingGrade in history.StudentTrainingGrades)
            {
                studentTrainingGrade.TrainingTasksInfos = await _dbContext.StudentTrainingTaskInfos.Where(sti => sti.StudentTrainingGradeId == studentTrainingGrade.Id).ToListAsync();
                foreach (var trainingTaskInfo in studentTrainingGrade.TrainingTasksInfos)
                {
                    // trainingTaskInfo.Task = await _dbContext.Tasks.FindAsync(trainingTaskInfo.TaskId);
                    trainingTaskInfo.Answer = await _dbContext.Answers.FindAsync(trainingTaskInfo.AnswerId);
                    trainingTaskInfo.Answer!.Task = await _dbContext.Tasks.FindAsync(trainingTaskInfo.Answer.TaskId);
                }
            }
            return history;
        }

    }
}

