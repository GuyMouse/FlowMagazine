using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using ClassroomServer.Models;
using System;
using System.Linq;
using System.Collections.Generic;
using ClassroomServer.Models.ContentManagement;
using ClassroomServer.Models.RuntimeManagement;

namespace ClassroomServer.Data
{
    public class ClassroomDbContext : DbContext
    {
        public ClassroomDbContext(DbContextOptions<ClassroomDbContext> options)
            : base(options)
        {
        }

        public DbSet<Course> Courses { get; set; } = null!;
        // public DbSet<Fault> Faults { get; set; } = null!;
        public DbSet<Training> Trainings { get; set; } = null!;
        public DbSet<Instructor> Instructors { get; set; } = null!;
        public DbSet<Student> Students { get; set; } = null!;
        public DbSet<StudentHistory> StudentHistories { get; set; } = null!;
        // public DbSet<StudentProgression> StudentProgressions { get; set; } = null!;
        // public DbSet<StudentData> StudentsData { get; set; } = null!;

        public DbSet<TrainingTask> TrainingTasks { get; set; } = null!;
        public DbSet<TrainingTaskStatus> TrainingTaskStatuses { get; set; } = null!;

        public DbSet<Subject> Subjects { get; set; } = null!;
        public DbSet<Lesson> Lessons { get; set; } = null!;

        public DbSet<TaskBase> Tasks { get; set; } = null!;
        public DbSet<AnswerBase> Answers { get; set; } = null!;
        public DbSet<StudyUnit> StudyUnits { get; set; } = null!;
        public DbSet<Station> Stations { get; set; } = null!;
        public DbSet<StudentTrainingGrade> StudentTrainingGrades { get; set; } = null!;
        public DbSet<TrainingStatistics> TrainingStatistics { get; set; } = null!;
        public DbSet<TaskStatistics> TaskStatistics { get; set; } = null!;

        public DbSet<StudentTrainingTaskInfo> StudentTrainingTaskInfos { get; set; } = null!;
        // public DbSet<SelectionQuestion> SelectionQuestions { get; set; } = null!;
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Course
            modelBuilder.Entity<Course>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever(); // Since you're using Guid.NewGuid()
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Status).IsRequired();
                
                // Configure Instructor relationship (one-to-many: one Instructor can have many Courses)
                entity.HasOne(e => e.Instructor)
                    .WithMany(i => i.Courses)
                    .HasForeignKey(e => e.InstructorId)
                    .OnDelete(DeleteBehavior.SetNull); // Set Instructor to null if Instructor is deleted
                
                // Configure TrainingIds conversion
                entity.Property(e => e.TrainingIds)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(Guid.Parse)
                            .ToList()
                    )
                // Value Comparer Fix: When storing collections (List<Guid>) as strings in PostgreSQL, EF Core needs a ValueComparer
                // to properly detect changes. Without it, EF Core compares by reference instead of content, which means
                // it won't detect when collection items are added/removed/modified, causing updates to be missed.
                    .Metadata.SetValueComparer(new ValueComparer<List<Guid>>(
                        (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()));
                
                // Configure StudyUnitIds conversion
                // Note: StudyUnitIds is manually managed (stored as comma-separated string)
                // The StudyUnits navigation property is configured via the StudyUnit entity configuration
                entity.Property(e => e.StudyUnitIds)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(Guid.Parse)
                            .ToList()
                    )
                    .Metadata.SetValueComparer(new ValueComparer<List<Guid>>(
                        (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()));
                
                // Configure StudentIds conversion
                entity.Property(e => e.StudentIds)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(Guid.Parse)
                            .ToList()
                    )
                    .Metadata.SetValueComparer(new ValueComparer<List<Guid>>(
                        (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()));
            });

            // Configure Training
            modelBuilder.Entity<Training>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Location).IsRequired();
                entity.Property(e => e.Title).IsRequired();
                entity.Property(e => e.StudyUnitId).IsRequired();
            });

            // Configure Instructor
            modelBuilder.Entity<Instructor>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.FirstName).IsRequired();
                entity.Property(e => e.LastName).IsRequired();
                entity.Property(e => e.AuthRank).HasConversion<string>();
            
                entity.Property(e => e.CourseIds)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(Guid.Parse)
                            .ToList()
                    )
                    // Value Comparer Fix: Required for List<Guid> collections to detect changes properly
                    .Metadata.SetValueComparer(new ValueComparer<List<Guid>>(
                        (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()));
            });

            // Configure Student
            modelBuilder.Entity<Student>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.StudentId).IsRequired();
                entity.Property(e => e.FirstName).IsRequired();
                entity.Property(e => e.LastName).IsRequired();
                
                entity.Property(e => e.TrainingIds)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(Guid.Parse)
                            .ToList()
                    )
                    // Value Comparer Fix: Required for List<Guid> collections to detect changes properly    
                    .Metadata.SetValueComparer(new ValueComparer<List<Guid>>(
                        (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()));
            });

            // Configure StudentHistory
            modelBuilder.Entity<StudentHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.StudentId).IsRequired();
            });

            // Configure StudentTrainingGrade
            modelBuilder.Entity<StudentTrainingGrade>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.StudentHistoryId).IsRequired();
                entity.Property(e => e.TrainingId).IsRequired();
                entity.Property(e => e.Grade).IsRequired();
                entity.Property(e => e.TrainingTasksInfosIds)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(Guid.Parse)
                            .ToList()
                    )
                    .Metadata.SetValueComparer(new ValueComparer<List<Guid>>(
                        (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()));
            });

            // Configure StudentData
            modelBuilder.Entity<StudentTrainingTaskInfo>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.StudentTrainingGradeId).IsRequired();
                // entity.Property(e => e.TaskId).IsRequired();
                entity.Property(e => e.AnswerId).IsRequired();
                entity.Property(e => e.IsCorrect).IsRequired();
            });

        
            // Configure TrainingTask
            modelBuilder.Entity<TrainingTask>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                // entity.Property(e => e.Answer).IsRequired();
            });

            // Configure TrainingTaskStatus
            modelBuilder.Entity<TrainingTaskStatus>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                // TrainingTaskStatus.Task is FK to TrainingTask; cascade delete so statuses are removed when task is deleted
                entity.HasOne<TrainingTask>()
                    .WithMany()
                    .HasForeignKey(e => e.TrainingTaskId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        
            // Configure Subject
            modelBuilder.Entity<Subject>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                
                // One Subject has many Lessons
                entity.HasMany(s => s.Lessons)
                    .WithOne(l => l.Subject)
                    .HasForeignKey(l => l.SubjectId)
                    .OnDelete(DeleteBehavior.Cascade); // If Subject is deleted, delete all it's lessons
            });

            // Configure Lesson
            modelBuilder.Entity<Lesson>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                
                // One Lesson has many Tasks
                entity.HasMany(l => l.Tasks)
                    .WithOne(t => t.Lesson)
                    .HasForeignKey(t => t.LessonId)
                    .OnDelete(DeleteBehavior.Cascade); // If Lesson is deleted, delete all its Tasks
            });

            // Configure TaskBase && it's derived types
            modelBuilder.Entity<TaskBase>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.HasDiscriminator<string>("Discriminator")
                    .HasValue<SelectionQuestion>("SelectionQuestion")
                    .HasValue<OpenQuestion>("OpenQuestion");
                
                
                // The relationship to Lesson is configured in the Lesson entity configuration above
            });

            modelBuilder.Entity<AnswerBase>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.HasDiscriminator<string>("Discriminator")
                    .HasValue<AnswerSelectionQuestion>("AnswerSelectionQuestion")
                    .HasValue<AnswerOpenQuestion>("AnswerOpenQuestion");
                
                // entity.HasOne(e => e.Task).WithOne; // TODO: Configure the relationship between AnswerBase and TaskBase
            });
            
            // Configure StudyUnit
            modelBuilder.Entity<StudyUnit>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.CourseId).IsRequired();
                
                // Configure Course relationship (many-to-one: many StudyUnits can belong to one Course)
                entity.HasOne(e => e.Course)
                    .WithMany(c => c.StudyUnits)
                    .HasForeignKey(e => e.CourseId)
                    .OnDelete(DeleteBehavior.Cascade); // If Course is deleted, delete all its StudyUnits
                
                // Note: Tasks navigation property is manually populated from TaskIds in the service
                // This is a many-to-many relationship stored as a List<Guid> rather than a join table
            });

            // Configure Station
            modelBuilder.Entity<Station>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.StudyUnitId).IsRequired();
                entity.Property(e => e.TrainingId).IsRequired();
                entity.Property(e => e.CurrentTaskIndex).HasDefaultValue(-1);
                entity.Property(e => e.StudentIds)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(Guid.Parse)
                            .ToList()
                    )
                    .Metadata.SetValueComparer(new ValueComparer<List<Guid>>(
                        (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()));
            });

            // Configure TrainingStatistics
            modelBuilder.Entity<TrainingStatistics>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.TrainingId).IsRequired();
                entity.Property(e => e.GradeAverage).IsRequired();
                entity.Property(e => e.TaskStatisticsIds)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(Guid.Parse)
                            .ToList()
                    )
                    .Metadata.SetValueComparer(new ValueComparer<List<Guid>>(
                        (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()));
            });

            // Configure TaskStatistics
            modelBuilder.Entity<TaskStatistics>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.TrainingStatisticsId).IsRequired();
                entity.Property(e => e.TaskId).IsRequired();
            });
        }
    }
}

