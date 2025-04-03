# UserCRUD API

A robust RESTful API built with Node.js, Express, and PostgreSQL for managing user data with comprehensive CRUD operations.

## Features

- **User Management Operations**
  - Create new users
  - Get user information
  - Update user details
  - Delete users
  - List all users

- **Authentication**
  - JWT-based authentication
  - Secure login endpoint
  - Token-based authorization
  - Token expiration (1 hour)

- **Database Integration**
  - PostgreSQL database with connection pooling
  - Efficient query handling
  - Transaction support

- **Security & Validation**
  - Input validation for email and user data
  - Email format verification
  - Duplicate email prevention
  - CORS support for cross-origin requests
  - JWT token validation

- **API Structure**
  - RESTful endpoints under `/api/users` and `/api/auth`
  - JSON response format
  - Proper HTTP status codes
  - Logging API Requests and error handling middleware

## Technical Stack

- **Backend Framework**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)
- **Port**: 6543 (default)
- **API Format**: RESTful with JSON responses

## Project Structure

```
usercrud-api/
├── authorization/     # Authentication middleware and JWT handling
├── database/         # Database configuration and queries
├── middleware/       # Custom middleware
├── routes/          # API route definitions
├── .env             # Environment variables (not in repo)
├── .env.example     # Example environment variables
├── index.js         # Main application entry point
└── package.json     # Project dependencies
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

### Authentication
- `POST /api/auth/login` - Authenticate user and receive JWT token

## Environment Variables

Create a `.env` file with the following variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
HOST=your_host
PORT=your_port
DATABASE=your_database
USER=your_username
PASSWORD=your_password
POOL_MODE=transaction
JWT_SECRET=your_jwt_secret_key
```

## Error Handling

The API includes comprehensive error handling for:
- Invalid input data
- Database connection issues
- Duplicate entries
- Not found resources
- Server errors
- Authentication failures
- Invalid tokens

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
