
from datetime import datetime, timedelta
import json
import re
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from db.models import (renters, user, role, system_log, user_session)
from core.security import create_access_token, create_refresh_token, get_password_hash, SECRET_KEY, ALGORITHM, verify_password
from helper.hepler import log_action
from schemas.user import ChangePasswordRequest, UpdateUser, UserCreate, UserResponse
from db.session import get_db
from jose import JWTError, jwt
from sqlalchemy import and_, desc

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# Valid gender options
VALID_GENDERS = {"Male", "Female"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
        username: str = payload.get("name")
        if username is None:
            raise credentials_exception
        user_obj = db.query(user.User).filter(user.User.userName == username).first()
        if user_obj is None:
            raise credentials_exception
        return user_obj
    except JWTError as e:
        raise credentials_exception

def get_owners_controller(db: Session, current_user: user.User = Depends(get_current_user)):
    try:
        admin_role = db.query(role.Role).filter(role.Role.role == "Admin").first()
        if not admin_role:
            raise HTTPException(status_code=403, detail="Only admins can access owner list")

        owner_role = db.query(role.Role).filter(role.Role.role == "Owner").first()
        if not owner_role:
            raise HTTPException(status_code=404, detail="Owner role not found")

        owners = db.query(user.User).filter(user.User.role_id == owner_role.id).order_by(desc(user.User.id)).all()
        return [
                {
                'id': str(o.id),
                'userName': o.userName,
                'userID': re.sub(f"{o.id}$", "", o.userName or ""),
                'phoneNumber': o.phoneNumber,
                'passport': o.passport,
                'idCard': o.idCard,
                'address': o.address,
                'gender' : o.gender,
            } for o in owners
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch owners: {str(e)}")

async def create_owner_controller(user_data: UserCreate, db: Session, current_user: user.User = Depends(get_current_user), request_obj: Request = None):
    try:
        admin_role = db.query(role.Role).filter(role.Role.role == "Admin").first()
        if not admin_role or current_user.role_id != admin_role.id:
            raise HTTPException(status_code=403, detail="Only admins can create owners")

        existing_user = db.query(user.User).filter(user.User.userName == user_data.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        owner_role = db.query(role.Role).filter(role.Role.role == "Owner").first()
        if not owner_role:
            owner_role = role.Role(role="Owner", description="Property owner role")
            db.add(owner_role)
            db.commit()
            db.refresh(owner_role)
        
        # Validate gender
        gender = user_data.gender or 'Male'
        if gender not in VALID_GENDERS:
            raise HTTPException(status_code=400, detail=f"Invalid gender. Must be one of: {', '.join(VALID_GENDERS)}")

        hashed_password = get_password_hash(user_data.password)
        users = user.User(
            userName=user_data.username,
            password=hashed_password,
            role_id=owner_role.id,
            phoneNumber=user_data.phoneNumber,
            passport=user_data.passport,
            idCard=user_data.idCard,
            address=user_data.address,
            gender = gender
        )
        db.add(users)
        db.commit()
        db.refresh(users)

        data = update_username(users.id, f"{users.userName}{users.id}", db)

        ip_address = request_obj.client.host if request_obj else 'unknown'
        host_name = user_data.deviceName if hasattr(user_data, 'deviceName') else ip_address or 'unknown'
        log_action(
            db=db,
            user_id=users.id,
            action="CREATE_OWNER",
            log_type="INFO",
            message=f"Owner {users.userName} created by admin {current_user.userName}",
            host_name=host_name
        )

        user_response = UserResponse.from_orm(data)
        user_response.userID = user_data.username
        return user_response
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create owner: {str(e)}")
    
def update_username(user_id: int, new_username: str, db: Session):
    user_obj = db.query(user.User).filter(user.User.id == user_id).first()
    if not user_obj:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user = db.query(user.User).filter(user.User.userName == new_username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    user_obj.userName = new_username
    db.commit()
    db.refresh(user_obj)
    return user_obj

def update_owner_controller(id: int, user_data: UpdateUser, db: Session, current_user: user.User = Depends(get_current_user), request_obj: Request = None):
    try:
        admin_role = db.query(role.Role).filter(role.Role.role == "Admin").first()
        if not admin_role or current_user.role_id != admin_role.id:
            raise HTTPException(status_code=403, detail="Only admins can update owners")

        owner = db.query(user.User).filter(user.User.id == id).first()
        if not owner:
            raise HTTPException(status_code=404, detail="Owner not found")

        owner_role = db.query(role.Role).filter(role.Role.role == "Owner").first()
        if not owner_role or owner.role_id != owner_role.id:
            raise HTTPException(status_code=400, detail="User is not an owner")
       
        if user_data.username:
            owner.userName = user_data.username + str(id) or None
        if user_data.password is not None:
            owner.password = get_password_hash(user_data.password)
        if user_data.phoneNumber is not None:
            owner.phoneNumber = user_data.phoneNumber or None
        if user_data.passport is not None:
            owner.passport = user_data.passport or None
        if user_data.idCard is not None:
            owner.idCard = user_data.idCard or None
        if user_data.address is not None:
            owner.address = user_data.address or None
        if user_data.gender is not None:
            if user_data.gender not in VALID_GENDERS:
                raise HTTPException(status_code=400, detail=f"Invalid gender. Must be one of: {', '.join(VALID_GENDERS)}")
            owner.gender = user_data.gender

        db.commit()
        db.refresh(owner)

        ip_address = request_obj.client.host if request_obj else 'unknown'
        host_name = user_data.deviceName if hasattr(user_data, 'deviceName') else ip_address or 'unknown'
        log_action(
            db=db,
            user_id=owner.id,
            action="UPDATE_OWNER",
            log_type="INFO",
            message=f"Owner {owner.userName} updated by admin {current_user.userName}",
            host_name=host_name
        )
        user_response = UserResponse.from_orm(owner)
        user_response.userID = user_data.username
        return user_response
    except Exception as e:
        db.rollback()
        print(f"Error updating owner: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Failed to update owner: {str(e)}")
    
def delete_owner_controller(id: str, db: Session, current_user: user.User = Depends(get_current_user), request_obj: Request = None):
    try:
        admin_role = db.query(role.Role).filter(role.Role.role == "Admin").first()
        if not admin_role or current_user.role_id != admin_role.id:
            raise HTTPException(status_code=403, detail="Only admins can delete owners")

        owner = db.query(user.User).filter(user.User.id == id).first()
        if not owner:
            raise HTTPException(status_code=404, detail="Owner not found")

        owner_role = db.query(role.Role).filter(role.Role.role == "Owner").first()
        if not owner_role or owner.role_id != owner_role.id:
            raise HTTPException(status_code=400, detail="User is not an owner")
        # Delete associated system logs
        db.query(system_log.SystemLog).filter(system_log.SystemLog.user_id == owner.id).delete()

        db.delete(owner)
        db.commit()

        ip_address = request_obj.client.host if request_obj else 'unknown'
        log_action(
            db=db,
            user_id=current_user.id,
            action="DELETE_OWNER",
            log_type="INFO",
            message=f"Owner {owner.userName} and associated logs deleted by {current_user.userName}",
            host_name=ip_address
        )
        user_response = UserResponse.from_orm(owner)
        return user_response
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete owner and logs: {str(e)}")

def update_profile_controller(user_data: UpdateUser, db: Session, current_user):
    try:
        user_record = db.query(user.User).filter(user.User.id == user_data.id).first()
        if not user_record:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user_data.username:
            duplicate_user = db.query(user.User).filter(and_(user.User.userName == user_data.username, user.User.id != user_data.id)).first()

            if duplicate_user:
                raise HTTPException(status_code=400, detail="Username already taken")

        user_record.userName = user_data.username or user_record.userName
        user_record.phoneNumber = user_data.phoneNumber or user_record.phoneNumber
        user_record.passport = user_data.passport
        user_record.idCard = user_data.idCard
        user_record.address = user_data.address
        user_record.gender = user_data.gender

        db.commit()
        db.refresh(user_record)
        user_response = UserResponse.from_orm(user_record)
        user_response.userID = user_data.username
        return user_response
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"{str(e)}")

def change_password_controller(user_data: ChangePasswordRequest, db: Session, current_user, request_obj: Request = None):
    try:
        user_record = db.query(user.User).filter(user.User.id == user_data.id).first()

        if not user_record:
            raise HTTPException(status_code=404, detail="User not found")

        user_record.password = get_password_hash(user_data.newPassword)
        accessToken = create_access_token({"name": user_record.userName, "password": user_record.password, "id": user_record.id})
        refreshToken = create_refresh_token({"name": user_record.userName, "password": user_record.password, "id": user_record.id})

        device_info = None
        try:
            device_info = json.loads(user_data.deviceInfo) if user_data.deviceInfo else None
        except Exception:
            device_info = {"info": user_data.deviceInfo}

        ip_address = request_obj.client.host if request_obj else None

        session = user_session.UserSession(
            user_id = user_record.id,
            deviceName = device_info.get("Model") if isinstance(device_info, dict) else None,
            access_token = accessToken,
            refresh_token = refreshToken,
            token_expired = datetime.utcnow() + timedelta(hours=2),
            refresh_expired = datetime.utcnow() + timedelta(days=7),
            ip_address = ip_address,
            user_agent = device_info.get("Version") if isinstance(device_info, dict) else None,
        )
        db.add(session)
        db.commit()
        db.refresh(user_record)

        user_response = UserResponse.from_orm(user_record)
        user_response.accessToken = accessToken
        user_response.refreshToken = refreshToken
        return user_response
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"{str(e)}")

def get_renters_controller(db: Session, current_user: user.User = Depends(get_current_user)):
    try:
        admin_role = db.query(role.Role).filter(role.Role.role == "Admin").first()
        owner_role = db.query(role.Role).filter(role.Role.role == "Owner").first()
        if not (admin_role and owner_role) or (current_user.role_id != admin_role.id and current_user.role_id != owner_role.id):
            raise HTTPException(status_code=403, detail="Only admins or owners can access renter list")

        renter_role = db.query(role.Role).filter(role.Role.role == "Renter").first()
        if not renter_role:
            raise HTTPException(status_code=404, detail="Renter role not found")

        renters_list = db.query(user.User).join(renters.Renter, renters.Renter.user_id == user.User.id).filter(
            user.User.role_id == renter_role.id,
            renters.Renter.owner_id == current_user.id
        ).order_by(desc(user.User.id)).all()
        return [
            {
                'id': str(r.id),
                'userName': r.userName,
                'userID': re.sub(f"{r.id}$", "", r.userName or ""),
                'phoneNumber': r.phoneNumber,
                'passport': r.passport,
                'idCard': r.idCard,
                'address': r.address,
                'gender': r.gender,
            } for r in renters_list
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch renters: {str(e)}")
    
async def create_renter_controller(user_data: UserCreate, db: Session, current_user: user.User = Depends(get_current_user), request_obj: Request = None):
    try:
        owner_role = db.query(role.Role).filter(role.Role.role == "Owner").first()
        if not owner_role or current_user.role_id != owner_role.id:
            raise HTTPException(status_code=403, detail="Only owners can create renters")

        existing_user = db.query(user.User).filter(user.User.userName == user_data.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        renter_role = db.query(role.Role).filter(role.Role.role == "Renter").first()
        if not renter_role:
            renter_role = role.Role(role="Renter", description="Property renter role")
            db.add(renter_role)
            db.commit()
            db.refresh(renter_role)

        gender = user_data.gender or 'Male'
        if gender not in VALID_GENDERS:
            raise HTTPException(status_code=400, detail=f"Invalid gender. Must be one of: {', '.join(VALID_GENDERS)}")

        hashed_password = get_password_hash(user_data.password)
        renter = user.User(
            userName=user_data.username,
            password=hashed_password,
            role_id=renter_role.id,
            phoneNumber=user_data.phoneNumber,
            passport=user_data.passport,
            idCard=user_data.idCard,
            address=user_data.address,
            gender=gender
        )
        db.add(renter)
        db.commit()
        db.refresh(renter)

        renter_extra = renters.Renter(
            user_id=renter.id,
            id_document=user_data.idCard or user_data.passport,
            owner_id=current_user.id
        )
        db.add(renter_extra)
        db.commit()
        db.refresh(renter_extra)

        data = update_username(renter.id, f"{renter.userName}{renter.id}", db)

        ip_address = request_obj.client.host if request_obj else 'unknown'
        host_name = user_data.deviceName if hasattr(user_data, 'deviceName') else ip_address or 'unknown'
        log_action(
            db=db,
            user_id=renter.id,
            action="CREATE_RENTER",
            log_type="INFO",
            message=f"Renter {renter.userName} created by owner {current_user.userName}",
            host_name=host_name
        )

        user_response = UserResponse.from_orm(data)
        user_response.userID = user_data.username
        return user_response
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create renter: {str(e)}")
    
def update_renter_controller(id: int, user_data: UpdateUser, db: Session, current_user: user.User = Depends(get_current_user), request_obj: Request = None):
    try:
        owner_role = db.query(role.Role).filter(role.Role.role == "Owner").first()
        if not owner_role or current_user.role_id != owner_role.id:
            raise HTTPException(status_code=403, detail="Only owners can update renters")

        renter = db.query(user.User).filter(user.User.id == id).first()
        if not renter:
            raise HTTPException(status_code=404, detail="Renter not found")

        renter_role = db.query(role.Role).filter(role.Role.role == "Renter").first()
        if not renter_role or renter.role_id != renter_role.id:
            raise HTTPException(status_code=400, detail="User is not a renter")

        if user_data.username:
            renter.userName = user_data.username + str(id) or None
        if user_data.password is not None:
            renter.password = get_password_hash(user_data.password)
        if user_data.phoneNumber is not None:
            renter.phoneNumber = user_data.phoneNumber or None
        if user_data.passport is not None:
            renter.passport = user_data.passport or None
        if user_data.idCard is not None:
            renter.idCard = user_data.idCard or None
        if user_data.address is not None:
            renter.address = user_data.address or None
        if user_data.gender is not None:
            if user_data.gender not in VALID_GENDERS:
                raise HTTPException(status_code=400, detail=f"Invalid gender. Must be one of: {', '.join(VALID_GENDERS)}")
            renter.gender = user_data.gender

        db.commit()
        db.refresh(renter)
        renter_extra = db.query(renters.Renter).filter(
            renters.Renter.user_id == id,
            renters.Renter.owner_id == current_user.id
        ).first()
        if not renter_extra:
            raise HTTPException(status_code=403, detail="You are not authorized to update this renter")

        ip_address = request_obj.client.host if request_obj else 'unknown'
        host_name = user_data.deviceName if hasattr(user_data, 'deviceName') else ip_address or 'unknown'
        log_action(
            db=db,
            user_id=renter.id,
            action="UPDATE_RENTER",
            log_type="INFO",
            message=f"Renter {renter.userName} updated by owner {current_user.userName}",
            host_name=host_name
        )

        user_response = UserResponse.from_orm(renter)
        user_response.userID = user_data.username
        return user_response
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update renter: {str(e)}")
    
def delete_renter_controller(id: str, db: Session, current_user: user.User = Depends(get_current_user), request_obj: Request = None):
    try:
        owner_role = db.query(role.Role).filter(role.Role.role == "Owner").first()
        if not owner_role or current_user.role_id != owner_role.id:
            raise HTTPException(status_code=403, detail="Only owners can delete renters")

        renter = db.query(user.User).filter(user.User.id == id).first()
        if not renter:
            raise HTTPException(status_code=404, detail="Renter not found")

        renter_role = db.query(role.Role).filter(role.Role.role == "Renter").first()
        if not renter_role or renter.role_id != renter_role.id:
            raise HTTPException(status_code=400, detail="User is not a renter")

        db.query(renters.Renter).filter(renters.Renter.user_id == id).delete()
        db.query(system_log.SystemLog).filter(system_log.SystemLog.user_id == renter.id).delete()

        db.delete(renter)
        db.commit()

        ip_address = request_obj.client.host if request_obj else 'unknown'
        log_action(
            db=db,
            user_id=current_user.id,
            action="DELETE_RENTER",
            log_type="INFO",
            message=f"Renter {renter.userName} and associated logs deleted by {current_user.userName}",
            host_name=ip_address
        )
        user_response = UserResponse.from_orm(renter)
        return user_response
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete renter and logs: {str(e)}")