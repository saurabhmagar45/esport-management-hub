# Database

This project keeps the database layer separate from the app logic so the stack is easier to run, maintain, and scale.

## Local setup
- The backend is configured to use MongoDB.
- If MongoDB is not running locally, the backend falls back to an embedded in-memory MongoDB instance for demo/local development.
- The main database configuration lives in the backend app under the `back end` folder.

## Runtime notes
- The primary database connection string is configured in the backend environment file.
- For production or external MongoDB deployments, point the backend to the correct MongoDB URI in `back end/.env`.
- Keep database credentials and connection strings out of source control when used in real deployments.
