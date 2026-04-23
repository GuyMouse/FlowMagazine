using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ClassroomServer.Models;
using ClassroomServer.Data;

namespace ClassroomServer.Services
{
    public class StationMonitorService : BackgroundService
    {
        private readonly ILogger<StationMonitorService> _logger;
        // private readonly Dictionary<int, StationState> _stations;
        private readonly ClassroomDbContext _dbContext;

        public StationMonitorService(ILogger<StationMonitorService> logger, ClassroomDbContext dbContext)
        {
            _logger = logger;

            _dbContext = dbContext;
        }

        // Simulate monitoring stations
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Station monitoring service is running.");

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken); // Simulate a periodic check
            }
        }

        // Get the status of a specific station
        public async Task<Station?> GetStation(string stationId)
        {
            var station = await _dbContext.Stations.FindAsync(Guid.Parse(stationId));
            if (station == null)
            {
                return null;
            }
            return station;
        }

        // Update station status based on data received from the physical station
        public async Task<Station?> UpdateStation(string id, List<Guid>? studentIds, Guid? trainingId, Guid? studyUnitId, string? stationName, List<Guid>? trainingTaskIds, int? currentTaskIndex)
        {
            var stationId = Guid.Parse(id);
            var station = await _dbContext.Stations.FindAsync(stationId);
            if (station == null)
            {
                return null;
            }
            station.StudentIds = studentIds ?? station.StudentIds;
            station.TrainingId = trainingId ?? station.TrainingId;
            station.StudyUnitId = studyUnitId ?? station.StudyUnitId;
            station.StationName = stationName ?? station.StationName;
            station.TrainingTaskIds = trainingTaskIds ?? station.TrainingTaskIds;
            station.CurrentTaskIndex = currentTaskIndex ?? station.CurrentTaskIndex;

            await _dbContext.SaveChangesAsync();
            
            return station;
        }
    }
}
