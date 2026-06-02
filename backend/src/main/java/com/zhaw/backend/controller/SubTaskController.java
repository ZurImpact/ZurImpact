package com.zhaw.backend.controller;

import com.zhaw.backend.exception.NotFoundException;
import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.model.dto.SubTaskCompletionRequestDto;
import com.zhaw.backend.service.SubTaskService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for SubTasks, takes request from frontend, passes to Service.
 * Errors propagate to {@code GlobalExceptionHandler} as RFC 9457 problems.
 */
@RestController
@RequestMapping("/api/subTasks")
public class SubTaskController {
    @Autowired
    private SubTaskService subTaskService;

    @PostMapping(value = "/completeSubTask")
    public ResponseEntity<Void> completeSubTask(
            @Valid @RequestBody SubTaskCompletionRequestDto requestDto) {
        subTaskService.completeSubTaskForUser(requestDto);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update subtask", description = "Updates an existing GPS subtask. Requires ADMIN or PARTNER role.", tags = "SubTask Management")
    public ResponseEntity<Void> updateSubTask(@PathVariable("id") Long id, @RequestBody GpsActionTaskDto dto) {
        if (!subTaskService.updateSubTask(id, dto)) {
            throw new NotFoundException("SubTask with id " + id + " not found");
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete subtask", description = "Permanently deletes a subtask. Requires ADMIN or PARTNER role.", tags = "SubTask Management")
    public ResponseEntity<Void> deleteSubTask(@PathVariable("id") Long id) {
        if (!subTaskService.deleteSubTask(id)) {
            throw new NotFoundException("SubTask with id " + id + " not found");
        }
        return ResponseEntity.noContent().build();
    }
}