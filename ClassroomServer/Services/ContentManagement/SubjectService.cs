using ClassroomServer.Models;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using ClassroomServer.Models.ContentManagement;

namespace ClassroomServer.Services.ContentManagement
{
    public class SubjectService
    {
        private readonly ClassroomDbContext _dbContext;

        public SubjectService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Subject> CreateSubject(string title, string? description = null)
        {
            var newSubject = new Subject
            {
                Title = title,
                Description = description
            };

            _dbContext.Subjects.Add(newSubject);
            await _dbContext.SaveChangesAsync();

            return newSubject;
        }

        public async Task<Subject> EditSubject(string id, string? title = null, string? description = null)
        {
            var subjectId = Guid.Parse(id);
            var subject = await _dbContext.Subjects.FindAsync(subjectId);
            
            if (subject == null)
            {
                return null;
            }

            bool shouldSave = false;

            if (title != null) 
            {
                subject.Title = title;
                shouldSave = true;
            }
            if (description != null) 
            {
                subject.Description = description;
                shouldSave = true;
            }
            
            if (shouldSave)
            {
                await _dbContext.SaveChangesAsync();
            }

            return subject;
        }

        public async Task<List<Subject>> GetAllSubjectsAsync()
        {
            return await _dbContext.Subjects
            .Include(s => s.Lessons).ThenInclude(l => l.Tasks)  // ✅ Load Lessons for all subjects
            .ToListAsync();
        }

        public async Task<Subject> GetSubjectByIdAsync(string id)
        {
            var subjectId = Guid.Parse(id);
            return await _dbContext.Subjects
                .Include(s => s.Lessons).ThenInclude(l => l.Tasks)  // Load the Lessons collection
                .FirstOrDefaultAsync(s => s.Id == subjectId);
        }

        public async Task<Subject> DeleteSubject(string id)
        {
            var subjectId = Guid.Parse(id);
            var subject = await _dbContext.Subjects.FindAsync(subjectId);
            if (subject == null)
            {
                return null;
            }
            
            _dbContext.Subjects.Remove(subject);
            await _dbContext.SaveChangesAsync();
            
            return subject;
        }
/*
        public async Task<InstructorDto> Get(string id)
        {
            var instructor = await GetSubjectByIdAsync(id);
            if (instructor == null) return null;

            List<CourseDto> courseDtos = null;
            if (instructor.CourseIds != null && instructor.CourseIds.Count > 0)
            {
                var courses = await _dbContext.Courses
                    .Where(course => instructor.CourseIds.Contains(course.Id))
                    .ToListAsync();
                
                // TODO: add Trainings here ?
                courseDtos = courses.Select(c => c.ToDto()).ToList();
            }

            return instructor.ToDto(courseDtos);
        }
*/
    }
}

