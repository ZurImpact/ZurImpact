package com.zhaw.backend.controller;

import com.zhaw.backend.model.dto.ActionDto;
import com.zhaw.backend.model.dto.UserActionHistoryDto;
import com.zhaw.backend.service.ActionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller for Actions, takes request from frontend, passes to Service.
 * Builds response with success and return values or returns error
 */
@RestController
@RequestMapping("/api/actions")
public class ActionController {

    @Autowired
    private ActionService actionService;

    private static final Logger logger = LoggerFactory.getLogger(ActionController.class);

    /**
     * Gets all Actions in DB available with filtering options for text, points, tags and validUntil
     * @param text gets all Actions with text in description or displayName, case-insensitive
     * @param points points limit
     * @param tags filters on specific tasks
     * @param validUntil filters on validUntil, gets all Actions with validUntil before the given date
     * @return List of all Actions available in DB with filtering options for text, points, tags and validUntil
     */
    @GetMapping
    public ResponseEntity<List<ActionDto>> getActions(
            @RequestParam(name = "text", required = false) String text,
            @RequestParam(name = "points", required = false) Integer points,
            @RequestParam(name = "tags", required = false) String tags,
            @RequestParam(name = "validUntil", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime validUntil) {
        try {
            List<ActionDto> actions = actionService.getActions(text, points, tags, validUntil);
            return ResponseEntity.ok(actions);
        } catch (Exception e) {
           logger.error("ERROR GETTING ACTIONS - text: {}, points: {}, tags: {}, validUntil: {}, error: {}", text, points, tags, validUntil, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActionDto> getAction(@PathVariable("id") Long id) {
        try {
            ActionDto actionDto = actionService.getActionById(id);
            if (actionDto != null) {
                return ResponseEntity.ok(actionDto);
            } else {
                logger.warn("ACTION NOT FOUND - id: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("ERROR GETTING ACTION - id: {}, error: {}", id, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Get all actions with a user has done
     * @param userId id of the user for which the action history should be retrieved
     * @return all actions done by that user
     */
    @GetMapping("/getUserActions")
    public ResponseEntity<List<UserActionHistoryDto>> getUserActions(
            @RequestParam(name = "userId") Long userId,
            @RequestParam(name = "active", required = false) Boolean active){
        try {
            List<UserActionHistoryDto> dto = actionService.getUserActions(userId, active);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Start a new action for user
     * @param userId id of the user for which the action should be started
     * @param actionId id of the action which should be started
     * @return success or error
     */
    @PostMapping("/startAction")
    public ResponseEntity<Void> startAction(
            @RequestParam(name = "userId") Long userId,
            @RequestParam(name = "actionId") Long actionId,
            @RequestParam(name = "isSubtask", required = false) Boolean isSubtask,
            @RequestParam(name = "subactionId", required = false) String subactionId) {
        try {
            actionService.startActionForUser(userId, actionId, isSubtask, subactionId);
            logger.info("STARTED ACTION - userId: {}, actionId: {}, isSubtask: {}, subactionId: {}", userId, actionId, isSubtask, subactionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("ERROR STARTING ACTION - userId: {}, actionId: {}, error: {}", userId, actionId, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Completes an action for a user, updates the mapping in DB to state "COMPLETED"
     * @param userId id of the user for which the action should be completed
     * @param actionId id of the action which should be completed
     * @return true if the action was successfully completed, false if not (e.g. if the mapping does not exist or is already completed)
     */
    @PostMapping("/completeAction")
    public ResponseEntity<Void> completeAction(
            @RequestParam(name = "userId") Long userId,
            @RequestParam(name = "actionId") Long actionId,
            @RequestParam(name = "isSubtask", required = false) Boolean isSubtask,
            @RequestParam(name = "subactionId", required = false) String subactionId,
            @RequestParam(name = "gpsX", required = false) Float gpsX,
            @RequestParam(name = "gpsY", required = false) Float gpsY,
            @RequestParam(name = "gpsZ", required = false) Float gpsZ) {
        try {
            actionService.completeActionForUser(userId, actionId, isSubtask, subactionId, gpsX, gpsY, gpsZ);
            logger.info("COMPLETED ACTION - userId: {}, actionId: {}, isSubtask: {}, subactionId: {}", userId, actionId, isSubtask, subactionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("ERROR COMPLETING ACTION - userId: {}, actionId: {}, error: {}", userId, actionId, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Deletes the action mapping for a user, effectively deleting the action for that user
     * @param userId id of the user for which the action should be deleted
     * @param actionId id of the action which should be deleted
     * @return true if the action was successfully deleted, false otherwise
     */
    @PostMapping("/cancelAction")
    public ResponseEntity<Void> cancelAction(@RequestParam(name = "userId") Long userId, @RequestParam(name = "actionId") Long actionId) {
        try {
            actionService.deleteActionForUser(userId, actionId);
            logger.info("CANCELED ACTION - userId: {}, actionId: {}", userId, actionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("ERROR CANCELLING ACTION - userId: {}, actionId: {}, error: {}", userId, actionId, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
