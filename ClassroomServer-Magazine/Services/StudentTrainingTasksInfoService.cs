using ClassroomServer.Models;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
// using System.Threading.Tasks;
using System.Linq;

namespace ClassroomServer.Services
{
    public class StudentTrainingTasksInfoService
    {
        private readonly ClassroomDbContext _dbContext;

        public StudentTrainingTasksInfoService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<StudentTrainingTaskInfo> CreateStudentTrainingTasksInfo(Guid studentTrainingGradeId, Guid answerId, bool isCorrect)
        {
            var newStudentTrainingTasksInfo = new StudentTrainingTaskInfo
            {
                StudentTrainingGradeId = studentTrainingGradeId,
                AnswerId = answerId,
                IsCorrect = isCorrect
            };

            _dbContext.StudentTrainingTaskInfos.Add(newStudentTrainingTasksInfo);
            await _dbContext.SaveChangesAsync();
            return newStudentTrainingTasksInfo;
        }

        public async Task<StudentTrainingTaskInfo> EditStudentTrainingTasksInfo(string id, Guid? studentTrainingGradeId = null, Guid? answerId = null, bool? isCorrect = null)
        {
            var studentTrainingTasksInfoId = Guid.Parse(id);
            var studentTrainingTasksInfo = await _dbContext.StudentTrainingTaskInfos.FindAsync(studentTrainingTasksInfoId);
            
            if (studentTrainingTasksInfo == null)
            {
                return null;
            }

            studentTrainingTasksInfo.StudentTrainingGradeId = studentTrainingGradeId ?? studentTrainingTasksInfo.StudentTrainingGradeId;
            studentTrainingTasksInfo.AnswerId = answerId ?? studentTrainingTasksInfo.AnswerId;
            studentTrainingTasksInfo.IsCorrect = isCorrect ?? studentTrainingTasksInfo.IsCorrect;
            
            await _dbContext.SaveChangesAsync();
            return studentTrainingTasksInfo;
        }

        public async Task<List<StudentTrainingTaskInfo>> GetAllStudentTrainingTasksInfosAsync()
        {
            return await _dbContext.StudentTrainingTaskInfos.ToListAsync();
        }

        public async Task<StudentTrainingTaskInfo> GetStudentTrainingTasksInfoByIdAsync(string id)
        {
            var studentTrainingTasksInfoId = Guid.Parse(id);
            var studentTrainingTasksInfo = await _dbContext.StudentTrainingTaskInfos.FindAsync(studentTrainingTasksInfoId);
            if (studentTrainingTasksInfo == null)
            {
                return null;
            }
            return studentTrainingTasksInfo;
        }

        public async Task<StudentTrainingTaskInfo> DeleteStudentTrainingTasksInfoAsync(string id)
        {
            var studentTrainingTasksInfoId = Guid.Parse(id);
            var studentTrainingTasksInfo = await _dbContext.StudentTrainingTaskInfos.FindAsync(studentTrainingTasksInfoId);
            if (studentTrainingTasksInfo == null)
            {
                return null;
            }

            _dbContext.StudentTrainingTaskInfos.Remove(studentTrainingTasksInfo);
            await _dbContext.SaveChangesAsync();

            return studentTrainingTasksInfo;
        }
    }
}
