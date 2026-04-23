# Classroom Project - Root Repository

This repository contains the orchestration setup (docker-compose) for running both the backend and frontend applications together in development.

## Repository Structure

This repository uses **Git Submodules** to link two independent repositories:

- **ClassroomServer** - C# ASP.NET Core backend application
- **ClassroomMgmt** - React frontend application

Each submodule is an independent Git repository with its own commit history, branches, and remote. The root repository tracks specific commits of each submodule.

## Initial Setup

### Cloning for the first time

When cloning this repository for the first time, you need to initialize and update the submodules:

```bash
# Clone the root repository
git clone <root-repo-url> ClassroomProject
cd ClassroomProject

# Initialize and clone all submodules
git submodule update --init --recursive
```
If you are having problem with the command above, try first running:
1) `$ Remove-Item -Recurse -Force ClassroomMgmt, ClassroomServer`
2) `$ git submodule sync`
3) `$ git submodule update --init --recursive`

Or use a single command:

```bash
git clone --recurse-submodules <root-repo-url> ClassroomProject
```

### If you've already cloned (without --recurse-submodules)

```bash
git submodule update --init --recursive
```

## Working with Submodules

### Making Changes to Submodules

**Each submodule is an independent repository.** To work on them:

1. **Navigate to the submodule directory:**
   ```bash
   cd ClassroomServer  # or ClassroomMgmt
   ```

2. **Check out the branch you want to work on:**
   ```bash
   git checkout <branch-name>
   ```

3. **Make your changes and commit as normal:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin <branch-name>
   ```

4. **Return to the root directory and update the submodule reference:**
   ```bash
   cd ..
   git add ClassroomServer  # or ClassroomMgmt
   git commit -m "Update ClassroomServer submodule to latest commit"
   git push
   ```

### Updating Submodules

When someone else updates a submodule reference in the root repo, or you want to get the latest changes:

```bash
# Update all submodules to the latest commit referenced by the root repo
git submodule update --remote

# Or update a specific submodule
git submodule update --remote ClassroomServer
```

### Working with Multiple Repositories

When you have changes in multiple repositories:

1. **Commit and push changes in each submodule separately:**
   ```bash
   # In ClassroomServer/
   git add .
   git commit -m "Backend changes"
   git push

   # In ClassroomMgmt/
   git add .
   git commit -m "Frontend changes"
   git push
   ```

2. **Then commit and push the submodule references in the root repo:**
   ```bash
   # In root directory
   git add ClassroomServer ClassroomMgmt
   git commit -m "Update submodules"
   git push
   ```

### Switching Branches in Root Repo

When switching branches in the root repo, you may need to update submodules:

```bash
git checkout <branch>
git submodule update --init --recursive
```

## Important Notes

- **Each repository has independent commits**: Changes in ClassroomServer, ClassroomMgmt, and the root repo are committed and pushed separately.
- **Submodules track specific commits**: The root repo stores a reference to a specific commit in each submodule, not the latest commit automatically.
- **Always commit submodule changes**: If you update code in a submodule and push it, remember to also update the reference in the root repo.
- **Use `git submodule status`** to see which commit each submodule is currently checked out at.

## Development Workflow

1. Make changes in the individual submodule repositories (ClassroomServer or ClassroomMgmt)
2. Commit and push changes in those repositories
3. Optionally update the submodule reference in the root repo if you want to track the new commit
4. Commit and push docker-compose changes in the root repo separately

This setup allows for:
- Independent version control and release cycles for each application
- Shared docker-compose configuration at the root level
- Easy coordination of all components for local development

