import json
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from controller import maintenance_request_controller, usercontroller
from db.session import get_db
from schemas.maintenance_request import MaintenanceRequestCreate, MaintenanceRequestUpdate
from helper.hepler import manager

router = APIRouter()

@router.post("/create-maintenance-request")
async def create_maintenance_request(data: MaintenanceRequestCreate, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    try:
        request = maintenance_request_controller.create_maintenance_request(db, data, current_user)
        await manager.broadcast({
            "action": "create",
            "data": jsonable_encoder(request)
        }, channel="/ws/maintenance-requests")
        return request
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating maintenance request: {str(e)}")

@router.get("/maintenance-requests")
def get_all_maintenance_requests(db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    return maintenance_request_controller.get_all_maintenance_requests(db, current_user)

@router.put("/maintenance-request/{request_id}")
async def update_maintenance_request(request_id: int, data: MaintenanceRequestUpdate, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    updated = maintenance_request_controller.update_maintenance_request(db, request_id, data, current_user)
    await manager.broadcast({
        "action": "update",
        "id": request_id,
        "data": jsonable_encoder(updated)
    }, channel="/ws/maintenance-requests")
    return updated

@router.delete("/maintenance-request/{request_id}")
async def delete_maintenance_request(request_id: int, db: Session = Depends(get_db), current_user=Depends(usercontroller.get_current_user)):
    deleted = maintenance_request_controller.delete_maintenance_request(db, request_id, current_user)
    await manager.broadcast({
        "action": "delete",
        "id": request_id,
        "data": jsonable_encoder(deleted) if deleted else None
    }, channel="/ws/maintenance-requests")
    return {"message": "Maintenance request deleted successfully"}

@router.websocket("/ws/maintenance-requests")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    channel = "/ws/maintenance-requests"
    await manager.connect(websocket, channel)

    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            action = payload.get("action")

            if action == "init":
                requests = maintenance_request_controller.get_all_maintenance_requests(db, current_user=None)
                await websocket.send_text(json.dumps({
                    "action": "init",
                    "data": jsonable_encoder(requests)
                }))
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)