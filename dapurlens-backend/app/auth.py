import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import User

# --- Konfigurasi JWT ---
# Di production, SECRET_KEY WAJIB datang dari environment variable yang
# rahasia (jangan pernah commit ke Git). Untuk belajar, kita hardcode dulu.
SECRET_KEY = os.getenv("SECRET_KEY", "ganti-ini-dengan-string-acak-yang-panjang")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # token berlaku 24 jam

# OAuth2PasswordBearer = helper FastAPI yang tahu cara "membaca" token dari
# header "Authorization: Bearer <token>" yang dikirim client secara otomatis.
# tokenUrl cuma dipakai untuk dokumentasi Swagger (/docs), bukan logic inti.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def hash_password(plain_password: str) -> str:
    """
    Password TIDAK PERNAH disimpan apa adanya. "Hash" itu fungsi satu arah:
    mudah diubah dari password -> hash, tapi (secara praktis) mustahil
    dibalik dari hash -> password asli. bcrypt juga otomatis menambahkan
    "salt" acak, jadi 2 user dengan password sama pun hash-nya beda.
    """
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Cek apakah password yang diketik user cocok dengan hash yang tersimpan."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: int) -> str:
    """
    Buat JWT (JSON Web Token) — "tiket masuk" yang dikirim ke client
    setelah login berhasil. Token ini berisi info siapa user-nya (sub)
    dan kapan kedaluwarsa (exp), ditandatangani pakai SECRET_KEY supaya
    tidak bisa dipalsukan oleh client.
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    Dependency ini dipasang di endpoint yang BUTUH login (lihat main.py,
    parameter `user: User = Depends(get_current_user)`). FastAPI otomatis:
    1. Ambil token dari header Authorization
    2. Jalankan fungsi ini SEBELUM endpoint dieksekusi
    3. Kalau token tidak valid, request ditolak duluan (401) —
       kode di dalam endpoint bahkan tidak sempat jalan.
    """
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kedaluwarsa",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_error
    except jwt.PyJWTError:
        raise credentials_error

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_error

    return user