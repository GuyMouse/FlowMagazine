using System;
using System.ComponentModel.DataAnnotations;

namespace ClassroomServer.Models.ContentManagement
{
    public class OpenQuestion : TaskBase
    {
        // [Required]
        public string Question { get; set; } = null!;

        // [Required]
        public string Answer { get; set; } = null!;
    }
}