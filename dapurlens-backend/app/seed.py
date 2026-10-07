"""
Jalankan file ini SEKALI untuk mengisi data awal ke database:
    python -m app.seed
"""

from .database import Base, SessionLocal, engine
from .models import Food

FOODS = [
    dict(
        slug="seblak-bandung", name="Seblak Bandung", region="Jawa Barat",
        tags=["viral"], emoji="🌶️",
        description="Kerupuk basah pedas berkuah yang digemari anak muda.",
        gradient_from="#FBD9D2", gradient_to="#F3B6A8",
        ingredients=[
            "200 g kerupuk mentah (kerupuk bawang/aci)", "5 siung bawang putih",
            "8 buah cabai rawit", "2 butir telur", "1 batang daun bawang",
            "Kencur secukupnya", "Kaldu bubuk & garam secukupnya",
        ],
        steps=[
            "Rendam kerupuk mentah dengan air panas hingga lunak, tiriskan.",
            "Haluskan bawang putih, cabai rawit, dan kencur.",
            "Tumis bumbu halus hingga harum, tambahkan air secukupnya.",
            "Masukkan kerupuk yang sudah direndam, masak hingga kuah menyusut.",
            "Masukkan telur, orak-arik hingga matang, taburi daun bawang.",
            "Sajikan selagi hangat.",
        ],
    ),
    dict(
        slug="cireng-isi", name="Cireng Isi", region="Jawa Barat",
        tags=["viral"], emoji="🥟",
        description="Aci digoreng garing, kini populer dengan isian pedas meledak.",
        gradient_from="#FDEBC0", gradient_to="#F6D493",
        ingredients=[
            "200 g tepung tapioka", "50 g tepung terigu", "2 siung bawang putih, haluskan",
            "150 ml air panas", "Isian sambal/keju sesuai selera", "Garam & kaldu bubuk secukupnya",
        ],
        steps=[
            "Campur tepung tapioka, terigu, bawang putih, garam, dan kaldu bubuk.",
            "Tuang air panas sedikit demi sedikit sambil diaduk hingga kalis.",
            "Ambil adonan, pipihkan, beri isian di tengah, lalu tutup dan bentuk bulat pipih.",
            "Goreng dengan minyak panas hingga kecokelatan dan mengembang.",
            "Sajikan dengan sambal favorit.",
        ],
    ),
    dict(
        slug="rendang", name="Rendang", region="Sumatera Barat",
        tags=["daerah"], emoji="🍖",
        description="Daging berbumbu rempah dimasak lama hingga kering dan legit.",
        gradient_from="#E9D6C2", gradient_to="#CBA98A",
        ingredients=[
            "1 kg daging sapi, potong besar", "1 liter santan kental",
            "8 siung bawang merah, 5 siung bawang putih", "6 buah cabai merah besar",
            "3 cm jahe, 3 cm lengkuas, 2 batang serai", "Daun jeruk, daun kunyit, garam secukupnya",
        ],
        steps=[
            "Haluskan bawang merah, bawang putih, cabai, jahe.",
            "Tumis bumbu halus bersama serai, lengkuas, daun jeruk hingga harum.",
            "Masukkan daging, aduk hingga berubah warna.",
            "Tuang santan, masak dengan api kecil sambil sesekali diaduk.",
            "Masak berjam-jam hingga kuah mengering dan bumbu meresap sempurna.",
        ],
    ),
    dict(
        slug="klepon", name="Klepon", region="Jawa",
        tags=["daerah"], emoji="🟢",
        description="Bola ketan isi gula merah, berbalut kelapa parut.",
        gradient_from="#DCEBD8", gradient_to="#B7D8AE",
        ingredients=[
            "250 g tepung ketan", "Air daun suji/pandan secukupnya (untuk warna hijau)",
            "Gula merah, sisir halus", "1/2 butir kelapa parut, kukus dengan sejumput garam",
        ],
        steps=[
            "Campur tepung ketan dengan air daun suji hingga adonan bisa dibentuk.",
            "Ambil sedikit adonan, pipihkan, isi dengan gula merah sisir, bulatkan kembali.",
            "Rebus bola-bola klepon hingga mengapung, tandanya sudah matang.",
            "Gulingkan klepon di atas kelapa parut kukus sebelum disajikan.",
        ],
    ),
    dict(
        slug="pempek", name="Pempek", region="Palembang",
        tags=["daerah"], emoji="🐟",
        description="Olahan ikan dan sagu khas Sumatera Selatan, disantap dengan cuko.",
        gradient_from="#E4E9EF", gradient_to="#C3CEDA",
        ingredients=[
            "500 g daging ikan tenggiri giling", "300 g tepung sagu", "200 ml air es",
            "1 sdt garam", "Bahan cuko: gula merah, asam jawa, cabai rawit, bawang putih",
        ],
        steps=[
            "Campur ikan giling dengan air es dan garam hingga rata.",
            "Masukkan tepung sagu sedikit demi sedikit, uleni hingga kalis.",
            "Bentuk adonan sesuai selera, rebus hingga mengapung.",
            "Goreng pempek yang sudah direbus hingga keemasan.",
            "Sajikan dengan kuah cuko yang sudah dimasak terpisah.",
        ],
    ),
    dict(
        slug="es-kepal-milo", name="Es Kepal Milo", region="Nasional",
        tags=["viral"], emoji="🍧",
        description="Es serut dengan taburan milo yang sempat viral di media sosial.",
        gradient_from="#E6DCCB", gradient_to="#CBB98F",
        ingredients=[
            "Es batu secukupnya, serut halus", "3 sdm susu kental manis",
            "4 sdm bubuk milo", "Meses & keju parut untuk topping",
        ],
        steps=[
            "Serut es batu hingga halus, padatkan dalam mangkuk seperti kubah.",
            "Siram dengan susu kental manis secara merata.",
            "Taburi bubuk milo hingga menutupi seluruh permukaan.",
            "Tambahkan topping meses dan keju parut sesuai selera.",
        ],
    ),
    dict(
        slug="basreng-pedas", name="Basreng Pedas", region="Bandung",
        tags=["viral", "daerah"], emoji="🔥",
        description="Bakso goreng kering pedas, camilan viral asal Bandung.",
        gradient_from="#F3C9C2", gradient_to="#E39C90",
        ingredients=[
            "20 buah bakso, iris tipis", "Minyak untuk menggoreng",
            "10 buah cabai rawit kering/bubuk cabai", "3 siung bawang putih, cincang",
            "Garam & penyedap secukupnya",
        ],
        steps=[
            "Jemur atau angin-anginkan irisan bakso agar sedikit kering.",
            "Goreng irisan bakso dengan minyak panas hingga kering dan renyah, tiriskan.",
            "Tumis bawang putih dan bubuk cabai dengan sedikit minyak hingga harum.",
            "Masukkan basreng goreng, aduk rata dengan bumbu, koreksi rasa.",
        ],
    ),
    dict(
        slug="sate-klatak", name="Sate Klatak", region="Yogyakarta",
        tags=["daerah"], emoji="🍢",
        description="Sate kambing khas Yogyakarta yang ditusuk jeruji besi.",
        gradient_from="#EAD8C3", gradient_to="#D2B48C",
        ingredients=[
            "500 g daging kambing muda, potong dadu", "Jeruji besi/sate sebagai tusukan",
            "5 siung bawang putih, haluskan", "1 sdt merica bubuk", "Garam secukupnya",
        ],
        steps=[
            "Lumuri daging kambing dengan bawang putih halus, merica, dan garam.",
            "Diamkan selama minimal 30 menit agar bumbu meresap.",
            "Tusuk daging menggunakan jeruji besi (bukan tusuk bambu).",
            "Bakar di atas bara api sambil sesekali dibolak-balik hingga matang merata.",
        ],
    ),
]


def run():
    # create_all membuat semua tabel yang didefinisikan di models.py,
    # KALAU tabelnya belum ada. Ini bukan pengganti migration tool
    # (seperti Alembic) untuk production, tapi cukup untuk tahap belajar ini.
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(Food).count()
        if existing > 0:
            print(f"Sudah ada {existing} data, seed dilewati. Hapus tabel dulu kalau mau seed ulang.")
            return

        for item in FOODS:
            db.add(Food(**item))
        db.commit()
        print(f"Berhasil seed {len(FOODS)} data makanan.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
