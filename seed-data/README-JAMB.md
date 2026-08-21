# MathCloud JAMB Seed

This seed is for the 2026 JAMB version of the MathCloud platform. It contains a broad JAMB/UTME subject catalogue and common course-to-subject templates.

**Important:** JAMB's IBASS Eligibility Checker is the authoritative place to verify the exact UTME combination for a particular institution/programme. A course template in this seed must not be presented as a universal rule where the institution has a waiver or variation.

Official references used when preparing this seed:
- JAMB IBASS Eligibility Checker
- JAMB official Payment & Services page
- JAMB official 2026 UTME registration bulletin
- JAMB IBASS/CAPS manuals and official brochure PDFs


## MathCloud subscription plans

`subscription-plans.json` contains the default 1–12 month plans. The 1-month base price is ₦5,000; longer plans are discounted. The admin console automatically creates these plans in `settings/plans` if that node is empty.

Payments are collected through the configured Flutterwave payment link in the application. Students submit their Flutterwave transaction reference for administrator verification; access is never unlocked solely because a student clicked the payment link.
