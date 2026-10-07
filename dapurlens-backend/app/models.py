from sqlalchemy import ARRAY, Boolean, Column, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from .database import Base

class Food(Base):
    """
    Tabel utama resep. Tags, ingredients, dan steps disimpan sebagai
    ARRAY(String) — pilihan paling sederhana untuk skala MVP kita
    (sesuai yang kita diskusikan: array cukup untuk 2 tag tetap,
    belum perlu tabel relasi many-to-many yang lebih rumit).
    """

    __tablename__ = "foods"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    region = Column(String, nullable=False)
    tags = Column(ARRAY(String), nullable=False, default=list)
    emoji = Column(String, nullable=False)
    description = Column(String, nullable=False)
    gradient_from = Column(String, nullable=False)
    gradient_to = Column(String, nullable=False)
    ingredients = Column(ARRAY(String), nullable=False, default=list)
    steps = Column(ARRAY(String), nullable=False, default=list)

    recognition_results = relationship("RecognitionResult", back_populates="food")

class User(Base):
    """
    Modul Pengguna. Perhatikan: kolom bernama "hashed_password", BUKAN
    "password" — ini sengaja, supaya siapa pun yang baca kode ini langsung
    tahu bahwa yang disimpan BUKAN password asli, tapi hasil hash-nya
    (lihat auth.py). Password asli TIDAK PERNAH disimpan di mana pun.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class RecognitionResult(Base):
    """
    Tabel ini BELUM dipakai di increment 1 (belum ada fitur kamera),
    tapi sudah kita siapkan strukturnya sesuai desain yang kita bahas:
    satu hasil pemindaian foto bisa punya SATU prediksi utama (food_id + confidence),
    dan BEBERAPA kandidat alternatif kalau confidence-nya rendah (tabel terpisah
    di bawah, RecognitionCandidate) — relasi one-to-many.
    """

    __tablename__ = "recognition_results"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=True)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    food = relationship("Food", back_populates="recognition_results")
    candidates = relationship("RecognitionCandidate", back_populates="recognition_result")


class RecognitionCandidate(Base):
    """Alternatif kemungkinan makanan kalau confidence prediksi utama rendah."""

    __tablename__ = "recognition_candidates"

    id = Column(Integer, primary_key=True, index=True)
    recognition_result_id = Column(Integer, ForeignKey("recognition_results.id"), nullable=False)
    food_id = Column(Integer, ForeignKey("foods.id"), nullable=False)
    confidence_score = Column(Float, nullable=False)

    recognition_result = relationship("RecognitionResult", back_populates="candidates")
