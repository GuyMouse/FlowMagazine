using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ClassroomServer.Models
{
    public class Station
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public List<Guid> StudentIds { get; set; } = new();

        [Required]
        public Guid TrainingId { get; set; }

        [Required]
        public Guid StudyUnitId { get; set; }

        public string? StationName { get; set; } = null;

        public bool IsLive { get; set; } = false;

        public List<Guid>? TrainingTaskIds { get; set; } = new();

        public List<TrainingTask>? TrainingTasks { get; set; } = null;

        public int? CurrentTaskIndex { get; set; } = -1;
    }
}
