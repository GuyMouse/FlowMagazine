using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ClassroomServer.Models
{
    public class TrainingStatistics
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid TrainingId { get; set; }

        [Required]
        public float GradeAverage { get; set; }

        // [Required]
        public List<Guid>? TaskStatisticsIds { get; set; } = null;

        public List<TaskStatistics>? TaskStatistics { get; set; } = null;
    }
}
