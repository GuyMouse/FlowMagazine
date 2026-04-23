using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ClassroomServer.Models.ContentManagement;
using ClassroomServer.Models.RuntimeManagement;

public enum TaskType
{
    SelectionQuestion,
    OpenQuestion,
    InstructionAuto,
    InstructionManual,
    Fault,
    None
}

namespace ClassroomServer.Models
{
    public class TrainingTask
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public TaskType Type { get; set; }

        [Required]
        public Guid TrainingId { get; set; } // Training

        [Required]
        public Guid TaskId { get; set; } // TaskBase

        // [ForeignKey(nameof(TaskId))]
        public virtual TaskBase? Task { get; set; } = null;

        public Guid? AnswerId { get; set; } = null; // AnswerBase

        public Guid StationId { get; set; }

        public int StudyUnitTaskIndex { get; set; }

        public virtual AnswerBase? Answer { get; set; } = null;

        // public Guid? TrainingTaskId { get; set; } = null; // TrainingTask // OWNER TrainingTask

        public Guid StatusId { get; set; } // TaskStatus

        // public Guid SuccessTracking { get; set; } // TaskSuccessTracking
    }
}
