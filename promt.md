You are a senior frontend engineer working on a modern fashion brand website called “THEE UNITE”.

The project is deployed via:
GitHub → Vercel

---

# 🔴 CRITICAL RULE (DO NOT BREAK AGAIN)

* The `/collection` page MUST exist
* Restore it if missing
* Restore ALL its logic (data, cart, interactions, UI)
* DO NOT modify `/collection` page behavior
* ALL new changes must apply ONLY to the homepage (`/`)

---

# ✅ TASK OVERVIEW

1. Restore `/collection` page completely
2. Keep its product logic as the SINGLE SOURCE OF TRUTH
3. Modify ONLY homepage:

   * Remove "Connection" section
   * Replace with **scroll-based product experience**
   * Reuse products from `/collection`

---

# 🧠 DATA ARCHITECTURE (IMPORTANT)

* Extract product data into shared module:

/data/products.js

* Both:

  * `/collection`
  * homepage

MUST import from this file

👉 No duplicated data

---

# 🏠 HOMEPAGE EXPERIENCE (ADVANCED UX)

## 🎬 HERO SECTION (KEEP EXISTING)

* Background video
* Text scroll animation
* Video pinned then released

---

## 🔥 AFTER HERO → RUNWAY PRODUCT EXPERIENCE

Create a **cinematic scroll section**:

### Behavior:

* Products appear one by one as user scrolls
* Feels like a **fashion runway**
* NOT a grid

---

## 🎯 PRODUCT DISPLAY RULE

Each product shows ONLY:

* Image
* Name
* Price

BUT:

⚠️ NO static layout like collection page
⚠️ Must look visually DIFFERENT from `/collection`

---

# 🎥 RUNWAY SCROLL ANIMATION (GSAP)

Use GSAP + ScrollTrigger:

### Each product:

* Enters from bottom (y: 100 → 0)
* Opacity: 0 → 1
* Slight scale: 0.95 → 1
* Smooth easing (power3.out)

### Timing:

* One product per scroll segment
* Snap-like scroll feel (Apple-level smoothness)

### Optional:

* Slight horizontal shift alternating (left/right)

---

# 🍎 APPLE-LEVEL SCROLL PHYSICS

* Use:

  * scrub: true
  * smooth scrolling (Lenis or equivalent)
* No jitter
* No lag
* No scroll jumps

---

# 🎥 HOVER = VIDEO PREVIEW

Each product:

* On hover:

  * Replace image with video
  * Autoplay muted loop

* On mouse leave:

  * Return to image

---

# 🛒 CART + CHECKOUT (FROM HOMEPAGE)

⚠️ IMPORTANT:

* Use SAME cart logic as `/collection`

### Add interaction:

* Clicking product OR small invisible hotspot:
  → Adds to cart instantly

* Show:

  * Small floating cart indicator (top right or bottom corner)

---

## ⚡ INSTANT CHECKOUT

* No page navigation
* Use:

  * Slide-up panel OR modal

Inside:

* Product summary
* Quantity
* Checkout button

---

# 🎨 UI STYLE

* Minimal luxury (like Apple / Yeezy)
* No clutter
* No buttons visible unless necessary
* Clean typography
* Black / white + yellow accent (#FFD000)

---

# 🧱 COMPONENTS

Create:

/components/home

* RunwayProducts.jsx
* RunwayItem.jsx
* HoverVideo.jsx
* FloatingCart.jsx
* CheckoutModal.jsx

---

# 📱 RESPONSIVE

Mobile:

* Vertical scroll still works
* No horizontal overflow
* Smooth performance

---

# ⚡ PERFORMANCE

* Lazy load videos
* Use intersection observer
* Avoid re-renders on scroll
* GPU-accelerated transforms only

---

# 🚫 DO NOT

* Do NOT delete `/collection`
* Do NOT duplicate logic
* Do NOT break cart system
* Do NOT add unnecessary text

---

# 🔗 GITHUB

After completion:

git add .
git commit -m "Restore collection page + add runway scroll products on homepage"
git push origin main

---

# 🧠 FINAL EXPECTATION

* `/collection` page fully working again
* Homepage has **runway-style scroll product experience**
* Shared product data system
* Instant cart + checkout from homepage
* Hover video preview
* Apple-level smooth animations
