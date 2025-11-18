from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException
from db.models import properties as Property, property_types, user
from schemas.property import PropertyCreate, PropertyUpdate
from sqlalchemy.exc import SQLAlchemyError

def create_property(db: Session, data: PropertyCreate, current_user):
    try:
        type_exists = db.query(property_types.PropertyType).filter(property_types.PropertyType.id == data.type_id).first()
        if not type_exists:
            raise HTTPException(status_code=400, detail="Invalid type_id")
        
        duplicate_property = db.query(Property.Property).filter(func.lower(Property.Property.name) == func.lower(data.name), func.lower(Property.Property.address) == func.lower(data.address)).first()

        if duplicate_property:
            raise HTTPException(status_code=400, detail="A property with the same name and address already exists.")
        
        new_property = Property.Property(
            name = data.name,
            address = data.address,
            city = data.city,
            district = data.district,
            province = data.province,
            postal_code = data.postal_code,
            latitude = None if data.latitude == "" else data.latitude,
            longitude = None if data.longitude == "" else data.longitude,
            description = data.description,
            type_id=int(data.type_id),
            owner_id=int(current_user.id)
        )
        db.add(new_property)
        db.commit()
        db.refresh(new_property)

        return {
            "id": new_property.id,
            "name": new_property.name,
            "address": new_property.address,
            "city": new_property.city,
            "district": new_property.district,
            "province": new_property.province,
            "postal_code": new_property.postal_code,
            "latitude": new_property.latitude,
            "longitude": new_property.longitude,
            "description": new_property.description,
            "type_id": new_property.type_id,
            "type_name": type_exists.type_code,
            "owner_id": new_property.owner_id,
            "owner_name": current_user.userName
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating property: {str(e)}")

def get_all_properties(db: Session, current_user):
    try:
        properties = (
            db.query(Property.Property, property_types.PropertyType)
            .outerjoin(property_types.PropertyType, property_types.PropertyType.id == Property.Property.type_id)
            .filter(Property.Property.owner_id == current_user.id)
            .order_by(Property.Property.id.desc())
        ).all()

        return [
            {
                "id": p.id,
                "name": p.name,
                "address": p.address,
                "city": p.city,
                "district": p.district,
                "province": p.province,
                "postal_code": p.postal_code,
                "latitude": p.latitude,
                "longitude": p.longitude,
                "description": p.description,
                "type_id": p.type_id,
                "type_name": prop_type.type_code if prop_type else None,
                "owner_id": p.owner_id,
                "owner_name": current_user.userName if current_user else None,
            }
            for p, prop_type in properties
        ]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=500, detail=f"Error fetching properties: {str(e)}")

def update_property(db: Session, property_id: int, data: PropertyUpdate, current_user):
    try:
        prop = db.query(Property.Property).filter(Property.Property.id == property_id).first()
        if not prop:
            raise HTTPException(status_code=404, detail="Property not found")
        
        if data.name is not None and data.address is not None:
            duplicate = db.query(Property.Property).filter(func.lower(Property.Property.name) == func.lower(data.name), func.lower(Property.Property.address) == func.lower(data.address), Property.Property.id != property_id).first()
            if duplicate:
                raise HTTPException(status_code=400, detail="Another property with the same name and address already exists.")
        
        if data.name is not None:
            prop.name = data.name
        if data.address is not None:
            prop.address = data.address
        if data.city is not None:
            prop.city = data.city
        if data.district is not None:
            prop.district = data.district or None
        if data.province is not None:
            prop.province = data.province or None
        if data.postal_code is not None:
            prop.postal_code = data.postal_code or None
        if data.latitude is not None:
            prop.latitude = None if data.latitude == "" else float(data.latitude)
        if data.longitude is not None:
            prop.longitude = None if data.longitude == "" else float(data.longitude)
        if data.description is not None:
            prop.description = data.description or None
        if data.type_id is not None:
            prop.type_id = int(data.type_id)
        if current_user.id is not None:
            prop.owner_id = int(current_user.id)

        if data.owner_id is not None:
            owner = db.query(user.User).filter(user.User.id == current_user.id).first()
            if not owner:
                raise HTTPException(status_code=404, detail="Owner not found")

        if data.type_id is not None:
            prop_type = db.query(property_types.PropertyType).filter(property_types.PropertyType.id == data.type_id).first()
            if not prop_type:
                raise HTTPException(status_code=404, detail="Property type not found")

        db.commit()
        db.refresh(prop)

        return {
            "id": prop.id,
            "name": prop.name,
            "address": prop.address,
            "city": prop.city,
            "district": prop.district,
            "province": prop.province,
            "postal_code": prop.postal_code,
            "latitude": str(prop.latitude),
            "longitude": str(prop.longitude),
            "description": prop.description,
            "type_id": str(prop.type_id),
            "type_name": prop_type.type_code if prop_type else None,
            "owner_id": str(prop.owner_id),
            "owner_name": owner.userName if owner else None,
        }
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating property: {str(e)}")

def delete_property(db: Session, property_id: int, current_user):
    try:
        prop = db.query(Property.Property).filter(Property.Property.id == property_id).first()
        if not prop:
            raise HTTPException(status_code=404, detail="Property not found")
        
        db.delete(prop)
        db.commit()

        return {"detail": "Property deleted"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting property: {str(e)}")
