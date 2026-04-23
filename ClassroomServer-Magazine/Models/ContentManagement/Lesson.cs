using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClassroomServer.Models.ContentManagement
{
    public class Lesson
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Title { get; set; } = null!;

        public string? Description { get; set; } = null!;

        // Foreign Key Property
        public Guid SubjectId { get; set; } // FK // Not required for POC
        
        // Navigation Property - One Lesson belongs to one Subject (optional)
        [ForeignKey(nameof(SubjectId))]
        public virtual Subject? Subject { get; set; }
        
        // Navigation Property - One Lesson has many Tasks
        public virtual ICollection<TaskBase> Tasks { get; set; } = new List<TaskBase>();
        
    }
}