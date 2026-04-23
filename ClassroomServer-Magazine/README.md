# Flow Classroom-Server

## EP1

## EP2

## Adding a new model

When you want to add a new model schema, there are 4 places that you need to modify code:

1. Create the new schema file under `./Models`
2. Create a new controller for it under `./Controllers`
3. Create a new service for it under `./Services`
4. Create a new DbSet for it in the `./Data/ClassroomDbContext.cs` file, and add it's Entity configuration within the `OnModelCreating` function override
5. Add it to the `Builder.Services` in the main `Program.cs` file