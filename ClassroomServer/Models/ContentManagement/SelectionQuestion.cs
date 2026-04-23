using System;
using System.ComponentModel.DataAnnotations;

namespace ClassroomServer.Models.ContentManagement
{
    public class SelectionQuestion : TaskBase
    {
        // [Required]
        public string Prompt { get; set; } = null!;

        // [Required]
        public List<string> Options { get; set; } = new();
        public int CorrectIndex { get; set; } = 0;
    }
}