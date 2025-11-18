from fastapi import FastAPI
from api.v1.routes import auth, user, systemlog, type, property, units, leases, renters, payment, invoice, inventory, utilitytype, maintenance_requests
from db.models import (
    user as users, 
    role, 
    user_session, 
    system_log, 
    property_types, 
    properties, 
    units as unittb,
    renters as renterstb, 
    leases as leasestb, 
    payments, 
    maintenance_requests as maintenance_requeststb, 
    documents, 
    messages, 
    utility_types, 
    unit_utility, 
    meter_readings, 
    invoices, 
    inventory as inventorytb
)
from db.session import engine, Base
from fastapi.middleware.cors import CORSMiddleware
import os
from sqlalchemy import create_engine, text

app = FastAPI()

Base.metadata.create_all(bind=engine)

def fix_allow_null_column():
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        conn.execute(text("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 't_maintenance_requests' 
                AND column_name = 'renter_id' 
                AND is_nullable = 'NO'
            ) THEN
                ALTER TABLE t_maintenance_requests ALTER COLUMN renter_id DROP NOT NULL;
            END IF;
        END
        $$;
        """))
        conn.commit()
#Fix database schema manually
def add_columns():
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        #Add 'address' column only if it does not exist
        conn.execute(text("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 't_units' AND column_name = 'created_at'
            ) THEN
                ALTER TABLE t_units ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
            END IF;

            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 't_units' AND column_name = 'updated_at'
            ) THEN
                ALTER TABLE t_units ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();
            END IF;
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 't_renters' AND column_name = 'owner_id'
            ) THEN
                ALTER TABLE t_renters ADD COLUMN owner_id INT REFERENCES t_users(id);
            END IF;
        END
        $$;
        """))
        conn.commit()

def drop_columns():
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        conn.execute(text("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 't_users' AND column_name = 'addresss'
            ) THEN
                ALTER TABLE t_users DROP COLUMN addresss;
            END IF;    
        END
        $$;
        """))
        conn.commit()

def drop_table(table_name: str):
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)

    drop_sql = f'DROP TABLE IF EXISTS {table_name} CASCADE;'

    with engine.begin() as conn:
        conn.execute(text(drop_sql))

# drop_table("t_utility_types")
# add_columns()
# drop_columns()
# fix_allow_null_column()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(user.router, prefix="/api", tags=["User"])
app.include_router(systemlog.router, prefix="/api", tags=["SystemLog"])
app.include_router(type.router, prefix="/api", tags=["Type"])
app.include_router(property.router, prefix="/api", tags=["Property"])
app.include_router(units.router, prefix="/api", tags=["Units"])
app.include_router(leases.router, prefix="/api", tags=["Leases"])
app.include_router(renters.router, prefix="/api", tags=["Renters"])
app.include_router(payment.router, prefix="/api", tags=["Payment"])
app.include_router(inventory.router, prefix="/api", tags=["Inventory"])
app.include_router(invoice.router, prefix="/api", tags=["Invoice"])
app.include_router(utilitytype.router, prefix="/api", tags=["UtilityType"])
app.include_router(maintenance_requests.router, prefix="/api", tags=["Maintenance"])
