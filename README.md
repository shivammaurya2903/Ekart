# 🛒 EKart — Smart E-Commerce Platform (Flipkart Clone with Price Intelligence)

![MERN Stack](https://img.shields.io/badge/Stack-MERN-00D8FF?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=for-the-badge)
![Chart.js](https://img.shields.io/badge/Charts-Chart.js-FF6384?style=for-the-badge)
![Razorpay](https://img.shields.io/badge/Payments-Razorpay_Test_Mode-3395FF?style=for-the-badge)

**EKart** is a full-stack, Flipkart-inspired e-commerce platform built with the **MERN stack (MongoDB, Express.js, React, Node.js)**. Instead of stopping at a basic UI clone, EKart is engineered to solve the four biggest everyday frustrations in online shopping—**decision fatigue, price opacity, tab overload, and checkout surprises**—through five integrated, problem-solving UX novelties.

---

## ✨ Signature Novelties & Problems Solved

Every standout feature in EKart was designed to remove real user friction:

### 1. 📈 Price History Graph & "Buy / Wait" Verdict Badge
* **The Problem:** Online marketplaces often inflate MRPs before sales, leaving shoppers unsure whether a "40% off" deal is actually a good price.
* **The EKart Solution:** Every product card includes a **Price History** button that opens an interactive **Chart.js** line graph plotting historical prices over time.
* **How It Helps:** EKart automatically calculates the all-time lowest price and displays a clear verdict badge—such as **"Lowest Price Ever!"** or **"₹2,000 above lowest price — Consider waiting"**. Logged-in users can also set a **Target Price Alert** to receive an automated email the moment the price drops.

### 2. 🎚️ Budget-First Dimmer
* **The Problem:** Standard price filters completely hide products above a user's budget, making it hard to see if spending just ₹1,000 more gets a significantly better product.
* **The EKart Solution:** A smooth range slider sits at the top of the catalog. As you drag it, products outside your budget don't vanish—they smoothly **dim out (`opacity: 0.25`, `grayscale: 80%`)** while affordable items stay sharp and highlighted.
* **How It Helps:** Eliminates decision fatigue while preserving full catalog context.

### 3. ⚖️ Floating Quick-Compare Bar
* **The Problem:** Comparing specs across multiple phones or laptops usually means opening 4–5 browser tabs and jumping back and forth.
* **The EKart Solution:** Check the **Compare** box on up to 3 product cards to pin them to a sleek floating bar at the bottom of the screen.
* **How It Helps:** Clicking **Compare Now** opens a clean side-by-side table comparing **Current Price, Historical Lowest Price, Ratings, and Technical Specs** without ever leaving the catalog page.

### 4. 🧾 No-Surprise Total Calculator
* **The Problem:** Shoppers frequently abandon carts when unexpected taxes, platform fees, or shipping charges appear only on the final payment screen.
* **The EKart Solution:** Cart and checkout views show a real-time, itemized breakdown of **Subtotal, Discount, 18% GST, Delivery Fee (free above ₹499), and Final Payable Amount** upfront—strictly verified on the backend.
* **How It Helps:** Builds checkout trust with zero hidden surprises.

### 5. ↩️ Smart Undo Toast
* **The Problem:** Clicking "Remove" on a cart item and getting hit with an intrusive *"Are you sure you want to delete this?"* modal slows down the experience.
* **The EKart Solution:** Items are removed immediately with zero popups, accompanied by a non-blocking bottom notification offering a **5-second "Undo" button** that instantly restores the item.
* **How It Helps:** Keeps cart management fast while protecting against accidental clicks.

---

## 🚀 Full-Stack Features

* **Responsive Storefront:** Flipkart-style sticky navbar, live keyword search (`?search=`), category filters (`?category=`), and responsive CSS Grid layout.
* **Role-Based Authentication:** Secure signup/login using **JWT** and **bcrypt** (`customer` and `admin` roles) with rate-limiting protection.
* **Persistent MongoDB Cart:** Logged-in users' carts sync across sessions and devices.
* **Secure Razorpay Checkout (Test Mode):** Supports UPI/Card test payments with server-side price recalculation and **HMAC-SHA256 signature verification**.
* **Admin Dashboard (`/admin`):** Create, edit, and delete products. Updating a product's price automatically pushes a timestamped entry to `priceHistory`, updating customer charts live.
* **Automated Price-Drop Worker:** A `node-cron` background job checks active user price alerts and sends email notifications via **Nodemailer** when `currentPrice <= targetPrice`.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) + Tailwind CSS | Component UI, responsive layout, smooth CSS dimming transitions |
| **Data Visualization** | Chart.js (`react-chartjs-2`) | Interactive historical price trend graphs |
| **Backend** | Node.js + Express.js | REST API, business logic, RBAC middleware, security headers |
| **Database** | MongoDB Atlas + Mongoose | Flexible product specs, embedded `priceHistory`, users, and orders |
| **Authentication** | JWT + `bcryptjs` | Stateless authentication & password hashing |
| **Payments** | Razorpay SDK (Test Mode) | Order creation and cryptographic payment verification |
| **Jobs & Email** | `node-cron` + `nodemailer` | Scheduled price-drop checks and automated email alerts |

---

## 📁 Project Structure

```text
smart-ecommerce-flipkart-clone/
├── client/                     # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Navbar, ProductCard, BudgetDimmer, CompareBar, PriceHistoryModal, UndoToast
│   │   ├── pages/              # Home, ProductDetail, Cart, Checkout, Login, AdminDashboard
│   │   ├── context/            # AuthContext, CartContext, CompareContext
│   │   ├── services/           # api.js (Axios instance with JWT interceptor)
│   │   └── App.jsx
│   └── package.json
└── backend/                     # Node.js + Express + Mongoose
    ├── config/                 # db.js, razorpay.js
    ├── controllers/            # auth, product, cart, order, alert controllers
    ├── middleware/             # authMiddleware.js, adminMiddleware.js, errorHandler.js
    ├── models/                 # User.js, Product.js, Order.js, Review.js
    ├── routes/                 # REST API route definitions
    ├── jobs/                   # priceAlertCron.js
    ├── seed/                   # seed.js (20 products + 4-6 months price history)
    ├── server.js
    └── package.json
```

---

## 🗄️ Database Schema Overview

EKart uses **4 MongoDB collections**:

1. **`users`** — Stores credentials (`passwordHash`), `role` (`customer`/`admin`), persistent `cart`, and `priceAlerts` (`{ productId, targetPrice, notified }`).
2. **`products`** — Stores catalog metadata, flexible `specs` (`Map`), `currentPrice`, `mrp`, `stock`, `rating`, `images`, and an embedded `priceHistory` array (`[{ price, date }]`).
3. **`orders`** — Stores purchased items, server-calculated `priceBreakdown`, `shippingAddress`, Razorpay IDs, and `paymentStatus`.
4. **`reviews`** — Stores user ratings (1–5) and comments linked to `productId` and `userId`.

---

## 🔌 REST API Reference

| Domain | Method & Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST /api/auth/register` | Public | Register a new customer account |
| **Auth** | `POST /api/auth/login` | Public | Authenticate user and receive JWT |
| **Auth** | `GET /api/auth/me` | Auth | Get logged-in profile, populated cart, and alerts |
| **Products** | `GET /api/products` | Public | List products (`?search=`, `?category=`, `?maxPrice=`) |
| **Products** | `GET /api/products/:id` | Public | Get product details, `priceHistory`, and lowest price |
| **Admin** | `POST /api/products` | Admin | Create product & initialize `priceHistory` |
| **Admin** | `PATCH /api/products/:id/price` | Admin | Update `currentPrice` & append to `priceHistory` |
| **Admin** | `DELETE /api/products/:id` | Admin | Delete a product |
| **Cart** | `POST /api/cart` | Auth | Add/update cart item & return live price breakdown |
| **Cart** | `DELETE /api/cart/:productId` | Auth | Remove item from cart immediately |
| **Orders** | `POST /api/orders/create-payment` | Auth | Calculate server-side total & create Razorpay order |
| **Orders** | `POST /api/orders/verify` | Auth | Verify HMAC signature, save paid order, clear cart |
| **Orders** | `GET /api/orders/my` | Auth | Fetch authenticated user's order history |
| **Alerts** | `POST /api/alerts` | Auth | Set or update a target price alert for a product |

---

## ⚙️ Local Setup & Installation

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas account (Free M0 cluster) or local MongoDB
* Razorpay account (Test Mode API keys)
* SMTP credentials (e.g., Gmail App Password or Ethereal Mail for testing)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ekart-price-intelligence.git
cd ekart-price-intelligence
```

### 2. Configure & Start the Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` (based on `.env.example`):
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_test_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Seed the database with 20 sample products (including 5–6 months of price history) and demo accounts:
```bash
npm run seed
```

Start the Express server:
```bash
npm run dev
```

### 3. Configure & Start the Frontend
Open a new terminal window:
```bash
cd client
npm install
```

Create a `.env` file inside `client/`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

Run the Vite development server:
```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🧪 Demo Accounts (After Running `npm run seed`)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@ekart.com` | `Admin@123` |
| **Customer** | `user@ekart.com` | `User@123` |

> **Tip:** Log in as **Admin**, navigate to `/admin`, and lower a product's price below a customer's Target Price Alert to watch the live **Price History Chart** update and trigger the automated email alert!

---

## 🌐 Deployment

* **Frontend:** Deploy the `/client` folder on **Vercel** (`VITE_API_BASE_URL`, `VITE_RAZORPAY_KEY_ID`).
* **Backend:** Deploy the `/server` folder on **Render** (configure all server `.env` variables and set `CLIENT_URL` to your Vercel URL).
* **Database:** Hosted on **MongoDB Atlas** (Free Tier).

---

## 📄 Disclaimer

This project is built strictly for **educational and portfolio purposes** as a full-stack practice application inspired by Flipkart. All product names, images, and historical prices are mock data used for demonstration.