# ✅ **TaskFlow API** — *Custom Task Management API*

A **fully functional API server** for managing tasks, built using **Next.js App Router**, **NeonDB + Drizzle ORM**, and an optional **React frontend** for smooth user interaction.

> ✅ **Create**, **Read**, **Update**, and **Delete** tasks seamlessly  
> 🔍 All endpoints are tested and verified using [Postman](https://www.postman.com/)

---

## 🔗 **Live Project**

**🌐 [Visit the Live App](https://task-flow-hazel-xi.vercel.app/)**

---

## 🚀 **Tech Stack**

| Layer       | Technology                          |
|-------------|--------------------------------------|
| 🧭 Framework | `Next.js 14 (App Router)`           |
| 🗄️ Database  | `PostgreSQL` (via [Neon](https://neon.tech/)) |
| 🧬 ORM       | `Drizzle ORM`                       |
| 🎨 Frontend  | `React + Tailwind CSS`              |
| ☁️ Deploy    | `Vercel`                            |

---

## 📘 **API Documentation**

### 🧾 **OpenAPI Schema**

Explore the full API structure based on **OpenAPI 3.0.3**:

🔗 **[📝 View OpenAPI Spec](https://github.com/amish-kumar-07/TaskFlow/blob/main/OpenApiSchema.md)**  
*(Click to preview schema definition in markdown)*

---

### 🧾 **cURL Command Examples**

This section includes `cURL` examples for all supported endpoints:

🔗 **[📝 View Curl Command Spec](https://github.com/amish-kumar-07/TaskFlow/blob/main/curlCommand.md)**  
*(Click to preview commands and interact via terminal)*

---

## 📊 **Test Coverage**

Thoroughly tested using **Jest** & **React Testing Library** with automated reports.

| Metric      | Value                    |
|-------------|--------------------------|
| Statements  | `96.95%`                 |
| Branches    | `86.04%`                 |
| Functions   | `100%`                   |
| Lines       | `98.6%`                  |
| Test Suites | `8 passed / 8 total`     |
| Total Tests | `121 passed / 121 total` |
| Time        | `8.38 seconds`           |

> ✅ Test Runner: `Jest`  
> ✅ Coverage Command: `npm run test:coverage`

#### 📂 Coverage Snapshot

<img src="./public/test.png" alt="Test Coverage" width="100%" />

---

## ✅ **API Test Automation with Keploy**

Integrated with [Keploy](https://keploy.io) for capturing real-time API tests via CI/CD (GitHub Actions).

#### 🧪 Sample Test Report

<img src="./public/result.png" alt="Keploy Test Report" width="100%" />

🔧 [View CI/CD Workflow](.github/workflows/ci.yml)

---

## 📦 **API Endpoints**

All routes are prefixed with `/api/`  
Responses are in JSON format.

---

### 1. 🟢 Fetch All Tasks

- **URL:** `/api/fetchdata`  
- **Method:** `GET`  
- **Description:** Fetches all tasks from the database

#### ✅ Response

```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "title": "Amish 2",
      "description": "test 2",
      "completed": true,
      "dueDate": "2025-07-05T00:00:00.000Z",
      "createdAt": "2025-06-21T06:00:44.882Z",
      "updatedAt": "2025-06-21T06:23:34.314Z"
    }
  ]
}
````

---

### 2. 🟡 Create a New Task

* **URL:** `/api/createtasks`
* **Method:** `POST`
* **Description:** Adds a new task

#### 📥 Request

```json
{
  "title": "Finish assignment",
  "description": "Submit",
  "dueDate": "2025-06-22T00:00:00.000Z"
}
```

#### ✅ Response

```json
{
  "id": 7,
  "title": "Finish assignment",
  "description": "Submit",
  "completed": false,
  "dueDate": "2025-06-22T00:00:00.000Z",
  "createdAt": "2025-06-21T06:43:19.440Z",
  "updatedAt": "2025-06-21T06:43:19.440Z"
}
```

---

### 3. 🛠️ Update a Task

* **URL:** `/api/update?id=<taskId>`
* **Method:** `PATCH`
* **Description:** Updates one or more task fields

#### 📥 Request (Partial)

```json
{
  "completed": true
}
```

#### ✅ Response

```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "Amish 3",
    "description": "test 3",
    "completed": true,
    "dueDate": "2025-07-30T00:00:00.000Z",
    "createdAt": "2025-06-21T06:10:36.964Z",
    "updatedAt": "2025-06-21T06:48:16.895Z"
  }
}
```

---

### 4. 🔴 Delete a Task

* **URL:** `/api/delete?id=<taskId>`
* **Method:** `DELETE`
* **Description:** Deletes a task by its ID

#### ✅ Response

```json
{
  "success": true,
  "message": "Task deleted",
  "data": {
    "id": 3,
    "title": "Amish 3",
    "description": "test 3",
    "completed": true,
    "dueDate": "2025-07-30T00:00:00.000Z",
    "createdAt": "2025-06-21T06:10:36.964Z",
    "updatedAt": "2025-06-21T06:48:16.895Z"
  }
}
```

---

## 🧑‍💻 **Run Locally**

```bash
# 1. Clone the project
git clone https://github.com/amish-kumar-07/TaskFlow

# 2. Install dependencies
npm install

# 3. Setup environment variables
# Inside .env.local
DATABASE_URL="your-neon-postgres-url"

# 4. Run the dev server
npm run dev
```

---

## 🗃️ **Database Schema (Drizzle ORM)**

```ts
pgTable("tasks", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

---

## 📬 **Feedback & Contact**

Got suggestions or bugs to report?

* 📧 Email: `rashusingh110@gmail.com`
* 💬 [Open an Issue](https://github.com/amish-kumar-07/TaskFlow/issues)

---
