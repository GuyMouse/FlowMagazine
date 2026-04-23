FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ClassroomServer.csproj ./
RUN dotnet restore "ClassroomServer.csproj"

# Copy the remaining source and build
COPY . ./
RUN dotnet publish "ClassroomServer.csproj" -c Debug -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000

COPY --from=build /app/publish ./

EXPOSE 5000

ENTRYPOINT ["dotnet", "ClassroomServer.dll"]


