# 💰 FinTrack — Student Expense Tracker

A full-stack, immersive web app to help students track their daily expenses. Built with a pristine Vanilla HTML/CSS/JS frontend and powered by a robust Node.js, Express, and MongoDB backend.
*Financially unstable. Visually immaculate.*

FinTrack is a premium, cinematic student financial lifestyle app. It gracefully maps your late-night food runs, panic auto rides, and the friends who still owe you money, ensuring your bank account actually survives the semester.

---

## ✨ Features & Functionality

The project is powered by highly interactive Vanilla JavaScript and DOM manipulation, fully integrated with a live REST API and Cloud Database for an authentic, production-ready SaaS experience.

### 🎨 UI/UX & Animations
- **Cinematic Landing Page:** Includes a premium 3D magnetic tilt effect on the hero section and frosted-glass navbar transitions on scroll.
- **Scroll Animations:** Utilizes `IntersectionObserver` for smooth fade-in effects as elements enter the viewport.
- **Smooth Scrolling:** Intercepts anchor links for buttery-smooth page navigation.
- **Animated Counters:** Financial balances smoothly count up to their final values upon page load.

### 📊 Dashboard & Financial Pulse
- **Wallet Vibe Engine:** Dynamically calculates your financial "mood" (Stable, Recovering, or Critical) based on how close you are to your budget limit. Warns you with messages like *"Entering the death overs"* when you spend over 80%.
- **Sassy Timeline:** Expense items are automatically tagged with humorous labels based on category (e.g., *"Surge pricing victim"* for Commute, *"Assignment printing trauma"* for College Life).
- **Modals:** Built-in modal functionality to "Add Expense" and "Add Money".

### 🤝 Social Debt Tracker (Friends Page)
- Stop being the group's free bank. Tracks total amounts owed versus returned.
- Features visual progress rings for repayments.
- Auto-flags "danger borrowers" (people who owe high amounts but have returned less than 20%).
- Actionable UI with "Record Return" and "Remind" buttons.

### 📈 Insights & Analytics
- **Category Bubbles:** Calculates total spend per category and assigns percentage weights.
- **Trend Indicators:** Pseudo-randomized visual trend arrows indicating spending direction.

### ⚙️ Settings & Controls
- **Interactive Sliders:** Real-time DOM updates for Monthly Budget and Emergency Reserve sliders that persist dynamically to your MongoDB user profile.
- **Source Chips:** Toggleable payment source chips (Cash, UPI, etc.).

### 🔐 Security & Backend Authentication
- **JWT Implementation:** Fully protected API routes utilizing JSON Web Tokens and secure `localStorage` handling.
- **Bcrypt Password Hashing:** User credentials are cryptographically secured before storing in the database.
- **Validation:** Real-time frontend form validation coupled with strict Express/Mongoose backend error handling.

---

## 🚀 How to Run the Local Environment

### 1. Backend Setup (Node.js & MongoDB)
1. Open the project folder in your terminal.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your environment variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_string
   CLIENT_URL=http://127.0.0.1:5500
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup (Live Server)
1. Open the project folder in **VS Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` → **"Open with Live Server"**.
4. The site opens at `http://127.0.0.1:5500` and will securely communicate with your local `localhost:5000` Node server.

---

## 📁 Project Structure

```text
student-expense-tracker/
│
├── index.html          ← Cinematic landing page with 3D effects
├── login.html          ← Login form with validation
├── signup.html         ← Sign up form with validation
├── dashboard.html      ← Overview & survival snapshot
├── transactions.html   ← Complete activity feed & filters
├── friends.html        ← Group math & social debt tracking
├── wallet.html         ← Cash, UPI, and Bank balances
├── insights.html       ← Spending analytics & behavior tracking
├── settings.html       ← Preferences, sliders, & panic alerts
│
├── style.css           ← Core styling (Glassmorphism, Dark mode, Responsive)
├── script.js           ← Global App Logic, Auth, Validations & API Integration
│
├── server.js           ← Entry point for the Express backend
├── package.json        ← Node.js dependencies and scripts
├── config/             ← Database connection logic (db.js)
├── controllers/        ← API logic (auth, transactions, friends, analytics, settings)
├── models/             ← Mongoose Schemas (User, Transaction, FriendDebt, Settings)
├── routes/             ← Express route definitions
├── middleware/         ← JWT Protection & Global Error Handlers
│
├── assets/
│   ├── images/         
│   └── icons/          
│
└── README.md           ← Project Documentation
```

---

## 🛠️ Tech Stack

| Layer      | Technology        | Details                                      |
|------------|-------------------|----------------------------------------------|
| Markup     | HTML5             | Semantic structure across 9 distinct views   |
| Styling    | CSS3              | Pure CSS, Custom Variables, Glassmorphism    |
| Logic      | Vanilla JS        | DOM manipulation, Observers, Event Listeners |
| Backend    | Node.js & Express | RESTful architecture, built-in CORS, and JWT |
| Database   | MongoDB Atlas     | NoSQL cloud database powered by Mongoose     |

---

## 🚀 Backend API Specification

This document outlines the data models and API endpoints implemented in the backend of FinTrack. The backend is a stateless RESTful API that securely uses JSON Web Tokens (JWT) for authentication.

### Authentication Flow

1.  A new user signs up via `POST /api/auth/signup`. The server validates the data, hashes the password, creates a new `User` record, and returns a JWT.
2.  An existing user logs in via `POST /api/auth/login`. The server validates credentials and returns a JWT.
3.  The frontend stores this JWT (e.g., in `localStorage` or a secure cookie).
4.  For all subsequent protected API calls, the frontend must include the token in the `Authorization` header: `Authorization: Bearer <your_jwt>`.
5.  The backend will have a middleware to verify this token on protected routes and attach the authenticated user's ID to the request object.

---

### Data Models

#### 1. User

Represents a registered user account.

| Field              | Type      | Description                                       | Notes                               |
| ------------------ | --------- | ------------------------------------------------- | ----------------------------------- |
| `id`               | `UUID`    | Unique identifier for the user.                   | Primary Key                         |
| `fullName`         | `String`  | The user's full name.                             | Required on signup                  |
| `email`            | `String`  | The user's email address.                         | Required, unique, indexed           |
| `password`         | `String`  | Hashed user password.                             | Required, use bcrypt                |
| `monthlyBudget`    | `Number`  | The user's self-defined monthly budget limit.     | Default: `5000`                     |
| `emergencyReserve` | `Number`  | The user's emergency fund goal.                   | Default: `2000`                     |
| `paymentSources`   | `Array`   | Array of preferred payment source strings.        | e.g., `['GPay', 'Cash']`            |
| `createdAt`        | `Timestamp` | Timestamp of when the user was created.         | Auto-generated                      |
| `updatedAt`        | `Timestamp` | Timestamp of the last update.                   | Auto-generated                      |

#### 2. Transaction

Represents a single financial event, either an expense or an income.

| Field     | Type      | Description                                       | Notes                               |
| --------- | --------- | ------------------------------------------------- | ----------------------------------- |
| `id`      | `UUID`    | Unique identifier for the transaction.            | Primary Key                         |
| `userId`  | `UUID`    | Foreign key linking to the `User` model.          | Required, indexed                   |
| `title`   | `String`  | A description of the transaction.                 | e.g., "Hostel Snacks Refill"        |
| `amount`  | `Number`  | The monetary value of the transaction.            | **Negative for expenses**, positive for income. |
| `type`    | `Enum`    | The type of transaction.                          | `'expense'` or `'income'`           |
| `category`| `String`  | The category of the transaction.                  | e.g., "Food & Snacks", "Pocket Money" |
| `method`  | `String`  | The payment method used.                          | e.g., "UPI", "Cash", "Bank Transfer" |
| `date`    | `Timestamp` | The date the transaction occurred.              | Provided by user, defaults to `now()` |
| `createdAt`| `Timestamp`| Timestamp of when the record was created.      | Auto-generated                      |

#### 3. FriendDebt

Represents money owed to the user from a friend.

| Field     | Type      | Description                                       | Notes                               |
| --------- | --------- | ------------------------------------------------- | ----------------------------------- |
| `id`      | `UUID`    | Unique identifier for the debt record.            | Primary Key                         |
| `userId`  | `UUID`    | Foreign key linking to the `User` model.          | Required, indexed                   |
| `name`    | `String`  | The name of the friend.                           | e.g., "Rahul"                       |
| `reason`  | `String`  | The reason for the debt.                          | e.g., "Movie plan split"            |
| `total`   | `Number`  | The total amount of the original debt.            |                                     |
| `returned`| `Number`  | The amount that has been returned so far.         | Default: `0`                        |
| `createdAt`| `Timestamp`| Timestamp of a record's creation.               | Auto-generated                      |
| `updatedAt`| `Timestamp`| Timestamp of the last update (e.g., a return). | Auto-generated                      |

---

### API Endpoints

All endpoints should be prefixed with `/api`.

#### Authentication Endpoints (`/auth`)

| Method | Path             | Auth? | Description          | Request Body                               | Success Response (200/201)                 | Error Response (4xx)                       |
| ------ | ---------------- | ----- | -------------------- | ------------------------------------------ | ------------------------------------------ | ------------------------------------------ |
| `POST` | `/signup`        | No    | Register a new user. | `{ fullName, email, password }`            | `{ token, user: { id, fullName, email } }` | `{ message: "Email already in use." }`     |
| `POST` | `/login`         | No    | Log in an existing user. | `{ email, password }`                      | `{ token, user: { id, fullName, email } }` | `{ message: "Invalid credentials." }`      |
| `GET`  | `/me`            | Yes   | Get current authenticated user details. | -                                          | `{ user: { id, fullName, email, ... } }`   | `{ message: "Unauthorized." }`             |

#### Transaction Endpoints (`/transactions`)

| Method   | Path             | Auth? | Description                               | Request Body                               | Success Response (200/201)                 |
| -------- | ---------------- | ----- | ----------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `GET`    | `/`              | Yes   | Get all transactions for the user.        | -                                          | `[Transaction]`                            |
| `POST`   | `/`              | Yes   | Create a new transaction.                 | `{ title, amount, type, category, method, date }` | `Transaction` (the new object)             |
| `PUT`    | `/:id`           | Yes   | Update a transaction.                     | `{ title?, amount?, ... }`                 | `Transaction` (the updated object)         |
| `DELETE` | `/:id`           | Yes   | Delete a transaction.                     | -                                          | `204 No Content`                           |

#### Friend Debt Endpoints (`/friends`)

| Method   | Path             | Auth? | Description                               | Request Body                               | Success Response (200/201)                 |
| -------- | ---------------- | ----- | ----------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `GET`    | `/`              | Yes   | Get all friend debts for the user.        | -                                          | `[FriendDebt]`                             |
| `POST`   | `/`              | Yes   | Create a new friend debt record.          | `{ name, reason, total, returned? }`       | `FriendDebt` (the new object)              |
| `PUT`    | `/:id`           | Yes   | Update a debt (e.g., record a payment).   | `{ returned }`                             | `FriendDebt` (the updated object)          |
| `DELETE` | `/:id`           | Yes   | Delete a friend debt record.              | -                                          | `204 No Content`                           |

#### User & Settings Endpoints (`/user`)

| Method   | Path             | Auth? | Description                               | Request Body                               | Success Response (200)                     |
| -------- | ---------------- | ----- | ----------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `GET`    | `/settings`      | Yes   | Get user's settings.                      | -                                          | `{ monthlyBudget, emergencyReserve, ... }` |
| `PUT`    | `/settings`      | Yes   | Update user's settings.                   | `{ monthlyBudget?, emergencyReserve?, ... }` | `{ monthlyBudget, ... }` (updated settings) |
| `DELETE` | `/data`          | Yes   | **DANGER:** Delete all data for the user. | -                                          | `204 No Content`                           |

---

---

## 🌍 Production Deployment
- **Frontend:** Hosted on **Netlify** for lightning-fast global edge delivery.
- **Backend:** Hosted on **Render** (Node Web Service) for secure, scalable API routing.
- **Database:** Hosted on **MongoDB Atlas** (Cloud DB).

*Built as a visually stunning, resume-ready Full-Stack application.*
