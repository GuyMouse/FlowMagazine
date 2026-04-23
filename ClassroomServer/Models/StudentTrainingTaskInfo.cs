using System;
using System.ComponentModel.DataAnnotations;
using ClassroomServer.Models.ContentManagement;
using ClassroomServer.Models.RuntimeManagement;

namespace ClassroomServer.Models
{
    public class StudentTrainingTaskInfo
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid? StudentTrainingGradeId { get; set; } = null;


        // [Required]
        // public Guid TaskId { get; set; } // TaskBase

        // public virtual TaskBase? Task { get; set; } = null;

        [Required]
        public Guid AnswerId { get; set; } // AnswerBase

        public virtual AnswerBase? Answer { get; set; } = null;

        public bool IsCorrect { get; set; } = false;
    }
}

