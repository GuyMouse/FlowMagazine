using ClassroomServer.Models;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using System.Text.Json;
using ClassroomServer.Models.ContentManagement;
using ClassroomServer.DTOs;

namespace ClassroomServer.Services.ContentManagement
{
     // Helper classes for deserialization
    public class SelectionQuestionData
    {
        public string Prompt { get; set; } = null!;
        public List<string> Options { get; set; } = new();
        public int CorrectIndex { get; set; }
    }

    public class OpenQuestionData
    {
        public string Question { get; set; } = null!;
        public string Answer { get; set; } = null!;
    }

    public class TaskBaseService
    {
        private readonly ClassroomDbContext _dbContext;
        private readonly JsonSerializerOptions jsonOptions;

        public TaskBaseService(ClassroomDbContext dbContext)
        {
            _dbContext = dbContext;
            jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
        }

        public async Task<TaskBase> CreateTask(string title, TaskType type, string lessonId, JsonElement data)
        {
            var newTask = null as TaskBase;

            switch (type)
            {
                case TaskType.SelectionQuestion:
                    var selectionData = JsonSerializer.Deserialize<SelectionQuestionData>(data, jsonOptions);
                    newTask = new SelectionQuestion
                    {
                        Title = title,
                        Prompt = selectionData.Prompt,
                        Options = selectionData.Options,
                        CorrectIndex = selectionData.CorrectIndex,
                        LessonId = Guid.Parse(lessonId)
                    };
                    break;
                
                case TaskType.OpenQuestion:
                    var openData = JsonSerializer.Deserialize<OpenQuestionData>(data, jsonOptions);
                    newTask = new OpenQuestion
                    {
                        Title = title,
                        Question = openData.Question,
                        Answer = openData.Answer,
                        LessonId = Guid.Parse(lessonId)
                    };
                    break;
            }

            if (newTask == null)
            {
                return null;
            }

            _dbContext.Tasks.Add(newTask);
            await _dbContext.SaveChangesAsync();
            return newTask;
        }

        public async Task<TaskBase> EditTaskBase(string id, TaskType type, string? title = null, string? lessonId = null, JsonElement? data = null)
        {
            var taskId = Guid.Parse(id);
            var task = await _dbContext.Tasks.FindAsync(taskId);
            
            if (task == null)
            {
                return null;
            }

            bool ShouldSave = false;

            switch (type)
            {
                case TaskType.SelectionQuestion:
                    
                    var selectionTask = task as SelectionQuestion;
                    if (title != null)
                    {
                        selectionTask.Title = title;
                        ShouldSave = true;
                    }
                    if (lessonId != null)
                    {
                        selectionTask.LessonId = Guid.Parse(lessonId);
                        ShouldSave = true;
                    }
                    if (data != null)
                    {
                        var selectionData = JsonSerializer.Deserialize<SelectionQuestionUpdateDTO>(data.Value, jsonOptions);
                        if (selectionData.Prompt != null)
                        {
                            selectionTask.Prompt = selectionData.Prompt;
                            ShouldSave = true;
                        }
                        if (selectionData.Options != null)
                        {
                            selectionTask.Options = selectionData.Options;
                            ShouldSave = true;
                        }
                        if (selectionData.CorrectIndex != null)
                        {
                            selectionTask.CorrectIndex = selectionData.CorrectIndex.Value;
                            ShouldSave = true;
                        }
                    }

                    break;
                
                case TaskType.OpenQuestion:
                    var openTask = task as OpenQuestion;
                    
                    if (title != null)
                    {
                        openTask.Title = title;
                        ShouldSave = true;
                    }

                    if (lessonId != null)
                    {
                        openTask.LessonId = Guid.Parse(lessonId);
                        ShouldSave = true;
                    }

                    if (data != null)
                    {

                        var openData = JsonSerializer.Deserialize<OpenQuestionUpdateDTO>(data.Value, jsonOptions);
                        if (openData.Question != null)
                        {
                            openTask.Question = openData.Question;
                            ShouldSave = true;
                        }
                        if (openData.Answer != null)
                        {
                            openTask.Answer = openData.Answer;
                            ShouldSave = true;
                        }
                    }
                    
                    break;
            }
            
            if (ShouldSave)
            {
                await _dbContext.SaveChangesAsync();
            }

            return task;
        }

        public async Task<List<TaskBase>> GetAllTasksAsync()
        {
            return await _dbContext.Tasks.Include(t => t.Lesson).ToListAsync();
        }

        public async Task<TaskBase> GetTaskByIdAsync(string id)
        {
            var taskId = Guid.Parse(id);
            return await _dbContext.Tasks.Include(t => t.Lesson).FirstOrDefaultAsync(t => t.Id == taskId);
        }

        public async Task<TaskBase> DeleteTask(string id)
        {
            var taskId = Guid.Parse(id);
            var task = await _dbContext.Tasks.FindAsync(taskId);
            if (task == null)
            {
                return null;
            }
            _dbContext.Tasks.Remove(task);
            await _dbContext.SaveChangesAsync();
            return task;
        }
    }

    
}

