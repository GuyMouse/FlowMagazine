using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using ClassroomServer.Models.ContentManagement;

namespace ClassroomServer.Models.RuntimeManagement
{
    [JsonDerivedType(typeof(AnswerSelectionQuestion), typeDiscriminator: "AnswerSelectionQuestion")]
    [JsonDerivedType(typeof(AnswerOpenQuestion), typeDiscriminator: "AnswerOpenQuestion")]
    public abstract class AnswerBase
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        // Foreign Key Property
        [Required]
        public Guid TaskId { get; set; } // FK
        
        // Navigation Property - One answer belongs to one task
        [ForeignKey(nameof(TaskId))]
        public virtual TaskBase Task { get; set; } = null!;

        public Guid? TrainingTaskId { get; set; } = null; // FK
        
    }
}