from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import or_
from sqlalchemy.orm import Session
from .auth import create_access_token, get_current_user, hash_password, verify_password
from .models import Food, User
from .schemas import FoodCreate, FoodOut, FoodUpdate, TokenOut, UserCreate, UserLogin, UserOut

from .database import get_db
from .models import Food
from .schemas import FoodCreate, FoodOut, FoodUpdate
from .utils import slugify

app = FastAPI(title="DapurLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    # Dulu cuma "GET" karena baru ada Read. Sekarang kita tambah
    # method lain untuk Create/Update/Delete.
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["*"],
)


def _to_food_out(food: Food) -> FoodOut:
    return FoodOut(
        slug=food.slug,
        name=food.name,
        region=food.region,
        tags=food.tags,
        emoji=food.emoji,
        description=food.description,
        gradientFrom=food.gradient_from,
        gradientTo=food.gradient_to,
        ingredients=food.ingredients,
        steps=food.steps,
    )


@app.get("/api/foods", response_model=list[FoodOut])
def list_foods(
    db: Session = Depends(get_db),
    tag: Optional[str] = Query(None, description="Filter: 'viral' atau 'daerah'"),
    q: Optional[str] = Query(None, description="Kata kunci pencarian nama/daerah"),
):
    query = db.query(Food)

    if tag and tag != "all":
        query = query.filter(Food.tags.any(tag))

    if q:
        keyword = f"%{q}%"
        query = query.filter(or_(Food.name.ilike(keyword), Food.region.ilike(keyword)))

    return [_to_food_out(f) for f in query.all()]


@app.get("/api/foods/{slug}", response_model=FoodOut)
def get_food(slug: str, db: Session = Depends(get_db)):
    food = db.query(Food).filter(Food.slug == slug).first()
    if not food:
        raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")
    return _to_food_out(food)


@app.post("/api/foods", response_model=FoodOut, status_code=status.HTTP_201_CREATED)
def create_food(payload: FoodCreate, db: Session = Depends(get_db),
    # FastAPI otomatis memvalidasi body request sesuai schema FoodCreate
    # SEBELUM function ini dijalankan. Kalau "name" kosong misalnya,
    # client akan dapat error 422 duluan tanpa kode kita perlu cek manual.
     _: User = Depends(get_current_user),
):

    base_slug = slugify(payload.name)
    slug = base_slug
    suffix = 2
    # Kalau slug sudah dipakai makanan lain (misal ada 2 "Soto Ayam"),
    # tambahkan angka di belakang: soto-ayam, soto-ayam-2, soto-ayam-3, dst.
    while db.query(Food).filter(Food.slug == slug).first() is not None:
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    food = Food(
        slug=slug,
        name=payload.name,
        region=payload.region,
        tags=payload.tags,
        emoji=payload.emoji,
        description=payload.description,
        gradient_from=payload.gradientFrom,
        gradient_to=payload.gradientTo,
        ingredients=payload.ingredients,
        steps=payload.steps,
    )
    db.add(food)
    db.commit()
    # refresh = ambil ulang data dari database setelah commit, supaya
    # "food" di sini punya id yang baru di-generate database (auto-increment).
    db.refresh(food)

    return _to_food_out(food)


@app.patch("/api/foods/{slug}", response_model=FoodOut)
def update_food(slug: str, payload: FoodUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    food = db.query(Food).filter(Food.slug == slug).first()
    if not food:
        raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")

    # model_dump(exclude_unset=True) cuma mengambil field yang BENAR-BENAR
    # dikirim client, bukan semua field (yang defaultnya None).
    # Ini intinya PATCH: field yang tidak dikirim = tidak diubah sama sekali.
    updates = payload.model_dump(exclude_unset=True)

    # Mapping nama field camelCase (dari client) ke nama kolom snake_case
    # (di database) — sama seperti _to_food_out tapi arah sebaliknya.
    field_map = {"gradientFrom": "gradient_from", "gradientTo": "gradient_to"}

    for field, value in updates.items():
        column_name = field_map.get(field, field)
        setattr(food, column_name, value)

    db.commit()
    db.refresh(food)
    return _to_food_out(food)


@app.delete("/api/foods/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_food(slug: str, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    food = db.query(Food).filter(Food.slug == slug).first()
    if not food:
        raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")

    db.delete(food)
    db.commit()
    # 204 No Content artinya "berhasil, tapi sengaja tidak ada body
    # dikembalikan" — konvensi umum untuk response DELETE.
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.post("/api/auth/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        # 409 Conflict = "request valid, tapi bentrok dengan data yang sudah ada"
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email sudah terdaftar")

    user = User(
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user_id=user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@app.post("/api/auth/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Sengaja pakai PESAN ERROR YANG SAMA baik email tidak ditemukan maupun
    # password salah — kalau pesannya beda ("email tidak ada" vs "password
    # salah"), orang jahat bisa memanfaatkannya untuk menebak email mana
    # yang terdaftar di sistem kita (disebut "user enumeration attack").
    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Email atau password salah"
    )

    if not user or not verify_password(payload.password, user.hashed_password):
        raise invalid_credentials

    token = create_access_token(user_id=user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@app.post("/api/auth/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        # 409 Conflict = "request valid, tapi bentrok dengan data yang sudah ada"
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email sudah terdaftar")

    user = User(
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user_id=user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@app.post("/api/auth/login", response_model=TokenOut)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Sengaja pakai PESAN ERROR YANG SAMA baik email tidak ditemukan maupun
    # password salah — kalau pesannya beda ("email tidak ada" vs "password
    # salah"), orang jahat bisa memanfaatkannya untuk menebak email mana
    # yang terdaftar di sistem kita (disebut "user enumeration attack").
    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Email atau password salah"
    )

    if not user or not verify_password(payload.password, user.hashed_password):
        raise invalid_credentials

    token = create_access_token(user_id=user.id)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@app.get("/api/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    # Perhatikan: endpoint ini TIDAK PERNAH query database sendiri untuk
    # mencari user. Dependency get_current_user yang sudah melakukan itu
    # (decode token -> cari user di DB) SEBELUM function ini jalan.
    return current_user

@app.get("/api/health")
def health_check():
    return {"status": "ok"}