using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using ClassroomServer.Models.ContentManagement;

namespace ClassroomServer.Models
{
    public class TaskStatistics
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid TrainingStatisticsId { get; set; }

        [Required]
        public Guid TaskId { get; set; }

        public virtual TaskBase? Task { get; set; } = null;

        [Required]
        public int SuccessfulAttempts { get; set; }

        [Required]
        public int FailedAttempts { get; set; }


    }
}
