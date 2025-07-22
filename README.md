# 🌐 سامانه دریافت بلادرنگ داده‌های دستگاه‌ها (SSE + Node.js)

این پروژه یک REST API با استفاده از Node.js و Express برای ثبت، مدیریت و دریافت بلادرنگ داده‌های سنسورها از طریق Server-Sent Events (SSE) ارائه می‌دهد. کاربران می‌توانند ثبت‌نام کنند، دستگاه‌های خود را اضافه نمایند، داده‌ ارسال کنند و از طریق SSE داده‌های جدید را بلادرنگ دریافت کنند.

---

## 🚀 شروع سریع

### پیش‌نیازها
- Node.js v18+
- MySQL (برای ذخیره داده‌های دستگاه)
- MongoDB (در صورت استفاده برای کاربران/دستگاه‌ها - اگر در مدل‌ها Mongo استفاده شده)

### نصب
<div dir="rtl">
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
اجرای پروژه
bash
Copy
Edit
# فایل .env بسازید:
cp .env.example config.env

# سپس سرور را اجرا کنید:
npm run dev
📦 ساختار پروژه
bash
Copy
Edit

 app.js               # تنظیم روت‌ها و میدلورها
 
server.js            # اجرای سرور و Polling

 Routes/              # تمامی روت‌های API
 
Controllers/         # کنترلرهای مربوط به کاربران، دستگاه‌ها و داده‌ها

 Middleware/          # میدلورها مانند اعتبارسنجی و احراز هویت
 
Models/              # مدل‌های دیتابیس (User, Device, DeviceData)

sse.js               # مدیریت اتصال‌های SSE

poller.js            # دریافت داده‌های جدید از MySQL هر ۱۵ دقیقه

 views/sse-test.html  # فایل تست SSE سمت کلاینت

📡 نقاط دسترسی (Endpoints)
📌 احراز هویت کاربران
مسیر	توضیح

POST /api/users	ثبت‌نام کاربر

POST /api/users/login	ورود و دریافت توکن

GET /api/users/:id	دریافت اطلاعات کاربر (با توکن)

📌 مدیریت دستگاه‌ها
مسیر	توضیح
GET /api/devices/user/:userId	دریافت لیست دستگاه‌های کاربر (نیازمند توکن)


📌 داده‌های دستگاه‌ها
مسیر	توضیح
POST /api/device-data/	ارسال داده‌های دستگاه

GET /api/device-data/device/:deviceId	دریافت داده‌های یک دستگاه خاص

GET /api/device-data/user/:userId	دریافت همه داده‌های کاربر


📌 اتصال بلادرنگ با SSE
مسیر	توضیح
GET /api/sse/:userId	اتصال SSE برای دریافت داده‌های زنده (نیاز به توکن)


🌐 تست اتصال SSE
یک فایل HTML به نام sse-test.html در ریشه یا داخل پوشه views/ وجود دارد. این فایل را در مرورگر باز کنید و:

مقدار userId و token خود را وارد کنید.

روی "اتصال" کلیک کنید.

پیام‌های بلادرنگ را مشاهده کنید.

برای دسترسی به اکثر مسیرها، توکن JWT باید در هدر Authorization فرستاده شود:

makefile
Copy
Edit
Authorization: Bearer <token>
⏱ مکانیزم Polling و SSE
هر ۱۵ دقیقه داده‌های جدید از دیتابیس MySQL واکشی می‌شود (در فایل poller.js)

سپس داده‌ها به کاربران متصل از طریق SSE (sse.js) ارسال می‌شود



رمز پایگاه داده را داخل کد نگه ندارید (از env استفاده کنید)

بررسی کنید که کاربران فقط به داده‌های خود دسترسی دارند

🧪 تست
برای تست API‌ها می‌توانید از ابزارهای زیر استفاده کنید:

Postman / Insomnia

curl/httpie

مرورگر برای تست فایل HTML

📄 لایسنس
MIT

# test1

</div>
