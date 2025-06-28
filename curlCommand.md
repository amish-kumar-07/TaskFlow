#!/bin/bash

APP URL - https://task-flow-hazel-xi.vercel.app/

echo "Creating Task..."
CREATE_RESPONSE=$(curl -s -X POST https://task-flow-hazel-xi.vercel.app/api/createtasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"This task will be deleted"}')

echo "Task Created: $CREATE_RESPONSE"

# Extract ID from response
TASK_ID=$(echo $CREATE_RESPONSE | jq -r '.id')

echo "Task ID: $TASK_ID"

echo "Fetching All Tasks..."
curl -X GET https://task-flow-hazel-xi.vercel.app/api/fetchdata
echo ""

echo "Updating Task..."
curl -X PATCH "https://task-flow-hazel-xi.vercel.app/api/update?id=$TASK_ID" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Task","description":"This is the updated task.","completed":true}'
echo ""

echo "Deleting Task..."
curl -X DELETE "https://task-flow-hazel-xi.vercel.app/api/delete?id=$TASK_ID"
echo ""
