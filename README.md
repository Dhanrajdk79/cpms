# Client & Project Management System (CPMS)

A full-stack web application designed to manage clients, projects, employees, tasks, comments and notifications from one centralized dashboard.

Built using React, Node.js, Express.js and MySQL.

---

# 1. Project Overview

CPMS provides a centralized platform where administrators, project managers, employees and clients can manage and monitor project activities.

The system includes secure authentication, role-based access control, project tracking, task assignment, automatic notifications and progress monitoring.

# 2. Technology Stack

## Frontend
- React 19
- Vite
- React Router
- Axios
- HTML5
- CSS3
- JavaScript

## Backend
- Node.js
- Express.js
- REST API
- JWT Authentication
- bcryptjs
- Express Validator

## Database
- MySQL 8
- mysql2

## Development Tools
- Visual Studio Code
- Git and GitHub
- MySQL Workbench / MySQL Command Line
- PowerShell

---

# 3. Main Functionalities

## Authentication
- User login and registration
- Password hashing using bcryptjs
- JWT-based authentication
- Protected routes
- User profile management
- Logout functionality

## Dashboard
- Role-based dashboards
- Total users and clients
- Total projects and tasks
- Completed and pending task statistics
- Project and task overview
- Recent project information

## Client Management
- Add new clients
- View client details
- Edit client information
- Delete clients
- Search and manage client records

## Project Management
- Create projects
- View project details
- Update project information
- Delete projects
- Assign project managers
- Set project start dates and deadlines
- Manage project status
- Track project progress

## Project Member Management
- Assign employees to projects
- View assigned project members
- Remove employees from projects
- Prevent duplicate assignments

## Task Management
- Create and assign tasks
- View task details
- Update task information
- Delete tasks
- Set task priority
- Set task deadlines
- Update task status
- Search and filter tasks
- Pagination and sorting
- Automatic project progress calculation

## Task Comments
- Add comments to tasks
- View task discussions
- Edit comments
- Delete comments
- Restrict comment access based on permissions

## Notifications
- Automatic notification when a task is assigned
- Notification when an employee updates task status
- Notification when a task is updated
- View notifications
- Mark individual notifications as read
- Mark all notifications as read
- Filter read and unread notifications
- Delete notifications

---

# 4. User Roles and Permissions

| Functionality | Admin | Project Manager | Employee | Client |
|---|---|---|---|---|
| Dashboard | Yes | Yes | Yes | Yes |
| Client Management | Yes | Yes | No | No |
| Project Management | All projects | Own projects | No | View |
| Task Management | All tasks | Own projects | Assigned tasks | View |
| Assign Employees | Yes | Own projects | No | No |
| Update Task Status | Yes | Yes | Own tasks | No |
| Task Comments | Yes | Yes | Accessible tasks | No |
| Notifications | Own notifications | Own notifications | Own notifications | Own notifications |

Access is controlled by the backend according to the authenticated user's role and permissions.

---

# 5. Demo Login Credentials

Use these accounts to test the application locally.

**Common demo password:** Test@12345

| Role | Email / Username | Password |
|---|---|---|
| Admin | admin@cpms.local | Test@12345 |
| Project Manager 1 | employee@example.com | Test@12345 |
| Project Manager 2 | manager2@example.com | Test@12345 |
| Employee | employee2@example.com | Test@12345 |
| Client | amit@abctech.com | Test@12345 |

### Demo Account Notes

- Admin can manage the overall system.
- Project Manager 1 manages projects assigned to user ID 1.
- Project Manager 2 manages projects assigned to user ID 5.
- Employee can view and update assigned tasks.
- Client can view information associated with their company.

**Security warning:** These are local test credentials. Do not use these passwords in a production environment. Change or disable demo accounts before public deployment. Never publish real production passwords.

---

# 6. Project Folder Structure

`	ext
cpms/
|
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- validators/
|   |-- .env.example
|   |-- package.json
|   |-- server.js
|
|-- frontend/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- services/
|   |-- .env.example
|   |-- package.json
|   |-- vite.config.js
|
|-- README.md
|-- package-lock.json
`

---

# 7. Installation and Setup

## Requirements

Install the following before running the project:

1. Node.js
2. npm
3. MySQL Server 8
4. Visual Studio Code

## Step 1: Clone the repository

`ash
git clone YOUR_GITHUB_REPOSITORY_URL
cd cpms
`

## Step 2: Database Setup

Start MySQL and create the database:

`sql
CREATE DATABASE client_project_management_db;
`

Create/import all required tables before starting the backend.

Required tables:

- users
- clients
- projects
- project_members
- tasks
- task_comments
- notifications

The database schema must match the application's models and controllers.

## Step 3: Backend Setup

Open a terminal:

`ash
cd backend
npm install
`

Create a .env file using .env.example as a reference.

Configure your own database credentials and JWT secret:

`env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=client_project_management_db
DB_PORT=3306
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=1d
`

Start the backend:

`ash
npm run dev
`

Backend URL:

http://localhost:5000

Health check:

http://localhost:5000/api/health

## Step 4: Frontend Setup

Open a second terminal:

`ash
cd frontend
npm install
`

Create a .env file using .env.example as a reference.

Configure:

`env
VITE_API_URL=http://localhost:5000/api
`

Start the frontend:

`ash
npm run dev
`

Open the local URL displayed in your terminal by Vite.

---

# 8. How to Use the Website

## Admin Workflow

1. Open the application.
2. Log in using the Admin credentials.
3. Open the Dashboard to view system statistics.
4. Open Clients to create and manage clients.
5. Open Projects to create projects.
6. Select a client and assign a project manager.
7. Open Tasks to create and assign tasks.
8. Manage project and task activities.
9. Open Notifications to view updates.

## Project Manager Workflow

1. Log in using a Project Manager account.
2. Open the Dashboard.
3. Create or view your projects.
4. Assign employees to your projects.
5. Create tasks and assign them to project members.
6. Monitor task progress.
7. View employee updates and notifications.

## Employee Workflow

1. Log in using the Employee account.
2. Open the Dashboard.
3. View assigned tasks.
4. Open a task to view its details.
5. Update the task status.
6. Add comments where permitted.
7. Check notifications for new assignments and updates.

## Client Workflow

1. Log in using the Client account.
2. Open the Dashboard.
3. View your company's project information.
4. Open Projects to view project details.
5. Open Tasks to view related task information.
6. Check notifications.

---

# 9. API Endpoints

Base URL:

http://localhost:5000/api

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/register | Register user |
| POST | /auth/login | Login |
| GET | /auth/profile | Get profile |

## Clients

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /clients | Create client |
| GET | /clients | Get all clients |
| GET | /clients/:id | Get client |
| PUT | /clients/:id | Update client |
| DELETE | /clients/:id | Delete client |

## Projects

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /projects | Create project |
| GET | /projects | Get projects |
| GET | /projects/:id | Get project |
| PUT | /projects/:id | Update project |
| DELETE | /projects/:id | Delete project |

## Project Members

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /projects/:projectId/members | Assign employee |
| GET | /projects/:projectId/members | View members |
| DELETE | /projects/:projectId/members/:userId | Remove employee |

## Tasks

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /tasks | Create task |
| GET | /tasks | Get tasks |
| GET | /tasks/:id | Get task |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |

## Comments

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /tasks/:taskId/comments | Add comment |
| GET | /tasks/:taskId/comments | Get comments |
| PUT | /comments/:id | Update comment |
| DELETE | /comments/:id | Delete comment |

## Notifications

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /notifications | Create notification |
| GET | /notifications | Get notifications |
| PATCH | /notifications/read-all | Mark all as read |
| PATCH | /notifications/:id/read | Mark as read |
| DELETE | /notifications/:id | Delete notification |

## Dashboard

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /dashboard | Get role-based dashboard |

All private endpoints require a valid JWT token in the Authorization header:

`	ext
Authorization: Bearer YOUR_JWT_TOKEN
`

---

# 10. Security Features

- Password hashing with bcryptjs
- JWT authentication
- Protected API routes
- Role-based authorization
- Project ownership validation
- Employee task access restrictions
- Parameterized SQL queries
- Environment variables for secrets
- Restricted access to user-specific notifications

---

# 11. Future Enhancements

- File and document uploads
- Email notifications
- Advanced analytics and reports
- Project attachments
- Real-time notifications
- Production cloud deployment

---

# 12. Author

Client & Project Management System

Full Stack Development Project

Technologies: React | Node.js | Express.js | MySQL

