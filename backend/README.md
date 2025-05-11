# LLM Editor Backend

The backend service for LLM Editor application, providing user authentication, document management, and API support for the frontend application.

## Overview

This FastAPI-based backend serves as the primary API service for the LLM Editor platform. It manages user authentication, document storage and retrieval, collaboration functionality, and administrative features.

## Features

- **User Authentication**: JWT-based authentication system
- **Document Management**: CRUD operations for text documents
- **Collaboration**: User invitation and document sharing
- **Token System**: Management of user tokens for premium features
- **Administration**: User management and content moderation
- **Blacklist Management**: System for managing inappropriate content

## Project Structure

The backend has a minimal and straightforward structure:

```
backend/
├── main.py           # Main application file containing all routes and logic
├── README.md         # This documentation file
├── backend.log       # General application logs
├── error.log         # Error logs
├── __pycache__/      # Python cache directory
└── venv/             # Python virtual environment
```

## Tech Stack

- **FastAPI**: High-performance Python web framework
- **Pydantic**: Data validation and settings management
- **PyJWT**: JWT token handling for authentication
- **Mock Database**: In-memory data storage using Python dictionaries

## API Endpoints

### Authentication
- `POST /auth/login`: User login
- `GET /auth/me`: Get current user info

### User Management
- `POST /users/deduct-tokens`: Deduct tokens from user account
- `POST /users/buy-tokens`: Add tokens to user account
- `POST /users/reward-tokens`: Reward user with tokens
- `PUT /users/change-password`: Update user password
- `DELETE /users/delete-account`: Delete user account
- `GET /users/token-stats`: Get user token statistics
- `GET /users/collaborator-list`: Get user collaborators
- `GET /users/search-collaborator`: Search for users
- `POST /users/invite-collaborator`: Invite collaborator
- `GET /users/invitations`: Get pending invitations
- `POST /users/invitations/{invitation_id}/{action}`: Handle invitation

### Document Management
- `GET /documents`: Get list of documents
- `GET /documents/detail/{document_id}`: Get document details
- `POST /documents`: Create new document
- `PUT /documents/{document_id}`: Update document
- `DELETE /documents/{document_id}`: Delete document
- `GET /documents/stats`: Get document statistics
- `POST /documents/{document_id}/add-collaborator`: Add collaborator to document
- `POST /documents/{document_id}/remove-collaborator`: Remove collaborator from document
- `GET /documents/{document_id}/collaborators`: Get document collaborators

### Administration
- `GET /admin/blacklist`: Get blacklisted words
- `POST /admin/blacklist/{request_id}/{action}`: Handle blacklist request
- `POST /admin/blacklist/remove`: Remove word from blacklist
- `POST /admin/blacklist/add`: Add word to blacklist
- `GET /admin/complaints`: Get user complaints
- `POST /admin/complaints/{complaint_id}/{action}`: Handle complaint
- `GET /admin/suggestions`: Get user suggestions
- `POST /admin/suggestions/{suggestion_id}/{action}`: Handle suggestion
- `GET /admin/users`: Get all users
- `DELETE /admin/users/{user_id}`: Delete user
- `POST /admin/users/{user_id}/{action}`: Block/unblock user

## Installation and Setup

### Prerequisites
- Python 3.8+
- Virtual environment tool (recommended)

### Installation

1. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install fastapi uvicorn pydantic python-jose[cryptography] passlib[bcrypt] python-multipart
   ```

3. Run the server:
   ```
   uvicorn main:app --reload --port 8000
   ```

The API will be available at `http://localhost:8000`.

## Implementation Details

### Mock Data

The current implementation uses in-memory dictionaries as mock databases:
- `fake_users_db`: User information and credentials
- `fake_document_db`: Document data
- `fake_collaborator_db`: Collaboration relationships
- `fake_blacklist_db`: Blacklisted words and requests
- `fake_complaints_db`: User complaints
- `fake_token_db`: Token transaction history

All data is reset when the server restarts.

### Authentication

The authentication system uses JWT tokens with the following configuration:
- Secret key: `your-super-secret-key` (defined in main.py)
- Algorithm: HS256
- Token expiration: 60 minutes

### Logging

The backend automatically generates logs in two files:
- `backend.log`: General application logs
- `error.log`: Error logs and exceptions

## Running in Development

Start the server with hot-reload enabled:

```
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Security Considerations

For production deployment:
1. Change the `SECRET_KEY` to a secure random value
2. Set up proper CORS configuration (currently configured for http://localhost:5173)
3. Implement rate limiting
4. Add request validation
5. Replace the mock database with a proper database system

## Troubleshooting

Common issues:
1. **Authentication errors**: Check that your JWT token is valid and not expired
2. **Permission errors**: Verify that the user has the correct role for the requested action
3. **Token deduction issues**: Ensure the user has sufficient tokens for the operation

## Future Improvement Suggestions

1. **Modular Structure**: Refactor the single main.py file into a modular structure
2. **Database Integration**: Replace in-memory dictionaries with a proper database
3. **Testing**: Add unit and integration tests
4. **Input Validation**: Enhance request validation
5. **Documentation**: Implement Swagger/OpenAPI documentation 