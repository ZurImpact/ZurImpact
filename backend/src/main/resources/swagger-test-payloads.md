# Swagger Test Payloads

## Auth

### POST /api/auth/login
```json
{ "username": "admin", "password": "secret" }
```
```json
{ "username": "partner", "password": "secret" }
```

---

## Actions

### POST /api/actions — Create action without subtasks
```json
{
  "description": "Pick up litter in your neighbourhood",
  "displayName": "Clean Up",
  "points": 50,
  "tags": ["TRAVEL"],
  "type": "GPS",
  "hasSubtasks": false,
  "validUntil": "2026-12-31T23:59:59"
}
```

### POST /api/actions — Create action with GPS subtasks
```json
{
  "description": "Visit all recycling stations in the city",
  "displayName": "Recycling Tour",
  "points": 100,
  "tags": ["TRAVEL"],
  "type": "GPS",
  "hasSubtasks": true,
  "validUntil": "2026-12-31T23:59:59",
  "subTasks": [
    {
      "type": "GPS",
      "description": "Recycling station Hauptbahnhof",
      "displayName": "HB Station",
      "latitude": 47.3769,
      "longitude": 8.5417,
      "distanceThresholdLevel": "MEDIUM"
    },
    {
      "type": "GPS",
      "description": "Recycling station Oerlikon",
      "displayName": "Oerlikon Station",
      "latitude": 47.4108,
      "longitude": 8.5448,
      "distanceThresholdLevel": "HARD"
    }
  ]
}
```

### PUT /api/actions/{id} — Update action
```json
{
  "description": "Updated description",
  "displayName": "Updated Name",
  "points": 75,
  "tags": ["TRAVEL"],
  "type": "GPS",
  "hasSubtasks": false,
  "validUntil": "2026-12-31T23:59:59"
}
```

### PUT /api/actions/subaction/{id} — Update GPS subaction
```json
{
  "description": "Updated checkpoint description",
  "displayName": "Updated Checkpoint",
  "latitude": 47.3769,
  "longitude": 8.5417
}
```

---

## User Progress

### POST /api/actions/{id}/start
No body required.

### POST /api/actions/{id}/complete
No body required.
