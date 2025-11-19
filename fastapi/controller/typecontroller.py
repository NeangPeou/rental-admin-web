from fastapi import HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session
from db.models import property_types, properties
from schemas.type import TypeCreate, TypeUpdate

def create_type(db: Session, data: TypeCreate):
    try:
        existing = db.query(property_types.PropertyType).filter(property_types.PropertyType.type_code == data.type_code).first()

        if existing:
            raise HTTPException(status_code=400, detail="Type already exists")
        
        db_type = property_types.PropertyType(
            type_code=data.type_code,
            name=data.name
        )
        db.add(db_type)
        db.commit()
        db.refresh(db_type)

        return {
            'id': str(db_type.id),
            'typeCode': db_type.type_code,
            'name': db_type.name,
        }
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating type: {str(e)}")

def get_all_types(db: Session, current_user):
    try:
        type = db.query(property_types.PropertyType).order_by(desc(property_types.PropertyType.id)).all()
        return [{
                'id': str(o.id),
                'typeCode': o.type_code,
                'name': o.name,
            } for o in type]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching types: {str(e)}")

def update_type(db: Session, type_id: int, data: TypeUpdate):
    db_type = db.get(property_types.PropertyType, type_id)
    if not db_type:
        raise HTTPException(status_code=404, detail="Type not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(db_type, key, value)

    db.commit()
    db.refresh(db_type)
    return db_type

def delete_type(db: Session, type_id: int):
    try:
        db_type = db.get(property_types.PropertyType, type_id)
        if not db_type:
            raise HTTPException(status_code=404, detail="Type not found")
        # -------add more checks before deletion-------
        usage_count = db.query(properties.Property).filter(
            properties.Property.type_id == type_id
        ).count()

        if usage_count > 0:
            raise HTTPException(
                status_code=400,
                detail="Type is in use and cannot be deleted"
            )
        # ------------------------------------
        return_data = {
            'id': str(db_type.id),
            'typeCode': db_type.type_code,
            'name': db_type.name,
        }

        db.delete(db_type)
        db.commit()

        return return_data
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating type: {str(e)}")