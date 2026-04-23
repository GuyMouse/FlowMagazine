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
    public class StudyUnitService
    {
        private readonly ClassroomDbContext _dbContext;

        public StudyUnitService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<StudyUnit> CreateStudyUnit(string title, List<Guid> taskIds, Guid courseId)
        {
            // Load and validate that the Course exists
            var course = await _dbContext.Courses.FindAsync(courseId);
            if (course == null)
            {
                throw new ArgumentException($"Course with Id {courseId} does not exist.");
            }
            
            var newStudyUnit = new StudyUnit
            {
                Title = title,
                TaskIds = taskIds,
                CourseId = courseId
            };

            if (newStudyUnit == null)
            {
                return null;
            }

            _dbContext.StudyUnits.Add(newStudyUnit);
            
            // Add the new StudyUnit ID to the Course's StudyUnitIds list (if not already present)
            if (course.StudyUnitIds == null)
            {
                course.StudyUnitIds = new List<Guid>();
            }
            if (!course.StudyUnitIds.Contains(newStudyUnit.Id))
            {
                course.StudyUnitIds.Add(newStudyUnit.Id);
            }
            
            // Save both changes in the same transaction
            await _dbContext.SaveChangesAsync();
            
            // Load Course via foreign key relationship
            newStudyUnit.Course = course;
            
            // Load Tasks navigation property from TaskIds
            if (newStudyUnit.TaskIds != null && newStudyUnit.TaskIds.Count > 0)
            {
                newStudyUnit.Tasks = await _dbContext.Tasks
                    .Where(t => newStudyUnit.TaskIds.Contains(t.Id))
                    .ToListAsync();
            }
            
            return newStudyUnit;
        }

        public async Task<StudyUnit> EditStudyUnit(string id, string? title = null, string? description = null, Guid? trainingId = null, List<Guid>? taskIds = null)
        {
            var studyUnitId = Guid.Parse(id);
            var studyUnit = await _dbContext.StudyUnits.FindAsync(studyUnitId);
            
            if (studyUnit == null)
            {
                return null;
            }

            bool ShouldSave = false;

            if (title != null)
            {
                studyUnit.Title = title;
                ShouldSave = true;
            }
            if (description != null)
            {
                studyUnit.Description = description;
                ShouldSave = true;
            }
            if (trainingId != null)
            {
                studyUnit.TrainingId = trainingId;
                ShouldSave = true;
            }
            if (taskIds != null)
            {
                studyUnit.TaskIds = taskIds;
                ShouldSave = true;
            }
            if (ShouldSave)
            {
                await _dbContext.SaveChangesAsync();
            }
            
            // Load Course via foreign key relationship
            if (studyUnit.CourseId != Guid.Empty)
            {
                studyUnit.Course = await _dbContext.Courses.FindAsync(studyUnit.CourseId);
            }
            
            // Load Tasks navigation property from TaskIds
            if (studyUnit.TaskIds != null && studyUnit.TaskIds.Count > 0)
            {
                studyUnit.Tasks = await _dbContext.Tasks
                    .Where(t => studyUnit.TaskIds.Contains(t.Id))
                    .ToListAsync();
            }
            
            return studyUnit;
        }

        public async Task<List<StudyUnit>> GetAllStudyUnitsAsync()
        {
            var studyUnits = await _dbContext.StudyUnits.ToListAsync();
            
            // Batch load related entities to avoid N+1 queries
            var allCourseIds = studyUnits
                .Where(su => su.CourseId != Guid.Empty)
                .Select(su => su.CourseId)
                .Distinct()
                .ToList();
            var allTaskIds = studyUnits
                .Where(su => su.TaskIds != null && su.TaskIds.Count > 0)
                .SelectMany(su => su.TaskIds)
                .Distinct()
                .ToList();
            
            // Load all related entities
            var courses = allCourseIds.Count > 0
                ? await _dbContext.Courses.Where(c => allCourseIds.Contains(c.Id)).ToListAsync()
                : new List<Course>();
            var tasks = allTaskIds.Count > 0
                ? await _dbContext.Tasks.Where(t => allTaskIds.Contains(t.Id)).ToListAsync()
                : new List<TaskBase>();
            
            // Create lookup dictionaries for O(1) access
            var coursesDict = courses.ToDictionary(c => c.Id);
            var tasksDict = tasks.ToDictionary(t => t.Id);
            
            // Assign related entities to each study unit
            foreach (var studyUnit in studyUnits)
            {
                // Load Course via foreign key relationship
                if (coursesDict.ContainsKey(studyUnit.CourseId))
                {
                    studyUnit.Course = coursesDict[studyUnit.CourseId];
                }
                
                // Manually populate Tasks navigation property from TaskIds
                if (studyUnit.TaskIds != null && studyUnit.TaskIds.Count > 0)
                {
                    studyUnit.Tasks = studyUnit.TaskIds
                        .Where(id => tasksDict.ContainsKey(id))
                        .Select(id => tasksDict[id])
                        .ToList();
                }
            }
            
            return studyUnits;
        }

        public async Task<StudyUnit> GetStudyUnitByIdAsync(string id)
        {
            var studyUnitId = Guid.Parse(id);
            var studyUnit = await _dbContext.StudyUnits.FirstOrDefaultAsync(s => s.Id == studyUnitId);
            
            if (studyUnit == null)
            {
                return null;
            }
            
            // Load Course via foreign key relationship
            if (studyUnit.CourseId != Guid.Empty)
            {
                studyUnit.Course = await _dbContext.Courses.FindAsync(studyUnit.CourseId);
            }
            
            // Manually populate Tasks navigation property from TaskIds
            if (studyUnit.TaskIds != null && studyUnit.TaskIds.Count > 0)
            {
                studyUnit.Tasks = await _dbContext.Tasks
                    .Where(t => studyUnit.TaskIds.Contains(t.Id))
                    .ToListAsync();
            }
            
            return studyUnit;
        }

        public async Task<StudyUnit> DeleteStudyUnit(string id)
        {
            var studyUnitId = Guid.Parse(id);
            var studyUnit = await _dbContext.StudyUnits.FindAsync(studyUnitId);
            if (studyUnit == null)
            {
                return null;
            }
            
            // Remove the StudyUnit ID from the Course's StudyUnitIds list
            if (studyUnit.CourseId != Guid.Empty)
            {
                var course = await _dbContext.Courses.FindAsync(studyUnit.CourseId);
                if (course != null && course.StudyUnitIds != null)
                {
                    course.StudyUnitIds.Remove(studyUnitId);
                }
            }
            
            _dbContext.StudyUnits.Remove(studyUnit);
            await _dbContext.SaveChangesAsync();
            return studyUnit;
        }
    }
}

