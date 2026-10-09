import json
import os

from google import genai
from google.genai import types

# Nama model Gemini berganti cukup cepat (model lama dipensiunkan, yang baru
# keluar). Makanya dibuat bisa diganti lewat environment variable tanpa
# ubah kode. Cek daftar model yang aktif & gratis di aistudio.google.com.
MODEL = os.getenv("VISION_MODEL", "gemini-3.1-flash-lite")


def _build_prompt(known_foods: list[dict]) -> str:
    food_list = "\n".join(f"- {f['name']} (slug: {f['slug']})" for f in known_foods)
    return f"""Kamu adalah asisten yang mengenali masakan Indonesia dari foto.

Berikut daftar masakan yang TERSEDIA di database aplikasi (HANYA cocokkan ke salah satu dari daftar ini, jangan menyebut nama di luar daftar):
{food_list}

Lihat foto yang diberikan, lalu balas dalam format JSON seperti ini:
{{
  "best_match_slug": "<slug dari daftar di atas yang paling cocok, atau null kalau tidak ada yang mirip sama sekali>",
  "confidence": <angka 0.0 - 1.0, seberapa yakin kamu>,
  "alternatives": [
    {{"slug": "<slug lain yang mungkin>", "confidence": <angka 0.0-1.0>}}
  ],
  "reasoning": "<alasan singkat 1 kalimat>"
}}

Kalau foto itu bukan makanan sama sekali, atau makanannya jelas tidak ada hubungannya dengan daftar di atas, set best_match_slug jadi null dan confidence jadi 0.
Isi "alternatives" maksimal 3 item, hanya kalau confidence best_match di bawah 0.6 (supaya user punya pilihan lain kalau sistem tidak yakin)."""


def recognize_food(image_bytes: bytes, media_type: str, known_foods: list[dict]) -> dict:
    """
    Kirim foto ke Gemini, minta dicocokkan ke salah satu resep yang ada di
    database. Signature fungsi ini SAMA PERSIS dengan versi Claude, jadi
    main.py tidak perlu diubah sama sekali.
    """
    # Client dibuat DI SINI (bukan di level modul) karena genai.Client()
    # langsung error kalau API key belum diset. Kalau dibuat di level modul,
    # seluruh backend akan gagal start hanya karena key belum dipasang.
    # API key dibaca otomatis dari environment variable GEMINI_API_KEY.
    client = genai.Client()

    response = client.models.generate_content(
        model=MODEL,
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=media_type),
            _build_prompt(known_foods),
        ],
        # response_mime_type="application/json" memaksa Gemini membalas JSON
        # valid -- lebih andal daripada cuma "meminta" lewat prompt. Sengaja
        # tidak membatasi max_output_tokens terlalu kecil karena model baru
        # Gemini memakai token untuk "berpikir" dulu, dan batas yang sempit
        # bisa memotong jawabannya.
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    raw_text = (response.text or "").strip()

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        # Kalau jawaban tidak bisa dibaca (atau diblokir filter keamanan),
        # jangan sampai seluruh request error -- anggap "tidak yakin".
        return {"best_match_slug": None, "confidence": 0.0, "alternatives": [], "reasoning": "Gagal memproses hasil"}