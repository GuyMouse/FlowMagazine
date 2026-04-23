using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ClassroomServer.Models.ContentManagement
{
    [JsonDerivedType(typeof(SelectionQuestion), typeDiscriminator: "SelectionQuestion")]
    [JsonDerivedType(typeof(OpenQuestion), typeDiscriminator: "OpenQuestion")]
    public abstract class TaskBase
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        // Foreign Key Property
        [Required]
        public Guid LessonId { get; set; } // FK
        
        // Navigation Property - Many Tasks belong to one Lesson
        [ForeignKey(nameof(LessonId))]
        public virtual Lesson Lesson { get; set; } = null!;
        
        [Required]
        public string Title { get; set; } = null!;

        public AssigneeTaskRole? AssigneeRole { get; set; } = AssigneeTaskRole.Any;
    }
}