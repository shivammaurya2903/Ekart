# **Product Requirements Document & System Architecture**

## **EKart  (Flipkart Clone with Price Intelligence)**

**Project Name:** EKart  
**Version:** 1.0  
**Date:** November 24, 2026  
**Stack:** MERN (MongoDB, Express.js, React, Node.js) \+ Tailwind CSS \+ Chart.js

# **PART 1: PRODUCT REQUIREMENTS DOCUMENT (PRD)**

# **1\. Executive Summary & Problem Statement**

Online shoppers on large marketplaces frequently face four friction points:

* **Decision Fatigue:** Hard filters hide out-of-budget options completely, making it difficult to judge whether spending slightly more yields better value.  
* **Price Opacity:** Shoppers cannot tell if a "sale price" is genuinely a good deal or an inflated MRP discount.  
* **Tab Overload:** Comparing specs and prices across multiple products requires opening and switching between several browser tabs.  
* **Checkout Friction:** Hidden taxes/shipping fees and intrusive "Are you sure?" confirmation popups slow down cart management.

This project delivers a full-stack Flipkart-inspired e-commerce platform built on the MERN stack that solves these problems through five integrated product novelties: **Price History Tracking with Buy/Wait Verdict Badges**, a **Budget-First Dimmer**, a **Floating Quick-Compare Bar**, a **No-Surprise Total Calculator**, and a **Smart Undo Toast**.

# **2\. Goals & Success Metrics**

| Category | Objective | Target Metric |
| :---- | :---- | :---- |
| **User Experience** | Reduce decision and comparison friction | Compare up to 3 products in 2 clicks without leaving the catalog page |
| **Price Transparency** | Give shoppers confidence in purchase timing | 100% of catalog items display historical price trends and lowest-price badge |
| **Performance** | Fast, responsive storefront on desktop and mobile | Initial product grid load under 1.5 seconds; smooth 60fps CSS dimming transitions |
| **Engineering** | End-to-end full-stack portfolio completeness | Full JWT auth, persistent MongoDB cart, Razorpay test checkout, Admin CRUD, automated price alerts |

# **3\. Target User Personas**

1. **Budget-Conscious Shopper:** Wants to stay within a strict budget (e.g., under ₹25,000) while still seeing slightly higher-priced options for context and knowing if a current discount is real.  
2. **Spec-Driven Buyer:** Compares electronics (RAM, storage, battery, ratings, and lowest historical price) side-by-side before committing.  
3. **Store Administrator:** Manages product listings, updates stock and pricing, and relies on automated logging of price changes to power customer-facing graphs and alerts.

# **4\. Functional Requirements**

## **4.1 Storefront & Catalog Discovery**

* **Sticky Navigation Bar:** Brand logo, live keyword search bar, category quick-links (Mobiles, Laptops, Footwear, Audio, Accessories), user account menu, and live cart badge.  
* **Responsive Product Grid:** CSS Grid layout (`auto-fill`, `minmax(240px, 1fr)`) displaying product image, title, star rating, current price, MRP, discount percentage, "Price History" button, and "Compare" checkbox.  
* **Search & Filtering:** Server-side query filtering by keyword (`?search=`), category (`?category=`), and maximum price (`?maxPrice=`).

## **4.2 Signature Novelty Features**

* **Price History Modal & Verdict Badge:**  
  * Clicking "Price History" opens a modal containing an interactive Chart.js line graph plotting historical dates vs. prices.  
  * Automatically computes the all-time minimum price from `priceHistory` and displays a smart badge: **"Lowest Price Ever\!"** (when current price equals historical low) or **"₹X above lowest price — Consider waiting"**.  
  * Allows logged-in users to set a **Target Price Alert** for the item.  
* **Budget-First Dimmer:**  
  * A prominent range slider at the top of the catalog (e.g., ₹1,000 to ₹1,00,000).  
  * Products priced above the selected threshold smoothly transition to reduced opacity (`0.25`) and grayscale (`80%`) rather than disappearing, preserving catalog visibility while highlighting affordable items.  
* **Floating Quick-Compare Bar:**  
  * Users can check "Compare" on up to 3 product cards.  
  * When 1 or more items are selected, a fixed bar slides up at the bottom showing thumbnails and a **"Compare Now"** button.  
  * Clicking "Compare Now" opens a side-by-side comparison table covering Price, Historical Lowest Price, Rating, and technical `specs`.  
* **No-Surprise Total Calculator:**  
  * Both product previews and the cart summary display an itemized, live breakdown of Subtotal, Discount, GST, Delivery Fee, and Final Payable Amount with zero hidden charges at checkout.  
* **Smart Undo Toast:**  
  * Removing an item from the cart executes immediately without a blocking confirmation dialog, displaying a bottom toast notification with a 5-second **"Undo"** action that restores the item.

## **4.3 Authentication, Cart & Checkout**

* **User Authentication:** Email/password registration and login using bcrypt hashing and JWT tokens, supporting `"customer"` and `"admin"` roles.  
* **Persistent Cart:** Cart items sync with MongoDB so logged-in users retain their cart across sessions and devices.  
* **Checkout Flow:** Shipping address entry, order summary review, and **Razorpay Test Mode** payment integration (UPI/Card mock checkout) creating persistent order records.

## **4.4 Admin Dashboard & Automated Price Tracking**

* Protected `/admin` route accessible only to users with `role: "admin"`.  
* Create, edit, and delete products.  
* **Automated Price History Logging:** Updating a product's `currentPrice` via the Admin panel automatically appends `{ price, date }` to the product's `priceHistory` array.  
* **Scheduled Price-Drop Alerts:** A `node-cron` background job checks active `priceAlerts` against updated prices and dispatches email alerts via Nodemailer when `currentPrice <= targetPrice`.

# **5\. Non-Functional Requirements**

* **Security:** Passwords hashed with `bcrypt` (10+ salt rounds), JWT signed with strong secret, role-based middleware on admin routes, CORS whitelist, Helmet HTTP headers, and Razorpay webhook/signature verification.  
* **Responsiveness:** Mobile-first Tailwind CSS breakpoints supporting 360px mobile screens through 1440px+ desktop monitors.  
* **Data Integrity:** Mongoose schema validation on all writes; atomic updates for price history pushes and stock adjustments.  
* **Maintainability:** Modular MVC-style backend (routes, controllers, models, middleware) and component-based React frontend.

# **6\. Phased Delivery Roadmap (15-Day Plan)**

| Phase | Timeline | Key Deliverables |
| :---- | :---- | :---- |
| **Phase 1: Backend & Seed Data** | Days 1–3 | Express server, MongoDB Atlas connection, Mongoose models, `seed.js` (20 products with 4–6 months of price history), `GET /api/products` |
| **Phase 2: Storefront & Novelties** | Days 4–7 | React \+ Tailwind UI, Flipkart-style layout, Budget-First Dimmer, Floating Quick-Compare Bar, Chart.js Price History Modal |
| **Phase 3: Auth, Cart & Checkout** | Days 8–11 | JWT auth, persistent MongoDB cart, No-Surprise Total Calculator, Smart Undo Toast, Razorpay Test Mode integration |
| **Phase 4: Admin & Price Alerts** | Days 12–14 | Protected `/admin` dashboard, live price update \-\> history push, `node-cron` \+ Nodemailer alert worker |
| **Phase 5: Deployment & QA** | Day 15 | Deploy frontend to Vercel, backend to Render, database on MongoDB Atlas, end-to-end testing |

# **PART 2: SYSTEM ARCHITECTURE DOCUMENT**

# **1\. High-Level Architecture Overview**

The application follows a **3-Tier Client-Server Architecture** with a decoupled React Single Page Application (SPA) communicating over HTTPS REST APIs with a Node.js/Express backend backed by MongoDB Atlas.

## **Component Interaction Flow**

1. **Client Layer (React \+ Tailwind \+ Chart.js):** Renders UI, manages local UI state (Budget Dimmer threshold, Quick-Compare selection, Undo Toast timer), and communicates with the backend via Axios/Fetch using Bearer JWT headers.  
2. **Application Layer (Node.js \+ Express.js):** Handles routing, authentication/RBAC middleware, input validation, business logic, Razorpay payment signature verification, and hosts the `node-cron` background worker.  
3. **Data & External Services Layer:**  
   * **MongoDB Atlas:** Primary NoSQL document store for users, products, orders, and reviews.  
   * **Razorpay API (Test Mode):** Handles payment order creation and checkout verification.  
   * **SMTP / Nodemailer:** Dispatches automated price-drop email notifications.

# **2\. Technology Stack Summary**

| Layer | Technology | Rationale |
| :---- | :---- | :---- |
| **Frontend Framework** | React (Vite) | Fast component rendering, state management for compare/dimmer/cart |
| **Styling** | Tailwind CSS | Rapid responsive design, smooth opacity/grayscale transitions |
| **Data Visualization** | Chart.js (`react-chartjs-2`) | Lightweight, responsive line charts for price history |
| **Backend Runtime** | Node.js \+ Express.js | Unified JavaScript stack, mature middleware ecosystem |
| **Database & ODM** | MongoDB Atlas \+ Mongoose | Flexible schema for variable product `specs` and embedded `priceHistory` arrays |
| **Authentication** | JSON Web Tokens (JWT) \+ bcrypt | Stateless auth with role-based access control |
| **Scheduler & Mailer** | `node-cron` \+ Nodemailer | Native Node scheduling for daily price checks and email alerts |
| **Payments** | Razorpay Test Mode | Standard Indian payment gateway supporting UPI and cards |
| **Hosting** | Vercel (Frontend), Render (Backend) | Zero-cost free tiers with Git-based CI/CD |

# **3\. Database Schema Design (MongoDB Collections)**

## **3.1 `users` Collection**

* `_id`: ObjectId  
* `name`: String (required)  
* `email`: String (required, unique, indexed)  
* `passwordHash`: String (required)  
* `role`: String (enum: `"customer"`, `"admin"`, default: `"customer"`)  
* `cart`: Array of `{ productId: ObjectId (ref: Product), quantity: Number }`  
* `priceAlerts`: Array of `{ productId: ObjectId (ref: Product), targetPrice: Number, notified: Boolean }`  
* `createdAt`, `updatedAt`: Timestamps

## **3.2 `products` Collection**

* `_id`: ObjectId  
* `name`: String (required, text-indexed for search)  
* `category`: String (required, indexed)  
* `specs`: Map/Object (flexible key-value pairs, e.g., `{ ram: "8GB", storage: "128GB", battery: "5000mAh" }`)  
* `currentPrice`: Number (required, indexed)  
* `mrp`: Number (required)  
* `stock`: Number (default: 0\)  
* `rating`: Number (default: 0\)  
* `images`: Array of Strings (URLs)  
* `priceHistory`: Array of `{ price: Number, date: Date }`  
* `createdAt`, `updatedAt`: Timestamps

## **3.3 `orders` Collection**

* `_id`: ObjectId  
* `userId`: ObjectId (ref: User, indexed)  
* `items`: Array of `{ productId: ObjectId, name: String, priceAtPurchase: Number, quantity: Number }`  
* `priceBreakdown`: `{ subtotal: Number, gst: Number, deliveryFee: Number, discount: Number, totalAmount: Number }`  
* `shippingAddress`: `{ fullName, street, city, state, pincode, phone }`  
* `razorpayOrderId`: String  
* `razorpayPaymentId`: String  
* `paymentStatus`: String (enum: `"pending"`, `"paid"`, `"failed"`)  
* `createdAt`: Timestamp

## **3.4 `reviews` Collection**

* `_id`: ObjectId  
* `productId`: ObjectId (ref: Product, indexed)  
* `userId`: ObjectId (ref: User)  
* `rating`: Number (1–5)  
* `comment`: String  
* `createdAt`: Timestamp

# **4\. REST API Specification**

| Domain | Method & Endpoint | Access | Purpose |
| :---- | :---- | :---- | :---- |
| **Auth** | `POST /api/auth/register` | Public | Register a new customer account |
| **Auth** | `POST /api/auth/login` | Public | Authenticate user and return JWT |
| **Auth** | `GET /api/auth/me` | Auth | Fetch logged-in user profile, cart, and alerts |
| **Products** | `GET /api/products` | Public | List products with `?search=`, `?category=`, `?maxPrice=` |
| **Products** | `GET /api/products/:id` | Public | Fetch single product details, specs, and full `priceHistory` |
| **Admin** | `POST /api/products` | Admin | Create a new product (initializes `priceHistory` with launch price) |
| **Admin** | `PATCH /api/products/:id/price` | Admin | Update `currentPrice` and push `{ price, date }` to `priceHistory` |
| **Admin** | `DELETE /api/products/:id` | Admin | Delete a product from catalog |
| **Cart** | `POST /api/cart` | Auth | Add or update item quantity in user's persistent cart |
| **Cart** | `DELETE /api/cart/:productId` | Auth | Remove item from cart (client handles 5-sec Undo Toast re-add) |
| **Orders** | `POST /api/orders/create-payment` | Auth | Create Razorpay order ID with server-verified total |
| **Orders** | `POST /api/orders/verify` | Auth | Verify Razorpay HMAC signature, save order, clear cart |
| **Orders** | `GET /api/orders/my` | Auth | Retrieve authenticated user's order history |
| **Alerts** | `POST /api/alerts` | Auth | Register a target price alert for a specific product |

# **5\. Key System Flows**

## **5.1 Price Update & Automated Alert Flow**

1. Admin submits a new price via `PATCH /api/products/:id/price`.  
2. Express controller validates the admin JWT, updates `product.currentPrice`, and atomically `$push`es `{ price: newPrice, date: new Date() }` into `product.priceHistory`.  
3. A scheduled `node-cron` job (or post-update hook) queries `users` where `priceAlerts.productId === id`, `priceAlerts.targetPrice >= newPrice`, and `notified === false`.  
4. For each matching user, Nodemailer sends a price-drop email and marks `notified = true`.

## **5.2 Secure Checkout Flow (Razorpay)**

1. Client clicks Checkout \-\> calls `POST /api/orders/create-payment`.  
2. Backend recalculates subtotal, GST, and delivery fee directly from MongoDB product prices (never trusting client-submitted totals) and requests a Razorpay Order ID.  
3. Frontend opens the Razorpay Checkout modal using the returned Order ID.  
4. On payment success, frontend posts `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `POST /api/orders/verify`.  
5. Backend verifies the HMAC-SHA256 signature using the Razorpay secret, marks the order `"paid"`, decrements product stock, and clears the user's cart.

# **6\. Recommended Project Folder Structure**

```
smart-ecommerce-flipkart-clone/
├── client/                     # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Navbar, ProductCard, BudgetDimmer, CompareBar, PriceHistoryModal, UndoToast
│   │   ├── pages/              # Home, ProductDetail, Cart, Checkout, Login, AdminDashboard
│   │   ├── context/            # AuthContext, CartContext, CompareContext
│   │   ├── services/           # api.js (Axios instance with JWT interceptor)
│   │   └── App.jsx
│   └── package.json
└── server/                     # Node.js + Express + Mongoose
    ├── config/                 # db.js, razorpay.js
    ├── controllers/            # authController, productController, cartController, orderController, alertController
    ├── middleware/             # authMiddleware.js, adminMiddleware.js, errorHandler.js
    ├── models/                 # User.js, Product.js, Order.js, Review.js
    ├── routes/                 # authRoutes, productRoutes, cartRoutes, orderRoutes, alertRoutes
    ├── jobs/                   # priceAlertCron.js
    ├── seed/                   # seed.js (20 sample products with price history)
    ├── server.js
    └── package.json
```

# **7\. Security & Deployment Architecture**

* **Frontend Deployment (Vercel):** Connects to GitHub `/client` directory; stores `VITE_API_BASE_URL` and `VITE_RAZORPAY_KEY_ID` as environment variables.  
* **Backend Deployment (Render):** Connects to GitHub `/backend` directory; stores `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and SMTP credentials securely in environment variables.  
* **Database Hosting (MongoDB Atlas):** M0 Free Tier cluster with IP allowlisting / network access configured for Render and indexes created on `products.category`, `products.currentPrice`, and `users.email`.  
* **Hardening Checklist:** Enable `helmet` for HTTP security headers, `express-rate-limit` on `/api/auth/*` routes, strict CORS restricted to the Vercel domain, and server-side price recalculation on all order requests.

