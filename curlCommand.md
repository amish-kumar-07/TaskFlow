## 🧪 API Testing Script with `curl`

This script demonstrates how to test the TaskFlow app API endpoints using `curl`.
It covers the full lifecycle: **Create → Read → Update → Delete**.

### 🌐 Application URL

```
https://task-flow-hazel-xi.vercel.app/
```

### 📝 Bash Script

```bash
#!/bin/bash

APP_URL="https://task-flow-hazel-xi.vercel.app"

echo "Creating Task..."
CREATE_RESPONSE=$(curl -s -X POST "$APP_URL/api/createtasks" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"This task will be deleted"}')

echo "Task Created: $CREATE_RESPONSE"

# Extract ID from response
TASK_ID=$(echo $CREATE_RESPONSE | jq -r '.id')

echo "Task ID: $TASK_ID"

echo "Fetching All Tasks..."
curl -X GET "$APP_URL/api/fetchdata"
echo ""

echo "Updating Task..."
curl -X PATCH "$APP_URL/api/update?id=$TASK_ID" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Task","description":"This is the updated task.","completed":true}'
echo ""

echo "Deleting Task..."
curl -X DELETE "$APP_URL/api/delete?id=$TASK_ID"
echo ""
```

### ✅ Requirements

* `jq` (for parsing JSON)
* `bash` shell
* `curl` CLI

### 📌 What it does:

1. **Creates** a new task.
2. Extracts the task `id` from the creation response.
3. **Fetches** all existing tasks.
4. **Updates** the newly created task.
5. **Deletes** the task to clean up.

---
