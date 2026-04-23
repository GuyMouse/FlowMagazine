using ClassroomServer.Models;
using ClassroomServer.Models.ContentManagement;
using ClassroomServer.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using ClassroomServer.Models.RuntimeManagement;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using ClassroomServer.Hubs;

namespace ClassroomServer.Services
{
    public class FlowTraining
    {
        public Training Training { get; set; }
        public List<Station> Stations { get; set; }
    }

    public class FlowStationAdvanceTaskResponse
    {
        public Training? Training { get; set; }
        public TrainingTask? TrainingTask { get; set; }
        public Station Station { get; set; }

        public string? ErrorMessage { get; set; } = null;

        public bool TrainingCompleted { get; set; } = false;
    }

    public class FlowAnswerOpenQuestion
    {
        public string Answer { get; set; } = null!;
    }

    public class FlowAnswerSelectionQuestion
    {
        public int AnswerIndex { get; set; } = -1;
    }

    public class FlowGradingReport
    {
        public Guid TrainingId { get; set; }
        public List<GradedStation> GradedStations { get; set; }
        // public List<FlowGradingReportItem> Items { get; set; }
    }

    public class GradedStation
    {
        public Guid StationId { get; set; }
        public List<Student> Students { get; set; }
    }

    public class QuestionAnswerData
    {
        public Guid TaskId { get; set; }

        public TaskBase Task { get; set; }
        public AnswerBase Answer { get; set; }
    }

    public class FlowService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private Training? ActiveTraining { get; set; }
        private List<Station> AvailableStations { get; set; }
        private List<Station> ActiveStations { get; set; }

        private float GradesSum { get; set; } = 0.0f;
        private readonly JsonSerializerOptions _jsonOptions;

        public FlowService(IServiceScopeFactory serviceScopeFactory)
        {
            _serviceScopeFactory = serviceScopeFactory;
            ActiveTraining = null;
            AvailableStations = new();
            ActiveStations = new();

            _jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
        }

        public List<Station> GetActiveStations() => ActiveStations;

        public async Task<bool> IsTrainingLive()
        {
            if (ActiveTraining == null)
            {
                return false;
                // throw new Exception("Training is NULL");
            }
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            var training = await dbContext.Trainings.FindAsync(ActiveTraining.Id);
            if (training == null)
            {
                return false;
                // throw new Exception("Training id NOT FOUND");
            }

            return training.IsLive;
        }

        public Station? InitializeStation()
        {
            if (ActiveStations.Count >= AvailableStations.Count)
            {
                return null;
            }

            var station = AvailableStations.ElementAt(ActiveStations.Count);
            ActiveStations.Add(station);

            return station;
        }


        private async Task<Training> CreateTraining(string studyUnitId)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            if (!Guid.TryParse(studyUnitId, out var studyUnitGuid))
            {
                throw new ArgumentException($"Invalid StudyUnitId format: {studyUnitId}", nameof(studyUnitId));
            }
            var studyUnit = await dbContext.StudyUnits.FindAsync(studyUnitGuid);
            if (studyUnit == null)
            {
                throw new ArgumentException($"StudyUnit with id {studyUnitGuid} not found", nameof(studyUnitId));
            }

            var course = await dbContext.Courses.FindAsync(studyUnit.CourseId);
            if (course == null)
            {
                throw new ArgumentException($"Course with id {studyUnit.CourseId} not found", nameof(studyUnitId));
            }

            var newTraining = new Training
            {
                CourseId = course.Id,
                InstructorId = course.InstructorId,
                StationIds = new List<Guid>(),
                StudyUnitId = studyUnitGuid,
                Location = course.Location, 
                Title = course.Name, // Default title for flow trainings
                CreationDate = DateTime.UtcNow,
                IsLive = true
            };

            dbContext.Trainings.Add(newTraining);
            studyUnit.TrainingId = newTraining.Id;
            course.TrainingIds.Add(newTraining.Id);
            
            await dbContext.SaveChangesAsync();

            return newTraining;
        }

        private async Task<Station> CreateStation(Training training)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            var newStation = new Station
            {
                StudyUnitId = training.StudyUnitId,
                TrainingId = training.Id,
                IsLive = false
            };

            dbContext.Stations.Add(newStation);
            var trainingUpdate = await dbContext.Trainings.FindAsync(training.Id);
            if (trainingUpdate.StationIds == null)
            {
                trainingUpdate.StationIds = new List<Guid>();
            }
            trainingUpdate!.StationIds!.Add(newStation.Id);
            await dbContext.SaveChangesAsync();

            return newStation;
        }
       
        public async Task<FlowTraining> StartFlowTraining(string studyUnitId, int numberOfStations)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            var flowTraining = new FlowTraining();
            var training = await CreateTraining(studyUnitId);

            for (int i = 0; i < numberOfStations; i++)
            {
                var Station = await CreateStation(training); // ! Not sure this is the right place for this
                AvailableStations.Add(Station);
            }

            training.StationIds!.AddRange(AvailableStations.Select(s => s.Id));
            await dbContext.SaveChangesAsync();

            ActiveTraining = training;
            flowTraining.Training = ActiveTraining;
            flowTraining.Stations = AvailableStations;
            
            return flowTraining;
        }

        public async Task<FlowStationAdvanceTaskResponse> OnStationInitLogin(string stationId, List<string> studentIds)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            var station = await dbContext.Stations.FindAsync(Guid.Parse(stationId));
            if (station == null)
            {
                return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"Station with id {stationId} not found" };
            }

            foreach (var studentId in studentIds)
            {
                var studentIdGuid = Guid.Parse(studentId);
                var student = await dbContext.Students.FindAsync(studentIdGuid);
                if (student == null)
                {
                    return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"Student with id {studentIdGuid} not found" };
                }
                station.StudentIds.Add(student.Id);
            }
            station.IsLive = true;
            await dbContext.SaveChangesAsync();

            ActiveStations.Find(st => st.Id == station.Id)!.StudentIds = station.StudentIds;
            ActiveStations.Find(st => st.Id == station.Id)!.IsLive = station.IsLive;

            return await OnStationTaskStart(stationId);
        }

        public async Task<FlowStationAdvanceTaskResponse> OnStationTaskStart(string stationId)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            FlowStationAdvanceTaskResponse response = new FlowStationAdvanceTaskResponse();
            
            var station = await dbContext.Stations.FindAsync(Guid.Parse(stationId));
            if (station == null)
            {
                response.ErrorMessage = $"Station with id {stationId} not found";
                return response;
            }

            // verify students are valid & connected to the station
            foreach (var studentId in station.StudentIds)
            {
                var student = await dbContext.Students.FindAsync(studentId);
                if (student == null)
                {
                    response.ErrorMessage = $"Student with id {studentId} not found";
                    return response;
                }
            }

            var StudyUnit = await dbContext.StudyUnits.FindAsync(station.StudyUnitId);
            if (StudyUnit == null)
            {
                response.ErrorMessage = $"StudyUnit with id {station.StudyUnitId} not found";
                return response;
            }

            station.CurrentTaskIndex++;
            await dbContext.SaveChangesAsync();

            if (station.CurrentTaskIndex == null || station.CurrentTaskIndex.Value >= StudyUnit.TaskIds.Count)
            {
                response.ErrorMessage = $"Current task index is out of range";
                return response;
            }
            Guid taskId = StudyUnit.TaskIds[station.CurrentTaskIndex.Value];

            var task = await dbContext.Tasks.FindAsync(taskId);
            if (task == null)
            {
                response.ErrorMessage = $"Task with id {taskId} not found";
                return response;
            }

            TaskType taskType = TaskType.None;

            if (task.GetType() == typeof(SelectionQuestion))
            {
                taskType = TaskType.SelectionQuestion;
            }
            else if (task.GetType() == typeof(OpenQuestion))
            {
                taskType = TaskType.OpenQuestion;
            }
            else
            {
                response.ErrorMessage = $"Task with id {taskId} is not a valid task - task type is None";
                return response;
            }

            // check if the TrainingTask already exists in the station
            // if it does, return the existing TrainingTask

            int studyUnitTaskIndex = station.CurrentTaskIndex.Value;
            bool taskAlreadyExists = false;
            TrainingTask? preExistingTrainingTask = null;

            station.TrainingTasks = await dbContext.TrainingTasks.Where(t => t.StationId == station.Id).ToListAsync();
            foreach (var existingTrainingTask in station.TrainingTasks)
            {
                if (existingTrainingTask.StudyUnitTaskIndex == studyUnitTaskIndex)
                {
                    taskAlreadyExists = true;
                    preExistingTrainingTask = existingTrainingTask;
                    break;
                }
            }

            if (taskAlreadyExists)
            {
                // update TrainingTaskStatus to InProgress
                var preExistingTaskStatus = await dbContext.TrainingTaskStatuses.FindAsync(preExistingTrainingTask.StatusId);
                preExistingTaskStatus.Status = Status.InProgress;
                await dbContext.SaveChangesAsync();

                response.Station = station;
                response.TrainingTask = preExistingTrainingTask;
                return response;
            }

            // TrainingTask does not yet exist in the station, create a new TrainingTask
            // FK: TrainingTaskStatus.Task must reference TrainingTask.Id (not TaskBase id). Create TrainingTask first so we have its Id.
            var trainingTask = new TrainingTask
            {
                Type = taskType,
                TrainingId = station.TrainingId,
                StationId = station.Id,
                TaskId = taskId,
                Task = task,
                StatusId = Guid.Empty, // set below after creating status
                StudyUnitTaskIndex = station.CurrentTaskIndex.Value
            };

            var taskStatus = new TrainingTaskStatus
            {
                AssigneeRole = task.AssigneeRole.Value,
                TrainingTaskId = trainingTask.Id, // FK points to TrainingTask.Id, not TaskBase id
                Status = Status.InProgress
            };
            trainingTask.StatusId = taskStatus.Id;

            station.TrainingTaskIds!.Add(trainingTask.Id);
            await dbContext.TrainingTasks.AddAsync(trainingTask);
            await dbContext.TrainingTaskStatuses.AddAsync(taskStatus);
            await dbContext.SaveChangesAsync();

            response.Station = station;
            response.TrainingTask = trainingTask;

            return response;
        }
        
        public async Task<FlowStationAdvanceTaskResponse> OnAnswerSubmitted(string stationId, JsonElement answerData)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            var station = await dbContext.Stations.FindAsync(Guid.Parse(stationId));
            if (station == null)
            {
                return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"Station with id {stationId} not found" };
            }

            var studyUnit = await dbContext.StudyUnits.FindAsync(station.StudyUnitId);
            if (studyUnit == null)
            {
                return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"StudyUnit with id {station.StudyUnitId} not found" };
            }

            var task = await dbContext.Tasks.FindAsync(studyUnit.TaskIds[station.CurrentTaskIndex!.Value]);
            if (task == null)
            {
                return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"Task with id {studyUnit.TaskIds[station.CurrentTaskIndex!.Value]} not found" };
            }

            // check if the training task already exists in the station*
            // This means, need to use the StudyUnitTaskIndex to find the training task
            station.TrainingTasks = await dbContext.TrainingTasks.Where(t => t.StationId == station.Id).ToListAsync();
            var trainingTask = station.TrainingTasks.Find(t => t.StudyUnitTaskIndex == station.CurrentTaskIndex.Value);
            if (trainingTask == null)
            {
                return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"TrainingTask with StudyUnitTaskIndex {station.CurrentTaskIndex.Value} not found" };
            }

            TaskType taskType = TaskType.None;
            if (task.GetType() == typeof(SelectionQuestion))
            {
                taskType = TaskType.SelectionQuestion;
            }
            else if (task.GetType() == typeof(OpenQuestion))
            {
                taskType = TaskType.OpenQuestion;
            }

            // if answer already exists, edit it - if not, create a new one
            AnswerBase answer = null;
            if (trainingTask.AnswerId != null)
            {
                answer = await dbContext.Answers.FindAsync(trainingTask.AnswerId);
            }

            switch (taskType)
            {
                case TaskType.SelectionQuestion:
                    var answerSelectionQuestion = JsonSerializer.Deserialize<FlowAnswerSelectionQuestion>(answerData, _jsonOptions);
                    if (answer != null)
                    {
                        ((AnswerSelectionQuestion)answer).AnswerIndex = answerSelectionQuestion.AnswerIndex;
                        await dbContext.SaveChangesAsync();
                        return await OnStationTaskCompleted(stationId);
                    }
                    else
                    {
                        answer = new AnswerSelectionQuestion
                        {
                            AnswerIndex = answerSelectionQuestion.AnswerIndex,
                            TaskId = task.Id
                        };
                    }
                    break;

                case TaskType.OpenQuestion:
                    var answerOpenQuestion = JsonSerializer.Deserialize<FlowAnswerOpenQuestion>(answerData, _jsonOptions);

                    if (answer != null)
                    {
                        ((AnswerOpenQuestion)answer).Answer = answerOpenQuestion.Answer;
                        await dbContext.SaveChangesAsync();
                        return await OnStationTaskCompleted(stationId);
                    }
                    else
                    {
                        answer = new AnswerOpenQuestion
                        {
                            Answer = answerOpenQuestion.Answer,
                            TaskId = task.Id
                        };
                    }
                    break;
            }

            if (answer == null)
            {
                return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"Answer is null" };
            }

            answer.TrainingTaskId = trainingTask.Id;
            trainingTask.AnswerId = answer.Id;

            dbContext.Answers.Add(answer);
            await dbContext.SaveChangesAsync();

            return await OnStationTaskCompleted(stationId);
        }

        public async Task<FlowStationAdvanceTaskResponse> OnStationTaskCompleted(string stationId)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            var station = await dbContext.Stations.FindAsync(Guid.Parse(stationId));
            if (station == null)
            {
                return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"Station with id {stationId} not found" };
            }

            var studyUnit = await dbContext.StudyUnits.FindAsync(station.StudyUnitId);
            if (studyUnit == null)
            {
                return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"StudyUnit with id {station.StudyUnitId} not found" };
            }

            // update task status to completed
            station.TrainingTasks = await dbContext.TrainingTasks.Where(t => t.StationId == station.Id).ToListAsync();
            var trainingTask = station.TrainingTasks.Find(t => t.StudyUnitTaskIndex == station.CurrentTaskIndex.Value);
            
            if (trainingTask == null)
            {
                return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"TrainingTask with at index {station.CurrentTaskIndex.Value} not found" };
            }
            var trainingTaskStatus = await dbContext.TrainingTaskStatuses.FindAsync(trainingTask.StatusId);
            if (trainingTaskStatus == null)
            {
                return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"TrainingTaskStatus with id {trainingTask.StatusId} not found" };
            }
            trainingTaskStatus.Status = Status.Completed;
            await dbContext.SaveChangesAsync();


            if (station.CurrentTaskIndex == null || station.CurrentTaskIndex.Value >= studyUnit.TaskIds.Count)
            {
                // Identify the case where the last answer has been submitted, so the station may be finished, but the station still needs
                // to send 'SubmitTraining' message so we know it finished for sure, allowing us to start grading it
                FlowStationAdvanceTaskResponse response = new FlowStationAdvanceTaskResponse();
                response.Station = station;
                response.TrainingTask = trainingTask;
                return response;
            }
            
            // if the station is not finished, continue with starting the next task
            return await OnStationTaskStart(stationId);
        }

        private async Task<float> CalculateTrainingGradeAverage()
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            var updatedTraining = await dbContext.Trainings.FindAsync(ActiveTraining!.Id);
            int studentsCount = 0;

            // Loop over all stations to get the students count (ActiveStations/AvailableStations are empty by this point)
            foreach (var stationId in updatedTraining!.StationIds!)
            {
                var station = await dbContext.Stations.FindAsync(stationId);
                if (station == null)
                {
                    throw new Exception($"Station with id {stationId} not found");
                }
                studentsCount += station.StudentIds.Count;
            }

            float gradeAverage = studentsCount == 0 ? 0f : GradesSum / studentsCount;
            
            return gradeAverage;
        }

        private async Task<TrainingStatistics> CalculateTrainingStatistics()
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();

            // Average grade calculation
            float gradeAverage = await CalculateTrainingGradeAverage();

            // Task statistics calculation
            var training = await dbContext.Trainings.FindAsync(ActiveTraining!.Id);
            var studyUnit = await dbContext.StudyUnits.FindAsync(training!.StudyUnitId);
            var taskIds = studyUnit!.TaskIds;

            var trainingStatistics = new TrainingStatistics
            {
                TrainingId = ActiveTraining!.Id,
                GradeAverage = gradeAverage
            };
            training.TrainingStatisticsId = trainingStatistics.Id;

            List<TaskStatistics> tasksStatistics = new();
            foreach (var taskId in taskIds)
            {
                int failedAttempts = 0;
                int successfulAttempts = 0;
                var task = await dbContext.Tasks.FindAsync(taskId);
                
                var trainingTasks = await dbContext.TrainingTasks.Where(t => t.TaskId == taskId && t.TrainingId == ActiveTraining!.Id).ToListAsync();
                foreach (var trainingTask in trainingTasks)
                {
                    if (trainingTask.AnswerId == null)
                    {
                        failedAttempts++;
                    }
                    else
                    {
                        var answer = await dbContext.Answers.FindAsync(trainingTask.AnswerId);
                        if (answer == null)
                        {
                            failedAttempts++;
                        }
                        else if (answer.GetType() == typeof(AnswerSelectionQuestion))
                        {
                            var selectionAnswer = answer as AnswerSelectionQuestion;
                            var selectionQuestion = task as SelectionQuestion;
                            if (selectionAnswer.AnswerIndex == selectionQuestion.CorrectIndex)
                            {
                                successfulAttempts++;
                            }
                            else
                            {
                                failedAttempts++;
                            }
                        }
                        // else if (answer.GetType() == typeof(AnswerOpenQuestion)) // FUTURE TODO
                        // {

                        // }
                        else // should never get here!
                        {
                            failedAttempts++;
                        }
                    }
                    
                }

                var taskStatistics = new TaskStatistics
                {
                    TrainingStatisticsId = trainingStatistics.Id,
                    TaskId = taskId,
                    FailedAttempts = failedAttempts,
                    SuccessfulAttempts = successfulAttempts
                };
                tasksStatistics.Add(taskStatistics);
            }
            trainingStatistics.TaskStatistics = tasksStatistics;
            trainingStatistics.TaskStatisticsIds = tasksStatistics.Select(t => t.Id).ToList();
            
            await dbContext.TaskStatistics.AddRangeAsync(tasksStatistics);
            await dbContext.TrainingStatistics.AddAsync(trainingStatistics);
            training.TrainingStatisticsId = trainingStatistics.Id;
            await dbContext.SaveChangesAsync();

            return trainingStatistics;
        }

        private async Task<bool> CalculateStudentsGrades(Station station, StudyUnit studyUnit)
        {
            // ----------------------------------------------------------------------------------------------------
            // -------------- THIS WILL NEED TO BE SCALED FOR MULTIPLE STUDENTS WITH DIFFERENT ROLES --------------

            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();

            foreach (var studentId in station.StudentIds)
            {
                var student = await dbContext.Students.FindAsync(studentId);

                var studentHistory = null as StudentHistory;
                if (student.StudentHistoryId == null)
                {
                    studentHistory = new StudentHistory
                    {
                        StudentId = studentId
                    };
                    student.StudentHistoryId = studentHistory.Id;
                    await dbContext.StudentHistories.AddAsync(studentHistory);
                }
                else
                {
                    studentHistory = await dbContext.StudentHistories.FindAsync(student.StudentHistoryId);
                }

                var studentTrainingGrade = new StudentTrainingGrade
                {
                    StudentHistoryId = studentHistory.Id,
                    TrainingId = ActiveTraining!.Id,
                    Grade = await CalculateStationTrainingGrade(ActiveTraining!.Id, station.Id, studyUnit.TaskIds.Count),
                };
                await dbContext.StudentTrainingGrades.AddAsync(studentTrainingGrade);
                await dbContext.SaveChangesAsync(); // Persist grade first so FK from StudentTrainingTaskInfos can reference it

                var trainingTasksInfos = await BuildStationTrainingTasksInfos(ActiveTraining!.Id, station.Id, studentTrainingGrade.Id);
                studentTrainingGrade.TrainingTasksInfosIds = trainingTasksInfos.Select(t => t.Id).ToList();
                studentHistory.StudentTrainingGradeIds!.Add(studentTrainingGrade.Id);

                await dbContext.SaveChangesAsync();
            }

            return true;

            // -------------- THIS WILL NEED TO BE SCALED FOR MULTIPLE STUDENTS WITH DIFFERENT ROLES --------------
            // ----------------------------------------------------------------------------------------------------
        }

        private async Task<float> CalculateStationTrainingGrade(Guid trainingId, Guid stationId, int tasksCount)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            var training = await dbContext.Trainings.FindAsync(trainingId);
            if (training == null)
            {
                throw new Exception($"Training with id {trainingId} not found");
            }

            var station = await dbContext.Stations.FindAsync(stationId);
            if (station == null)
            {
                throw new Exception($"Station with id {stationId} not found");
            }

            float gradeMultiplier = 100.0f / tasksCount;
            float finalGrade = 0.0f;

            station.TrainingTasks = await dbContext.TrainingTasks.Where(t => station.TrainingTaskIds!.Contains(t.Id)).ToListAsync();
            foreach (var trainingTask in station.TrainingTasks)
            {
                trainingTask.Task = await dbContext.Tasks.FindAsync(trainingTask.TaskId);
                trainingTask.Answer = await dbContext.Answers.FindAsync(trainingTask.AnswerId);

                // HARDCODED FOR NOW - WILL NEED TO BE SCALED FOR MULTIPLE QUESION/ANSWER TYPES
                var task = trainingTask.Task as SelectionQuestion;
                var answer = trainingTask.Answer as AnswerSelectionQuestion;

                if (task.CorrectIndex == answer.AnswerIndex)
                {
                    finalGrade += gradeMultiplier;
                }
            }
            
            GradesSum += finalGrade;

            return finalGrade;
        }

        private async Task<List<StudentTrainingTaskInfo>> BuildStationTrainingTasksInfos(Guid trainingId, Guid stationId, Guid studentTrainingGradeId)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            var training = await dbContext.Trainings.FindAsync(trainingId);
            if (training == null)
            {
                throw new Exception($"Training with id {trainingId} not found");
            }

            var station = await dbContext.Stations.FindAsync(stationId);
            if (station == null)
            {
                throw new Exception($"Station with id {stationId} not found");
            }

            var trainingTasksInfos = new List<StudentTrainingTaskInfo>();

            station.TrainingTasks = await dbContext.TrainingTasks.Where(t => station.TrainingTaskIds!.Contains(t.Id)).ToListAsync();
            foreach (var trainingTask in station.TrainingTasks)
            {
                // HARDCODED FOR NOW - WILL NEED TO BE SCALED FOR MULTIPLE QUESION/ANSWER TYPES
                var task = await dbContext.Tasks.FindAsync(trainingTask.TaskId) as SelectionQuestion;
                var answer = await dbContext.Answers.FindAsync(trainingTask.AnswerId) as AnswerSelectionQuestion;
                bool isCorrect = task.CorrectIndex == answer.AnswerIndex;

                var studentTrainingTaskInfo = new StudentTrainingTaskInfo
                {
                    StudentTrainingGradeId = studentTrainingGradeId,
                    // TaskId = trainingTask.TaskId,
                    AnswerId = trainingTask.AnswerId ?? Guid.Empty,
                    IsCorrect = isCorrect
                };

                trainingTasksInfos.Add(studentTrainingTaskInfo);
            }

            await dbContext.StudentTrainingTaskInfos.AddRangeAsync(trainingTasksInfos);
            await dbContext.SaveChangesAsync();

            return trainingTasksInfos;
        }

        public async Task<FlowStationAdvanceTaskResponse> OnStationTrainingSubmitted(string stationId)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            var station = await dbContext.Stations.FindAsync(Guid.Parse(stationId));
            if (station == null)
            {
                return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"Station with id {stationId} not found" };
            }

            var studyUnit = await dbContext.StudyUnits.FindAsync(station.StudyUnitId);
            if (studyUnit == null)
            {
                return new FlowStationAdvanceTaskResponse() { ErrorMessage = $"StudyUnit with id {station.StudyUnitId} not found" };
            }

            // mark station finished training
            station.IsLive = false;
            station.CurrentTaskIndex = studyUnit.TaskIds.Count;
            await dbContext.SaveChangesAsync();

            // calculate students grades
            await CalculateStudentsGrades(station, studyUnit);

            // update global stations state
            AvailableStations.Remove(AvailableStations.First(s => s.Id == station.Id));
            ActiveStations.Remove(ActiveStations.First(s => s.Id == station.Id));

            // if all stations finished training, the training is completed
            if (AvailableStations.Count == 0)
            {
                // Calculate training statistics
                var trainingStatistics = await CalculateTrainingStatistics();

                // Set training to NOT live
                var training = await dbContext.Trainings.FindAsync(ActiveTraining!.Id);
                training!.IsLive = false;
                await dbContext.SaveChangesAsync();

                // Reset active training and stations
                ActiveTraining = null;
                ActiveStations.Clear();
                GradesSum = 0.0f;

                // Add statistics to final socket response
                training!.TrainingStatistics = trainingStatistics;
                return new FlowStationAdvanceTaskResponse() { Training = training, /*AllStations*/TrainingCompleted = true, /*LastFinished*/Station = station };
            }

            return new FlowStationAdvanceTaskResponse() { /*SingleStation*/TrainingCompleted = true, Station = station };
        }

        // WIP - This is used when the station jumps to a specific task
        public async Task<FlowStationAdvanceTaskResponse> OnStationJumpToTask(string stationId, int taskIndex)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();

            FlowStationAdvanceTaskResponse response = new FlowStationAdvanceTaskResponse();
            
            var station = await dbContext.Stations.FindAsync(Guid.Parse(stationId));
            if (station == null)
            {
                response.ErrorMessage = $"Station with id {stationId} not found";
                return response;
            }

            station.CurrentTaskIndex = taskIndex;
            await dbContext.SaveChangesAsync();

            station.TrainingTasks = await dbContext.TrainingTasks.Where(t => t.StationId == station.Id).ToListAsync();
            var trainingTask = station.TrainingTasks.Find(t => t.StudyUnitTaskIndex == taskIndex);
            bool trainingTaskExists = station.TrainingTasks.Exists(t => t.StudyUnitTaskIndex == taskIndex);
            
            if (!trainingTaskExists || trainingTask == null)
            {
                var studyUnit = await dbContext.StudyUnits.FindAsync(station.StudyUnitId);
                if (studyUnit == null)
                {
                    response.ErrorMessage = $"StudyUnit with id {station.StudyUnitId} not found";
                    return response;
                }
                var task = await dbContext.Tasks.FindAsync(studyUnit.TaskIds[taskIndex]);
                if (task == null)
                {
                    response.ErrorMessage = $"Task with at index {taskIndex} in StudyUnit.Tasks not found";
                    return response;
                }

                // FUTURE: Will need to switch on additional task types once they are introduced in the application
                TaskType taskType = task.GetType() == typeof(SelectionQuestion) ? TaskType.SelectionQuestion : TaskType.OpenQuestion;

                trainingTask = new TrainingTask
                {
                    Type = taskType,
                    TrainingId = station.TrainingId,
                    StationId = station.Id,
                    TaskId = task.Id,
                    Task = task,
                    StatusId = Guid.Empty, // set below after creating status
                    StudyUnitTaskIndex = station.CurrentTaskIndex.Value
                };

                var taskStatus = new TrainingTaskStatus
                {
                    AssigneeRole = task.AssigneeRole.Value,
                    TrainingTaskId = trainingTask.Id, // FK points to TrainingTask.Id, not TaskBase id
                    Status = Status.InProgress
                };
                trainingTask.StatusId = taskStatus.Id;

                station.TrainingTaskIds!.Add(trainingTask.Id);
                await dbContext.TrainingTasks.AddAsync(trainingTask);
                await dbContext.TrainingTaskStatuses.AddAsync(taskStatus);
                await dbContext.SaveChangesAsync();
            }

            response.Station = station;
            response.TrainingTask = trainingTask;

            return response;
        }

        // Manually finish the training - this is used when the training is aborted by the instructor
        public async Task<FlowStationAdvanceTaskResponse> FinishTraining()
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            var training = await dbContext.Trainings.FindAsync(ActiveTraining!.Id);
            training!.IsLive = false;

            // var studyUnit = await dbContext.StudyUnits.FindAsync(training.StudyUnitId);

            foreach (var station in AvailableStations)
            {
                var validStation = dbContext.Stations.First(s => s.Id == station.Id);
                if (validStation == null)
                {
                    throw new Exception($"Station with id {station.Id} not found");
                }
                station.IsLive = false;
                // await CalculateStudentsGrades(station, studyUnit);
            }
            await dbContext.SaveChangesAsync();

            ActiveTraining = null;
            ActiveStations.Clear();
            AvailableStations.Clear();

            return new FlowStationAdvanceTaskResponse() { Training = training, TrainingCompleted = true };
        }

        public async Task<bool> CanLogStudentToStation(Guid studentId)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
            
            var liveStations = await dbContext.Stations.Where(s => s.IsLive == true).ToListAsync();
            bool canLogIn = true;
            
            foreach (var station in liveStations)
            {
                if (station.StudentIds.Contains(studentId))
                {
                    canLogIn = false;
                    break;
                }
            }
            
            return canLogIn;
        }
    }
}