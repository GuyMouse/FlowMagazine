using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClassroomServer.Models.ContentManagement
{
    public class StudyUnit
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid CourseId { get; set; }

        [ForeignKey(nameof(CourseId))]
        public virtual Course? Course { get; set; } = null;

        [Required]
        public string Title { get; set; } = null!;
        
        public string? Description { get; set; } = null;

        public Guid? TrainingId { get; set; } = null;

        public List<Guid> TaskIds { get; set; } = new();

        // Navigation Property - manually populated from TaskIds in the service
        public virtual ICollection<TaskBase> Tasks { get; set; } = new List<TaskBase>();
    }
}
