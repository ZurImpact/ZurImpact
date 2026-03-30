# GPS Action Tasks - Quick Reference Guide

## Table Structure

```
gps_action_tasks
├── id (BIGINT, PK, AUTO)
├── display_name (VARCHAR 255, NOT NULL)
├── description (VARCHAR 255, NOT NULL)
├── action_id (BIGINT, FK → action.id, NOT NULL)
├── gps_x (FLOAT, NOT NULL)
├── gps_y (FLOAT, NOT NULL)
├── gps_z (FLOAT, NULLABLE)
├── created_on (TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
└── updated_on (TIMESTAMP, NULLABLE)
```

## Classes & Locations

### Entity
- **Class:** `GpsActionTask extends SubAction`
- **Path:** `com.zhaw.backend.model.entities.GpsActionTask`
- **DB Table:** `gps_action_tasks`

### DTO
- **Class:** `GpsActionTaskDto extends SubActionDto`
- **Path:** `com.zhaw.backend.model.dto.GpsActionTaskDto`

### DAO
- **Class:** `SubActionDao`
- **Path:** `com.zhaw.backend.model.dao.SubActionDao`
- **Key Methods:**
  - `findGpsSubAction(Long actionId)` - Get all GPS tasks for action
  - `findById(Long id)` - Get specific GPS task
  - `save(GpsActionTask task)` - Create new GPS task
  - `update(GpsActionTask task)` - Update GPS task
  - `delete(Long id)` - Delete GPS task

### Mapper
- **Class:** `SubActionMapper`
- **Path:** `com.zhaw.backend.mappers.SubActionMapper`
- **Key Methods:**
  - `GpsActionTaskToDto(SubAction entity)` - Entity → DTO
  - `GpsActionTaskToEntity(SubActionDto dto)` - DTO → Entity
  - `GpsActionTaskToDtoList(List<SubAction>)` - Entity List → DTO List
  - `GpsActionTaskToEntityList(List<SubActionDto>)` - DTO List → Entity List

## Common Operations

### Create GPS Action Task
```java
GpsActionTask task = GpsActionTask.builder()
    .description("Checkpoint location")
    .displayName("Checkpoint A")
    .actionId(123L)
    .gpsX(47.3769f)
    .gpsY(8.5469f)
    .gpsZ(500.0f)
    .build();

subActionDao.save(task);
// createdOn and updatedOn auto-set by @PrePersist
```

### Find GPS Tasks
```java
// Find all for action
List<GpsActionTask> tasks = subActionDao.findGpsSubAction(actionId);

// Find by ID
Optional<GpsActionTask> task = subActionDao.findById(taskId);
```

### Convert to DTO
```java
GpsActionTaskDto dto = (GpsActionTaskDto) SubActionMapper.GpsActionTaskToDto(task);
List<GpsActionTaskDto> dtos = SubActionMapper.GpsActionTaskToDtoList(tasks);
```

### Update GPS Task
```java
task.setGpsX(47.4f);
task.setGpsY(8.6f);
subActionDao.update(task);
// updatedOn auto-set by @PreUpdate
```

### Delete GPS Task
```java
subActionDao.delete(taskId);
```

## Key Features

✅ **Automatic Timestamps**
- `createdOn` - Set on creation, immutable
- `updatedOn` - Set on creation and updated on every modification

✅ **Nullable Z Coordinate**
- For 2D-only GPS tasks, gpsZ can be null
- Properly handled in RowMapper

✅ **Type-Safe Mapping**
- RowMapper converts SQL types to Java types
- Timestamp → LocalDateTime conversion built-in

✅ **Referential Integrity**
- Foreign key to action table with CASCADE DELETE
- Automatic cleanup when action deleted

✅ **Builder Pattern**
- Inherited from SubAction
- Clean object construction

## Inheritance Structure

```
SubAction (MappedSuperclass)
    ↑
    │ extends
    │
GpsActionTask (Entity)
    ↓ maps to
GpsActionTaskDto (DTO)
```

## SQL Queries

### Insert
```sql
INSERT INTO gps_action_tasks 
(display_name, description, action_id, gps_x, gps_y, gps_z, created_on, updated_on) 
VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
```

### Select
```sql
SELECT id, description, display_name, action_id, gps_x, gps_y, gps_z, created_on, updated_on 
FROM gps_action_tasks 
WHERE action_id = ?
```

### Update
```sql
UPDATE gps_action_tasks 
SET display_name = ?, description = ?, gps_x = ?, gps_y = ?, gps_z = ?, updated_on = NOW() 
WHERE id = ?
```

### Delete
```sql
DELETE FROM gps_action_tasks WHERE id = ?
```

## Column Naming Convention

| Java | Database |
|------|----------|
| `gpsX` | `gps_x` |
| `gpsY` | `gps_y` |
| `gpsZ` | `gps_z` |
| `displayName` | `display_name` |
| `actionId` | `action_id` |
| `createdOn` | `created_on` |
| `updatedOn` | `updated_on` |

## Error Handling

### Nullable gpsZ
```java
if (rs.getObject("gps_z") != null) {
    task.setGpsZ(rs.getFloat("gps_z"));
}
```

### Optional findById
```java
Optional<GpsActionTask> task = subActionDao.findById(id);
if (task.isPresent()) {
    // Handle task
}
```

## Migration Info

**Version:** V8  
**File:** `V8__add_timestamps_to_gps_action_tasks.sql`  
**Status:** Already in migration history  
**Actions:**
1. Adds `created_on` and `updated_on` columns
2. Fixes `action_id` type to BIGINT
3. Recreates FK constraint with CASCADE DELETE

## Performance Considerations

- Timestamps indexed via FK on `action_id`
- Use `findById()` for single lookups
- Use `findGpsSubAction(actionId)` for filtering by action
- Consider pagination for large result sets

## Related Classes

- `SubAction` - Base class for all subtasks
- `SubActionDto` - Base DTO for all subtasks
- `ActionMapper` - Similar mapper pattern
- `ActionDao` - Similar DAO pattern

