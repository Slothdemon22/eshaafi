## - Medical Appointment Booking System

A full-stack medical appointment booking system built with Next.js (Frontend) and Node.js/Express (Backend) with PostgreSQL database.

##  Project Structure

```
eshaafi/
├── backend/                 # Node.js/Express API server
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middlewares/    # Authentication & authorization
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   └── index.js        # Server entry point
│   └── package.json
├── frontend/               # Next.js React application
│   ├── app/               # App router pages
│   ├── components/        # Reusable React components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utility functions
│   └── package.json
└── README.md
```

##  Features

### User Management
- User registration and authentication
- Role-based access (Patient, Doctor, Admin)
- Profile management
- Password change functionality

### Doctor Features
- Doctor application system
- Availability management
- Appointment scheduling
- Prescription management
- Profile management

### Patient Features
- Browse available doctors
- Book appointments
- View appointment history
- Access prescriptions

### Admin Features
- User management
- Doctor application approval/rejection
- System statistics
- User profile management

##  Tech Stack

### Backend
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with cookies
- **Password Hashing**: bcrypt
- **CORS**: Cross-origin resource sharing enabled

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Lucide React icons
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Animations**: Framer Motion

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** (recommended)
- **PostgreSQL** database (see setup instructions below)
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd eshaafi
```

### 2. PostgreSQL Database Setup

#### Option 1: Local PostgreSQL Installation

##### Windows
```bash
# Download and install from official website
# https://www.postgresql.org/download/windows/

# Or use Chocolatey
choco install postgresql

# Or use WSL2 with Ubuntu
wsl --install Ubuntu
# Then follow Linux instructions
```

##### macOS
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Or download from official website
# https://www.postgresql.org/download/macosx/
```

##### Linux (Ubuntu/Debian)
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database
sudo -u postgres psql
CREATE DATABASE eshaafi_db;
CREATE USER eshaafi_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE eshaafi_db TO eshaafi_user;
\q
```

#### Option 2: Docker PostgreSQL

```bash
# Create a Docker container for PostgreSQL
docker run --name eshaafi-postgres \
  -e POSTGRES_DB=eshaafi_db \
  -e POSTGRES_USER=eshaafi_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15

# To stop the container
docker stop eshaafi-postgres

# To start the container again
docker start eshaafi-postgres
```

#### Option 3: Cloud PostgreSQL Services

##### Railway (Recommended for Development)
```bash
# 1. Go to https://railway.app/
# 2. Sign up with GitHub
# 3. Create new project
# 4. Add PostgreSQL service
# 5. Copy the DATABASE_URL from the Connect tab
```

##### Supabase (Free Tier Available)
```bash
# 1. Go to https://supabase.com/
# 2. Create new project
# 3. Go to Settings > Database
# 4. Copy the connection string
# 5. Format: postgresql://postgres:[password]@[host]:5432/postgres
```

##### Neon (Serverless PostgreSQL)
```bash
# 1. Go to https://neon.tech/
# 2. Create new project
# 3. Copy the connection string from dashboard
# 4. Format: postgresql://[user]:[password]@[host]/[database]
```

##### PlanetScale (MySQL Compatible)
```bash
# Note: Requires schema changes for MySQL compatibility
# 1. Go to https://planetscale.com/
# 2. Create new database
# 3. Use the connection string provided
```

##### AWS RDS
```bash
# 1. Go to AWS Console > RDS
# 2. Create PostgreSQL instance
# 3. Configure security groups
# 4. Get connection details from endpoint
```

##### Google Cloud SQL
```bash
# 1. Go to Google Cloud Console > SQL
# 2. Create PostgreSQL instance
# 3. Configure connection settings
# 4. Get connection string from overview
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

#### Environment Variables (Backend)

Create a `.env` file in the `backend/` directory:

```env
# Database (Choose one based on your setup)

# Local PostgreSQL
DATABASE_URL="postgresql://eshaafi_user:your_password@localhost:5432/eshaafi_db"

# Docker PostgreSQL
DATABASE_URL="postgresql://eshaafi_user:your_password@localhost:5432/eshaafi_db"

# Railway
DATABASE_URL="postgresql://postgres:password@containers-us-west-XX.railway.app:XXXX/railway"

# Supabase
DATABASE_URL="postgresql://postgres:[password]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"

# Neon
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Server Port
PORT=5000

# Cookie Secret
COOKIE_SECRET="your-cookie-secret"
```

#### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# or
pnpm install

# Set up environment variables
cp .env.example .env.local
```

#### Environment Variables (Frontend)

Create a `.env.local` file in the `frontend/` directory:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URI=http://localhost:5000
```

## 🚀 Running the Application

### Development Mode

#### Backend
```bash
cd backend
npm run dev
```
The backend server will start on `http://localhost:5000`

#### Frontend
```bash
cd frontend
npm run dev
# or
pnpm dev
```
The frontend application will start on `http://localhost:3000`

### Database Connection Verification

To verify your database connection:

```bash
# Test connection with Prisma
cd backend
npx prisma db pull

# Or test with psql (if using local PostgreSQL)
psql -h localhost -U eshaafi_user -d eshaafi_db
```

### Production Build

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require a JWT token sent via HTTP-only cookies.

### User Routes (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/change-password` | Change user password | Yes |
| GET | `/appointments` | Get user appointments | Yes |
| GET | `/appointments/:id` | Get specific appointment | Yes |
| GET | `/getUsers` | Get all users (Admin) | Yes (Admin) |
| PUT | `/users/:id` | Edit user (Admin) | Yes (Admin) |
| DELETE | `/users/:id` | Delete user (Admin) | Yes (Admin) |

### Doctor Routes (`/api/doctor`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/apply` | Submit doctor application | No |
| GET | `/all` | Get all doctors for booking | No |
| GET | `/profile` | Get doctor profile | Yes (Doctor) |
| PUT | `/profile` | Update doctor profile | Yes (Doctor) |
| GET | `/appointments` | Get doctor appointments | Yes (Doctor) |
| GET | `/availability` | Get doctor availability | Yes (Doctor) |
| POST | `/addAvailability` | Add availability slot | Yes (Doctor) |
| POST | `/availability/slots` | Add multiple slots | Yes (Doctor) |
| DELETE | `/availability/:slotId` | Delete availability slot | Yes (Doctor) |
| GET | `/availability/bookings` | Get availability with bookings | No |

### Booking Routes (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/book` | Book an appointment | Yes |
| DELETE | `/deleteBooking/:id` | Delete appointment | Yes |
| GET | `/getBooking/:id` | Get booking details | Yes |
| PUT | `/changeBookingStatus` | Change booking status | Yes |
| POST | `/prescription` | Create prescription | Yes |
| GET | `/prescription/:id` | Get prescription | Yes |
| PUT | `/prescription/:id` | Update prescription | Yes |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/addUser` | Add new user | Yes (Admin) |
| GET | `/applications` | Get doctor applications | Yes (Admin) |
| POST | `/applications/:id/approve` | Approve application | Yes (Admin) |
| POST | `/applications/:id/reject` | Reject application | Yes (Admin) |
| GET | `/stats` | Get system statistics | Yes (Admin) |

## 🗄️ Database Schema

### Core Models

- **User**: Base user model with role-based access
- **Doctor**: Doctor-specific information and relationships
- **AvailabilitySlot**: Doctor's available time slots
- **Booking**: Appointment bookings between patients and doctors
- **Prescription**: Medical prescriptions for appointments
- **DoctorApplication**: Pending doctor applications

### Relationships

- Users can have one Doctor profile
- Doctors have many AvailabilitySlots and Bookings
- Bookings belong to both Doctor and Patient (User)
- Prescriptions belong to Bookings
- DoctorApplications are standalone pending applications

##  Authentication & Authorization

### JWT Token System
- Tokens are stored in HTTP-only cookies for security
- Automatic token refresh mechanism
- Role-based middleware protection

### Middleware
- `authMiddleware`: Verifies JWT token
- `adminMiddleware`: Ensures admin role access
- `doctorMiddleware`: Ensures doctor role access

##  Frontend Architecture

### App Router Structure
```
app/
├── admin/           # Admin dashboard pages
├── doctor/          # Doctor-specific pages
├── patient/         # Patient-specific pages
├── appointments/    # Appointment management
├── book-appointment/ # Appointment booking
├── login/          # Authentication
├── register/       # User registration
└── layout.tsx      # Root layout
```

### Key Components
- **AuthContext**: Global authentication state
- **Navigation**: Role-based navigation
- **ProfileRedirect**: Automatic role-based redirects
- **UI Components**: Reusable Tailwind components

##  Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm run lint
npm test
```

## 📦 Deployment

### Backend Deployment
1. Set up PostgreSQL database (use cloud options from above)
2. Configure environment variables
3. Run database migrations
4. Deploy to your preferred platform (Heroku, Railway, etc.)

### Frontend Deployment
1. Configure environment variables
2. Build the application
3. Deploy to Vercel, Netlify, or your preferred platform

### Production Database Recommendations

For production, consider these cloud PostgreSQL options:

- **Railway**: Easy deployment with automatic scaling
- **Supabase**: Full-featured with real-time capabilities
- **Neon**: Serverless with automatic scaling
- **AWS RDS**: Enterprise-grade with high availability
- **Google Cloud SQL**: Managed service with automatic backups

### Environment Variables for Production

```env
# Production Database (example with Railway)
DATABASE_URL="postgresql://postgres:password@containers-us-west-XX.railway.app:XXXX/railway"

# Production JWT Secret (use a strong, unique secret)
JWT_SECRET="your-production-jwt-secret-key-here"

# Production Cookie Secret
COOKIE_SECRET="your-production-cookie-secret"

# Frontend Production Backend URL
NEXT_PUBLIC_BACKEND_URI="https://your-backend-domain.com"
```

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

##  License

This project is licensed under the ISC License.

##  Support

For support and questions:
- Create an issue in the repository
- Contact the development team

##  Version History

- **v1.0.0**: Initial release with core functionality
- Basic user management
- Doctor application system
- Appointment booking
- Prescription management
