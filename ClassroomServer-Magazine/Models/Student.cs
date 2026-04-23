using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ClassroomServer.Models
{
    public class Student
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string StudentId { get; set; } = null!;

        [Required]
        public string FirstName { get; set; } = null!;

        [Required]
        public string LastName { get; set; } = null!;

        public Guid? StudentHistoryId { get; set; }

        public List<Guid> TrainingIds { get; set; } = new();
    }
}