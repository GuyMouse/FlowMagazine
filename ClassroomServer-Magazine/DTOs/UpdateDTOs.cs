using System;
using System.Text.Json;
using System.Collections.Generic;
using ClassroomServer.Models;

namespace ClassroomServer.DTOs
{
    public class CourseUpdateDTO
    {
        public string? Name { get; set; } = null;
        public string? Status { get; set; } = null;

        public string? Location { get; set; } = null;

        public List<Guid>? StudyUnitIds { get; set; } = null;
        public List<Guid>? TrainingIds { get; set; } = null;
        public Guid? InstructorId { get; set; } = null;
        public List<Guid>? StudentIds { get; set; } = null;
    }

    public class InstructorUpdateDTO
    {
        public AuthorityRank? AuthRank { get; set; } = null;

        public string? FirstName { get; set; } = null;

        public string? LastName { get; set; } = null;

        public List<Guid>? CourseIds { get; set; } = null;
    }

    public class StationUpdateDTO
    {
        public List<Guid>? StudentIds { get; set; } = null;

        public Guid? TrainingId { get; set; } = null;

        public Guid? StudyUnitId { get; set; } = null;

        public string? StationName { get; set; } = null;

        public List<Guid>? TrainingTaskIds { get; set; } = null;

        public int? CurrentTaskIndex { get; set; } = null;
    }

    public class StudentUpdateDTO
    {
        public string? StudentId { get; set; } = null;

        public string? FirstName { get; set; } = null;

        public string? LastName { get; set; } = null;

    }

    public class StudentHistoryUpdateDTO
    {

        public Guid? StudentId { get; set; } = null;

        public List<Guid>? StudentTrainingGradeIds { get; set; } = null;
    }

    public class StudentTrainingGradeUpdateDTO
    {
        public Guid? StudentHistoryId { get; set; } = null;

        public Guid? TrainingId { get; set; } = null;

        public float? Grade { get; set; } = null;
    }

    public class TrainingUpdateDTO
    {

        public string? Location { get; set; } = null!;

        public string? Title { get; set; } = null;

        public bool? IsLive { get; set; } = null;

        public float? GradeAverage { get; set; } = null;

        public Guid? CourseId { get; set; } = null;

        public Guid? InstructorId { get; set; } = null;

        public List<Guid>? StationIds { get; set; } = null;

        public Guid? TrainingStatisticsId { get; set; } = null;

        public List<Guid>? StudentsData { get; set; }

        public Guid? StudyUnitId { get; set; } = null;

        public int? Version { get; set; } = null;
    }

    public class TrainingTaskUpdateDTO
    {
        public TaskType? Type { get; set; } = null;
        public Guid? TrainingId { get; set; } = null; // Training
        public Guid? TaskId { get; set; } = null; // TaskBase
        public Guid? AnswerId { get; set; } = null; // AnswerBase
        public Guid? StatusId { get; set; } = null; // TaskStatus
    }

    public class StudentTrainingTasksInfoUpdateDTO
    {
        public Guid? StudentTrainingGradeId { get; set; } = null;
        public Guid? AnswerId { get; set; } = null;
        public bool? IsCorrect { get; set; } = null;
    }

    public class TrainingTaskStatusUpdateDTO
    {
        public AssigneeTaskRole? AssigneeRole { get; set; } = null;

        public Guid? TrainingTaskId { get; set; } = null; // TrainingTask // OWNER TrainingTask

        public Status? Status { get; set; } = null;
    }
    
    public class TrainingStatisticsUpdateDTO
    {
        public Guid? TrainingId { get; set; } = null;
        public float? GradeAverage { get; set; } = null;
        public List<Guid>? TaskStatisticsIds { get; set; } = null;
    }

    public class TaskStatisticsUpdateDTO
    {
        public Guid? TrainingStatisticsId { get; set; } = null;
        public Guid? TaskId { get; set; } = null;
        public int? SuccessfulAttempts { get; set; } = null;
        public int? FailedAttempts { get; set; } = null;
    }

    public class LessonUpdateDTO
    {
        public string? Title { get; set; } = null;
        public string? Description { get; set; } = null;
        public Guid? SubjectId { get; set; } = null;
    }

    public class StudyUnitUpdateDTO
    {
        public string? Title { get; set; } = null;
        
        public string? Description { get; set; } = null;

        public Guid? TrainingId { get; set; } = null;

        public List<Guid>? TaskIds { get; set; } = null;
    }

    public class SubjectUpdateDTO
    {
        public string? Title { get; set; } = null;
        public string? Description { get; set; } = null;
    }

    public class BaseTaskUpdateDTO
    {
        public string? Title { get; set; } = null;
        public TaskType Type { get; set; }

        public string? LessonId { get; set; } = null;
        public JsonElement? Data { get; set; } = null;
    }

    public class SelectionQuestionUpdateDTO
    {
        public string? Prompt { get; set; } = null;
        public List<string>? Options { get; set; } = null;
        public int? CorrectIndex { get; set; } = null;
    }

    public class OpenQuestionUpdateDTO
    {
        public string? Question { get; set; } = null;
        public string? Answer { get; set; } = null;
    }
}