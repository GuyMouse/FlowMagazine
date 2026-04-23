using System;
using System.ComponentModel.DataAnnotations;

namespace ClassroomServer.Models
{
    public class StudentTrainingGrade
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid StudentHistoryId { get; set; }

        [Required]
        public Guid TrainingId { get; set; }

        [Required]
        public float Grade { get; set; }

        public List<Guid>? TrainingTasksInfosIds { get; set; } = null;

        public virtual ICollection<StudentTrainingTaskInfo>? TrainingTasksInfos { get; set; } = null;
    }
}

