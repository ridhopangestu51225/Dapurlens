import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Di production, ini sebaiknya datang dari environment variable, bukan hardcode.
# Untuk tahap belajar ini kita hardcode dulu supaya jelas alurnya.
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg2://postgres:DekuBakasta999@localhost:5432/dapurlens"
)

engine = create_engine(DATABASE_URL)

# sessionmaker = "pabrik" yang membuat sesi database baru tiap ada request.
# Kenapa perlu sesi baru tiap request (bukan satu sesi global)?
# Supaya satu user tidak "menabrak" transaksi user lain yang sedang berjalan.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = kelas induk untuk semua model ORM kita (lihat models.py).
# SQLAlchemy pakai ini untuk tahu tabel apa saja yang perlu dibuat.
Base = declarative_base()


def get_db():
    """
    Dependency Injection ala FastAPI: fungsi ini dipanggil FastAPI otomatis
    tiap ada request yang butuh akses database (lihat main.py, parameter
    `db: Session = Depends(get_db)`). "yield" memastikan sesi selalu ditutup
    setelah request selesai, walaupun terjadi error di tengah jalan.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
