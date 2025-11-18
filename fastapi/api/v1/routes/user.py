import json
from fastapi import APIRouter, Depends, Request, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from controller import usercontroller
from db.session import get_db
from db.models import (user)
from schemas.user import ChangePasswordRequest, UpdateUser, UserCreate
from helper.hepler import manager

router = APIRouter()


@router.get("/renters")
def get_renters(db: Session = Depends(get_db), current_user: user.User = Depends(usercontroller.get_current_user)):
    return usercontroller.get_renters_controller(db, current_user)

@router.post("/create-renter")
async def create_renter(user_data: UserCreate, request_obj: Request = None, db: Session = Depends(get_db), current_user: user.User = Depends(usercontroller.get_current_user)):
    return await usercontroller.create_renter_controller(user_data, db, current_user, request_obj)

@router.put("/update-renter/{id}")
async def update_renter(id: str, user_data: UpdateUser, request_obj: Request = None, db: Session = Depends(get_db), current_user: user.User = Depends(usercontroller.get_current_user)):
    return usercontroller.update_renter_controller(id, user_data, db, current_user, request_obj)

@router.delete("/delete-renter/{id}")
async def delete_renter(id: str, request_obj: Request = None, db: Session = Depends(get_db), current_user: user.User = Depends(usercontroller.get_current_user)):
    return usercontroller.delete_renter_controller(id, db, current_user, request_obj)


@router.get("/owners")
def get_owners(db: Session = Depends(get_db), current_user: user.User = Depends(usercontroller.get_current_user)):
    return usercontroller.get_owners_controller(db, current_user)

@router.post("/create-owner")
async def create_owner(user_data: UserCreate, request_obj: Request = None, db: Session = Depends(get_db), current_user: user.User = Depends(usercontroller.get_current_user)):
    owner = await usercontroller.create_owner_controller(user_data, db, current_user, request_obj)
    await manager.broadcast({
        "action": "create",
        "data": owner
    }, channel="/ws/owners")
    return owner

@router.put("/update-owner/{id}")
async def update_owner(id: str, user_data: UpdateUser, request_obj: Request = None, db: Session = Depends(get_db), current_user: user.User = Depends(usercontroller.get_current_user)):
    owner = usercontroller.update_owner_controller(id, user_data, db, current_user, request_obj)
    await manager.broadcast({
        "action": "update",
        "id": id,
        "data": owner
    }, channel="/ws/owners")
    return owner

@router.delete("/delete-owner/{id}")
async def delete_owner(id: str, request_obj: Request = None, db: Session = Depends(get_db), current_user: user.User = Depends(usercontroller.get_current_user)):
    owner = usercontroller.delete_owner_controller(id, db, current_user, request_obj)
    await manager.broadcast({
        "action": "delete",
        "id": str(id),
        "data": owner
    }, channel="/ws/owners")
    return owner

@router.websocket("/ws/owners")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    channel = "/ws/owners"
    await manager.connect(websocket, channel)

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            action = payload.get("action")

            if action == "init":
                owners = usercontroller.get_owners_controller(db, current_user=None)
                await websocket.send_text(json.dumps({
                    "action": "init",
                    "data": jsonable_encoder(owners)
                }))
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)

@router.put("/update-profile")
async def update_profile(user_data: UpdateUser, db: Session = Depends(get_db), current_user= Depends(usercontroller.get_current_user)):
    user = usercontroller.update_profile_controller(user_data, db, current_user)
    return user

@router.put("/change-password")
def change_password(data: ChangePasswordRequest, db: Session = Depends(get_db), current_user = Depends(usercontroller.get_current_user), request_obj: Request = None):
    data = usercontroller.change_password_controller(data, db, current_user, request_obj)
    return data