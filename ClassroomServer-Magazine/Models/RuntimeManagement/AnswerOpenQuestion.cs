using System;
using System.ComponentModel.DataAnnotations;

namespace ClassroomServer.Models.RuntimeManagement
{
    public class AnswerOpenQuestion : AnswerBase
    {
        // [Required]
        public string Answer { get; set; } = null!;
    }
}