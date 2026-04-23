using ClassroomServer.Models;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace ClassroomServer.Services
{
    public class StudentService
    {
        private readonly ClassroomDbContext _dbContext;

        public StudentService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Student> CreateStudent(string firstName, string lastName, string idNumber)
        {
            if (await _dbContext.Students.AnyAsync(s => s.StudentId == idNumber))
            {
                return null;
            }

            var newStudent = new Student
            {
                FirstName = firstName,
                LastName = lastName,
                StudentId = idNumber
            };

            _dbContext.Students.Add(newStudent);
            await _dbContext.SaveChangesAsync();
            return newStudent;
        }

        public async Task<Student> EditStudent(string id, string? firstName = null, string? lastName = null, string? idNumber = null)
        {
            var studentId = Guid.Parse(id);
            var student = await _dbContext.Students.FindAsync(studentId);
            
            if (student == null)
            {
                return null;
            }

            bool ShouldSave = false;

            if (firstName != null)
            {
                student.FirstName = firstName;
                ShouldSave = true;
            }
            if (lastName != null)
            {
                student.LastName = lastName;
                ShouldSave = true;
            }
            if (idNumber != null)
            {
                if (await _dbContext.Students.AnyAsync(s => s.StudentId == idNumber))
                {
                    return null;
                }
                student.StudentId = idNumber;
                ShouldSave = true;
            }
            
            if (ShouldSave)
            {
                await _dbContext.SaveChangesAsync();
            }

            return student;
        }

        public async Task<List<Student>> GetAllStudentsAsync()
        {
            return await _dbContext.Students.ToListAsync();
        }

        public async Task<Student> GetStudentByIdAsync(string id)
        {
            var studentId = Guid.Parse(id);
            var student = await _dbContext.Students.FindAsync(studentId);
            return student;
        }

        public async Task<Student?> GetStudentByIdNumberAsync(string idNumber)
        {
            var student = await _dbContext.Students.FirstOrDefaultAsync(s => s.StudentId == idNumber);
            if (student == null)
            {
                return null;
            }
            return student;
        }

        public async Task<Student> DeleteStudent(string id)
        {
            var studentId = Guid.Parse(id);
            var student = await _dbContext.Students.FindAsync(studentId);
            if (student == null)
            {
                return null;
            }
            
            _dbContext.Students.Remove(student);
            await _dbContext.SaveChangesAsync();
            
            return student;
        }

    }
}
