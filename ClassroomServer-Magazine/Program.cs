using DotNetEnv; 
using ClassroomServer.Models;
using ClassroomServer.Services;
using ClassroomServer.Services.ContentManagement;
using ClassroomServer.Data;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json.Serialization;
using System.Threading;
using System.Linq;


var builder = WebApplication.CreateBuilder(args);

// Load .env variables
Env.Load();

// Retrieve settings from .env or fallback to appsettings.json
string postgresConnectionString = Env.GetString("POSTGRES_CONNECTION_STRING", builder.Configuration["PostgresSettings:ConnectionString"]);
string ipAddress = Env.GetString("IP_ADDRESS", "localhost");
string port = Env.GetString("PORT", "5000");

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLanAccess",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:3002")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

// Register Entity Framework Core DbContext for PostgreSQL
if (!string.IsNullOrEmpty(postgresConnectionString))
{
    builder.Services.AddDbContext<ClassroomDbContext>(options =>
        options.UseNpgsql(postgresConnectionString));
}

// Register services
// All services that use DbContext should be Scoped (for proper dependency injection and disposal)
builder.Services.AddScoped<StudentService>();
builder.Services.AddScoped<CourseService>();
builder.Services.AddScoped<TrainingService>();
builder.Services.AddScoped<InstructorService>();
// builder.Services.AddScoped<StudentDataService>();
builder.Services.AddScoped<StudentHistoriesService>();
// builder.Services.AddScoped<StudentProgressionService>();
// builder.Services.AddScoped<FaultService>();
builder.Services.AddScoped<TrainingTaskService>();
builder.Services.AddScoped<TrainingTaskStatusService>();
// builder.Services.AddScoped<TaskSuccessTrackingService>();
builder.Services.AddScoped<SubjectService>();
builder.Services.AddScoped<LessonService>();
builder.Services.AddScoped<TaskBaseService>();
builder.Services.AddScoped<StudyUnitService>();
builder.Services.AddScoped<StationMonitorService>();
builder.Services.AddScoped<StudentTrainingGradesService>();
builder.Services.AddScoped<TrainingStatisticsService>();
builder.Services.AddSingleton<FlowService>();



// Add controllers and Swagger
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        {
            // allow enumeration values to be passed as their string values
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());

            // Handle circular references by ignoring cycles (prevents infinite loops when serializing navigation properties)
            options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        }
    );

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

var app = builder.Build();

// Apply database migrations automatically on startup (for development)
if (!string.IsNullOrEmpty(postgresConnectionString))
{
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ClassroomDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        
        // Retry logic to wait for PostgreSQL to be ready
        int maxRetries = 30;
        int retryDelayMs = 2000;
        bool migrated = false;
        
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                // Ensure database exists and is accessible
                if (!dbContext.Database.CanConnect())
                {
                    logger.LogWarning("Database not ready. Attempt {Attempt}/{MaxRetries}. Retrying in {Delay}ms...", 
                        attempt, maxRetries, retryDelayMs);
                    Thread.Sleep(retryDelayMs);
                    continue;
                }
                
                // Check if database needs to be created or migrated
                var pendingMigrations = dbContext.Database.GetPendingMigrations().ToList();
                
                if (pendingMigrations.Any())
                {
                    logger.LogInformation("Applying {Count} pending migration(s)...", pendingMigrations.Count);
                    dbContext.Database.Migrate();
                    logger.LogInformation("Database migrations applied successfully.");
                }
                else
                {
                    // If no migrations exist, ensure database is created with current model
                    if (!dbContext.Database.GetAppliedMigrations().Any())
                    {
                        logger.LogInformation("No migrations found. Ensuring database is created...");
                        dbContext.Database.EnsureCreated();
                        logger.LogInformation("Database created successfully.");
                    }
                    else
                    {
                        logger.LogInformation("Database is up to date.");
                    }
                }
                
                migrated = true;
                break;
            }
            catch (Exception ex) when (attempt < maxRetries)
            {
                logger.LogWarning(ex, "Database connection attempt {Attempt}/{MaxRetries} failed. Retrying in {Delay}ms...", 
                    attempt, maxRetries, retryDelayMs);
                Thread.Sleep(retryDelayMs);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while migrating the database after {MaxRetries} attempts.", maxRetries);
                throw;
            }
        }
        
        if (!migrated)
        {
            logger.LogError("Failed to migrate database after {MaxRetries} attempts.", maxRetries);
        }
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

// Use the CORS policy
app.UseCors("AllowLanAccess");

//app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ClassroomServer.Hubs.FlowHub>("/flowHub");

app.Urls.Add($"http://{ipAddress}:{port}");


app.Run();
