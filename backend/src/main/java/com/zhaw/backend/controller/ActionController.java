package com.zhaw.backend.controller;

import com.zhaw.backend.exception.NotFoundException;
import com.zhaw.backend.model.dto.ActionDto;
import com.zhaw.backend.service.ActionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST controller for Actions.
 * Exposes endpoints for browsing actions, managing action content (admin/partner only),
 * and tracking user progress against actions.
 *
 * <p>Error handling is centralised: controllers throw typed exceptions
 * (e.g. {@link NotFoundException}) or let service exceptions propagate to
 * {@code GlobalExceptionHandler}, which renders RFC 9457 problem responses.
 */
@RestController
@RequestMapping("/api/actions")
@Tag(name = "Actions", description = "Endpoints for browsing and managing actions and subtasks")
@RequiredArgsConstructor
public class ActionController {

    private final ActionService actionService;

    // ── Browsing ─────────────────────────────────────────────────────────────

    /**
     * Returns all actions, optionally filtered by text, points, tags, and expiry date.
     *
     * @param text      case-insensitive search across description and displayName
     * @param points    exact points value to filter by
     * @param tags      comma-separated tag names to filter by
     * @param validUntil only return actions valid up to this timestamp
     * @return list of matching actions including their subtasks
     */
    @GetMapping
    @Operation(summary = "List actions", description = "Returns all actions with optional filtering. Open to all users.", tags = "Actions")
    public ResponseEntity<List<ActionDto>> getActions(
            @RequestParam(name = "text", required = false) String text,
            @RequestParam(name = "points", required = false) Integer points,
            @RequestParam(name = "tags", required = false) String tags,
            @RequestParam(name = "validUntil", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime validUntil) {
        return ResponseEntity.ok(actionService.getActions(text, points, tags, validUntil));
    }

    /**
     * Returns a single action by its ID, including its subtasks if any.
     *
     * @param id the action ID
     * @return the action
     * @throws NotFoundException if no action with the given ID exists
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get action by ID", description = "Returns a single action including subtasks. Open to all users.", tags = "Actions")
    public ResponseEntity<ActionDto> getAction(@PathVariable("id") Long id) {
        ActionDto actionDto = actionService.getActionById(id);
        if (actionDto == null) {
            throw new NotFoundException("Action with id " + id + " not found");
        }
        return ResponseEntity.ok(actionDto);
    }

    // ── Action management (admin / partner only) ──────────────────────────────

    /**
     * Creates a new action. If {@code hasSubtasks} is true and {@code subtasks} is provided,
     * the subtasks are persisted in the same transaction.
     *
     * @param dto the action data including optional subtasks
     * @return the created action with its generated ID (HTTP 201)
     */
    @PostMapping
    @Operation(summary = "Create action", description = "Creates a new action, optionally with subtasks. Requires ADMIN or PARTNER role.", tags = "Action Management")
    public ResponseEntity<ActionDto> createAction(@Valid @RequestBody ActionDto dto) {
        return ResponseEntity.status(201).body(actionService.createAction(dto));
    }

    /**
     * Updates an existing action by ID.
     *
     * @param id  the action ID
     * @param dto the updated action data
     * @return 204 on success
     * @throws NotFoundException if no action with the given ID exists
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update action", description = "Updates an existing action. Requires ADMIN or PARTNER role.", tags = "Action Management")
    public ResponseEntity<Void> updateAction(@PathVariable("id") Long id, @RequestBody ActionDto dto) {
        if (!actionService.updateAction(id, dto)) {
            throw new NotFoundException("Action with id " + id + " not found");
        }
        return ResponseEntity.noContent().build();
    }

    /**
     * Deletes an action by ID.
     *
     * @param id the action ID
     * @return 204 on success
     * @throws NotFoundException if no action with the given ID exists
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete action", description = "Permanently deletes an action. Requires ADMIN or PARTNER role.", tags = "Action Management")
    public ResponseEntity<Void> deleteAction(@PathVariable("id") Long id) {
        if (!actionService.deleteAction(id)) {
            throw new NotFoundException("Action with id " + id + " not found");
        }
        return ResponseEntity.noContent().build();
    }


    /**
     * Starts an action for a user by creating an IN_PROGRESS mapping in the database.
     *
     * @param userId      the user ID
     * @param actionId    the action ID to start
     * @param isSubtask   whether this is a subtask interaction
     * @param subtaskId the subtask ID, if applicable
     * @return 200 on success
     */
    @PostMapping("/startAction")
    @Operation(summary = "Start action", description = "Records that a user has started an action.", tags = "User Progress")
    public ResponseEntity<Void> startAction(
            @RequestParam(name = "userId") Long userId,
            @RequestParam(name = "actionId") Long actionId,
            @RequestParam(name = "isSubtask", required = false) Boolean isSubtask,
            @RequestParam(name = "subtaskId", required = false) String subtaskId) {
        actionService.startActionForUser(userId, actionId, isSubtask, subtaskId);
        return ResponseEntity.ok().build();
    }

    /**
     * Marks an action as completed for a user by adding a COMPLETED mapping in the database.
     *
     * @param userId      the user ID
     * @param actionId    the action ID to complete
     * @return 200 on success
     */
    @PostMapping("/completeAction")
    @Operation(summary = "Complete action", description = "Records that a user has completed an action.", tags = "User Progress")
    public ResponseEntity<Void> completeAction(
            @RequestParam(name = "userId") Long userId,
            @RequestParam(name = "actionId") Long actionId) {
        actionService.completeActionForUser(userId, actionId);
        return ResponseEntity.ok().build();
    }

    /**
     * Cancels an action for a user by removing their action mapping from the database.
     *
     * @param userId   the user ID
     * @param actionId the action ID to cancel
     * @return 200 on success
     */
    @PostMapping("/cancelAction")
    @Operation(summary = "Cancel action", description = "Removes a user's in-progress action mapping.", tags = "User Progress")
    public ResponseEntity<Void> cancelAction(@RequestParam(name = "userId") Long userId, @RequestParam(name = "actionId") Long actionId) {
        actionService.deleteActionForUser(userId, actionId);
        return ResponseEntity.ok().build();
    }
}
