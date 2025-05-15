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

# DELETE? (MS)
SECRET_KEY = "your-super-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# DELETE? (MS)
# create token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# GOOD! (MS)
# verify password
def verify_password(plain_password: str, stored_password: str) -> bool:
    return plain_password == stored_password

# GOOD! (MS)
# authenticate user
def authenticate_user(username: str, password: str):
    user = db.get_user(username)  # Fetch full user record
    if not user or not verify_password(password, user["password"]):
        return None
    return user

# DELETE? (MS)
# OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# DELETE? (MS)
# login request
class LoginRequest(BaseModel):
    username: str
    password: str

# GOOD! (MS)
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


# GOOD! (MS)
class User(BaseModel):
    id: int
    username: str
    user_type: str
    tokens: int

# GOOD! (MS)
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
    

# GOOD! (MS)
# read user info
@app.get("/auth/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# GOOD! (MS)
# deduct tokens
class TokenDeduction(BaseModel):
    amount: int

# GOOD! (MS)
@app.post("/users/deduct-tokens")
async def deduct_tokens(token_data: TokenDeduction, current_user: User = Depends(get_current_user)):
    if current_user.tokens < token_data.amount:
        raise HTTPException(status_code=400, detail="Insufficient tokens")

    # Update in DB
    db.alter_tokens(current_user.username, -token_data.amount)

    # Re-fetch updated user from DB
    updated_user = db.get_user(current_user.username)

    return {
        "message": "Tokens deducted successfully",
        "user": updated_user
    }


# GOOD! (MS)
# buy tokens
class TokenPurchase(BaseModel):
    amount: int

# GOOD! (MS)
@app.post("/users/buy-tokens")
async def buy_tokens(token_data: TokenPurchase, current_user: User = Depends(get_current_user)):
    # Add tokens in database
    db.alter_tokens(current_user.username, token_data.amount)

    # Re-fetch updated user info
    updated_user = db.get_user(current_user.username)

    return {
        "message": "Tokens bought successfully",
        "user": updated_user
    }


# GOOD! (MS)
# reward tokens
class TokenReward(BaseModel):
    amount: int

@app.post("/users/reward-tokens")
async def reward_tokens(token_data: TokenReward, current_user: User = Depends(get_current_user)):
    current_user.tokens += token_data.amount
    db.alter_tokens(current_user.username, token_data.amount)
    return {"message": "Tokens rewarded successfully", "user": current_user}


# GOOD! (MS)
# 修改密码请求
class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# GOOD!
@app.put("/users/change-password")
async def change_password(
    password_data: ChangePasswordRequest, 
    current_user: User = Depends(get_current_user)
):
    # Step 1: Get current password from DB
    user_record = db.get_user(current_user.username)
    if not user_record or user_record["password"] != password_data.current_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Step 2: Call the db function to update password
    db.update_password(current_user.username, password_data.new_password)

    return {"message": "Password updated successfully"}


# GOOD! (MS)
class DeleteAccountRequest(BaseModel):
    password: str

# GOOD! (MS)
@app.delete("/users/delete-account")
async def delete_own_account(
    delete_data: DeleteAccountRequest,
    current_user: User = Depends(get_current_user)
):
    # Step 1: Fetch actual password from DB
    user_record = db.get_user(current_user.username)
    
    # Step 2: Check if password matches
    if not user_record or user_record["password"] != delete_data.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect"
        )

    # Step 3: Delete user account from DB
    db.delete_user(current_user.username)

    return {"message": "Account deleted successfully"}


# GOOD! (MS)
# fetch token amount (CB)
@app.get("/users/token-stats")
async def fetch_token_stats(current_user: User = Depends(get_current_user)):
    tokens = db.get_tokens(current_user.username)
    return {"username": current_user.username, "tokens": tokens}


## LOOK AT LATER!!!!! (MS)
# fetch collaborator list
# the following does not exist in real DB so can't really alter this
#ill leave as is for now(CB)
"""
@app.get("/users/collaborator-list")
async def fetch_collaborator_list(current_user: User = Depends(get_current_user)):
    collaborators = fake_collaborator_db[current_user.username]['collaborators']
    collaborators_info = [fake_users_db[collaborator] for collaborator in collaborators]
    return {"collaborators": collaborators_info}


## LOOK AT LATER!!!!! (MS)
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
"""
# GOOD! (MS)
# 邀请协作者请求模型
class InviteRequest(BaseModel):
    inviteUsername: str

# GOOD! (MS)
# 模拟邀请数据库
class InviteRequest(BaseModel):
    inviteUsername: str

@app.post("/users/invite-collaborator")
async def invite_collaborator(data: InviteRequest, current_user: User = Depends(get_current_user)):
    target_username = data.inviteUsername

    # 1. Check if user exists
    if not db.username_exists(target_username):
        raise HTTPException(status_code=404, detail=f"User '{target_username}' not found")

    # 2. Avoid duplicate invitations (check if collaboration already exists)
    sql = """
        SELECT 1 FROM collaborators
        WHERE inviter = %s AND collaborator = %s
    """
    if db.query(sql, (current_user.username, target_username)):
        raise HTTPException(status_code=400, detail=f"{target_username} is already your collaborator")

    # 3. Add a new collaboration (empty text/correction, not yet received)
    db.add_collaboration(
        inviter=current_user.username,
        collaborator=target_username,
        text="",
        correction="",
        received=False
    )

    return {"message": f"Invitation sent to {target_username}"}


# GOOD! (MS)
# 获取协作者邀请列表
@app.get("/users/invitations")
async def get_invitations(current_user: User = Depends(get_current_user)):
    # Invitations received by the current user (pending = not yet received)
    received_invitations = db.query("""
        SELECT * FROM collaborators
        WHERE collaborator = %s AND received = 0
    """, (current_user.username,))

    # Invitations sent by the current user (can include accepted/pending)
    sent_invitations = db.query("""
        SELECT * FROM collaborators
        WHERE inviter = %s
    """, (current_user.username,))

    return {
        "received": received_invitations,
        "sent": sent_invitations
    }


# GOOD! (MS)
@app.post("/users/invitations/{invitation_id}/{action}")
async def handle_invitation(
    invitation_id: int,
    action: str,
    current_user: User = Depends(get_current_user)
):
    if action not in ["accept", "reject"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Must be 'accept' or 'reject'"
        )

    # Step 1: Retrieve the invitation
    invitation = db.get_collaboration_by_id(invitation_id)

    if not invitation or invitation["collaborator"] != current_user.username or invitation["received"] != 0:
        raise HTTPException(
            status_code=404,
            detail="Invitation not found, not pending, or not addressed to you"
        )

    if action == "accept":
        db.update_collaboration(
            id=invitation_id,
            new_text=invitation["text"],
            new_correction=invitation["correction"],
            received=True  # mark as accepted
        )
        return {"message": "Invitation accepted successfully"}
    
    elif action == "reject":
        db.delete_collaboration(invitation_id)
        return {"message": "Invitation rejected and deleted successfully"}



# GOOD! (MS)
#same for here as collaborators, the DB for this does not exist yet so
#no functionality can be added(CB)
@app.get("/user/history")
async def fetch_user_history(
    current_user: User = Depends(get_current_user),
    filter_type: str = Query(default=None, enum=["own"], description="Filter by type"),
    sort_by: str = Query(default="latest_update", enum=["latest_update"], description="Sort order")
):
    # Step 1: Fetch all history entries for this user
    history_entries = db.get_user_history_by_user(current_user.username)

    # Step 2: Apply optional filters
    if filter_type == "own":
        filtered = history_entries  # All are user's own history
    else:
        filtered = history_entries

    # Step 3: Sort by created_at descending (latest first)
    sorted_history = sorted(filtered, key=lambda x: x.get("created_at", ""), reverse=True)

    return {"history": sorted_history}



# GOOD! (MS)
# 修改文档详情API，添加协作者信息
@app.get("/history/detail/{history_id}")
async def fetch_history_detail(history_id: int, current_user: User = Depends(get_current_user)):
    # Fetch the history entry from the real database
    history_entry = db.get_user_history_by_id(history_id)
    
    if not history_entry:
        raise HTTPException(status_code=404, detail="History entry not found")

    # Check if the current user owns this history entry
    if history_entry["username"] != current_user.username:
        raise HTTPException(status_code=403, detail="You don't have permission to access this history entry")
    
    return {
        "history": history_entry,
        "is_owner": True  # Always true since we only allow access to own entries
    }


# LOOK AT LATER!!!! (MS)
# 添加文档协作者API
"""
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


### LOOK AT LATER!!! (MS)
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


### LOOK AT LATER!!! (MS)
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
"""

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
#SHOULD work, please work(CB)
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
    
    # Get all unreviewed words to find the request
    unreviewed_words = db.get_unreviewed_blacklist_words()
    request_found = False
    word_to_process = None
    
    # Find the word with matching request_id (assuming request_id is the word for simplicity)
    # You might need to adjust this if request_id is a separate field
    for word_data in unreviewed_words:
        if word_data['word'] == request_id:  # Adjust this if request_id is stored differently
            request_found = True
            word_to_process = word_data['word']
            break
    
    if not request_found:
        raise HTTPException(
            status_code=404,
            detail="Request not found"
        )
    
    # Process the action
    if action == "approve":
        # Mark as reviewed and approved
        db.blacklist_alter_reviewed(word_to_process, reviewed=1)
    elif action == "reject":
        # Remove the word from blacklist
        db.delete_blacklist_word(word_to_process)
    
    return {"message": f"Request {action}d successfully"}

# DELETE? (MS)
# user submit blacklist request
class BlacklistRequest(BaseModel):
    word: str
    #reason: str 
    #no place in database for this 

@app.post("/users/request-blacklist")
async def request_blacklist_word(
    request_data: BlacklistRequest, 
    current_user: User = Depends(get_current_user),
):
    # Check if word is already in blacklist (approved)
    if db.blacklist_word_exists(request_data.word):
        raise HTTPException(
            status_code=400,
            detail="Word is already blacklisted"
        )
    
    # Check if there's already a pending request (unreviewed entry)
    unreviewed_words = db.get_unreviewed_blacklist_words()
    for word_data in unreviewed_words:
        if word_data['word'] == request_data.word:
            raise HTTPException(
                status_code=400,
                detail="There is already a pending request for this word"
            )
    
    # Add new word to blacklist table with super_user_reviewed=0 (pending)
    success = db.add_blacklist_word(request_data.word)
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Failed to submit blacklist request"
        )
    
    # Note: If we need to store additional reason for request
    #I dont think that is necessary tho(CB)
    return {"message": "Blacklist request submitted successfully"}

# DELETE? (MS)
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
    if not db.blacklist_word_exists[word]:
        raise HTTPException(
            status_code=404,
            detail="Word is not in blacklist"
        )
    
    # remove word from blacklist(CB)
    db.delete_blacklist_words(word)
    
    # update any approved requests to rejected
    #no need to do this
    """
    for request in fake_blacklist_db["requests"]:
        if request["word"] == word and request["status"] == "approved":
            request["status"] = "rejected"
    """
    return {"message": f"Word '{word}' removed from blacklist successfully"}

# DELETE? (MS)
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
    
    # unnescessary since "requests" in our case is the super_user_reviewed column
    """
    for request in fake_blacklist_db["requests"]:
        if request["word"] == word and request["status"] == "pending":
            request["status"] = "approved"
    """
    return {"message": f"Word '{word}' added to blacklist successfully"}


# Get complaints
#switch over to correct DB, needs to be tested(CB)
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
    if status == "unreviewed":
        return {"complaints": db.get_unreviewed_complaints()}
    else:
        # Get all complaints (note: need to implement this in db_connector)
        return {"complaints": db.query("SELECT * FROM complaints")}

# DELETE? (MS)
# Handle complaint
#functionality switched over to current DB, need to test(CB)
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
   # Check if complaint exists
    if not db.complaint_exists(complaint_id):
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )
    
    # Update complaint status based on action
    reviewed_status = 1 if action == "approve" else 0
    db.complaints_alter_reviewed(complaint_id, reviewed_status)
    
    #If approved and penalties are applied
    if action == "approve" and data.penalty:
        complaint_details = db.query(f"SELECT reportee FROM complaints WHERE id = {complaint_id}")[0]
        collaborator = complaint_details['reportee']
                
        # Apply block if needed
        #not sure if this will even work, need to try out and/or just comment out(CB)
        if data.penalty.get("block"):
            print(f"Blocked user {collaborator} for 14 days")
                
            # Deduct tokens if needed
            if tokens_to_deduct := data.penalty.get("deductTokens", 0):
                user = db.get_user(collaborator)
                if user:
                    db.alter_tokens(collaborator, -tokens_to_deduct)
                    print(f"Deducted {tokens_to_deduct} tokens from {collaborator}")
    
    if not complaint_found:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )
    
    return {"message": f"Complaint {action}d successfully"}

# Get incorrection suggestions
#no place in the DB to work with suggestions, so we need to either do that or comment this out(CB)
"""
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
"""

# 获取所有用户列表的API端点
#converted to current DB, need to test functionality(CB)
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
    
        # Get all users from database
        users = db.get_user("SELECT id, username, email, user_type as role, tokens, status FROM users")
        
        # Process user list
        users_list = []
        for user_data in users:
            user = {
                "id": user_data["id"],
                "username": user_data["username"],
                "role": user_data["user_type"],
                "tokens": user_data["tokens"]
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
#converted to current DB(CB) need to test functionality
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
    
        # Get user to be deleted
        user_to_delete = db.query("SELECT username FROM users WHERE id = %s", (user_id,))
        
        if not user_to_delete:
            raise HTTPException(
                status_code=404,
                detail=f"User with ID {user_id} not found"
            )
            
        username = user_to_delete[0]["username"]
        
        # Ensure admin can't delete themselves
        if username == current_user.username:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete your own account"
            )
            
        # Delete user from database
        success = db.delete_user(username)
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to delete user"
            )
            return {"message": f"User {username} deleted successfully"}
    
    # 如果没有找到指定ID的用户
    raise HTTPException(
        status_code=404,
        detail=f"User with ID {user_id} not found"
    )

#this was not implemented in the DB currently
#should try to comment out or implement if possible(CB)
# 封禁或解封用户
"""
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
"""
# DELETE? (MS)
#need to test but is converted to the current DB(CB)
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
    if not db.username_exists(complaint_data.collaborator):
        raise HTTPException(
            status_code=404,
            detail=f"User {complaint_data.collaborator} not found"
        )
    
    # Combine subject and content as the "correction" field since that's what the DB expects
    correction_details = f"Subject: {complaint_data.subject}\nContent: {complaint_data.content}"
    
    # Use the add_correction function from the DB
    success = db.add_correction(
        username=current_user.username,
        correction=correction_details,
        reason=complaint_data.reason
    )
    
    #got rid of id stuff, could bring back(CB)
    #return {"message": "Complaint submitted successfully", "id": complaint_id}
    return {"message": "Complaint submitted successfully"}


db.close()
