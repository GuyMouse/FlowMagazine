using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

public enum AssigneeTaskRole
{
    Commander,
    Operator,
    Any
}

public enum Status
{
    Pending,
    InProgress,
    AwaitingApproval,
    Completed,
    Failed
}


namespace ClassroomServer.Models
{
    public class TrainingTaskStatus
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public AssigneeTaskRole AssigneeRole { get; set; }

        [Required]
        public Guid TrainingTaskId { get; set; } // TrainingTask // OWNER TrainingTask

        [Required]
        public Status Status { get; set; }
    }
}
