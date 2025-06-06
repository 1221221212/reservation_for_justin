# Reservation System

This repository contains a prototype reservation system. The goal is to manage store information and bookings from the web.

See the [docs/](docs/README.md) directory for detailed specifications, guidelines and document templates.

## Setup

1. Prepare a MySQL instance.
2. Initialize the schema using `backend/db/init.sql`:
   ```bash
   mysql -u <user> -p <database> < backend/db/init.sql
   ```
3. Future application code will connect to this database.

