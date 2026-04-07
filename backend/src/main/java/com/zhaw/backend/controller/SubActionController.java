package com.zhaw.backend.controller;

import com.zhaw.backend.model.dto.SubActionCompletionRequestDto;
import com.zhaw.backend.service.SubActionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Actions, takes request from frontend, passes to Service.
 * Builds response with success and return values or returns error
 */
@RestController
@RequestMapping("/api/subActions")
@RequiredArgsConstructor
public class SubActionController {
    private final SubActionService subActionService;

    private static final Logger logger = LoggerFactory.getLogger(SubActionController.class);

    @PostMapping(value = "/completeSubAction")
    public ResponseEntity<Void> completeSubAction(
            @Valid @RequestBody SubActionCompletionRequestDto requestDto) {
        try     {
            subActionService.completeSubActionForUser(requestDto);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("ERROR COMPLETING SUBACTION - userId: {}, actionId: {}, subActionId: {}, actionType: {}, error: {}", requestDto.getUserId(), requestDto.getActionId(), requestDto.getSubActionId(), requestDto.getActionType(), e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
