package com.zhaw.backend.controller;

import com.zhaw.backend.model.dto.SubTaskCompletionRequestDto;
import com.zhaw.backend.service.SubTaskService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Actions, takes request from frontend, passes to Service.
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
}
