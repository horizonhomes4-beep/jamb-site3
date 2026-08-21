# MathCloud Tutorial — JAMB / UTME Platform

This build converts the previous WASSCE-oriented project into a JAMB / UTME preparation platform.

## Main changes

- JAMB / UTME branding and student flow.
- Student self-registration with Firebase Authentication.
- Course selection during registration.
- Course → UTME subject-combination logic.
- Alternative-subject handling for courses whose fourth subject can vary.
- Course and subject selection is locked after registration.
- Students are told to contact MathCloud Tutorial for changes.
- Subscription requests can be submitted by students.
- Learning materials, subjects, questions, practice, diagnostics and mock exams are gated by an **active, administrator-approved subscription** in Firebase Realtime Database rules.
- One-device lock: the first device that successfully activates the account is stored; another device cannot replace it. Admin can unlock the device.
- Admin console now shows course and subscription status.
- Suggested JAMB pricing: ₦5,000 / 1 month, ₦12,000 / 3 months, ₦20,000 / 6 months. Admin can change these plans.
- New `seed-data/jamb-curriculum.json` contains the broad UTME subject catalogue and common course templates.
- New `seeder-jamb.html` seeds the public JAMB catalogue, JAMB subjects and subscription plans.
- Firebase Authentication is now used for students and administrators; the old custom admin session remains as a secondary write-proof mechanism for existing admin code.

## First deployment

1. Enable **Email/Password** under Firebase Authentication → Sign-in method.
2. Deploy the new `assets/database_rules.json` to Realtime Database.
3. Open `setup.html` once and create the MathCloud administrator.
4. Sign in through `admin-login.html`.
5. Open `seeder-jamb.html` in the same browser session and run the JAMB seed.
6. Open the main `index.html` and register a test student.
7. Submit a subscription request from the student portal.
8. Approve it in Admin → Subscriptions.
9. Confirm that materials remain locked before approval and become available after approval.
10. Test login from a second browser/device: the first registered device must remain the only permitted device until the administrator unlocks it.

## Important JAMB source rule

Course combinations are templates, not a replacement for the official institution-level check. JAMB's IBASS Eligibility Checker is the authoritative place to confirm the exact UTME combination for a selected institution/programme. Requirements and waivers can differ between institutions.

Official references:
- https://www.jamb.gov.ng/
- https://eligibility.jamb.gov.ng/
- https://www.jamb.gov.ng/payment-Services
- https://learn.jamb.gov.ng/

The 2026 JAMB official bulletin reported UTME/DE application fee components and the 2026 registration timetable; MathCloud subscription fees are independent platform fees and are not JAMB fees.

## Security note

Do not describe MathCloud subscription approval as a JAMB approval. It is MathCloud's own access-control decision. JAMB registration, eligibility, examination and official fees remain governed by JAMB.


## Password reset

- Student login includes **Forgot password?**. The student enters the registered email and Firebase Authentication sends the reset email.
- Admin login also includes **Forgot password?**.
- In Firebase Console, Authentication → Sign-in method → Email/Password must be enabled.
- In Authentication → Settings → Authorized domains, add every domain used to host MathCloud.
- Firebase's password-reset email template can be customised under Authentication → Templates.

## Google sign-in
Google sign-in is supported for student registration/login and the admin login page. In Firebase Console, enable **Google** under Authentication → Sign-in method and add the deployed site domain under Authentication → Settings → Authorized domains. Student Google registration creates the MathCloud profile only after the student chooses and confirms a locked JAMB course/subject combination. Existing password accounts should continue using email/password unless Google is explicitly linked to that Firebase user.

For admin Google login, the Google user's Firebase UID must be set to `true` at `settings/adminUsers/<GOOGLE_UID>` in Realtime Database before that Google account can enter the admin console. The supplied database rules allow an already-authorized Firebase admin UID to create the short-lived admin session token used by the existing admin console.

## Current JAMB account/payment workflow

- Student registration creates a Firebase Auth account but the MathCloud student profile starts as `pending`.
- Only an administrator can change a student from `pending` to `active`.
- Course selection automatically determines the stored JAMB subject combination; the combination is locked after registration.
- Admin-created students are activated immediately and their course automatically selects the recommended subjects for quick creation.
- Google Sign-In is supported for both student registration/login and admin login. The UI uses a branded Google-style G mark.
- Subscription plans run from 1–12 months. The 1-month base is NGN 5,000; longer plans are discounted.
- Payments use the configured Flutterwave payment link: https://flutterwave.com/pay/7n1wlo69qnrs . Students submit the Flutterwave transaction reference after payment; an administrator verifies and approves the request before learning materials unlock.
