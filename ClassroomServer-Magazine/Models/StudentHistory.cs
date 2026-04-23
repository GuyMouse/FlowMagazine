using System;
using System.ComponentModel.DataAnnotations;

namespace ClassroomServer.Models
{
    public class StudentHistory
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentId { get; set; }

        public List<Guid>? StudentTrainingGradeIds { get; set; } = new();

        public virtual ICollection<StudentTrainingGrade>? StudentTrainingGrades { get; set; } = null;
    }
}