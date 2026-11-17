# Vaqt Xati

O‘zbek tilidagi shaxsiy xotira va AI suhbat ilovasi. Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, PostgreSQL/Drizzle va Gemini 2.5 Flash ishlatiladi.

## Ishga tushirish

1. Node.js 20 yoki undan yangi versiya va PostgreSQL bazasini tayyorlang. Supabase PostgreSQL connection string ishlatish mumkin.
2. `npm install` buyrug‘ini bajaring.
3. `.env.example` nusxasini `.env` nomi bilan yarating va qiymatlarni o‘zingiz kiriting:
   - `DATABASE_URL` — Supabase PostgreSQL connection string (zarur bo‘lsa SSL parametrlarini ham qo‘shing). Serverless uchun Supabase transaction pooler ulanishi tavsiya etiladi.
   - `GEMINI_API_KEY` — Gemini API kaliti; `gemini-2.5-flash` modeliga ruxsat bo‘lishi kerak.
   - `SECRET_KEY` — session imzosi uchun kamida 32 ta tasodifiy belgi. Masalan, `openssl rand -hex 32` bilan yarating. Uni oshkor qilmang.
4. Migratsiyani qo‘llang: `npm run db:migrate`. Muqobil ravishda Supabase SQL Editor orqali `drizzle/0000_initial.sql` faylini ishga tushiring.
5. `npm run dev` va brauzerda `http://localhost:3000` ni oching.

## Vercel

Loyihani Vercel’ga ulang, yuqoridagi uchta environment variable’ni server muhitiga kiriting, bazaga migratsiyani bir marta qo‘llang va `vercel deploy` qiling. Kalitlar faqat serverda ishlatiladi. Build vaqtida baza yoki Gemini ulanishi shart emas; ishlash vaqtida ular talab qilinadi.

## Qanday ishlaydi

- Parollar bcrypt bilan xeshlanadi. Imzolangan, HTTP-only, SameSite=Lax cookie 7 kun amal qiladi; production’da Secure yoqiladi.
- Beshta onboarding javobining har biri savol konteksti bilan alohida fakt sifatida saqlanadi.
- Har bir xabarga Gemini javob beradi; undan keyin fakt ajratish va kayfiyat baholash uchun ikkita alohida Gemini so‘rovi yuboriladi. Tahlil xatolari foydalanuvchiga bildiriladi; muvaffaqiyatli javob saqlanadi. Baholar tashxis emas.
- AI promptiga demo sanasigacha bo‘lgan eng so‘nggi 20 ta fakt, ularning sanasi va o‘tgan kunlar soni kiritiladi. Eng yangi faktlar birinchi keladi. Oxirgi 20 ta chat xabari ham kontekst sifatida beriladi.
- Demo vaqti haqiqiy sanaga nisbatan kunlar siljishi bo‘lib, `sessionStorage`da saqlanadi. Timeline, grafik va AI konteksti tanlangan sanagacha bo‘lgan yozuvlarni ko‘rsatadi. Baza sanalari o‘zgarmaydi; yangi xabarlar doim haqiqiy vaqt bilan saqlanadi. Orqaga sayohatda shu sahifada hozir yozilgan xabarlar vaqtincha ko‘rinib turadi; sahifa yangilangach tanlangan sanadan keyingi yozuvlar yashiriladi va haqiqiy sanaga qaytganda yana ko‘rinadi.
- AI bilan suhbat mazmuni va kontekst sifatida tanlangan xotiralar Gemini xizmatiga yuboriladi. Maxfiy ma’lumotlarni kiritishda buni inobatga oling.

## Neon (ixtiyoriy PostgreSQL provayderi)

`.neon` tanlangan Neon loyihasi va `production` branch’ni ko‘rsatadi. `neon.ts` xususiy `vaqt-xati-private` bucketni belgilaydi. `neon deploy` ishlashi uchun CLI’da Neon hisobiga kirish va loyiha regioni Object Storage’ni qo‘llashi zarur. Neon yaratgan `.env.local` faylidagi `DATABASE_URL` ilovaning mavjud Drizzle/Postgres ulanishida ishlatiladi. Migratsiyalarda imkon qadar direct, ilovada pooled ulanishdan foydalaning. `SECRET_KEY` va `GEMINI_API_KEY`ni alohida qo‘shing.

Server tarafidagi `lib/storage.ts` Neon tomonidan berilgan `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` qiymatlari bilan path-style S3 client yaratadi. Ilova talablariga muvofiq, fayl yuklash interfeysi yoki ochiq API qo‘shilmagan.

`npm run test:neon` Postgres’ga `SELECT 1` yuboradi va private bucketga tasodifiy nomdagi kichik test obyektini yozib, o‘qib, o‘chiradi. Bu test haqiqiy xizmatlarga ulanadi va bucketda vaqtincha obyekt yaratadi. To‘liq ilova testlari uchun migratsiyani qo‘llab, Gemini kaliti va session secret’ni ham sozlang. Neon storage hozir hamma regionlarda mavjud emas.
