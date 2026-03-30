package com.zhaw.backend.controller;


import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.model.entities.Action;
import com.zhaw.backend.service.SubActionService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for Actions, takes request from frontend, passes to Service.
 * Builds response with success and return values or returns error
 */
@RestController
@RequestMapping("/api/subActions")
public class SubActionController {
    @Autowired
    private SubActionService subActionService;

    private static final Logger logger = LoggerFactory.getLogger(SubActionController.class);

    @PostMapping("/completeSubAction")
    public ResponseEntity<Void> completeSubAction(
            @RequestParam(name = "userId") Long userId,
            @RequestParam(name = "actionId") Long actionId,
            @RequestParam(name = "subActionId") Long subActionId,
            @Parameter(description = "SubActionTypes", schema = @Schema(implementation = ActionType.class))
            @RequestParam(name = "subActionType") ActionType subActionType,
            @RequestParam(name = "gpsX", required = false) Float gpsX,
            @RequestParam(name = "gpsY", required = false) Float gpsY){
        try     {
            subActionService.completeSubActionForUser(userId, actionId, subActionId, subActionType, gpsX, gpsY);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("ERROR COMPLETING SUBACTION - userId: {}, actionId: {}, subActionId: {}, gpsX: {}, gpsY: {}, error: {}", userId, actionId, subActionId, gpsX, gpsY, e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }
}
