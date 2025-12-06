# Archived Files

This directory contains files that are not needed for the two main executables (CLI TUI and Electron app) but are kept for reference.

## Contents

### Docker/Container Files (Not Needed)
- `Dockerfile` - Production Docker build
- `Dockerfile.dev` - Development Docker build  
- `docker-compose.yml` - Production Docker Compose
- `docker-compose.dev.yml` - Development Docker Compose
- `nginx.conf` - Nginx configuration for web serving

**Why archived**: The project goal is to produce 2 local executables with embedded databases. Docker deployment is not part of the core use case.

### Documentation (Superseded)
- `BUN_MIGRATION.md` - Old migration guide
- `IMPLEMENTATION_SUMMARY.md` - Old implementation notes

**Why archived**: Information has been consolidated into the main README.md

## Restoration

If you need to restore Docker support or reference old documentation, these files are available here. Simply move them back to the root directory.
