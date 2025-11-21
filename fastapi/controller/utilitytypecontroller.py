from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from db.models import utility_types
from schemas.utilitytype import UtilityTypeCreate, UtilityTypeUpdate

def create_utility_type(db: Session, data: UtilityTypeCreate):
    try:
        existing = db.query(utility_types.UtilityType).filter(utility_types.UtilityType.name == data.name).first()

        if existing:
            raise HTTPException(status_code=400, detail="Utility type already exists")
        
        db_utility_type = utility_types.UtilityType(
            name=data.name
        )
        db.add(db_utility_type)
        db.commit()
        db.refresh(db_utility_type)

        return {
            'id': str(db_utility_type.id),
            'name': db_utility_type.name,
        }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating utility type: {str(e)}")

def get_all_utility_types(db: Session, current_user):
    try:
        utility_types_list = db.query(utility_types.UtilityType).order_by(desc(utility_types.UtilityType.id)).all()
        return [{
                'id': str(o.id),
                'name': o.name,
            } for o in utility_types_list]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching utility types: {str(e)}")

def update_utility_type(db: Session, utility_type_id: int, data: UtilityTypeUpdate):
    
    # add check for existing name
    existing = (db.query(utility_types.UtilityType).filter(utility_types.UtilityType.name == data.name, utility_types.UtilityType.id != utility_type_id).first())
    if existing:
        raise HTTPException(status_code=400, detail="Utility type already exists")
    #--------------------------------------------------------------------------------------------------------

    db_utility_type = db.get(utility_types.UtilityType, utility_type_id)
    if not db_utility_type:
        raise HTTPException(status_code=404, detail="Utility type not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(db_utility_type, key, value)

    db.commit()
    db.refresh(db_utility_type)
    return db_utility_type

def delete_utility_type(db: Session, utility_type_id: int):
    try:
        db_utility_type = db.get(utility_types.UtilityType, utility_type_id)
        if not db_utility_type:
            raise HTTPException(status_code=404, detail="Utility type not found")

        return_data = {
            'id': str(db_utility_type.id),
            'name': db_utility_type.name,
        }

        db.delete(db_utility_type)
        db.commit()

        return return_data
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting utility type: {str(e)}")