using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using ClassroomServer.Models.ContentManagement;

namespace ClassroomServer.Models
{
    public class Course
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Name { get; set; } = null!;

        [Required]
        public string Status { get; set; } = null!;

        public string? Location { get; set; } = null;

        public List<Guid> StudyUnitIds { get; set; } = new();
        public virtual ICollection<StudyUnit> StudyUnits { get; set; } = new List<StudyUnit>();
        public List<Guid> TrainingIds { get; set; } = new();
        public virtual ICollection<Training> Trainings { get; set; } = new List<Training>();

        public Guid? InstructorId { get; set; }

        public virtual Instructor? Instructor { get; set; }


        public List<Guid> StudentIds { get; set; } = new();
        public virtual ICollection<Student> Students { get; set; } = new List<Student>();

        public DateTime CreationDate { get; set; }

        public int Version { get; set; }
    }
}
