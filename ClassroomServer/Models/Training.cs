using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ClassroomServer.Models
{
    public class Training
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string? Location { get; set; } = null!;

        [Required]
        public string Title { get; set; } = null!;

        public bool IsLive { get; set; }

        public Guid? CourseId { get; set; }

        public Guid? InstructorId { get; set; }

        public List<Guid>? StationIds { get; set; } = null;

        public List<Station>? Stations { get; set; } = null;

        public Guid? TrainingStatisticsId { get; set; } = null;

        public virtual TrainingStatistics? TrainingStatistics { get; set; } = null;

        public Guid StudyUnitId { get; set; }

        public DateTime CreationDate { get; set; }

        public int Version { get; set; }
    }
}
