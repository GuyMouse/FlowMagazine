#!/bin/bash
set -e

echo "Installing EF Core tools..."
dotnet tool install --global dotnet-ef > /dev/null 2>&1 || true
export PATH="$PATH:/root/.dotnet/tools"

# Install postgresql-client if not available
if ! command -v psql &> /dev/null; then
    echo "Installing postgresql-client..."
    apt-get update -qq > /dev/null 2>&1
    apt-get install -y -qq postgresql-client > /dev/null 2>&1
fi

echo "Restoring packages..."
dotnet restore

# Check if this is the first migration (baseline)
if [ ! -d Migrations ] || [ -z "$(ls -A Migrations/*.cs 2>/dev/null | grep -v ModelSnapshot)" ]; then
    echo "No migrations found. Creating initial baseline migration..."
    MIGRATION_NAME="InitialBaseline_$(date +%Y%m%d_%H%M%S)"
    dotnet ef migrations add "$MIGRATION_NAME" --project ClassroomServer.csproj
    
    # Extract migration ID from filename (format: TIMESTAMP_MigrationName.cs)
    MIGRATION_FILE=$(ls Migrations/*"$MIGRATION_NAME".cs | head -1)
    MIGRATION_ID=$(basename "$MIGRATION_FILE" .cs)
    echo "Created migration: $MIGRATION_ID"
    
    # Wait for postgres
    sleep 2
    
    # Mark baseline as applied
    echo "Marking baseline migration as applied (tables already exist)..."
    PGPASSWORD=postgres psql -h postgres -U postgres -d classroomdb <<EOF
CREATE TABLE IF NOT EXISTS __EFMigrationsHistory (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);
INSERT INTO __EFMigrationsHistory ("MigrationId", "ProductVersion")
VALUES ('$MIGRATION_ID', '8.0.0')
ON CONFLICT ("MigrationId") DO NOTHING;
EOF
    echo "Baseline migration marked as applied successfully!"
else
    echo "Migrations exist. Checking for changes..."
    
    # Check for pending migrations first
    PENDING=$(dotnet ef migrations list --project ClassroomServer.csproj --no-build 2>/dev/null | grep -c "Pending" || echo "0")
    if [ "$PENDING" -gt 0 ]; then
        echo "Found pending migrations. Applying..."
        dotnet ef database update --project ClassroomServer.csproj
        echo "Pending migrations applied!"
    else
        # Try to create a migration to detect model changes
        MIGRATION_NAME="AutoMigration_$(date +%Y%m%d_%H%M%S)"
        OUTPUT=$(dotnet ef migrations add "$MIGRATION_NAME" --project ClassroomServer.csproj 2>&1)
        
        if echo "$OUTPUT" | grep -q "No changes"; then
            echo "No model changes detected. Database is up to date."
            # Clean up empty migration files if created
            rm -f Migrations/*"$MIGRATION_NAME"*.cs Migrations/*"$MIGRATION_NAME"*.Designer.cs 2>/dev/null || true
        else
            echo "Model changes detected! Applying migration..."
            dotnet ef database update --project ClassroomServer.csproj
            echo "Migration applied successfully!"
        fi
    fi
fi

echo "Migration process completed!"