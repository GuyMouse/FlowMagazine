using ClassroomServer.Models;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace ClassroomServer.Services
{
    public class StudentTrainingGradesService
    {
        private readonly ClassroomDbContext _dbContext;

        public StudentTrainingGradesService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<StudentTrainingGrade> CreateStudentTrainingGrade(Guid studentHistoryId, Guid trainingId, float grade)
        {
            var newStudentsTrainingGrades = new StudentTrainingGrade
            {
                StudentHistoryId = studentHistoryId,
                TrainingId = trainingId,
                Grade = grade
            };

            _dbContext.StudentTrainingGrades.Add(newStudentsTrainingGrades);
            await _dbContext.SaveChangesAsync();

            return newStudentsTrainingGrades;
        }

        public async Task<StudentTrainingGrade> EditStudentTrainingGrade(string id, Guid? studentHistoryId = null, Guid? trainingId = null, float? grade = null)
        {
            var studentsTrainingGradesId = Guid.Parse(id);
            var studentsTrainingGrades = await _dbContext.StudentTrainingGrades.FindAsync(studentsTrainingGradesId);
            if (studentsTrainingGrades == null)
            {
                return null;
            }
            studentsTrainingGrades.StudentHistoryId = studentHistoryId ?? studentsTrainingGrades.StudentHistoryId;
            studentsTrainingGrades.TrainingId = trainingId ?? studentsTrainingGrades.TrainingId;
            studentsTrainingGrades.Grade = grade ?? studentsTrainingGrades.Grade;

            await _dbContext.SaveChangesAsync();

            return studentsTrainingGrades;
        }

        public async Task<List<StudentTrainingGrade>> GetAllStudentTrainingGradesAsync()
        {
            return await _dbContext.StudentTrainingGrades.ToListAsync();
        }

        public async Task<StudentTrainingGrade> GetStudentTrainingGradeByIdAsync(string id)
        {
            var studentsTrainingGradesId = Guid.Parse(id);
            var studentsTrainingGrades = await _dbContext.StudentTrainingGrades.FindAsync(studentsTrainingGradesId);
            if (studentsTrainingGrades == null)
            {
                return null;
            }
            
            return studentsTrainingGrades;
        }
        

        public async Task<StudentTrainingGrade> DeleteStudentTrainingGradeAsync(string id)
        {
            var studentsTrainingGradesId = Guid.Parse(id);
            var studentsTrainingGrades = await _dbContext.StudentTrainingGrades.FindAsync(studentsTrainingGradesId);
            if (studentsTrainingGrades == null)
            {
                return null;
            }
            
            _dbContext.StudentTrainingGrades.Remove(studentsTrainingGrades);
            await _dbContext.SaveChangesAsync();

            return studentsTrainingGrades;
        }
    }
}
