You are a senior frontend engineer working on a modern fashion brand website called “THEE UNITE”.

The project already includes:

* A hero section with a background video
* Scroll animation using GSAP ScrollTrigger
* Deployment pipeline: GitHub → Vercel

---

TASK:

Modify the landing page to remove the current “Connection” section and replace it with a minimal product showcase section.

---

REMOVE:

* Completely delete the “Connection” section
* Remove all related components, imports, and styles
* Ensure there are no layout gaps or leftover spacing

---

ADD: PRODUCT SHOWCASE SECTION

Create a new section that appears immediately after the hero section finishes its scroll animation.

---

UX FLOW:

1. Hero section remains unchanged:

   * Background video plays
   * Text scrolls upward and fades out
   * Video stays pinned during animation
   * After text disappears, hero releases

2. Immediately after hero releases:

   * Product section appears
   * No headings, no descriptions, no extra text

---

DISPLAY ONLY:

Each product must show:

* Product image
* Product name
* Product price
* Buttons
* “Add to cart”
* “View product”
* Descriptions
* Ratings
* Badges
* Overlays

Keep it extremely minimal.

---

PRODUCT GRID:

* Desktop: 5–8 columns
* Tablet: 5 columns
* Mobile: 5 column

Spacing:

* Large whitespace
* Centered layout
* Premium feel

---

PRODUCT CARD DESIGN:

Each card must include:

1. Image:

   * Full width
   * object-fit: cover
   * Smooth hover zoom (scale: 1.05)

2. Name:

   * Clean typography
   * Slightly bold or medium weight
   * Uppercase optional

3. Price:

   * Smaller than name
   * Muted color (gray or soft white)

---

SCROLL ANIMATION (GSAP):

When product section enters viewport:

* Fade in (opacity 0 → 1)
* Move upward (y: 50 → 0)
* Stagger animation across items

Animation must feel:

* Smooth
* Premium
* Not too fast

---

COMPONENT STRUCTURE:

/components

* ProductSection.jsx
* ProductCard.jsx

---

SAMPLE DATA:

Use mock data:

const products = [
{
id: 1,
name: "BLACK ESSENTIAL HOODIE",
price: "$120",
image: "/images/product1.jpg"
},
{
id: 2,
name: "OVERSIZED TEE",
price: "$80",
image: "/images/product2.jpg"
},
{
id: 3,
name: "CARGO PANTS",
price: "$150",
image: "/images/product3.jpg"
}
];

---

PERFORMANCE:

* Lazy load images
* Use optimized image handling (Next.js Image if applicable)
* Avoid layout shifts
* Use transform + opacity for animations only

---

RESPONSIVE:

Mobile:

* Single column
* Clean spacing
* Maintain luxury feel

---

STYLE:

* Black / white base
* Yellow accent (#FFD000)
* Minimal luxury aesthetic
* Clean modern typography

---

GITHUB WORKFLOW:

After implementation:

git add .
git commit -m "Replace connection section with minimal product showcase"
git push origin main

Only push to GitHub. Vercel will handle deployment automatically.

---

FINAL EXPECTATION:

* Connection section fully removed
* Minimal product-only UI
* Smooth scroll animations
* Clean, production-ready code
