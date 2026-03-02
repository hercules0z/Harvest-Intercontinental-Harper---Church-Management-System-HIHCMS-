# Harvest Intercontinental -Harper  Church Management System (HIPCMS)

Enterprise-grade Church CRM Platform built for scalability, security, and multi-campus operations.

---

## 📌 Project Overview

HIPCMS is a multi-tenant Church Management System designed to manage:

- Membership lifecycle
- Attendance tracking
- Contributions & Fund Accounting
- Events & Registration
- Payroll
- Facility Booking
- Communication (SMS/Email)
- Reporting & Analytics
- Multi-campus operations
- Member self-service portal

This platform is designed for:
- Individual churches
- Multi-campus churches
- Denominations
- SaaS deployment for multiple churches

---

# 🏗️ Architecture Overview

## Backend
- Django
- Django REST Framework
- PostgreSQL
- Redis
- Celery
- JWT Authentication
- Docker

## Frontend
- React (Next.js recommended)
- TailwindCSS or MUI
- React Query

## DevOps
- Docker & Docker Compose
- Nginx
- Gunicorn
- CI/CD (GitHub Actions)
- Cloud Deployment Hostinger 

---

# 📂 Project Structure

```
HIPCMS/
│
├── backend/
│   ├── config/
│   ├── apps/
│   │   ├── accounts/
│   │   ├── churches/
│   │   ├── members/
│   │   ├── attendance/
│   │   ├── contributions/
│   │   ├── events/
│   │   ├── payroll/
│   │   ├── facilities/
│   │   └── communications/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── package.json
│
├── docker-compose.yml
├── .env
└── README.md
```

---

# 🚀 Core Modules

## 1. Membership Management
- Member profiles
- Household grouping
- Baptism & membership status
- Ministry assignments
- Activity timeline
- Member directory

## 2. Attendance
- Service attendance
- Event attendance
- Children check-in/out
- Attendance analytics

## 3. Contributions
- Tithes & offerings
- Fund categorization
- Recurring donations
- Online giving
- Contribution statements
- Financial reports

## 4. Events
- Event creation
- Registration
- Capacity management
- Payment integration
- Attendance tracking

## 5. Payroll
- Staff management
- Salary configuration
- Deductions & allowances
- Payslip generation

## 6. Facilities
- Room booking
- Equipment booking
- Calendar management

## 7. Communication
- Bulk SMS
- Bulk Email
- Group messaging
- Automated notifications

---

# 🔐 User Roles

| Role | Access Level |
|------|-------------|
| Super Admin | Platform-level control |
| Church Admin | Full church access |
| Finance Officer | Contributions & accounting |
| Pastor | Member & attendance visibility |
| Ministry Leader | Ministry-level access |
| HR Officer | Payroll management |
| Check-in Staff | Attendance only |
| Member | Self-service portal |

---

# 🧠 Database Entities (Core)

- Church
- Campus
- User
- Role
- Member
- Household
- Ministry
- Service
- Attendance
- Fund
- Contribution
- Event
- EventRegistration
- Payroll
- FacilityBooking

---

# 🔄 System Workflow

## Membership Lifecycle
Visitor → Follow-up → Membership Class → Active Member → Inactive/Archived

## Weekly Service
Service Created → Attendance Recorded → Contributions Logged → Reports Generated → Follow-up Initiated

## Contribution Flow
Member Donation → Fund Allocation → Receipt Generated → Financial Report Update

## Payroll Cycle
Salary Setup → Monthly Processing → Payslip Generated → Accounting Updated

---

# 🛠️ Local Development Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/hipcms.git
cd hipcms
```

---

## 2️⃣ Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```



## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

# 🐳 Docker Setup (Recommended)

```bash
docker-compose up --build
```
---

# 📜 License

Proprietary – Internal Church / SaaS Use Only

---

# 👨‍💻 Maintainer

Lead Architect: Duah Jeremiah Leakpor  
Version: 1.0.0  
Status: In Development
