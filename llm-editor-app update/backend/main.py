from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from SQL_Database.db_connector import Database


app = FastAPI()
db = Database() #instantiate an instance of our database(CB)

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend server address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


SECRET_KEY = "your-super-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


# create token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# verify password
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# authenticate user
def authenticate_user(username: str, password: str):
    user = db.username_exists(username) #added changed functionality here(CB)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return user

# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# login request
class LoginRequest(BaseModel):
    username: str
    password: str

# POST - /auth/login
@app.post("/auth/login")
async def login(form_data: LoginRequest):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    access_token = create_access_token(data={"sub": user["username"]})
    return {"token": access_token}


# NOT SURE IF I CAN DELETE THIS (MS)
class User(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: str
    tokens: int


# get current user
def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        user = db.get_user(username)
        if user is None:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception
    

# read user info
@app.get("/auth/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


# deduct tokens
class TokenDeduction(BaseModel):
    amount: int

@app.post("/users/deduct-tokens") #issue here, how does this know what current tokens is?(CB)
async def deduct_tokens(token_data: TokenDeduction, current_user: User = Depends(get_current_user)):
    if current_user.tokens < token_data.amount:
        raise HTTPException(
            status_code=400,
            detail="Insufficient tokens"
        )
    current_user.tokens -= token_data.amount   
    #just modify the token amount in db, don't see why we would need to log the amount used(CB)
    db.alter_tokens(current_user.username, -token_data.amount)
    #below code is commentted out for now
    #fake_token_db[current_user.username]['used'] = fake_token_db[current_user.username]['used'] + token_data.amount
    return {"message": "Tokens deducted successfully", "user": current_user}

# buy tokens
class TokenPurchase(BaseModel):
    amount: int

@app.post("/users/buy-tokens")
async def buy_tokens(token_data: TokenPurchase, current_user: User = Depends(get_current_user)):
    #check it user exists or in db(CB)
    #unsure how to make this work with db_connector.py
    #is it really ok that if the user is not in the database to
    #just add them. we don't set the type of user either, or is this implicit
    if current_user.username not in fake_token_db:
        fake_token_db[current_user.username] = {
            "username": current_user.username,
            "tokens": 0,
            "pay": 0,
            "reward": 0,
            "used": 0
        }
        ''' would be
        if !(db.username_exists(current_user.username)):
            db.register_user(current_user.username, password_data.current_password)
            #i think this zeros everything out for tokens, etc and makes user free, need to consult
            #person who made DB
        
        
        '''
    
    # 更新用户的token数
    current_user.tokens += token_data.amount
    
    #this is same as last function(CB)
    db.alter_tokens(current_user.username, token_data.amount)
    #again, I'm unsure why it is necessary to maintain the amount payed, used, etc.
    #fake_token_db[current_user.username]['pay'] = fake_token_db[current_user.username].get('pay', 0) + token_data.amount
    
    return {"message": "Tokens bought successfully", "user": current_user}

# reward tokens
class TokenReward(BaseModel):
    amount: int

@app.post("/users/reward-tokens")
async def reward_tokens(token_data: TokenReward, current_user: User = Depends(get_current_user)):
    current_user.tokens += token_data.amount
    #alter the current amount assuming before this was called current_user.token was correct(CB)
    db.alter_tokens(current_user.username, token_data.amount)
    #fake_token_db[current_user.username]['reward'] = fake_token_db[current_user.username]['reward'] + token_data.amount
    return {"message": "Tokens rewarded successfully", "user": current_user}    


# 修改密码请求
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# 修改密码API
@app.put("/users/change-password")
async def change_password(
    password_data: ChangePasswordRequest, 
    current_user: User = Depends(get_current_user)
):
    #this I can't touch since we did not store the hashed passwords in the real DB
    #so I am not sure how to proceed here, it could get messy if I choose to store as is(CB)
    if not verify_password(password_data.current_password, fake_users_db[current_user.username]["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # 更新密码
    new_hashed_password = pwd_context.hash(password_data.new_password)
    fake_users_db[current_user.username]["hashed_password"] = new_hashed_password
    
    return {"message": "Password updated successfully"}


# 删除自己的账号
class DeleteAccountRequest(BaseModel):
    password: str

@app.delete("/users/delete-account")
async def delete_own_account(
    delete_data: DeleteAccountRequest,
    current_user: User = Depends(get_current_user)
):
    # 验证用户密码
    if not verify_password(delete_data.password, fake_users_db[current_user.username]["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect"
        )
    
    # 删除用户账号
    username = current_user.username
    
    #this is the only thing necessary I think, maybe we need to delete user elsewhere aswell(CB)
    db.delete_user(username)
    
    """
    # 同时删除token数据
    if username in fake_token_db:
        del fake_token_db[username]
    
    # 同时删除协作者数据
    if username in fake_collaborator_db:
        del fake_collaborator_db[username]
    
    # 对于每个用户的协作者列表，移除被删除的用户
    for collab_username, collab_data in fake_collaborator_db.items():
        if username in collab_data["collaborators"]:
            collab_data["collaborators"].remove(username)
    """
    return {"message": "Account deleted successfully"}


# fetch token amount(CB)
@app.get("/users/token-stats")
async def fetch_token_stats(current_user: User = Depends(get_current_user)):
    return db.get_tokens(current_user.username)


# fetch collaborator list
# the following does not exist in real DB so can't really alter this
#ill leave as is for now(CB)
@app.get("/users/collaborator-list")
async def fetch_collaborator_list(current_user: User = Depends(get_current_user)):
    collaborators = fake_collaborator_db[current_user.username]['collaborators']
    collaborators_info = [fake_users_db[collaborator] for collaborator in collaborators]
    return {"collaborators": collaborators_info}



# search collaborator
#same for this as above
#all things pertaining to collaboration needs to be done in DB(CB)
@app.get("/users/search-collaborator")
async def search_collaborator(searchName: str, current_user: User = Depends(get_current_user)):
    searched_users = []
    
    for username, user_data in fake_users_db.items():
        if username == current_user.username or user_data["role"] != "paid" or username in fake_collaborator_db[current_user.username]["collaborators"]:
            continue
            
        if searchName.lower() in username.lower():
            user_info = {
                "id": user_data["id"],
                "username": username,
                "email": user_data["email"],
            }
            searched_users.append(user_info)
    
    return {"searched_user": searched_users}


# 邀请协作者请求模型
class InviteRequest(BaseModel):
    inviteUsername: str

# 模拟邀请数据库
fake_invitation_db = {
    "invitations": []
}

@app.post("/users/invite-collaborator")
async def invite_collaborator(data: InviteRequest, current_user: User = Depends(get_current_user)): 
    target_username = data.inviteUsername
    
    # 检查被邀请的用户是否存在
    if target_username not in fake_users_db:
        raise HTTPException(
            status_code=404,
            detail=f"User {target_username} not found"
        )
    
    # 检查是否已经是协作者
    if target_username in fake_collaborator_db.get(current_user.username, {}).get("collaborators", []):
        raise HTTPException(
            status_code=400,
            detail=f"User {target_username} is already your collaborator"
        )
    
    # 检查是否已经发送过邀请
    for invitation in fake_invitation_db["invitations"]:
        if invitation["inviter"] == current_user.username and invitation["invitee"] == target_username and invitation["status"] == "pending":
            raise HTTPException(
                status_code=400,
                detail=f"You have already sent an invitation to {target_username}"
            )
    
    # 创建新邀请
    new_invitation = {
        "id": str(len(fake_invitation_db["invitations"]) + 1),
        "inviter": current_user.username,
        "invitee": target_username,
        "status": "pending",
        "createdAt": datetime.now().isoformat()
    }
    
    # 添加到邀请数据库
    fake_invitation_db["invitations"].append(new_invitation)
    
    return {"message": "Invitation sent successfully"}

# 获取协作者邀请列表
@app.get("/users/invitations")
async def get_invitations(current_user: User = Depends(get_current_user)):
    # 获取当前用户收到的邀请
    received_invitations = [
        inv for inv in fake_invitation_db["invitations"]
        if inv["invitee"] == current_user.username and inv["status"] == "pending"
    ]
    
    # 获取当前用户发出的邀请
    sent_invitations = [
        inv for inv in fake_invitation_db["invitations"]
        if inv["inviter"] == current_user.username
    ]
    
    return {
        "received": received_invitations,
        "sent": sent_invitations
    }

# 处理协作者邀请（接受/拒绝）
@app.post("/users/invitations/{invitation_id}/{action}")
async def handle_invitation(
    invitation_id: str,
    action: str,
    current_user: User = Depends(get_current_user)
):
    if action not in ["accept", "reject"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Must be 'accept' or 'reject'"
        )
    
    # 查找邀请
    invitation_found = False
    for invitation in fake_invitation_db["invitations"]:
        if invitation["id"] == invitation_id and invitation["invitee"] == current_user.username:
            invitation_found = True
            invitation["status"] = "accepted" if action == "accept" else "rejected"
            
            # 如果接受邀请，将邀请者添加为协作者
            if action == "accept":
                inviter = invitation["inviter"]
                
                # 确保协作者数据库中有邀请者的记录
                if inviter not in fake_collaborator_db:
                    fake_collaborator_db[inviter] = {"collaborators": []}
                
                # 添加当前用户为邀请者的协作者
                if current_user.username not in fake_collaborator_db[inviter]["collaborators"]:
                    fake_collaborator_db[inviter]["collaborators"].append(current_user.username)
            
            break
    
    if not invitation_found:
        raise HTTPException(
            status_code=404,
            detail="Invitation not found or you are not the invitee"
        )
    
    return {"message": f"Invitation {action}ed successfully"}


#same for here as collaborators, the DB for this does not exist yet so
#no functionality can be added(CB)
class Document(BaseModel):
    id: str
    title: str
    date: str
    content: str
    wordCount: int

# 文档协作者关联表 - 弱实体关系
fake_document_collaborators_db = {
    "1": ["paid_user2", "paid_user3"],  # document 1 的协作者
    "3": ["paid_user4"],                # document 3 的协作者
    "5": ["paid_user2"],                # document 5 的协作者
    "7": ["paid_user3", "paid_user4"],  # document 7 的协作者
}

# 修改文档获取列表API，添加协作者信息和过滤功能
@app.get("/documents")
async def fetch_document_list(
    current_user: User = Depends(get_current_user),
    filter_type: str = None,
    sort_by: str = "latest_update"
):
    all_documents = []
    
    # 获取用户创建的文档
    for document_id, document_info in fake_document_db.items():
        # 如果是用户自己创建的文档
        if document_info["user"] == current_user.username:
            document_with_author = document_info.copy()
            document_with_author["is_owner"] = True
            all_documents.append(document_with_author)
        # 或者用户是此文档的协作者
        elif document_id in fake_document_collaborators_db and current_user.username in fake_document_collaborators_db[document_id]:
            document_with_author = document_info.copy()
            document_with_author["is_owner"] = False
            all_documents.append(document_with_author)
    
    # 应用过滤条件
    if filter_type == "own":
        filtered_documents = [doc for doc in all_documents if doc["is_owner"]]
    elif filter_type == "collaborated":
        filtered_documents = [doc for doc in all_documents if not doc["is_owner"]]
    else:
        filtered_documents = all_documents
    
    # 排序
    if sort_by == "latest_update":
        filtered_documents.sort(key=lambda x: x["latest_update"], reverse=True)
    
    return {"documents": filtered_documents}

# 修改文档详情API，添加协作者信息
@app.get("/documents/detail/{document_id}")
async def fetch_document_detail(document_id: str, current_user: User = Depends(get_current_user)):
    # 检查文档是否存在
    if document_id not in fake_document_db:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # 检查用户是否有权限访问该文档
    document = fake_document_db[document_id]
    is_owner = document["user"] == current_user.username
    is_collaborator = document_id in fake_document_collaborators_db and current_user.username in fake_document_collaborators_db[document_id]
    
    if not (is_owner or is_collaborator):
        raise HTTPException(status_code=403, detail="You don't have permission to access this document")
    
    # 获取文档的协作者列表
    collaborators = []
    if document_id in fake_document_collaborators_db:
        for collaborator_username in fake_document_collaborators_db[document_id]:
            if collaborator_username in fake_users_db:
                collaborator_info = {
                    "id": fake_users_db[collaborator_username]["id"],
                    "username": collaborator_username,
                    "email": fake_users_db[collaborator_username]["email"]
                }
                collaborators.append(collaborator_info)
    
    # 返回文档详情和协作者列表
    result = {
        "document": document,
        "is_owner": is_owner,
        "collaborators": collaborators
    }
    
    return result

# 添加文档协作者API
@app.post("/documents/{document_id}/add-collaborator")
async def add_document_collaborator(
    document_id: str,
    collaborator_username: str,
    current_user: User = Depends(get_current_user)
):
    # 检查文档是否存在
    if document_id not in fake_document_db:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # 检查用户是否是文档所有者
    document = fake_document_db[document_id]
    if document["user"] != current_user.username:
        raise HTTPException(status_code=403, detail="Only the document owner can add collaborators")
    
    # 检查要添加的协作者是否存在
    if collaborator_username not in fake_users_db:
        raise HTTPException(status_code=404, detail=f"User {collaborator_username} not found")
    
    # 初始化文档的协作者列表（如果不存在）
    if document_id not in fake_document_collaborators_db:
        fake_document_collaborators_db[document_id] = []
    
    # 检查是否已经是协作者
    if collaborator_username in fake_document_collaborators_db[document_id]:
        raise HTTPException(status_code=400, detail=f"{collaborator_username} is already a collaborator on this document")
    
    # 添加协作者
    fake_document_collaborators_db[document_id].append(collaborator_username)
    
    return {"message": f"{collaborator_username} added as collaborator successfully"}

# 删除文档协作者API
@app.post("/documents/{document_id}/remove-collaborator")
async def remove_document_collaborator(
    document_id: str,
    collaborator_username: str,
    current_user: User = Depends(get_current_user)
):
    # 检查文档是否存在
    if document_id not in fake_document_db:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # 检查用户是否是文档所有者
    document = fake_document_db[document_id]
    if document["user"] != current_user.username:
        raise HTTPException(status_code=403, detail="Only the document owner can remove collaborators")
    
    # 检查文档是否有协作者列表
    if document_id not in fake_document_collaborators_db:
        raise HTTPException(status_code=400, detail="Document has no collaborators")
    
    # 检查指定用户是否是协作者
    if collaborator_username not in fake_document_collaborators_db[document_id]:
        raise HTTPException(status_code=400, detail=f"{collaborator_username} is not a collaborator on this document")
    
    # 移除协作者
    fake_document_collaborators_db[document_id].remove(collaborator_username)
    
    return {"message": f"{collaborator_username} removed as collaborator successfully"}

# 更新文档协作者列表API
@app.get("/documents/{document_id}/collaborators")
async def get_document_collaborators(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    # 检查文档是否存在
    if document_id not in fake_document_db:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # 检查用户是否有权限访问该文档
    document = fake_document_db[document_id]
    is_owner = document["user"] == current_user.username
    is_collaborator = document_id in fake_document_collaborators_db and current_user.username in fake_document_collaborators_db[document_id]
    
    if not (is_owner or is_collaborator):
        raise HTTPException(status_code=403, detail="You don't have permission to access this document")
    
    # 获取文档的协作者列表
    collaborators = []
    if document_id in fake_document_collaborators_db:
        for collaborator_username in fake_document_collaborators_db[document_id]:
            if collaborator_username in fake_users_db:
                collaborator_info = {
                    "id": fake_users_db[collaborator_username]["id"],
                    "username": collaborator_username,
                    "email": fake_users_db[collaborator_username]["email"]
                }
                collaborators.append(collaborator_info)
    
    return {"collaborators": collaborators, "is_owner": is_owner}

# fetch document stats
@app.get("/documents/stats")
async def fetch_document_stats(current_user: User = Depends(get_current_user)):
    stats = {
        "total_words": 0,
        "total_documents": 0,
    }
    for document_id, document_info in fake_document_db.items():
        if document_info["user"] == current_user.username:
            stats["total_words"] += document_info["word_count"]
            stats["total_documents"] += 1
    return {"stats": stats}

# save document
@app.post("/documents")
async def save_document(document: Document, current_user: User = Depends(get_current_user)):
    document_info = {
        "id": document.id,
        "title": document.title,
        "latest_update": document.date,
        "created_date": document.date,
        "word_count": document.wordCount,
        "preview": document.content[:20] + "...",
        "content": document.content,
        "user": current_user.username
    }
    fake_document_db[document.id] = document_info
    return {"message": "Document saved successfully", "user": current_user}

# update document
@app.put("/documents/{document_id}")
async def update_document(document_id: str, document: Document, current_user: User = Depends(get_current_user)):
    document_info = {
        "id": document_id,
        "title": document.title,
        "date": document.date,
        "latest_update": document.date,
        "created_date": fake_document_db[document_id]["created_date"],
        "word_count": document.wordCount,
        "preview": document.content[:20] + "...",
        "content": document.content,
        "user": current_user.username
    }
    fake_document_db[document_id] = document_info
    return {"message": "Document updated successfully", "document": document_info}

# delete document
@app.delete("/documents/{document_id}")
async def delete_document(document_id: str, current_user: User = Depends(get_current_user)):
    if document_id not in fake_document_db:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )
    
    # Check if the user owns the document
    if fake_document_db[document_id]["user"] != current_user.username:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to delete this document"
        )
    
    # Delete the document
    del fake_document_db[document_id]
    return {"message": "Document deleted successfully"}

# fetch blacklist words
@app.get("/admin/blacklist")
async def fetch_blacklist_words(current_user: User = Depends(get_current_user)):
    if current_user.role != "super":
        raise HTTPException(
            status_code=403,
            detail="Only admin users can access this endpoint"
        )
    
    return {
        #returns all words not reviewed by superusers yet(CB)
        #maybe add functionality to see all words reviewed or not
        "unreviewed blacklist words": db.get_unreviewed_blacklist_words(),
        #"requests": fake_blacklist_db["requests"]
    }

# handle blacklist request
@app.post("/admin/blacklist/{request_id}/{action}")
async def handle_blacklist_request(
    request_id: str, 
    action: str, 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super":
        raise HTTPException(
            status_code=403,
            detail="Only admin users can access this endpoint"
        )
    
    if action not in ["approve", "reject"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Must be 'approve' or 'reject'"
        )
    
    # find request
    #unsure how to change this to fit functionality in db_connector(CB)
    request_found = False
    for request in fake_blacklist_db["requests"]:
        if request["id"] == request_id:
            request_found = True
            request["status"] = action
            
            # if approved, add to blacklist
            if action == "approve" and request["word"] not in fake_blacklist_db["words"]:
                fake_blacklist_db["words"].append(request["word"])
            
            break
    
    if not request_found:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )
    
    return {"message": f"Request {action}d successfully"}

# user submit blacklist request
class BlacklistRequest(BaseModel):
    word: str
    reason: str

@app.post("/users/request-blacklist")
async def request_blacklist_word(
    request_data: BlacklistRequest, 
    current_user: User = Depends(get_current_user)
):
    # check if word is already in blacklist
    if request_data.word in fake_blacklist_db["words"]:
        raise HTTPException(
            status_code=400,
            detail="Word is already blacklisted"
        )
    
    # check if there is already a pending request
    for request in fake_blacklist_db["requests"]:
        if request["word"] == request_data.word and request["status"] == "pending":
            raise HTTPException(
                status_code=400,
                detail="There is already a pending request for this word"
            )
    
    # generate unique ID
    request_id = str(len(fake_blacklist_db["requests"]) + 1)
    
    # create new request
    new_request = {
        "id": request_id,
        "word": request_data.word,
        "requestedBy": current_user.username,
        "status": "pending",
        "requestDate": datetime.now().strftime("%Y-%m-%d"),
        "reason": request_data.reason
    }
    
    #this was not implemented in real DB(CB)
    fake_blacklist_db["requests"].append(new_request)
    
    return {"message": "Blacklist request submitted successfully"}

# remove word from blacklist
class RemoveBlacklistWord(BaseModel):
    word: str

@app.post("/admin/blacklist/remove")
async def remove_blacklist_word(
    request_data: RemoveBlacklistWord, 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super":
        raise HTTPException(
            status_code=403,
            detail="Only admin users can access this endpoint"
        )
    
    word = request_data.word
    
    # check if word is in blacklist
    if word not in fake_blacklist_db["words"]:
        raise HTTPException(
            status_code=404,
            detail="Word is not in blacklist"
        )
    
    # remove word from blacklist(CB)
    db.delete_blacklist_words(word)
    
    # update any approved requests to rejected
    #no functionality for this in DB yet
    for request in fake_blacklist_db["requests"]:
        if request["word"] == word and request["status"] == "approved":
            request["status"] = "rejected"
    
    return {"message": f"Word '{word}' removed from blacklist successfully"}

# add word to blacklist
class AddBlacklistWord(BaseModel):
    word: str

@app.post("/admin/blacklist/add")
async def add_blacklist_word(
    request_data: AddBlacklistWord, 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super":
        raise HTTPException(
            status_code=403,
            detail="Only admin users can access this endpoint"
        )
    
    word = request_data.word
    
    # check if word is already in blacklist
    if db.blacklist_word_exists(word):
        raise HTTPException(
            status_code=400,
            detail="Word is already in blacklist"
        )
    
    # add word to blacklist(CB)
    db.add_blacklist_word(word)
    
    # auto-approve any pending requests for this word
    for request in fake_blacklist_db["requests"]:
        if request["word"] == word and request["status"] == "pending":
            request["status"] = "approved"
    
    return {"message": f"Word '{word}' added to blacklist successfully"}


# Get complaints
@app.get("/admin/complaints")
async def get_complaints(
    status: str = None,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super":
        raise HTTPException(
            status_code=403,
            detail="Only admin users can access this endpoint"
        )
    
    #unsure how to change this(CB)
    if status:
        filtered_complaints = [
            complaint for complaint in fake_complaints_db["complaints"] 
            if complaint["status"] == status
        ]
        return {"complaints": filtered_complaints}
    else:
        return {"complaints": fake_complaints_db["complaints"]}

# Handle complaint
class ComplaintAction(BaseModel):
    response: str
    penalty: dict

@app.post("/admin/complaints/{complaint_id}/{action}")
async def handle_complaint(
    complaint_id: str,
    action: str,
    data: ComplaintAction,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super":
        raise HTTPException(
            status_code=403,
            detail="Only admin users can access this endpoint"
        )
    
    if action not in ["approve", "reject"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Must be 'approve' or 'reject'"
        )
    
    # Find complaint
    complaint_found = False
    for complaint in fake_complaints_db["complaints"]:
        if complaint["id"] == complaint_id:
            complaint_found = True
            complaint["status"] = "resolved" if action == "approve" else "rejected"
            complaint["adminResponse"] = data.response
            
            # If approved and penalties are applied
            if action == "approve" and data.penalty:
                collaborator = complaint["collaborator"]
                
                # Apply block if needed
                if data.penalty.get("block"):
                    print(f"Blocked user {collaborator} for 14 days")
                
                # Deduct tokens if needed
                if tokens_to_deduct := data.penalty.get("deductTokens", 0):
                    user = fake_users_db.get(collaborator)
                    if user:
                        user['tokens'] = max(0, user['tokens'] - tokens_to_deduct)
                        print(f"Deducted {tokens_to_deduct} tokens from {collaborator}")
            break
    
    if not complaint_found:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )
    
    return {"message": f"Complaint {action}d successfully"}

# Get incorrection suggestions
@app.get("/admin/suggestions")
async def get_suggestions(
    status: str = None,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super":
        raise HTTPException(
            status_code=403,
            detail="Only admin users can access this endpoint"
        )
    
    if status:
        filtered_suggestions = [
            suggestion for suggestion in fake_suggestions_db["suggestions"] 
            if suggestion["status"] == status
        ]
        return {"suggestions": filtered_suggestions}
    else:
        return {"suggestions": fake_suggestions_db["suggestions"]}

# Handle incorrection suggestion
@app.post("/admin/suggestions/{suggestion_id}/{action}")
async def handle_suggestion(
    suggestion_id: str,
    action: str,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super":
        raise HTTPException(
            status_code=403,
            detail="Only admin users can access this endpoint"
        )
    
    if action not in ["approve", "reject"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Must be 'approve' or 'reject'"
        )
    
    # Find suggestion
    suggestion_found = False
    for suggestion in fake_suggestions_db["suggestions"]:
        if suggestion["id"] == suggestion_id:
            suggestion_found = True
            suggestion["status"] = "approved" if action == "approve" else "rejected"
            
            # If approved, could add to a training data set for LLM improvement
            if action == "approve":
                print(f"Added suggestion {suggestion_id} to LLM training data")
            break
    
    if not suggestion_found:
        raise HTTPException(
            status_code=404,
            detail="Suggestion not found"
        )
    
    return {"message": f"Suggestion {action}d successfully"}


# 获取所有用户列表的API端点
@app.get("/admin/users")
async def get_all_users(
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super":
        raise HTTPException(
            status_code=403,
            detail="Only admin users can access this endpoint"
        )
    
    # 处理用户列表
    users_list = []
    for username, user_data in fake_users_db.items():
        # 添加额外的用户属性
        user = {
            "id": user_data["id"],
            "username": username,
            "email": user_data["email"],
            "role": user_data["role"],
            "tokens": user_data["tokens"],
            "status": user_data["status"],
            "lastActive": datetime.now().isoformat()  # 模拟最后活跃时间
        }
        users_list.append(user)
    
    # 简单分页
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_users = users_list[start_index:end_index]
    
    return {
        "users": paginated_users,
        "total": len(users_list),
        "page": page,
        "limit": limit,
        "totalPages": (len(users_list) + limit - 1) // limit
    }

# 删除用户API端点
@app.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super":
        raise HTTPException(
            status_code=403,
            detail="Only admin users can access this endpoint"
        )
    
    # 在真实应用中，这里应该寻找并删除指定ID的用户
    # 在此模拟删除操作
    for username, user_data in list(fake_users_db.items()):
        if user_data["id"] == user_id:
            # 确保管理员不能删除自己
            if username == current_user.username:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot delete your own account"
                )
            # 从假数据库中删除用户
            del fake_users_db[username]
            # 同时删除token数据
            if username in fake_token_db:
                del fake_token_db[username]
            # 同时删除协作者数据
            if username in fake_collaborator_db:
                del fake_collaborator_db[username]
            # 对于每个用户的协作者列表，移除被删除的用户
            for collab_username, collab_data in fake_collaborator_db.items():
                if username in collab_data["collaborators"]:
                    collab_data["collaborators"].remove(username)
            return {"message": f"User {username} deleted successfully"}
    
    # 如果没有找到指定ID的用户
    raise HTTPException(
        status_code=404,
        detail=f"User with ID {user_id} not found"
    )

# 封禁或解封用户
@app.post("/admin/users/{user_id}/{action}")
async def block_or_unblock_user(
    user_id: int,
    action: str,
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super":
        raise HTTPException(
            status_code=403,
            detail="Only admin users can access this endpoint"
        )
    
    if action not in ["block", "unblock"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Must be 'block' or 'unblock'"
        )
    
    # 在真实应用中，这里应该更新数据库中用户的状态
    # 在此模拟操作
    user_found = False
    for username, user_data in fake_users_db.items():
        if user_data["id"] == user_id:
            user_found = True
            
            # 确保管理员不能封禁自己
            if username == current_user.username:
                raise HTTPException(
                    status_code=400,
                    detail="Cannot block your own account"
                )
            
            # 更新用户状态
            new_status = "blocked" if action == "block" else "active"
            
            # 在模拟数据库中添加或更新status字段
            fake_users_db[username]["status"] = new_status
            
            return {
                "message": f"User {username} {action}ed successfully",
                "status": new_status
            }
    
    if not user_found:
        raise HTTPException(
            status_code=404,
            detail=f"User with ID {user_id} not found"
        )

# 用户提交协作者投诉
class ComplaintSubmission(BaseModel):
    collaborator: str
    subject: str
    content: str
    reason: str

@app.post("/users/submit-complaint")
async def submit_complaint(
    complaint_data: ComplaintSubmission,
    current_user: User = Depends(get_current_user)
):
    # 确认被投诉的用户存在
    if complaint_data.collaborator not in fake_users_db:
        raise HTTPException(
            status_code=404,
            detail=f"User {complaint_data.collaborator} not found"
        )
    
    # 生成唯一ID
    complaint_id = str(len(fake_complaints_db["complaints"]) + 1)
    
    # 创建新投诉
    new_complaint = {
        "id": complaint_id,
        "username": current_user.username,
        "collaborator": complaint_data.collaborator,
        "subject": complaint_data.subject,
        "content": complaint_data.content,
        "reason": complaint_data.reason,
        "status": "pending",
        "createdAt": datetime.now().isoformat(),
        "projectName": "Collaborative Document" # 默认项目名称
    }
    
    # 添加到模拟数据库
    fake_complaints_db["complaints"].append(new_complaint)
    
    return {"message": "Complaint submitted successfully", "id": complaint_id}
