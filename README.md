# Advanced Todo & Calendar Management System

A comprehensive backend API for managing todos and calendar events, similar to Google Calendar, built with Node.js, Express, Prisma, and MySQL.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based authentication with secure password hashing
- **Todo Management**: Create, read, update, and delete todos with:
  - Priority levels (LOW, MEDIUM, HIGH, URGENT)
  - Status tracking (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
  - Due dates and completion tracking
  - Sub-todos (hierarchical tasks)
  - Time estimation and actual time tracking
  
- **Calendar Events**: Full-featured event management with:
  - Event scheduling with start/end times
  - All-day event support
  - Event conflicts detection
  - Recurring events with RRULE support
  - Attendee management
  - Location tracking

- **Categories & Tags**: Organize todos and events with custom categories and tags
- **Reminders**: Set reminders for todos and events (EMAIL, PUSH, SMS)
- **Analytics**: Dashboard and productivity analytics

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd todo_alarm-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/todo_calendar_db"
   JWT_SECRET="your-secret-key-change-this-in-production"
   JWT_EXPIRE="7d"
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up the database**
   
   Create the MySQL database:
   ```bash
   mysql -u root -p
   CREATE DATABASE todo_calendar_db;
   exit;
   ```

5. **Run Prisma migrations**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

6. **Start the server**
   
   Development mode:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "timezone": "America/New_York"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "timezone": "UTC"
}
```

---

### Todos

#### Create Todo
```http
POST /api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2025-10-20T10:00:00Z",
  "categoryId": "category-uuid",
  "tagIds": ["tag-uuid-1", "tag-uuid-2"],
  "estimatedTime": 120,
  "reminderTime": "2025-10-20T09:00:00Z"
}
```

#### Get All Todos
```http
GET /api/todos?status=PENDING&priority=HIGH&page=1&limit=50
Authorization: Bearer <token>
```

Query parameters:
- `status`: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- `priority`: LOW, MEDIUM, HIGH, URGENT
- `categoryId`: Filter by category
- `tagId`: Filter by tag
- `search`: Search in title and description
- `sortBy`: createdAt, dueDate, priority
- `order`: asc, desc
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

#### Get Todo by ID
```http
GET /api/todos/:id
Authorization: Bearer <token>
```

#### Get Todos by Date Range
```http
GET /api/todos/date-range?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer <token>
```

#### Update Todo
```http
PUT /api/todos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "status": "IN_PROGRESS",
  "actualTime": 150
}
```

#### Delete Todo
```http
DELETE /api/todos/:id
Authorization: Bearer <token>
```

---

### Calendar Events

#### Create Event
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Team Meeting",
  "description": "Weekly sync meeting",
  "location": "Conference Room A",
  "startTime": "2025-10-20T14:00:00Z",
  "endTime": "2025-10-20T15:00:00Z",
  "isAllDay": false,
  "categoryId": "category-uuid",
  "tagIds": ["tag-uuid-1"],
  "attendees": [
    {
      "email": "colleague@example.com",
      "name": "Jane Smith"
    }
  ],
  "reminderTime": "2025-10-20T13:30:00Z",
  "isRecurring": true,
  "recurrenceRule": "FREQ=WEEKLY;BYDAY=FR",
  "recurrenceEnd": "2025-12-31T23:59:59Z"
}
```

#### Get All Events
```http
GET /api/events?status=SCHEDULED&startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer <token>
```

Query parameters:
- `status`: SCHEDULED, COMPLETED, CANCELLED
- `categoryId`: Filter by category
- `tagId`: Filter by tag
- `search`: Search in title, description, location
- `startDate`: Filter events starting from this date
- `endDate`: Filter events ending before this date
- `sortBy`: startTime, endTime
- `order`: asc, desc
- `page`: Page number
- `limit`: Items per page

#### Get Events by Date
```http
GET /api/events/by-date?date=2025-10-20
Authorization: Bearer <token>
```

#### Get Event by ID
```http
GET /api/events/:id
Authorization: Bearer <token>
```

#### Get Recurring Event Instances
```http
GET /api/events/:id/recurring-instances?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer <token>
```

#### Update Event
```http
PUT /api/events/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Meeting Title",
  "status": "COMPLETED"
}
```

#### Delete Event
```http
DELETE /api/events/:id
Authorization: Bearer <token>
```

---

### Categories

#### Create Category
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Work",
  "color": "#3b82f6",
  "description": "Work-related tasks"
}
```

#### Get All Categories
```http
GET /api/categories
Authorization: Bearer <token>
```

#### Update Category
```http
PUT /api/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Personal",
  "color": "#10b981"
}
```

#### Delete Category
```http
DELETE /api/categories/:id
Authorization: Bearer <token>
```

---

### Tags

#### Create Tag
```http
POST /api/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "urgent",
  "color": "#ef4444"
}
```

#### Get All Tags
```http
GET /api/tags
Authorization: Bearer <token>
```

#### Update Tag
```http
PUT /api/tags/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "important",
  "color": "#f59e0b"
}
```

#### Delete Tag
```http
DELETE /api/tags/:id
Authorization: Bearer <token>
```

---

### Reminders

#### Create Reminder
```http
POST /api/reminders
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "PUSH",
  "reminderTime": "2025-10-20T09:00:00Z",
  "message": "Don't forget the meeting!",
  "todoId": "todo-uuid"
}
```

#### Get All Reminders
```http
GET /api/reminders?upcoming=true
Authorization: Bearer <token>
```

Query parameters:
- `isSent`: true/false
- `upcoming`: true (shows only future unsent reminders)

#### Update Reminder
```http
PUT /api/reminders/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "reminderTime": "2025-10-20T08:30:00Z",
  "isSent": true
}
```

#### Delete Reminder
```http
DELETE /api/reminders/:id
Authorization: Bearer <token>
```

---

### Analytics

#### Get Dashboard Analytics
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

Returns:
- Todo statistics (total, pending, in progress, completed, overdue)
- Event statistics (total, upcoming, today)
- Category usage
- Tag usage
- Upcoming reminders count

#### Get Productivity Analytics
```http
GET /api/analytics/productivity?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer <token>
```

Returns:
- Completion rate
- Time estimation accuracy
- Completions by day
- Completions by priority

---

## 🗄️ Database Schema

### Key Models

- **User**: User accounts with authentication
- **Todo**: Task items with priorities, status, and due dates
- **Event**: Calendar events with time slots and recurrence
- **Category**: Organizational categories for todos and events
- **Tag**: Labels for todos and events
- **Reminder**: Scheduled reminders
- **Attendee**: Event participants

### Relationships

- Users have many Todos, Events, Categories, Tags, and Reminders
- Todos can have sub-todos (parent-child relationship)
- Events can have multiple attendees
- Todos and Events can have multiple tags (many-to-many)

## 🔧 Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ Warning: Deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

## 📊 Project Structure

```
todo_alarm-app/
├── controllers/          # Request handlers
│   ├── auth.controller.js
│   ├── todo.controller.js
│   ├── event.controller.js
│   ├── category.controller.js
│   ├── tag.controller.js
│   ├── reminder.controller.js
│   └── analytics.controller.js
├── routes/              # API routes
│   ├── auth.routes.js
│   ├── todo.routes.js
│   ├── event.routes.js
│   ├── category.routes.js
│   ├── tag.routes.js
│   ├── reminder.routes.js
│   └── analytics.routes.js
├── middleware/          # Express middleware
│   ├── auth.middleware.js
│   └── validate.middleware.js
├── prisma/             # Prisma schema and migrations
│   └── schema.prisma
├── .env                # Environment variables (create from .env.example)
├── .env.example        # Environment template
├── .gitignore
├── package.json
├── server.js           # Application entry point
└── README.md
```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected routes with authentication middleware
- Input validation with express-validator
- SQL injection prevention via Prisma ORM

## 🚀 Advanced Features

### Recurring Events
Events can be set to recur using RRULE format (iCalendar standard):

```javascript
// Weekly every Friday
"recurrenceRule": "FREQ=WEEKLY;BYDAY=FR"

// Daily
"recurrenceRule": "FREQ=DAILY"

// Monthly on the 1st
"recurrenceRule": "FREQ=MONTHLY;BYMONTHDAY=1"
```

### Event Conflict Detection
When creating events, the API automatically detects scheduling conflicts and returns conflicting events in the response.

### Sub-todos
Create hierarchical todo structures by setting `parentId` when creating a todo.

### Time Tracking
Track estimated vs. actual time spent on todos for productivity analytics.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Your Name

## 🙏 Acknowledgments

- Express.js for the web framework
- Prisma for the amazing ORM
- RRule for recurring event handling

---

**Note**: Remember to never commit your `.env` file to version control. Use `.env.example` as a template.
