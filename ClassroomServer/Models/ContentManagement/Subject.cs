using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ClassroomServer.Models.ContentManagement
{
    public class Subject
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public string Title { get; set; } = null!;
        
        public string? Description { get; set; } = null;
        
        // Navigation Property - One Subject has many Lessons
        public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    }
}