package com.zhaw.backend.controller;

import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.model.dto.SubTaskCompletionRequestDto;
import com.zhaw.backend.service.SubTaskService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for SubTasks, takes request from frontend, passes to Service.
 * Builds response with success and return values or returns error
 */
@RestController
@RequestMapping("/api/subTasks")
public class SubTaskController {
    @Autowired
    private SubTaskService subTaskService;

    private static final Logger logger = LoggerFactory.getLogger(SubTaskController.class);

    @PostMapping(value = "/completeSubTask")
    public ResponseEntity<Void> completeSubTask(
            @Valid @RequestBody SubTaskCompletionRequestDto requestDto) {
        try     {
            subTaskService.completeSubTaskForUser(requestDto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("ERROR COMPLETING SUBTASK - userId: {}, actionId: {}, subTaskId: {}, actionType: {}, error: {}", requestDto.getUserId(), requestDto.getActionId(), requestDto.getSubTaskId(), requestDto.getActionType(), e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update subtask", description = "Updates an existing GPS subtask. Requires ADMIN or PARTNER role.", tags = "SubTask Management")
    public ResponseEntity<Void> updateSubTask(@PathVariable("id") Long id, @RequestBody GpsActionTaskDto dto) {
        try {
            boolean updated = subTaskService.updateSubTask(id, dto);
            if (!updated) {
                logger.warn("SUBTASK NOT FOUND FOR UPDATE - id: {}", id);
                return ResponseEntity.notFound().build();
            }
            logger.info("UPDATED SUBTASK - id: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("ERROR UPDATING SUBTASK - id: {}, error: {}", id, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete subtask", description = "Permanently deletes a subtask. Requires ADMIN or PARTNER role.", tags = "SubTask Management")
    public ResponseEntity<Void> deleteSubTask(@PathVariable("id") Long id) {
        try {
            boolean deleted = subTaskService.deleteSubTask(id);
            if (!deleted) {
                logger.warn("SUBTASK NOT FOUND FOR DELETE - id: {}", id);
                return ResponseEntity.notFound().build();
            }
            logger.info("DELETED SUBTASK - id: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("ERROR DELETING SUBTASK - id: {}, error: {}", id, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
