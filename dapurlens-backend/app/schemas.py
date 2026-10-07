from typing import Optional
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

FoodTag = Literal ["Viral", "daerah", "Western"]

class FoodCreate(BaseModel):
    slug: str = Field(..., description="Unique identifier for the food item")
    name: str = Field(..., description="Name of the food item")
    region: str = Field(..., description="Region where the food is popular")
    tags: list[FoodTag] = Field(..., description="Tags associated with the food item")
    emoji: str = Field(..., description="Emoji representation of the food item")
    description: str = Field(..., description="Description of the food item")
    gradientFrom: str = Field(..., description="Starting color of the gradient for UI representation")
    gradientTo: str = Field(..., description="Ending color of the gradient for UI representation")
    ingredients: list[str] = Field(..., description="List of ingredients used in the food item")
    steps: list[str] = Field(..., description="List of steps to prepare the food item")

class FoodUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Name of the food item")
    region: Optional[str] = Field(None, description="Region where the food is popular")
    tags: Optional[list[FoodTag]] = Field(None, description="Tags associated with the food item")
    emoji: Optional[str] = Field(None, description="Emoji representation of the food item")
    description: Optional[str] = Field(None, description="Description of the food item")
    gradientFrom: Optional[str] = Field(None, description="Starting color of the gradient for UI representation")
    gradientTo: Optional[str] = Field(None, description="Ending color of the gradient for UI representation")
    ingredients: Optional[list[str]] = Field(None, description="List of ingredients used in the food item")
    steps: Optional[list[str]] = Field(None, description="List of steps to prepare the food item")

class UserCreate(BaseModel):
    email: str
    name: str = Field(min_length=1)
    # min_length=8 divalidasi FastAPI otomatis SEBELUM kode kita jalan —
    # client yang kirim password 3 karakter akan ditolak dengan error 422.
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    name: str
    # Perhatikan: TIDAK ADA field password/hashed_password di sini.
    # Schema response sengaja tidak menyertakannya, supaya walau ada bug di
    # tempat lain, password tidak akan pernah bisa "bocor" lewat response API.


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class FoodOut(BaseModel):
    # model_config ini yang bikin Pydantic bisa baca langsung dari object
    # SQLAlchemy (model_validate(food_row)), bukan cuma dari dict biasa.
    model_config = ConfigDict(from_attributes=True)

    slug: str
    name: str
    region: str
    tags: list[str]
    emoji: str
    description: str
    gradientFrom: str
    gradientTo: str
    ingredients: list[str]
    steps: list[str]


class RecognitionCandidateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    food_id: int
    confidence_score: float


class RecognitionResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    food_id: Optional[int]
    confidence_score: Optional[float]
    candidates: list[RecognitionCandidateOut] = []
