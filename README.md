# Roqa Store

موقع متجر جاهز مبني بـ Next.js + Supabase.

## المزايا
- صفحة رئيسية بالأقسام والمنتجات
- سلة مشتريات
- دخول أدمن مخفي بعد الضغط 5 مرات على أيقونة المراية
- لوحة تحكم كاملة للمنتجات والأقسام والطلبات
- حفظ البيانات في Supabase
- إرسال الطلب إلى واتساب برسالة جاهزة

## 1) إنشاء مشروع Supabase
1. اعمل مشروع جديد على Supabase
2. افتح SQL Editor
3. انسخ محتوى الملف `supabase-schema.sql` ونفذه
4. من Project Settings > API انسخ:
   - Project URL
   - anon public key

## 2) ضبط البيئة
انسخ `.env.example` إلى `.env.local` ثم ضع القيم الحقيقية:

```bash
cp .env.example .env.local
```

## 3) تشغيل المشروع
```bash
npm install
npm run dev
```

## 4) الرفع على Vercel
1. ارفع المشروع على GitHub
2. افتح Vercel واعمل Import Project
3. أضف Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`
   - `NEXT_PUBLIC_WHATSAPP_PHONE`
4. Deploy

## الدخول إلى الأدمن
- اضغط 5 مرات على أيقونة المراية في الهيدر
- اكتب الباسورد: `859410` أو غيّره من `.env.local`

## ملاحظات مهمة
- الإرسال هنا يتم بفتح واتساب برسالة جاهزة للرقم المحدد.
- أي تعديل في لوحة الأدمن يتحفظ في قاعدة البيانات ويظهر تلقائيًا في الصفحة الرئيسية.
