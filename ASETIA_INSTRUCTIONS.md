# AI Development Instructions: Project Asetia (Neo-Brutalism Edition)

## 1. Project Context
- **Name:** Asetia
- **Tagline:** Marketplace Aset Digital Paling Lokal
- **Concept:** A fast, lightweight, and high-contrast marketplace for digital assets.
- **Vibe:** Neo-Brutalist (Bold, Clean, Gen-Z, Unapologetic).

## 2. Tech Stack
- **Framework:** Next.js 14+ (App Router, Server Actions)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn UI
- **Backend:** Supabase (@supabase/ssr)
- **Payments:** Midtrans
- **Delivery:** Resend (Email-based)

## 3. Visual Identity (Neo-Brutalism Light)
Please apply these styling rules to all components:
- **Borders:** Hard 2px black borders on all cards, buttons, and inputs (`border-2 border-black`).
- **Shadows:** No soft blurs. Use hard, offset black shadows (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`).
- **Corners:** Slight rounding (`rounded-md` or `rounded-none` for a sharper look).
- **Colors:** - Background: Pure White (`#FFFFFF`) or Paper-like Off-white.
  - Primary Accent: High-saturation color (e.g., Electric Lime or Vibrant Purple).
  - Text: High-contrast black (`#000000`).
- **Typography:** Bold, clean sans-serif (Inter/Geist).

## 4. Technical Constraints
- **Authentication:** Use `@supabase/ssr`. Implement Login/Sign-Up via Server Actions.
- **Asset Delivery:** Assets are delivered ONLY via email after Midtrans settlement.
- **No Chat:** Avoid WebSockets. Use static "Contact Support" forms.
- **Security:** Implement RLS in Supabase. Ensure file paths in storage are private.

## 5. UI Components Priority (Shadcn Mod)
Modify Shadcn components to follow the Neo-Brutalist style:
- **Button:** Solid background, 2px border, hard shadow on hover/static.
- **Card:** White background, 2px border, hard shadow.
- **Input:** 2px border, no glow on focus (just solid color change).

## 6. Implementation Steps
1. Configure `tailwind.config.ts` with Neo-Brutalist extended shadows and colors.
2. Initialize Supabase SSR and Middleware.
3. Build the Auth pages (Login/Sign-up) with the Neo-Brutalist theme.
4. Implement Product Listing Grid (Hard-bordered cards).
5. Setup the payment flow & Resend email automation.

## 7. Role Management Logic
- **Universal Account:** A single user account can act as both a Buyer and a Seller. No separate accounts needed.
- **Role Switching:** Implement a simple toggle/switcher in the Dashboard to change the view/interface between "Buyer Mode" and "Seller Mode".
- **Superadmin (Superuser):** - One specific role `superadmin` for platform management.
  - Access to a special route `/admin` to moderate products and view all transactions.
- **Database Mapping:** - Update `profiles` table `role` to support `admin` and a default `user`. 
  - Within the app logic, differentiate `seller_mode` vs `buyer_mode` based on UI state or session.