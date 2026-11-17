# Vercel + Supabase sozlash (xatoni tuzatish)

## Muammo nima edi

`re-me` Vercel loyihasida **hech qanday environment variable yo‘q**. Shu sababli `POST /api/auth/register` ichida `DATABASE_URL` topilmay, 500 xato qaytargan va foydalanuvchi «Ro‘yxatdan o‘tib bo‘lmadi. Server sozlamalarini tekshiring.» degan umumiy xabarni ko‘rgan.

Kodning o‘zi sog‘lom: `npm run build` xatosiz o‘tadi, `tsc --noEmit` toza.

## 1-qadam. Baza (Supabase)

Supabase → **Connect** → *Connection pooling* (Session yoki Transaction pooler) manzilini oling.
Ko‘rinishi:

```
postgresql://postgres.<ref>:<PAROL>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
```

So‘ng **SQL Editor**’da `drizzle/0000_initial.sql` faylini bir marta ishga tushiring (jadvallarni yaratadi).

## 2-qadam. Environment variables (Vercel)

Vercel → loyiha → **Settings → Environment Variables** → quyidagilarni Production + Preview uchun qo‘shing:

| Kalit | Qiymat |
| --- | --- |
| `DATABASE_URL` | 1-qadamdagi pooler manzili (oxirida `?sslmode=require`) |
| `SECRET_KEY` | kamida 32 belgi: `openssl rand -hex 32` |
| `GEMINI_API_KEY` | Google AI Studio’dan olingan kalit (`gemini-2.5-flash` ruxsati bilan) |

Keyin **Deployments → eng oxirgi deploy → ⋯ → Redeploy** (env’lar faqat yangi deploy’da o‘qiladi).

## 3-qadam. Tekshirish

Brauzerda oching: `https://<domen>/api/health`

- `{"ready": true}` — hammasi joyida.
- `{"ready": false, "checks": {...}}` — qaysi kalit yetishmayotgani yoki baza/jadval muammosi aniq yozilgan.

Endi `/register` sahifasida ro‘yxatdan o‘tish ishlaydi. Xato bo‘lsa, sahifada aniq sabab va `/api/health` havolasi chiqadi.

## Eslatma: Vercel qaysi repo’ga ulangan

Hozirgi `re-me` loyihasi GitHub’dagi `zzv717/RE-ME` repo’siga ulangan, bu sessiya esa `azvsh717-cmd/RE-ME` repo’sida ishlaydi. Ikkalasida kod bir xil, lekin kelajakdagi o‘zgarishlar avtomatik deploy bo‘lishi uchun Vercel’dagi ulanishni **Settings → Git → Connected Git Repository** orqali shu repo’ga o‘tkazing (yoki yangi loyiha yarating va shu repo’ni tanlang).
