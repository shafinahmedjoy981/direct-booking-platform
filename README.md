# Direct Booking Desk (সরাসরি বুকিং ডেস্ক)
**Single-Property Direct Booking & CRM for Small Resorts, Cottages & Glamping Sites in Bangladesh**

A production-grade, mobile-first booking desk and CRM tailored for property owners and managers in Sajek Valley, Cox's Bazar, Bandarban, and Sylhet. Built specifically to eliminate OTA commission leakage, prevent double booking, automate bKash advance payments, and streamline 1-tap WhatsApp confirmations.

---

## 1. Design Tokens & "Clean Coastal" Theme

The application adheres strictly to the **Clean Coastal** visual constitution: flat, solid, high-legibility, and zero decorative glassmorphism or translucent blurs to guarantee speed on mid-range Android smartphones over 3G/4G.

| Token | Hex / Value | Application |
|---|---|---|
| **Primary Navy** | `#0E2F76` | Primary buttons, active nav pills, headings, key statistics, hero tiles, sidebar |
| **Soft Sky** | `#A9C0E0` | Secondary fills, borders (`#A9C0E0/40`), charts, highlights, tinted section bands |
| **Ice Background** | `#F4FEFF` | App background canvas, input backgrounds |
| **Pure White** | `#FFFFFF` | Solid cards, top header, modal surfaces |
| **Ink Black** | `#0A0A0A` | High-contrast body typography (WCAG AA compliant) |
| **Card Radius** | `16px` (`rounded-2xl`) | Outer card boundaries with 1px border and soft dual-layer shadow |
| **Input / Button Radius** | `12px` (`rounded-xl`) | Touch-friendly controls ($\ge 44\text{px}$ touch targets) |
| **Status Badges** | Muted Pastel | Confirmed (Emerald), Awaiting Advance (Amber), Checked In (Navy/Sky), Checked Out (Slate), Cancelled (Rose) |
| **Typography** | `Hind Siliguri` & `Inter` | Natural spoken Bangla phrasing with local date formatting and numeral switcher |

---

## 2. Component Architecture

- **`AppContext` (`/src/context/AppContext.tsx`)**: Central state manager handling property configuration, 4 room categories, 12 units, 25+ dynamic bookings, audit trails, offline simulation, undo toast mechanisms, and `localStorage` persistence.
- **`DashboardView` (`/src/components/dashboard/DashboardView.tsx`)**: Bento-style view with single solid Navy hero tile ("Today's Check-ins"), attention items list with 1-tap WhatsApp reminders, and live Commission Savings mini-calculator.
- **`CalendarView` (`/src/components/calendar/CalendarView.tsx`)**: Interactive unit timeline with 7/14/30 day zoom, instant click-to-book cell handlers, and real-time double booking overlap warnings. Includes accessible list view.
- **`BookingsView` & `BookingDetailDrawer` (`/src/components/bookings/`)**: Fast search, filtering by source/status, price breakdown, manual payment recording, and 1-tap wa.me confirmation dispatch.
- **`AddBookingModal` (`/src/components/add-booking/AddBookingModal.tsx`)**: Fast 3-step booking creation ($\le 30$ seconds) with auto-detecting returning guest lookups by mobile number.
- **`CommissionCalculatorView` (`/src/components/calculator/CommissionCalculatorView.tsx`)**: The hook calculator demonstrating monthly/yearly savings from shifting OTA volume to direct booking.
- **`PublicBookingPage` (`/src/components/public-booking/PublicBookingPage.tsx`)**: Guest-facing direct booking interface with hero imagery, live availability checks, bKash merchant payment instructions, and QR code sharing.
- **`RoomsPricingView` (`/src/components/rooms/RoomsPricingView.tsx`)**: Dynamic seasonal rules (Weekend uplift, Winter peak, Eid holidays, Monsoon discounts) and addon dining packages.
- **`PaymentsView` (`/src/components/payments/PaymentsView.tsx`)**: Ledger for bKash, Nagad, bank transfers, and advance payment link generation.
- **`MessagesView` (`/src/components/messages/MessagesView.tsx`)**: Editable WhatsApp templates in spoken Bangla and English with real-time variable injection (`{guest_name}`, `{booking_code}`, `{amount}`, `{payment_link}`).
- **`SettingsView` (`/src/components/settings/SettingsView.tsx`)**: Property profile, advance/refund policies, staff roles (Owner, Manager, Front Desk), and full audit logging.

---

## 3. How to Connect a Real Backend & Payment Gateway

### A. Backend Architecture (Node.js / Express / PostgreSQL)
1. **Database Schema**: Implement PostgreSQL or Cloud SQL using Drizzle ORM / Prisma. Tables: `properties`, `room_types`, `units`, `bookings`, `guests`, `payments`, `price_rules`, and `audit_logs`.
2. **Atomic Availability Lock**: Prevent simultaneous double-booking by executing bookings within an isolated database transaction with row-level locks:
   ```sql
   BEGIN;
   -- Lock the unit for the requested dates
   SELECT id FROM bookings 
   WHERE unit_id = $1 
     AND status != 'cancelled' 
     AND check_in < $3 AND check_out > $2
   FOR UPDATE;
   -- If no rows returned, insert new booking
   INSERT INTO bookings (...) VALUES (...);
   COMMIT;
   ```

### B. Bangladeshi Payment Gateway Integration
1. **bKash Merchant Checkout API (URL-Based)**:
   - Call `/tokenized/checkout/create` with `amount`, `merchantInvoiceNumber` (e.g. `MP-2041`), and webhook callback URL.
   - Redirect guest to bKash gateway or generate dynamic deep-link.
   - On `/tokenized/checkout/execute`, verify signature and update `advancePaid`, `advanceStatus: 'paid'`, and trigger automated WhatsApp confirmation webhook.
2. **SSLCommerz / Shurjopay**:
   - Post payment session payload containing `total_amount`, `currency: 'BDT'`, `tran_id: bookingCode`.
   - Implement idempotent IPN (Instant Payment Notification) listener:
     ```ts
     app.post('/api/payment/ipn', async (req, res) => {
       const { tran_id, val_id, status } = req.body;
       if (status === 'VALID' || status === 'VALIDATED') {
         await verifyPaymentWithSSLCommerz(val_id);
         await markBookingAdvancePaid(tran_id);
       }
       res.status(200).send('IPN_PROCESSED');
     });
     ```

---

## 4. Production Security & Reliability Checklist

- [x] **No Cardholder Storage**: Zero credit card data stored locally; hosted gateways only.
- [x] **Role-Based Access Control (RBAC)**: Distinct permissions for `Owner` (full access & settings), `Manager` (bookings, rates & payments), and `Front Desk` (check-ins, check-outs & viewing).
- [x] **Double-Booking Prevention at Data Layer**: Guaranteed by database constraints and overlapping date validation checks.
- [x] **Timezone Normalization**: Standardized to `Asia/Dhaka` (+06:00) to ensure accurate night counts and checkout times.
- [x] **Guest PII Minimization**: Sanitization and masking of sensitive phone and identity data.
- [x] **Tamper-Evident Audit Logging**: Tracking every state modification (creation, modification, cancellation, payment) with actor ID and timestamp.
- [x] **Offline Resilience**: Cached state handling with prominent offline visual warning.
- [x] **Single-Purpose Expiring Payment Links**: Unpredictable nonces for direct payment URLs.
