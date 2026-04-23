using ClassroomServer.Models;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace ClassroomServer.Services
{
    public class InstructorService
    {
        private readonly ClassroomDbContext _dbContext;

        public InstructorService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Instructor> CreateInstructor(string firstName, string lastName, AuthorityRank authRank, List<Guid> courseIds)
        {
            var newInstructor = new Instructor
            {
                FirstName = firstName,
                LastName = lastName,
                AuthRank = authRank,
                CourseIds = courseIds
            };

            _dbContext.Instructors.Add(newInstructor);
            await _dbContext.SaveChangesAsync();
            return newInstructor;
        }

        public async Task<Instructor> EditInstructor(string id, string? firstName = null, string? lastName = null, AuthorityRank? authRank = null, List<Guid>? courseIds = null)
        {
            var instructorId = Guid.Parse(id);
            var instructor = await _dbContext.Instructors.FindAsync(instructorId);
            
            if (instructor == null)
            {
                return null;
            }

            bool ShouldSave = false;

            if (firstName != null)
            {
                instructor.FirstName = firstName;
                ShouldSave = true;
            }
            if (lastName != null)
            {
                instructor.LastName = lastName;
                ShouldSave = true;
            }
            if (authRank != null)
            {
                instructor.AuthRank = authRank.Value;
                ShouldSave = true;
            }
            if (courseIds != null)
            {
                instructor.CourseIds = courseIds;
                ShouldSave = true;
            }

            if (ShouldSave)
            {
                await _dbContext.SaveChangesAsync();
            }

            return instructor;
        }

        public async Task<List<Instructor>> GetAllInstructorsAsync()
        {
            return await _dbContext.Instructors.Include(i => i.Courses).ToListAsync();
        }

        public async Task<Instructor> GetInstructorByIdAsync(string id)
        {
            var instructorId = Guid.Parse(id);
            return await _dbContext.Instructors.Include(i => i.Courses).FirstOrDefaultAsync(i => i.Id == instructorId);
        }

        public async Task<Instructor> DeleteInstructor(string id)
        {
            var instructorId = Guid.Parse(id);
            var instructor = await _dbContext.Instructors.FindAsync(instructorId);
            if (instructor == null)
            {
                return null;
            }
            
            _dbContext.Instructors.Remove(instructor);
            await _dbContext.SaveChangesAsync();
            
            return instructor;
        }
    }
}

