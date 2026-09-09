# 🐝 BudgetBee — Personal Finance Manager

BudgetBee is a full-stack personal finance management web application designed to help users track income, manage expenses, monitor monthly spending, analyze financial activity, and generate downloadable monthly financial reports from a modern and responsive dashboard.

The application is built using **React, TypeScript, Node.js, Express.js, and MongoDB Atlas**, with the frontend deployed on **Vercel** and the backend deployed on **Render**.

---

## 🌐 Live Application

### Frontend

**Vercel**

```text
https://bedget-bee.vercel.app
```

> The frontend domain may later be updated to match the final BudgetBee branding.

### Backend API

**Render**

```text
https://budgetbee-uuev.onrender.com
```

---

# ✨ Key Features

## 🔐 User Authentication

BudgetBee provides secure user authentication so that each user has access only to their own financial information.

Authentication features include:

- User registration
- User login
- Secure password hashing
- JWT-based authentication
- Protected dashboard
- Authenticated API requests
- User-specific financial records
- Sign out functionality
- Session management

---

## 💰 Income Management

Users can record income by providing:

- Description
- Amount
- Income type
- Date
- Optional notes

Available income types include:

- Tuition
- Job
- Business
- Other

The user's total monthly income automatically determines the available monthly spending limit.

---

## 💸 Expense Management

Users can record expenses using:

- Description
- Amount
- Date
- Expense category
- Payment method
- Optional notes

### Expense Categories

- Food
- Rent
- Shopping
- Transportation
- Utilities
- Entertainment
- Healthcare
- Education
- Investment
- Other

### Payment Methods

- Cash
- Credit Card
- Debit Card
- Bank Transfer
- Mobile Banking
- bKash
- Nagad

---

## 📊 Monthly Spending Control

BudgetBee automatically uses a user's monthly income as their monthly spending limit.

```text
Monthly Spending Limit = Total Monthly Income
```

Remaining balance is calculated as:

```text
Remaining Balance = Monthly Income - Monthly Expenses
```

Example:

```text
Monthly Income:     ৳50,000
Monthly Expenses:   ৳32,000
Remaining Balance:  ৳18,000
Income Used:             64%
```

BudgetBee also provides spending warnings.

### Spending Status

```text
Below 80%   → Normal
80%+        → Warning
90%+        → Critical Warning
100%        → Spending Limit Reached
```

The system prevents users from adding expenses that exceed their available monthly balance.

---

## ✏️ Transaction Management

BudgetBee supports complete CRUD functionality for financial records.

Users can:

- Create income transactions
- Create expense transactions
- View transaction history
- Edit transactions
- Delete transactions
- Confirm transaction deletion
- Update income information
- Update expense information

Whenever a transaction is edited or deleted, BudgetBee automatically recalculates the monthly financial summary.

---

## 📈 Financial Analytics

BudgetBee provides interactive income and expense visualizations using **Recharts**.

Users can switch between:

### Weekly View

Displays financial activity from:

```text
Monday → Current Day
```

### Monthly View

Displays financial activity from:

```text
Day 1 → Current Day
```

The financial analytics section includes:

- Total income
- Total expenses
- Remaining balance
- Number of transactions
- Weekly financial trend
- Monthly financial trend
- Income visualization
- Expense visualization

---

## 📄 Monthly PDF Reports

BudgetBee allows users to generate downloadable monthly expense reports.

The report includes:

- User name
- Report month
- Report generation date
- Total monthly income
- Total monthly expenses
- Remaining balance
- Percentage of income used
- Expense transaction details
- Expense category
- Payment method
- Notes
- Total monthly expenditure

PDF reports are generated using:

- `jsPDF`
- `jspdf-autotable`

`BDT` is used inside generated PDF reports for better compatibility with default PDF fonts.

---

## ☀️🌙 Theme System

BudgetBee supports two visual themes:

- ☀️ Day Mode
- 🌙 Night Mode

The selected theme is saved locally so the user's preference remains available between sessions.

---

## 👤 User Interface

BudgetBee includes a modern and responsive user interface featuring:

- Authentication page
- Responsive dashboard
- User profile menu
- Income/Expense transaction forms
- Transaction table
- Financial analytics
- Spending progress bar
- Confirmation modals
- Delete confirmation
- Loading animations
- Success notifications
- Theme switching
- PDF report generation
- Responsive layouts

---

# 🛠️ Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe frontend development |
| Vite | Development server and build tool |
| React Router | Client-side routing |
| Recharts | Financial data visualization |
| jsPDF | PDF report generation |
| jspdf-autotable | PDF transaction tables |
| CSS | Styling, responsiveness and themes |

---

## Backend

| Technology | Purpose |
|---|---|
| Node.js | Backend runtime |
| Express.js | REST API |
| TypeScript | Type-safe backend development |
| MongoDB | Database |
| Mongoose | MongoDB object modelling |
| bcryptjs | Secure password hashing |
| JSON Web Token | User authentication |
| express-rate-limit | Request rate limiting |
| CORS | Frontend/backend communication |
| dotenv | Environment variable management |

---

## Database

| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted database |
| Mongoose | Database schema and query management |

---

## Deployment

| Service | Purpose |
|---|---|
| Vercel | Frontend deployment |
| Render | Backend API deployment |
| MongoDB Atlas | Cloud database |

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │        USER         │
                         │ Browser / Computer  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │     REACT FRONTEND      │
                       │                         │
                       │ React                   │
                       │ TypeScript              │
                       │ Vite                    │
                       │ React Router            │
                       │ Recharts                │
                       │ jsPDF                   │
                       └────────────┬────────────┘
                                    │
                                    │ HTTPS
                                    │ REST API
                                    │ JWT
                                    ▼
                       ┌─────────────────────────┐
                       │     EXPRESS BACKEND     │
                       │                         │
                       │ Node.js                 │
                       │ Express.js              │
                       │ TypeScript              │
                       │ JWT Authentication      │
                       │ bcryptjs                │
                       │ Validation              │
                       │ Spending Logic          │
                       └────────────┬────────────┘
                                    │
                                    │ Mongoose
                                    ▼
                       ┌─────────────────────────┐
                       │      MONGODB ATLAS      │
                       │                         │
                       │ Users                   │
                       │ Financial Records       │
                       └─────────────────────────┘
```

---

# 🔐 Authentication Architecture

```text
User
 │
 │ Register / Login
 ▼
React Frontend
 │
 │ Email + Password
 ▼
Express Authentication API
 │
 ├── Validate Input
 │
 ├── Hash Password with bcryptjs
 │
 ├── Verify Password
 │
 └── Generate JWT
 │
 ▼
JWT Returned to Frontend
 │
 │
 ▼
Authenticated API Requests
 │
 │ Authorization: Bearer <token>
 ▼
Authentication Middleware
 │
 ├── Verify JWT
 └── Identify User
 │
 ▼
Protected Financial Routes
 │
 ▼
MongoDB Atlas
```

---

# ☁️ Deployment Architecture

```text
┌────────────────────────────┐
│           Vercel           │
│                            │
│    BudgetBee React App     │
└─────────────┬──────────────┘
              │
              │ HTTPS
              │ REST API
              ▼
┌────────────────────────────┐
│           Render           │
│                            │
│   Node.js / Express API    │
└─────────────┬──────────────┘
              │
              │ Mongoose
              ▼
┌────────────────────────────┐
│       MongoDB Atlas        │
│                            │
│ Users + Financial Records  │
└────────────────────────────┘
```

---

# 📂 Project Structure

```text
BudgetBee/
│
├── client/
│   └── BudgetBee/
│       │
│       ├── public/
│       │
│       ├── src/
│       │   │
│       │   ├── contexts/
│       │   │   ├── auth-context.tsx
│       │   │   └── financial-record-context.tsx
│       │   │
│       │   ├── pages/
│       │   │   │
│       │   │   ├── auth/
│       │   │   │   ├── index.tsx
│       │   │   │   └── jwt-auth.css
│       │   │   │
│       │   │   └── dashboard/
│       │   │       ├── index.tsx
│       │   │       ├── financial-record-form.tsx
│       │   │       ├── financial-record-list.tsx
│       │   │       ├── financial-summary-chart.tsx
│       │   │       ├── financial-record-list.css
│       │   │       └── jwt-account.css
│       │   │
│       │   ├── App.tsx
│       │   ├── App.css
│       │   ├── index.css
│       │   └── main.tsx
│       │
│       ├── .env.local
│       ├── .gitignore
│       ├── index.html
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── vercel.json
│
├── server/
│   │
│   ├── src/
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── financial-records.ts
│   │   │
│   │   ├── schema/
│   │   │   ├── user.ts
│   │   │   └── financial-record.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── README.md
└── package-lock.json
```

> The exact structure may change slightly as BudgetBee continues to be developed.

---

# 🔄 Application Flow

```text
User Opens BudgetBee
        │
        ▼
Authentication Check
        │
   ┌────┴─────────┐
   │              │
No Session    Authenticated
   │              │
   ▼              ▼
Auth Page      Dashboard
   │              │
   │              ├── Add Income
   │              │
   │              ├── Add Expense
   │              │
   │              ├── View Records
   │              │
   │              ├── Edit Records
   │              │
   │              ├── Delete Records
   │              │
   │              ├── View Analytics
   │              │
   │              └── Download PDF
   │
   ├── Register
   │
   └── Login
```

---

# 💾 Data Models

## User Model

A user contains information similar to:

```ts
interface User {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
}
```

Passwords are never stored as plain text.

Instead, BudgetBee stores a secure password hash generated using `bcryptjs`.

---

## Financial Record Model

A financial transaction contains information similar to:

```ts
interface FinancialRecord {
  _id?: string;

  userID?: string;

  description: string;

  amount: number;

  transactionType:
    | "Income"
    | "Expense";

  date: string;

  category?: string;

  paymentMethod?: string;

  incomeType?: string;

  notes?: string;
}
```

---

# 🗄️ Example Database Records

## User

```json
{
  "_id": "USER_DATABASE_ID",
  "name": "BudgetBee User",
  "email": "user@example.com",
  "passwordHash": "$2b$..."
}
```

---

## Income

```json
{
  "userID": "USER_DATABASE_ID",
  "description": "Monthly Salary",
  "amount": 50000,
  "transactionType": "Income",
  "date": "2026-09-01",
  "incomeType": "Job",
  "notes": "September salary"
}
```

---

## Expense

```json
{
  "userID": "USER_DATABASE_ID",
  "description": "Groceries",
  "amount": 2500,
  "transactionType": "Expense",
  "date": "2026-09-03",
  "category": "Food",
  "paymentMethod": "Cash",
  "notes": "Weekly grocery shopping"
}
```

---

# 🔌 REST API Architecture

Production API:

```text
https://budgetbee-uuev.onrender.com
```

---

# 🔐 Authentication API

## Register User

```http
POST /auth/register
```

Example:

```json
{
  "name": "BudgetBee User",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

---

## Login

```http
POST /auth/login
```

Example:

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

A successful login returns a JSON Web Token that is used for authenticated requests.

---

## Get Current User

```http
GET /auth/me
```

Requires:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 💳 Financial Records API

All financial record routes require authentication.

---

## Get User Financial Records

```http
GET /financial-records/getAllByUserID/:userId
```

Returns financial records associated with the authenticated user.

---

## Get Record by ID

```http
GET /financial-records/getById/:id
```

---

## Create Transaction

```http
POST /financial-records/create
```

### Example Income Request

```json
{
  "description": "Salary",
  "amount": 30000,
  "transactionType": "Income",
  "date": "2026-09-01",
  "incomeType": "Job",
  "notes": "Monthly salary"
}
```

### Example Expense Request

```json
{
  "description": "Groceries",
  "amount": 2500,
  "transactionType": "Expense",
  "date": "2026-09-02",
  "category": "Food",
  "paymentMethod": "Cash",
  "notes": "Weekly groceries"
}
```

---

## Update Transaction

```http
PUT /financial-records/update/:id
```

---

## Delete Transaction

```http
DELETE /financial-records/delete/:id
```

---

# 🧠 Spending Limit Logic

BudgetBee treats monthly income as the maximum available amount for monthly expenses.

```text
Monthly Income
      │
      ▼
Monthly Spending Limit
      │
      ▼
Current Expenses
      │
      ▼
Remaining Balance
```

Formula:

```text
Remaining Balance =
Total Monthly Income - Total Monthly Expenses
```

Before allowing a new expense, BudgetBee checks:

```text
Current Expenses + New Expense <= Monthly Income
```

If the condition is false, the expense is rejected.

---

# ⚠️ Budget Warning Logic

```text
Expense Percentage =
(Monthly Expense / Monthly Income) × 100
```

Budget status:

```text
0% - 79.9%
    ↓
Normal Spending

80% - 89.9%
    ↓
Warning

90% - 99.9%
    ↓
Critical Warning

100%
    ↓
Monthly Spending Limit Reached
```

---

# 📊 Analytics Logic

Financial records are grouped according to their date and transaction type.

For each period:

```text
Income Records
      │
      ▼
Total Income

Expense Records
      │
      ▼
Total Expense

Total Income - Total Expense
      │
      ▼
Current Balance
```

### Weekly Analytics

```text
Monday → Current Day
```

### Monthly Analytics

```text
1st Day of Month → Current Day
```

---

# 📄 PDF Report Architecture

```text
MongoDB Financial Records
           │
           ▼
Financial Record Context
           │
           ▼
Current Month Records
           │
           ▼
Calculate Financial Summary
           │
           ▼
        jsPDF
           +
   jspdf-autotable
           │
           ▼
Monthly Financial Report
           │
           ▼
      Download PDF
```

---

# 🔒 Security Architecture

BudgetBee follows several security practices.

### Password Security

Passwords are never stored directly.

```text
User Password
     │
     ▼
bcryptjs
     │
     ▼
Password Hash
     │
     ▼
MongoDB
```

---

### JWT Authentication

After login:

```text
Valid Email + Password
         │
         ▼
Generate JWT
         │
         ▼
Return Token
         │
         ▼
Authenticated Request
         │
         ▼
JWT Middleware
         │
         ▼
Protected API
```

---

### Environment Variables

Sensitive information is stored outside the source code.

Examples include:

```text
MongoDB Connection String
JWT Secret
API URLs
Authentication Secrets
```

Environment files must never be committed to GitHub.

---

# ⚙️ Environment Variables

## Frontend

Create:

```text
client/BudgetBee/.env.local
```

Example:

```env
VITE_API_URL=http://localhost:3001
```

Production:

```env
VITE_API_URL=https://budgetbee-uuev.onrender.com
```

---

## Backend

Create:

```text
server/.env
```

Example:

```env
MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING

PORT=3001

JWT_SECRET=YOUR_SECURE_RANDOM_JWT_SECRET

CLIENT_URLS=http://localhost:5173,https://bedget-bee.vercel.app
```

> Never commit `.env` or `.env.local` files to GitHub.

---

# 💻 Running BudgetBee Locally

## Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Git
- MongoDB Atlas account

---

## 1. Clone the Repository

```bash
git clone https://github.com/Fardin1023/BudgetBee.git
```

Then enter the project:

```bash
cd BudgetBee
```

---

# 🖥️ Frontend Setup

Move into the frontend directory:

```bash
cd client/BudgetBee
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env.local
```

Add:

```env
VITE_API_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

# ⚙️ Backend Setup

Open another terminal.

Move into:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env
```

Add:

```env
MONGO_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING
PORT=3001
JWT_SECRET=YOUR_SECURE_RANDOM_SECRET
CLIENT_URLS=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The backend normally runs at:

```text
http://localhost:3001
```

---

# 🔑 Generate JWT Secret

A secure JWT secret can be generated using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the generated value into:

```env
JWT_SECRET=YOUR_GENERATED_SECRET
```

Do not share or commit this secret.

---

# 🏗️ Production Build

## Frontend

```bash
cd client/BudgetBee
npm run build
```

Vite generates the production application inside:

```text
dist/
```

---

## Backend

```bash
cd server
npm run build
```

Then start the compiled backend:

```bash
npm start
```

---

# 🚀 Deployment

## Frontend — Vercel

Recommended Vercel configuration:

```text
Framework Preset:
Vite

Root Directory:
client/BudgetBee

Build Command:
npm run build

Output Directory:
dist
```

Production environment variable:

```env
VITE_API_URL=https://budgetbee-uuev.onrender.com
```

---

## Backend — Render

Recommended Render configuration:

```text
Language:
Node

Root Directory:
server

Build Command:
npm install && npm run build

Start Command:
npm start
```

Required environment variables:

```text
MONGO_URI
JWT_SECRET
CLIENT_URLS
```

Example:

```text
CLIENT_URLS=https://bedget-bee.vercel.app
```

---

# ☁️ MongoDB Atlas Configuration

BudgetBee uses MongoDB Atlas as its production database.

MongoDB stores:

```text
Users
  │
  ├── Name
  ├── Email
  └── Password Hash

Financial Records
  │
  ├── User ID
  ├── Description
  ├── Amount
  ├── Transaction Type
  ├── Date
  ├── Category
  ├── Payment Method
  ├── Income Type
  └── Notes
```

Render must be allowed to communicate with MongoDB Atlas through the Atlas Network Access configuration.

---

# 🔄 Development Workflow

BudgetBee follows a Git-based development and deployment workflow.

```text
Develop Feature
      │
      ▼
Test Locally
      │
      ▼
Run TypeScript Build
      │
      ▼
Commit Changes
      │
      ▼
Push to GitHub
      │
      ├─────────────────────┐
      ▼                     ▼
   Vercel                Render
      │                     │
      ▼                     ▼
Frontend Deploy       Backend Deploy
      │                     │
      └──────────┬──────────┘
                 ▼
        Production Testing
```

Typical Git commands:

```bash
git add .
git commit -m "Describe implemented feature"
git push
```

---

# 🧪 Testing Checklist

Before deploying a new BudgetBee version:

### Authentication

- [ ] User registration works
- [ ] User login works
- [ ] Invalid password is rejected
- [ ] Invalid email is rejected
- [ ] Protected dashboard redirects unauthenticated users
- [ ] Sign out works
- [ ] Authentication remains valid after refresh

### Financial Records

- [ ] Add income
- [ ] Add expense
- [ ] View transactions
- [ ] Edit income
- [ ] Edit expense
- [ ] Delete transaction
- [ ] Delete confirmation works

### Spending Limit

- [ ] Monthly income is calculated correctly
- [ ] Monthly expenses are calculated correctly
- [ ] Remaining balance is correct
- [ ] 80% warning works
- [ ] 90% warning works
- [ ] 100% warning works
- [ ] Expense above available balance is rejected

### Analytics

- [ ] Weekly chart works
- [ ] Monthly chart works
- [ ] Income total is correct
- [ ] Expense total is correct
- [ ] Balance is correct

### PDF

- [ ] PDF generation works
- [ ] Current month is correct
- [ ] Expense table is correct
- [ ] Income total is correct
- [ ] Expense total is correct
- [ ] Remaining balance is correct

### Interface

- [ ] Day theme works
- [ ] Night theme works
- [ ] Theme preference persists
- [ ] Modals work
- [ ] Loading states work
- [ ] Desktop layout works
- [ ] Mobile layout works

### Deployment

- [ ] Frontend production build succeeds
- [ ] Backend production build succeeds
- [ ] Vercel deployment succeeds
- [ ] Render deployment succeeds
- [ ] MongoDB connection succeeds
- [ ] Production frontend communicates with backend

---

# 📱 Responsive Design

BudgetBee is designed to support different screen sizes.

Responsive components include:

- Authentication page
- Dashboard
- Income and expense forms
- Financial records table
- Spending summary
- Financial charts
- Profile menu
- Confirmation modals
- PDF controls

---

# 🎯 Project Objectives

BudgetBee was developed to demonstrate practical full-stack software development concepts including:

- React frontend development
- TypeScript
- REST API development
- Express.js backend development
- MongoDB database integration
- Mongoose schemas
- CRUD operations
- User authentication
- JWT authorization
- Password hashing
- Protected routes
- Financial calculations
- Spending validation
- Data visualization
- Responsive UI design
- PDF generation
- Cloud database deployment
- Frontend deployment
- Backend deployment
- Environment variable management
- Git/GitHub development workflow

---

# 🔮 Future Improvements

Possible future features include:

- 🔍 Transaction search
- 🗂️ Advanced filters
- 📅 Date-range filtering
- 🏷️ Category-based filtering
- 📄 Transaction pagination
- 📊 Dashboard summary cards
- 🥧 Expense category pie chart
- 📈 Advanced financial analytics
- 🎯 Savings goals
- 💳 Category-specific budgets
- 📆 Custom monthly budgets
- 📁 CSV export
- 📊 Excel export
- 📄 Improved PDF reports
- 🔔 Financial notifications
- 📧 Email verification
- 🔑 Forgot password functionality
- 🔄 Password reset
- 🛡️ Improved authentication security
- 🍪 HttpOnly cookie-based authentication
- 📱 Better mobile optimization
- ⚡ Improved loading states
- ❌ Improved error handling
- 🐝 Custom BudgetBee favicon
- 🌐 Custom production domain

---

# 📌 Project Status

BudgetBee currently includes the major functionality required for a personal finance management platform.

```text
✅ Full-Stack Architecture
✅ Income Management
✅ Expense Management
✅ Transaction CRUD
✅ Monthly Spending Limit
✅ Spending Validation
✅ Budget Warnings
✅ Weekly Analytics
✅ Monthly Analytics
✅ Interactive Charts
✅ PDF Reports
✅ User Authentication
✅ User-Specific Data
✅ Protected Dashboard
✅ MongoDB Persistence
✅ Light Theme
✅ Dark Theme
✅ Responsive Dashboard
✅ Vercel Frontend Deployment
✅ Render Backend Deployment
✅ MongoDB Atlas Integration
```

---

# 📚 Core Concepts Demonstrated

This project demonstrates knowledge and implementation of:

```text
Frontend Development
        +
Backend Development
        +
Database Management
        +
Authentication
        +
REST APIs
        +
CRUD Operations
        +
Data Visualization
        +
Financial Logic
        +
Cloud Deployment
        =
BudgetBee
```

---

# 👨‍💻 Author

Developed as a full-stack web development project focused on personal finance management, secure authentication, financial analytics, and cloud deployment.

---

# 🐝 BudgetBee

> **Track smarter. Spend better. Build better financial habits.**
