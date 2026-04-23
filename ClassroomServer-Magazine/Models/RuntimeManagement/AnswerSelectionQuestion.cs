using System;
using System.ComponentModel.DataAnnotations;

namespace ClassroomServer.Models.RuntimeManagement
{
    public class AnswerSelectionQuestion : AnswerBase
    {
        [Required]
        public int AnswerIndex { get; set; }
    }
}