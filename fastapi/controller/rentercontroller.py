from fastapi import HTTPException
from sqlalchemy.orm import Session
from schemas.renters import RenterOut
from db.models.renters import Renter
from db.models.user import User

def get_all_renters(db: Session, current_user):
    try:
        renters = (
            db.query(Renter, User.userName)
            .join(User, User.id == Renter.user_id)
            .filter(Renter.owner_id == current_user.id)  # ✅ filter by owner
            .all()
        )

        return [
            RenterOut(
                id=renter.id,
                user_id=renter.user_id,
                id_document=renter.id_document,
                username=username
            ) for renter, username in renters
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching renters: {str(e)}")
