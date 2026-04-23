using ClassroomServer.Models;
using ClassroomServer.Models.ContentManagement;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace ClassroomServer.Services
{
    public class CourseService
    {
        private readonly ClassroomDbContext _dbContext;

        public CourseService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Course> CreateCourse(string name, string status, List<Guid> studyUnitIds, List<Guid> trainingIds, Guid? instructorId, List<Guid> studentIds, string? location)
        {
            var newCourse = new Course
            {
                Name = name,
                Status = status,
                StudyUnitIds = studyUnitIds,
                Location = location,
                TrainingIds = trainingIds,
                InstructorId = instructorId,
                StudentIds = studentIds,
                CreationDate = DateTime.UtcNow
            };

            _dbContext.Courses.Add(newCourse);
            await _dbContext.SaveChangesAsync();
            return newCourse;
        }

        public async Task<Course> EditCourse(string id, string? name = null, string? status = null, List<Guid>? studyUnitIds = null, List<Guid>? trainingIds = null, Guid? instructorId = null, List<Guid>? studentIds = null, string? location = null)
        {
            var courseId = Guid.Parse(id);
            var course = await _dbContext.Courses.FindAsync(courseId);
            
            if (course == null)
            {
                return null;
            }

            bool ShouldSave = false;

            if (name != null)
            {
                course.Name = name;
                ShouldSave = true;
            }
            if (status != null)
            {
                course.Status = status;
                ShouldSave = true;
            }
            if (studyUnitIds != null)
            {
                course.StudyUnitIds = studyUnitIds;
                ShouldSave = true;
            }
            if (location != null)
            {
                course.Location = location;
                ShouldSave = true;
            }
            if (trainingIds != null)
            {
                course.TrainingIds = trainingIds;
                ShouldSave = true;
            }
            if (instructorId != null)
            {
                course.InstructorId = instructorId;
                ShouldSave = true;
            }
            if (studentIds != null)
            {
                course.StudentIds = studentIds;
                ShouldSave = true;
            }
            
            // course.Version++;
            if (ShouldSave)
            {
                await _dbContext.SaveChangesAsync();
            }

            return course;
        }

        public async Task<List<Course>> GetAllCoursesAsync()
        {
            var courses = await _dbContext.Courses.ToListAsync();

            // Get all course IDs for loading StudyUnits via foreign key relationship
            var allCourseIds = courses.Select(c => c.Id).ToList();
            
            // Batch load all related entities to avoid N+1 queries
            var allTrainingIds = courses
                .Where(c => c.TrainingIds != null && c.TrainingIds.Count > 0)
                .SelectMany(c => c.TrainingIds)
                .Distinct()
                .ToList();
            var allInstructorIds = courses
                .Where(c => c.InstructorId.HasValue)
                .Select(c => c.InstructorId!.Value)
                .Distinct()
                .ToList();
            var allStudentIds = courses
                .Where(c => c.StudentIds != null && c.StudentIds.Count > 0)
                .SelectMany(c => c.StudentIds)
                .Distinct()
                .ToList();

            // Load all related entities sequentially (DbContext is not thread-safe)
            // Load StudyUnits via foreign key relationship (CourseId)
            var studyUnits = allCourseIds.Count > 0
                ? await _dbContext.StudyUnits.Where(su => allCourseIds.Contains(su.CourseId)).ToListAsync()
                : new List<StudyUnit>();
            var trainings = allTrainingIds.Count > 0
                ? await _dbContext.Trainings.Where(t => allTrainingIds.Contains(t.Id)).ToListAsync()
                : new List<Training>();
            var instructors = allInstructorIds.Count > 0
                ? await _dbContext.Instructors.Where(i => allInstructorIds.Contains(i.Id)).ToListAsync()
                : new List<Instructor>();
            var students = allStudentIds.Count > 0
                ? await _dbContext.Students.Where(s => allStudentIds.Contains(s.Id)).ToListAsync()
                : new List<Student>();

            // Create lookup dictionaries for O(1) access
            var studyUnitsByCourseId = studyUnits.GroupBy(su => su.CourseId).ToDictionary(g => g.Key, g => g.ToList());
            var trainingsDict = trainings.ToDictionary(t => t.Id);
            var instructorsDict = instructors.ToDictionary(i => i.Id);
            var studentsDict = students.ToDictionary(s => s.Id);

            // Assign related entities to each course
            foreach (var course in courses)
            {
                // Load StudyUnits via foreign key relationship
                if (studyUnitsByCourseId.ContainsKey(course.Id))
                {
                    course.StudyUnits = studyUnitsByCourseId[course.Id];
                }
                else
                {
                    course.StudyUnits = new List<StudyUnit>();
                }
                
                if (course.TrainingIds != null && course.TrainingIds.Count > 0)
                {
                    course.Trainings = course.TrainingIds
                        .Where(id => trainingsDict.ContainsKey(id))
                        .Select(id => trainingsDict[id])
                        .ToList();
                }
                if (course.InstructorId.HasValue && instructorsDict.ContainsKey(course.InstructorId.Value))
                {
                    course.Instructor = instructorsDict[course.InstructorId.Value];
                }
                if (course.StudentIds != null && course.StudentIds.Count > 0)
                {
                    course.Students = course.StudentIds
                        .Where(id => studentsDict.ContainsKey(id))
                        .Select(id => studentsDict[id])
                        .ToList();
                }
            }

            return courses;
        }

        public async Task<Course> GetCourseByIdAsync(string id)
        {
            var courseId = Guid.Parse(id);
            var course = await _dbContext.Courses.FindAsync(courseId);
            if (course == null)
            {
                return null;
            }

            // Load all related entities sequentially (DbContext is not thread-safe)
            // Load StudyUnits via foreign key relationship (CourseId)
            course.StudyUnits = await _dbContext.StudyUnits
                .Where(su => su.CourseId == courseId)
                .ToListAsync();
            course.Trainings = course.TrainingIds != null && course.TrainingIds.Count > 0
                ? await _dbContext.Trainings.Where(t => course.TrainingIds.Contains(t.Id)).ToListAsync()
                : new List<Training>();
            if (course.InstructorId.HasValue)
            {
                var instructor = await _dbContext.Instructors.FindAsync(course.InstructorId.Value);
                if (instructor != null)
                {
                    course.Instructor = instructor;
                }
            }
            course.Students = course.StudentIds != null && course.StudentIds.Count > 0
                ? await _dbContext.Students.Where(s => course.StudentIds.Contains(s.Id)).ToListAsync()
                : new List<Student>();

            return course;
        }

        public async Task<Course> DeleteCourse(string id)
        {
            var courseId = Guid.Parse(id);
            var course = await _dbContext.Courses.FindAsync(courseId);
            if (course == null)
            {
                return null;
            }
        
            _dbContext.Courses.Remove(course);
            await _dbContext.SaveChangesAsync();
            return course;
        }
    }
}

