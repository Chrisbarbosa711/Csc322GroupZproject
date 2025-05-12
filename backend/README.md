# 后端说明

本文件夹包含应用程序的后端服务，基于FastAPI框架开发。

## 环境设置

1. 首先确保安装了MySQL服务器，并设置好相应的用户名和密码。

2. 创建虚拟环境（推荐使用Python 3.10+）：
   ```bash
   python -m venv venv
   source venv/bin/activate  # 在Windows上使用：venv\Scripts\activate
   ```

3. 安装依赖：
   ```bash
   pip install -r requirements.txt
   ```

4. 配置环境变量：
   - 复制`.env.example`文件为`.env`（如果不存在，已提供默认的`.env`文件）
   - 根据您的MySQL配置修改`.env`文件中的数据库连接信息

## 数据库初始化

1. 创建数据库：
   ```bash
   python create_db.py
   ```

2. 启动应用时会自动创建表并填充初始数据（如果`USE_MOCK_DATA=True`）

## 运行应用

启动后端服务：
```bash
uvicorn app.main:app --reload
```

默认情况下，服务将在 `http://127.0.0.1:8000` 上运行

## API文档

启动服务后，可以访问以下URL查看API文档：
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## 项目结构

```
backend/
├── app/                    # 应用程序代码
│   ├── api/                # API路由
│   │   ├── endpoints/      # API端点
│   │   └── api.py          # API路由注册
│   ├── core/               # 核心配置
│   │   ├── config.py       # 应用程序配置
│   │   └── security.py     # 安全相关功能
│   ├── db/                 # 数据库相关
│   │   ├── init_db.py      # 数据库初始化
│   │   └── models.py       # 数据库模型
│   └── main.py             # 应用程序入口
├── .env                    # 环境变量配置
├── create_db.py            # 数据库创建脚本
└── requirements.txt        # 依赖项
```

## Features

- **User Authentication**: JWT-based authentication system
- **Document Management**: CRUD operations for text documents
- **Collaboration**: User invitation and document sharing
- **Token System**: Management of user tokens for premium features
- **Administration**: User management and content moderation
- **Blacklist Management**: System for managing inappropriate content

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