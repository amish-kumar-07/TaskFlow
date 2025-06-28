## 📘 OpenAPI Specification – Task Flow API

This project follows the OpenAPI 3.0.3 standard to define and document the task management API.

### 🔗 API Base URL

```
https://task-flow-hazel-xi.vercel.app
```

### 📂 Endpoints

#### `GET /api/fetchdata`

* **Description**: Get all tasks.
* **Responses**:

  * `200 OK`: Returns a list of all tasks.
  * `400 Bad Request`: Failed to retrieve tasks.

#### `POST /api/createtasks`

* **Description**: Create a new task.
* **Request Body**:

  ```json
  {
    "title": "Task Title",
    "description": "Task Description"
  }
  ```
* **Responses**:

  * `200 OK`: Returns the created task.
  * `400 Bad Request`: Invalid input.

#### `PATCH /api/update?id=<task_id>`

* **Description**: Update an existing task by ID.
* **Query Parameters**:

  * `id` (string, required): Task ID.
* **Request Body**:

  ```json
  {
    "title": "Updated Title",
    "description": "Updated Description",
    "completed": true
  }
  ```
* **Responses**:

  * `200 OK`: Returns the updated task.
  * `400 Bad Request`: Invalid update data.

#### `DELETE /api/delete?id=<task_id>`

* **Description**: Delete a task by ID.
* **Query Parameters**:

  * `id` (string, required): Task ID.
* **Responses**:

  * `200 OK`: Task deleted successfully.
  * `400 Bad Request`: Invalid request.

---

### 📌 Components & Schemas

#### `Task`

```yaml
type: object
properties:
  id:
    type: string
  title:
    type: string
  description:
    type: string
  completed:
    type: boolean
```

#### `CreateTaskData`

```yaml
type: object
required:
  - title
  - description
properties:
  title:
    type: string
  description:
    type: string
```

#### `UpdateTaskData`

```yaml
type: object
properties:
  title:
    type: string
  description:
    type: string
  completed:
    type: boolean
```

---

### 📄 Full OpenAPI YAML

<details>
<summary>Click to expand</summary>

```yaml
openapi: 3.0.3
info:
  title: Task Flow API
  version: 1.0.0
  description: API for managing tasks with proper CRUD flow

servers:
  - url: https://task-flow-hazel-xi.vercel.app

paths:
  /api/fetchdata:
    get:
      summary: Get all tasks
      responses:
        '200':
          description: List of tasks
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Task'
        '400':
          description: Bad Request

  /api/createtasks:
    post:
      summary: Create a new task
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskData'
      responses:
        '200':
          description: Task created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '400':
          description: Invalid input

  /api/update:
    patch:
      summary: Update an existing task
      parameters:
        - name: id
          in: query
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateTaskData'
      responses:
        '200':
          description: Task updated successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    $ref: '#/components/schemas/Task'
        '400':
          description: Invalid request

  /api/delete:
    delete:
      summary: Delete a task by ID
      parameters:
        - name: id
          in: query
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Task deleted successfully
        '400':
          description: Bad Request

components:
  schemas:
    Task:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        description:
          type: string
        completed:
          type: boolean

    CreateTaskData:
      type: object
      required:
        - title
        - description
      properties:
        title:
          type: string
        description:
          type: string

    UpdateTaskData:
      type: object
      properties:
        title:
          type: string
        description:
          type: string
        completed:
          type: boolean
```

</details>

