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
    public class LessonService
    {
        private readonly ClassroomDbContext _dbContext;

        public LessonService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Lesson> CreateLesson(string title, string description, Guid subjectId)
        {
            // Option 1: Just set SubjectId (recommended - simpler and faster)
            var newLesson = new Lesson
            {
                Title = title,
                Description = description,
                SubjectId = subjectId  // EF Core will validate this exists when saving
            };

            _dbContext.Lessons.Add(newLesson);
            await _dbContext.SaveChangesAsync();
            
            // Note: newLesson.Subject will be null here unless we explicitly load it
            return newLesson;
        }

        public async Task<Lesson> EditLesson(string id, string? title = null, string? description = null, Guid? subjectId = null)
        {
            var lessonId = Guid.Parse(id);
            var lesson = await _dbContext.Lessons.FindAsync(lessonId);
            
            if (lesson == null)
            {
                return null;
            }

            bool ShouldSave = false;
            if (title != null)
            {
                lesson.Title = title;
                ShouldSave = true;
            }
            if (description != null)
            {
                lesson.Description = description;
                ShouldSave = true;
            }
            if (subjectId != null)
            {
                lesson.SubjectId = subjectId.Value;
                ShouldSave = true;
            }

            if (ShouldSave)
            {
                await _dbContext.SaveChangesAsync();
            }

            return lesson;
        }

        public async Task<List<Lesson>> GetAllLessonsAsync()
        {
            return await _dbContext.Lessons
                .Include(l => l.Subject)
                .Include(l => l.Tasks)
                .ToListAsync();
        }

        public async Task<Lesson> GetLessonByIdAsync(string id)
        {
            var lessonId = Guid.Parse(id);
            // Use FindAsync for simple lookups (Subject will be null)
            return await _dbContext.Lessons
                .Include(l => l.Subject)
                .Include(l => l.Tasks)  // Also load Tasks if needed
                .FirstOrDefaultAsync(l => l.Id == lessonId);
        }

        public async Task<Lesson> DeleteLesson(string id)
        {
            var lessonId = Guid.Parse(id);
            var lesson = await _dbContext.Lessons.FindAsync(lessonId);
            if (lesson == null)
            {
                return null;
            }
            
            _dbContext.Lessons.Remove(lesson);
            await _dbContext.SaveChangesAsync();
            return lesson;
        }
    }
}

