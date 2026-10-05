# ZarinCare — run guide

## 1. Start
```bash
# terminal 1
cd server && npm install && cp .env.example .env && npm run dev     # API on :5000
# terminal 2
cd client && npm install && npm run dev                              # site on :5173
```
Edit `server/.env` first: set `JWT_SECRET` and `ADMIN_KEY` to long random values.

## 2. Demo accounts (created on first run; `SEED_DEMO=false` to disable)
| Role | Login | Password |
|---|---|---|
| Patient | patient@zarincare.pk | Patient@123 |
| Doctor | doctor@zarincare.pk | Doctor@123 |

## 3. Routes
- Patient: `/login` `/register` `/forgot-password` `/reset-password` → portal `/patient/*` (Overview, Appointments, Medical Log, Prescriptions, Test Results, Payments, Profile)
- Doctor: `/doctor-login` `/doctor-register` → dashboard `/doctor/*` (Dashboard, Appointments, Patients, Schedule, Testimonials, Payments, Profile, Notifications, Settings)
- Admin approval of new doctors: `/admin` (enter `ADMIN_KEY`)

## 4. Doctor registration & verification
PMDC number (format `12345-P`, required, unique) + CNIC front/back + live camera photo (camera only, no upload). After OTP the account is **pending**; it cannot log in until you approve it at `/admin` after checking the PMDC number on the official PMDC site and comparing the CNIC and live photo. KYC images are stored in `server/data/kyc/` and are only served with the admin key.

## 5. OTP (email + WhatsApp) — sending for real
Set in `server/.env`:
- **Email:** `SMTP_USER` + `SMTP_PASS` (Gmail: turn on 2-step verification, create an *App Password*).
- **WhatsApp:** either Twilio (`TWILIO_SID`, `TWILIO_TOKEN`, `TWILIO_WA_FROM`) or Meta Cloud API (`WA_TOKEN`, `WA_PHONE_ID`). Meta requires an approved message template for business-initiated messages; Twilio's sandbox needs each recipient to join first.
Without keys, codes and reset links print in the **server console** so you can still test.

## 6. Forgot password
User enters phone + email → if both match an account a 30-minute one-time link is emailed → `/reset-password?token=…` sets the new password. The response is identical whether or not the details matched (prevents account guessing).

## 7. Known limits
- PMDC has no public API: only the format is checked; approval is manual.
- No payment gateway: patient submits a transaction ID, doctor confirms it.
- Data is a JSON file (`server/data/app.json`); replace `server/store.js` with PostgreSQL/MongoDB later.
- Gallery supports images (categories, upload, delete); video upload is not built yet.
- Set `VITE_API_URL` in `client/.env` if the API is not on localhost:5000.
