import json
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from db.models import (system_log)
from db.session import get_db
from controller import systemlogcontroller, usercontroller
from helper.hepler import manager

router = APIRouter()

@router.get("/system-logs")
def get_systemlog(db: Session = Depends(get_db), current_user: system_log.SystemLog = Depends(usercontroller.get_current_user)):
    return systemlogcontroller.get_system_logs_controller(db, current_user)