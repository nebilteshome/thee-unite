# Project Roadmap: Production Readiness for Thee Unite

This plan outlines the steps required to transition the current high-fidelity prototype into a production-ready e-commerce platform. The roadmap is divided into phased milestones, to be executed sequentially.

## Milestone 1: Security & Authentication (Critical)
**Objective:** Secure administrative access and establish a foundation for user accounts.

### 1.1 Secure Admin Routes
- **Changes:**
    - Create an `AdminGuard` component that checks for authenticated users with administrative privileges.
    - Wrap all `/admin/*` routes in `src/App.tsx` with this guard.
    - Redirect unauthorized users to a login page or the home page.
- **Verification:** Attempt to access `/admin` without being logged in (should redirect); log in and verify access.

### 1.2 Implement Firebase Authentication
- **Changes:**
    - Create a simple Login/Signup interface (initially for Admin use).
    - Update `src/lib/firebase.ts` to export `auth` and common auth methods.
    - Implement a global `AuthContext` to provide user state throughout the app.
- **Verification:** Successfully log in and out; observe state changes in the context.

---

## Milestone 2: Order Persistence & Backend (Critical)
**Objective:** Ensure successful transactions result in a permanent record for fulfillment.

### 2.1 Order Creation Logic
- **Changes:**
    - Define an `orders` collection schema in Firestore.
    - Modify the checkout flow in `src/components/Layout.tsx` (or where the Flutterwave callback resides) to write order details to Firestore *after* payment confirmation.
    - Order details should include: items, total, customer info, shipping address, and payment reference.
- **Verification:** Complete a test checkout and verify a new document appears in the `orders` collection.

### 2.2 Webhook Implementation
- **Changes:**
    - Fully implement `api/webhook.ts` to receive Flutterwave events.
    - Update the order status in Firestore to `paid` once the webhook confirms successful payment.
    - Add basic error logging for failed webhook attempts.
- **Verification:** Use a tool like Hookdeck or ngrok to simulate a Flutterwave webhook and verify the order status updates.

---

## Milestone 3: Shopping Experience & State
**Objective:** Improve reliability and usability for the end-user.

### 3.1 Cart Persistence
- **Changes:**
    - Modify `src/lib/cart.ts` to sync the cart state with `localStorage`.
    - On application load, initialize the cart from `localStorage`.
- **Verification:** Add items to cart, refresh the page, and verify items remain.

### 3.2 Inventory Management (Basic)
- **Changes:**
    - Update the `products` schema in Firestore to include a `stock` count.
    - Update `src/pages/Shop.tsx` to display "Out of Stock" if `stock <= 0` and disable "Add to Cart".
    - Add a Cloud Function (or client-side logic for now) to decrement stock after a successful order.
- **Verification:** Reduce stock to 0 in Firestore; verify the UI reflects "Out of Stock".

---

## Milestone 4: Admin Utility & Content
**Objective:** Provide the tools needed to manage the store without code changes.

### 4.1 Order Management UI
- **Changes:**
    - Build a dashboard in `/admin/orders` to view, search, and update order statuses (e.g., Pending -> Shipped).
- **Verification:** View list of orders; change a status and verify it persists in Firestore.

### 4.2 Content Finalization
- **Changes:**
    - Replace placeholders for Size Guide, Shipping Policy, and Return Policy with actual content or editable Firestore fields.
- **Verification:** All links in the footer and product pages lead to real content.
