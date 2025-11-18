from fastapi import HTTPException
from sqlalchemy.orm import Session
from db.models import system_log, user, role
from sqlalchemy import desc, asc

from helper.hepler import format_datetime


def get_system_logs_controller(db: Session, current_user: user.User = None):
    try:
        if current_user is not None:
            admin_role = db.query(role.Role).filter(role.Role.role == "Admin").first()
            if not admin_role:
                raise HTTPException(status_code=403, detail="Only admins can access system logs")
            
        # count logs
        total_logs = db.query(system_log.SystemLog).count()
        if total_logs >= 10000:
            old_logs = db.query(system_log.SystemLog).order_by(asc(system_log.SystemLog.created_at)).limit(5000).all()
            for log in old_logs:
                db.delete(log)
            db.commit()

        logs = db.query(system_log.SystemLog).order_by(desc(system_log.SystemLog.created_at)).all()
        return [
            {
                'id': str(log.id),
                'user_id': str(log.user_id),
                'action': log.action,
                'logType': log.logType,
                'message': log.message,
                'hostName': log.hostName,
                'created_at': format_datetime(log.created_at),
                'updated_at': format_datetime(log.updated_at),
            } for log in logs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch system logs: {str(e)}")