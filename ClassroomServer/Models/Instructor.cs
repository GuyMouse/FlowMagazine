using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public enum AuthorityRank
{
    Low,
    Medium,
    High
}

namespace ClassroomServer.Models
{
    public class Instructor
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public AuthorityRank AuthRank { get; set; } = AuthorityRank.Low;

        [Required]
        public string FirstName { get; set; } = null!;

        [Required]
        public string LastName { get; set; } = null!;

        public List<Guid> CourseIds { get; set; } = new();
        public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
    }
}