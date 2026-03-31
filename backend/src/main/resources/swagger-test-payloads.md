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

### POST /api/actions — Create action without subactions
```json
{
  "description": "Pick up litter in your neighbourhood",
  "displayName": "Clean Up",
  "points": 50,
  "tags": ["ECO", "COMMUNITY"],
  "type": "GPS",
  "hasSubtasks": false,
  "validUntil": "2026-12-31T23:59:59"
}
```

### POST /api/actions — Create action with GPS subactions
```json
{
  "description": "Visit all recycling stations in the city",
  "displayName": "Recycling Tour",
  "points": 100,
  "tags": ["ECO"],
  "type": "GPS",
  "hasSubtasks": true,
  "validUntil": "2026-12-31T23:59:59",
  "subActions": [
    {
      "type": "GPS",
      "description": "Recycling station Hauptbahnhof",
      "displayName": "HB Station",
      "gpsX": 47.3769,
      "gpsY": 8.5417,
      "gpsZ": 0.0
    },
    {
      "type": "GPS",
      "description": "Recycling station Oerlikon",
      "displayName": "Oerlikon Station",
      "gpsX": 47.4108,
      "gpsY": 8.5448,
      "gpsZ": 0.0
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
  "tags": ["ECO", "HEALTH"],
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
  "gpsX": 47.3769,
  "gpsY": 8.5417,
  "gpsZ": 10.0
}
```

---

## User Progress

### POST /api/actions/{id}/start
No body required.

### POST /api/actions/{id}/complete
No body required.
