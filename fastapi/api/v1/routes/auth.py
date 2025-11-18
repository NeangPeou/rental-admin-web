from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from controller import authcontroller, usercontroller
from db.session import get_db
from db.models import (user, user_session)
from core.security import ALGORITHM, SECRET_KEY
from helper.hepler import ConnectionManager
from schemas.user import LoginRequest, RegisterUser, UserResponse

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")
manager = ConnectionManager()

@router.post("/register")
def register(user_data: RegisterUser, db: Session = Depends(get_db), request_obj: Request = None):
    try:
        user = authcontroller.register_controller(user_data, db, request_obj)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db), request_obj: Request = None):
    try:
        user = authcontroller.login_controller(request, db, request_obj)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tokensValid")
def token_is_valid(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("authorization")
    if not auth_header:
        raise HTTPException(status_code=403, detail="Authorization header missing")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=403, detail="Invalid auth scheme")

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
    
        username_from_token = payload.get("name")
        password_from_token = payload.get("password") 
        
        if not username_from_token or not password_from_token:
            raise HTTPException(status_code=400, detail="Token missing username or password")

        userData = db.query(user.User).filter(user.User.userName == username_from_token).first()

        if not userData:
            raise HTTPException(status_code=404, detail="User not found")

        # Check password (hashed) against the password in token (usually NOT safe to store raw password in token)
        if password_from_token != userData.password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # check if the access token exists in the user session 
        session = db.query(user_session.UserSession).filter_by(access_token=token, user_id=userData.id).first()
        if not session:
            raise HTTPException(status_code=401, detail="Session invalid or revoked")

        user_response = UserResponse.from_orm(userData)
        user_response.accessToken = token
        return user_response
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.post("/logout")
def logout(request: Request ,db: Session = Depends(get_db)):
    return authcontroller.logout_controller(request, db)

@router.get("/me")
def get_current_user(current_user: user.User = Depends(usercontroller.get_current_user)):
    return {
        "username": current_user.userName,
        "role": current_user.role_id if current_user.role_id else None
    }

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    # Accept the WebSocket connection
    channel = "/ws"
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()  # Receive message from the client
            # You can add authentication here based on a token or user
            # If needed, fetch user from DB based on token
            await manager.broadcast(f"Message from client: {data}", channel = "/ws")
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel = "/ws")
        print("Client disconnected")