using Microsoft.AspNetCore.SignalR;
using ClassroomServer.Services;
using System.Text.Json;

namespace ClassroomServer.Hubs
{
    public class FlowConnectionRequest
    {
        public string OwnerId { get; set; } = string.Empty;
        public bool IsStation { get; set; }

        public string? StudyUnitId { get; set; } = null;

        public List<string>? StudentIds { get; set; } = null;   // Only for stations // TODO: DEPRECATE this here and bring it from the related Course
        public int? NumberOfStations { get; set; } = null;      // Only for instructor
    }

    public class FlowTrainingConnectionClient
    {
        public string OwnerId { get; set; } = string.Empty;
        public string ConnectionId { get; set; } = string.Empty;
    }
    
    /// <summary>
    /// SignalR hub used for broadcasting messages to Stations and Instructors during Training.
    /// </summary>
    public class FlowHub : Hub
    {
        private static readonly object _lock = new object();

        private static FlowTrainingConnectionClient? InstructorConnection { get; set; } = null;
        private static List<FlowTrainingConnectionClient> StationConnections { get; set; } = new();
        private readonly FlowService _flowService;
        public FlowHub(FlowService flowService)
        {
            _flowService = flowService;
        }

        /// <summary>
        /// Registers a client connection as either an instructor or a station.
        /// </summary>
        /// <param name="request">Connection request containing IsStation flag</param>
        public async Task RegisterTrainingConnection(FlowConnectionRequest request)
        {
            if (request.IsStation)
            {
                if (request.StudentIds != null && request.StudentIds.Count < 1)
                {
                    await Clients.Caller.SendAsync("ConnectionRejected", new { Message = "Student ids array is empty" });
                    return;
                }

                if (request.StudentIds == null)
                {
                    await Clients.Caller.SendAsync("ConnectionRejected", new { Message = "Student ids is NULL" });
                    return;
                }

                foreach (var studentId in request.StudentIds)
                {
                    var canLogIn = await _flowService.CanLogStudentToStation(Guid.Parse(studentId));
                    if (!canLogIn)
                    {
                        await Clients.Caller.SendAsync("ConnectionRejected", new { Message = "Student with id " + studentId + " is already logged in to a station" });
                        return;
                    }
                }

                // Add station to the stations group
                lock (_lock)
                {
                    StationConnections.Add(new FlowTrainingConnectionClient { 
                        OwnerId = request.OwnerId, 
                        ConnectionId = Context.ConnectionId 
                    });
                }

                var response = await _flowService.OnStationInitLogin(request.OwnerId, request.StudentIds!);
                if (response.ErrorMessage != null)
                {
                    await Clients.Caller.SendAsync("ConnectionRejected", new { Message = response.ErrorMessage });
                    lock (_lock)
                    {
                        StationConnections.Remove(StationConnections.First(s => s.ConnectionId == Context.ConnectionId));
                    }
                    return;
                }

                await Clients.Caller.SendAsync("TrainingConnectionRegistered", new { 
                    TrainingTask = response.TrainingTask, 
                    Station = response.Station 
                });
                
                if (InstructorConnection != null)
                {
                    await Clients.Client(InstructorConnection.ConnectionId).SendAsync("TrainingConnectionRegistered", new { 
                        Station = response.Station
                    });
                } 
            }
            else
            {
                // Handle instructor connection (only one allowed)
                bool canConnect = false;
                lock (_lock)
                {
                    if (InstructorConnection != null && InstructorConnection.ConnectionId != Context.ConnectionId)
                    {
                        // Another instructor is already connected
                        canConnect = false;
                    }
                    else
                    {
                        InstructorConnection = new FlowTrainingConnectionClient { 
                            OwnerId = request.OwnerId, 
                            ConnectionId = Context.ConnectionId 
                        };
                        canConnect = true;
                    }
                }

                if (!canConnect)
                {
                    await Clients.Caller.SendAsync("ConnectionRejected", new { Message = "An instructor is already connected" });
                    InstructorConnection = null;
                    return;
                }

                if (request.NumberOfStations == null || request.NumberOfStations != null &&request.NumberOfStations < 1)
                {
                    await Clients.Caller.SendAsync("ConnectionRejected", new { Message = "Number of stations is required" });
                    InstructorConnection = null;
                    return;
                }

                if (request.StudyUnitId == null)
                {
                    await Clients.Caller.SendAsync("ConnectionRejected", new { Message = "Study unit id is required" });
                    InstructorConnection = null;
                    return;
                }

                // Add instructor to the instructor group
                // await Groups.AddToGroupAsync(Context.ConnectionId, "instructor");
                var response = await _flowService.StartFlowTraining(request.StudyUnitId, request.NumberOfStations!.Value);
                await Clients.Caller.SendAsync("TrainingConnectionRegistered", new { 
                    Training = response.Training, 
                    Stations = response.Stations, 
                    Message = "Training started successfully" 
                });
            }
        }

        public async Task SubmitAnswer(string stationId, JsonElement answerData)
        {
            var response = await _flowService.OnAnswerSubmitted(stationId, answerData);
            if (response.ErrorMessage != null)
            {
                await Clients.Caller.SendAsync("AnswerSubmissionRejected", new { Message = response.ErrorMessage });
                return;
            }
            await Clients.Caller.SendAsync("AnswerSubmissionAccepted", new { TrainingTask = response.TrainingTask, Station = response.Station, TrainingCompleted = response.TrainingCompleted });
            
            // Broadcast the answer to the Instructor
            if (InstructorConnection != null)
            {
                await Clients.Client(InstructorConnection.ConnectionId).SendAsync("AnswerSubmissionAccepted", new { 
                    Training = response.Training, 
                    TrainingTask = response.TrainingTask, 
                    Station = response.Station,
                    TrainingCompleted = response.TrainingCompleted
                });
            }

            // When this condition is true, it means that the Training is completed for ALL stations
            if (response.Training != null && response.Training.IsLive == false)
            {
                // Notify all connections that training is completed and they should disconnect
                /*
                var connectionsToDisconnect = new List<string>();
                
                lock (_lock)
                {
                    // Collect all connection IDs
                    if (InstructorConnection != null)
                    {
                        connectionsToDisconnect.Add(InstructorConnection.ConnectionId);
                    }
                    
                    foreach (var station in StationConnections)
                    {
                        connectionsToDisconnect.Add(station.ConnectionId);
                    }
                    
                    // Clear the static collections
                    InstructorConnection = null;
                    StationConnections.Clear();
                }
                
                // Send disconnect message to all connections
                foreach (var connectionId in connectionsToDisconnect)
                {
                    try
                    {
                        await Clients.Client(connectionId).SendAsync("TrainingCompleted", new { 
                            Message = "Training completed. Please disconnect.",
                            Training = response.Training
                        });
                    }
                    catch
                    {
                        // Connection may already be closed, ignore
                    }
                }
                */
            }
        }

        // WIP - This is used when the station finishes and submits the training to the server
        public async Task SubmitTraining(string stationId)
        {
            var response = await _flowService.OnStationTrainingSubmitted(stationId);
            if (response.ErrorMessage != null)
            {
                await Clients.Caller.SendAsync("TrainingSubmissionRejected", new { Message = response.ErrorMessage });
                return;
            }
            await Clients.Caller.SendAsync("TrainingSubmissionAccepted", new { TrainingCompleted = response.TrainingCompleted, Station = response.Station });
        }

        public async Task JumpToTask(string stationId, int taskIndex)
        {
            var response = await _flowService.OnStationJumpToTask(stationId, taskIndex);
            if (response.ErrorMessage != null)
            {
                await Clients.Caller.SendAsync("TaskJumpRejected", new { Message = response.ErrorMessage });
                return;
            }
            await Clients.Caller.SendAsync("TaskJumpAccepted", new { TrainingTask = response.TrainingTask, Station = response.Station });
        }

        /// <summary>
        /// WIP - Manually finish the training - this is used when the training is aborted by the instructor
        /// </summary>
        /// <returns></returns>
        public async Task FinishTraining()
        {
            var response = await _flowService.FinishTraining();

            await Clients.Caller.SendAsync("TrainingFinishedAccepted", new { Training = response.Training, TrainingCompleted = response.TrainingCompleted });
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Handle disconnecting clients
            lock (_lock)
            {
                if (InstructorConnection != null && InstructorConnection.ConnectionId == Context.ConnectionId)
                {
                    InstructorConnection = null;
                }
                else if (StationConnections.Any(s => s.ConnectionId == Context.ConnectionId))
                {
                    StationConnections.Remove(StationConnections.First(s => s.ConnectionId == Context.ConnectionId));
                }
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
