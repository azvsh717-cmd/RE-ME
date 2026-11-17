# Vercel + Supabase sozlash (qadam-baqadam)

## Nima uchun xato chiqdi

`re-me` Vercel loyihasida **birorta ham environment variable yo‘q edi**. Kod `DATABASE_URL` topmay 500 qaytargan, sahifa esa «Ro‘yxatdan o‘tib bo‘lmadi. Server sozlamalarini tekshiring.» degan umumiy xabarni ko‘rsatgan.

Kodning o‘zi sog‘lom: `npm run build` xatosiz o‘tadi, `tsc --noEmit` toza.

Kerak bo‘ladigan 3 ta kalit (boshqasi **kerak emas**):

| Kalit | Nima uchun |
| --- | --- |
| `DATABASE_URL` | Postgres ulanish manzili |
| `SECRET_KEY` | sessiya cookie’sini imzolash |
| `GEMINI_API_KEY` | AI suhbat (ro‘yxatdan o‘tishga ta’sir qilmaydi) |

> `SUPABASE_URL`, `anon key`, `service_role key` **kerak emas** — ilova Supabase JS’dan emas, to‘g‘ridan-to‘g‘ri Postgres’dan foydalanadi.

---

## 1-qadam. Supabase: yangi loyiha

1. https://supabase.com/dashboard → **New project**
2. Nom: `vaqt-xati`, region: sizga yaqin (`eu-central-1` yoki `ap-southeast-1`), **Database Password** ni yozib qo‘ying (keyin kerak bo‘ladi).
3. Loyiha tayyor bo‘lishini kuting (~2 daqiqa, status `ACTIVE_HEALTHY`).

## 2-qadam. `DATABASE_URL` ni olish

Loyiha ichida yuqoridagi **Connect** tugmasini bosing → **Connection pooling** bo‘limi → **Transaction pooler** (port `6543`) → **Copy**.

Ko‘rinishi shunday bo‘ladi:

```
postgresql://postgres.wioxbokixsnarajndjjm:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

Qiladigan ishlar:
- `[YOUR-PASSWORD]` o‘rniga 1-qadamdagi parolni qo‘ying (maxsus belgilar bo‘lsa URL-encode qiling, masalan `@` → `%40`).
- Oxiriga `?sslmode=require` qo‘shing.

Natija:

```
postgresql://postgres.<ref>:<PAROL>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
```

> Serverless uchun **Transaction pooler (6543)** tavsiya etiladi. Session pooler (5432) ham ishlaydi, lekin ulanishlar soni tezroq tugaydi.

## 3-qadam. Jadvallarni yaratish (majburiy!)

Supabase → **SQL Editor** → **New query** → quyidagini to‘liq nusxalab **Run** bosing:

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE, password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS memory_facts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, fact_text text NOT NULL, source text NOT NULL CHECK (source IN ('onboarding','chat')), created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS memory_facts_user_idx ON memory_facts(user_id);
CREATE TABLE IF NOT EXISTS chat_messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, role text NOT NULL CHECK (role IN ('user','ai')), content text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS chat_messages_user_idx ON chat_messages(user_id);
CREATE TABLE IF NOT EXISTS mood_scores (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, score integer NOT NULL CHECK (score BETWEEN 1 AND 10), note text, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS mood_scores_user_idx ON mood_scores(user_id);
```

Bu qadam bajarilmasa `/api/health` «jadvallar yo‘q» deb aytadi va ro‘yxatdan o‘tish ishlamaydi.

## 4-qadam. `SECRET_KEY` yasash

Terminalda:

```bash
openssl rand -hex 32
```

Natija 64 belgili satr — uni to‘liq nusxalang (kamida 32 belgi shart, bu esa 64 ta).

## 5-qadam. `GEMINI_API_KEY` olish

1. https://aistudio.google.com/apikey → **Create API key**
2. Kalitni nusxalang. `gemini-2.5-flash` modeli shu kalit bilan ishlaydi.

## 6-qadam. Vercel’ga kiritish

Vercel → loyiha (`re-me`) → **Settings** → **Environment Variables** → har biri uchun **Add New**:

| Key | Value | Environments |
| --- | --- | --- |
| `DATABASE_URL` | 2-qadamdagi manzil | Production, Preview |
| `SECRET_KEY` | 4-qadamdagi satr | Production, Preview |
| `GEMINI_API_KEY` | 5-qadamdagi kalit | Production, Preview |

Keyin **Deployments** → eng oxirgi deploy → `⋯` → **Redeploy**. (Env’lar faqat yangi deploy’da o‘qiladi — redeploy qilmasangiz o‘zgarish ko‘rinmaydi.)

## 7-qadam. Tekshirish

Brauzerda: `https://<domeningiz>/api/health`

- `{"ready": true, ...}` → hammasi joyida, `/register` da ro‘yxatdan o‘tish ishlaydi.
- `{"ready": false, "checks": {...}}` → qaysi kalit yetishmayotgani yoki baza/jadval muammosi aniq yozilgan bo‘ladi.

Xato bo‘lsa, endi sahifada aniq sabab chiqadi (masalan «parol noto‘g‘ri», «jadvallar yo‘q», «SSL xatosi») va `/api/health` havolasi ko‘rinadi.

---

## Muhim eslatma: Vercel qaysi repo’ga ulangan

Hozirgi `re-me` loyihasi GitHub’dagi **`zzv717/RE-ME`** repo’siga ulangan, bu sessiyadagi ish esa **`azvsh717-cmd/RE-ME`** repo’sida. Ikkalasida kod bir xil, lekin:

- Kelajakda push qilingan o‘zgarishlar avtomatik deploy bo‘lishi uchun Vercel → **Settings → Git → Connected Git Repository** orqali shu repo’ga o‘tkazing.
- Yoki har safar qo‘lda deploy qilamiz (men buni qila olaman).

## Kod tomonida nima yaxshilandi

- `lib/config.ts` — yetishmayotgan kalitlarni oldindan aniqlaydi va aniq xabar beradi.
- `/api/health` — brauzerda ochiladigan diagnostika (maxfiy qiymatlarni ko‘rsatmaydi).
- `register`/`login` xatolari: jadval yo‘qligi (`42P01`), ulanish xatosi, parol xatosi (`28P01`), SSL, baza topilmadi (`3D000`) — har biri alohida tushunarli matnda.
- Auth sahifasida xato yonida «Server holatini tekshirish» havolasi.
