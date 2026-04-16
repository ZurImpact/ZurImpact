package com.zhaw.backend.controller;

import com.zhaw.backend.model.dto.ActionDto;
import com.zhaw.backend.service.ActionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ActionController - Unit Tests")
class ActionControllerTest {

    @Mock
    private ActionService actionService;

    @InjectMocks
    private ActionController actionController;

    private ActionDto actionDto(Long id) {
        return ActionDto.builder().id(id).displayName("Action " + id).build();
    }

    @Nested
    @DisplayName("getActions")
    class GetActions {

        @Test
        @DisplayName("returns 200 with actions when service succeeds")
        void returns200WhenServiceSucceeds() throws Exception {
            LocalDateTime validUntil = LocalDateTime.of(2026, 12, 1, 10, 0);
            when(actionService.getActions("bike", 10, "FOOD", validUntil)).thenReturn(List.of(actionDto(1L)));

            ResponseEntity<List<ActionDto>> response = actionController.getActions("bike", 10, "FOOD", validUntil);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals(1, response.getBody().size());
            verify(actionService).getActions("bike", 10, "FOOD", validUntil);
        }

        @Test
        @DisplayName("returns 500 when service throws exception")
        void returns500WhenServiceThrows() throws Exception {
            when(actionService.getActions(null, null, null, null)).thenThrow(new RuntimeException("db error"));

            ResponseEntity<List<ActionDto>> response = actionController.getActions(null, null, null, null);

            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        }
    }

    @Nested
    @DisplayName("getAction")
    class GetAction {

        @Test
        @DisplayName("returns 200 when action exists")
        void returns200WhenActionExists() throws Exception {
            when(actionService.getActionById(1L)).thenReturn(actionDto(1L));

            ResponseEntity<ActionDto> response = actionController.getAction(1L);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals(1L, response.getBody().getId());
        }

        @Test
        @DisplayName("returns 404 when action does not exist")
        void returns404WhenActionDoesNotExist() throws Exception {
            when(actionService.getActionById(99L)).thenReturn(null);

            ResponseEntity<ActionDto> response = actionController.getAction(99L);

            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        }

        @Test
        @DisplayName("returns 500 when service throws exception")
        void returns500WhenServiceThrows() throws Exception {
            when(actionService.getActionById(1L)).thenThrow(new RuntimeException("db error"));

            ResponseEntity<ActionDto> response = actionController.getAction(1L);

            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        }
    }

    @Nested
    @DisplayName("createAction")
    class CreateAction {

        @Test
        @DisplayName("returns 201 when action is created")
        void returns201WhenCreated() {
            ActionDto input = actionDto(null);
            ActionDto created = actionDto(10L);
            when(actionService.createAction(input)).thenReturn(created);

            ResponseEntity<ActionDto> response = actionController.createAction(input);

            assertEquals(HttpStatus.CREATED, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals(10L, response.getBody().getId());
        }

        @Test
        @DisplayName("returns 500 when create throws exception")
        void returns500WhenCreateThrows() {
            ActionDto input = actionDto(null);
            when(actionService.createAction(input)).thenThrow(new RuntimeException("db error"));

            ResponseEntity<ActionDto> response = actionController.createAction(input);

            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        }
    }

    @Nested
    @DisplayName("updateAction")
    class UpdateAction {

        @Test
        @DisplayName("returns 204 when action was updated")
        void returns204WhenUpdated() {
            ActionDto dto = actionDto(1L);
            when(actionService.updateAction(1L, dto)).thenReturn(true);

            ResponseEntity<Void> response = actionController.updateAction(1L, dto);

            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        }

        @Test
        @DisplayName("returns 404 when action was not found")
        void returns404WhenNotFound() {
            ActionDto dto = actionDto(99L);
            when(actionService.updateAction(99L, dto)).thenReturn(false);

            ResponseEntity<Void> response = actionController.updateAction(99L, dto);

            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        }

        @Test
        @DisplayName("returns 500 when update throws exception")
        void returns500WhenUpdateThrows() {
            ActionDto dto = actionDto(1L);
            when(actionService.updateAction(1L, dto)).thenThrow(new RuntimeException("db error"));

            ResponseEntity<Void> response = actionController.updateAction(1L, dto);

            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        }
    }

    @Nested
    @DisplayName("deleteAction")
    class DeleteAction {

        @Test
        @DisplayName("returns 204 when action was deleted")
        void returns204WhenDeleted() {
            when(actionService.deleteAction(1L)).thenReturn(true);

            ResponseEntity<Void> response = actionController.deleteAction(1L);

            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        }

        @Test
        @DisplayName("returns 404 when action was not found")
        void returns404WhenNotFound() {
            when(actionService.deleteAction(99L)).thenReturn(false);

            ResponseEntity<Void> response = actionController.deleteAction(99L);

            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        }

        @Test
        @DisplayName("returns 500 when delete throws exception")
        void returns500WhenDeleteThrows() {
            when(actionService.deleteAction(1L)).thenThrow(new RuntimeException("db error"));

            ResponseEntity<Void> response = actionController.deleteAction(1L);

            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        }
    }

    @Nested
    @DisplayName("user progress endpoints")
    class UserProgressEndpoints {

        @Test
        @DisplayName("startAction returns 200 on success")
        void startActionReturns200OnSuccess() {
            ResponseEntity<Void> response = actionController.startAction(1L, 2L, true, "5");

            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(actionService).startActionForUser(1L, 2L, true, "5");
        }

        @Test
        @DisplayName("startAction returns 500 on exception")
        void startActionReturns500OnException() {
            when(actionService.startActionForUser(1L, 2L, true, "5")).thenThrow(new RuntimeException("db error"));

            ResponseEntity<Void> response = actionController.startAction(1L, 2L, true, "5");

            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        }

        @Test
        @DisplayName("completeAction returns 200 on success")
        void completeActionReturns200OnSuccess() throws Exception {
            ResponseEntity<Void> response = actionController.completeAction(1L, 2L);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(actionService).completeActionForUser(1L, 2L);
        }

        @Test
        @DisplayName("completeAction returns 500 on exception")
        void completeActionReturns500OnException() throws Exception {
            when(actionService.completeActionForUser(1L, 2L)).thenThrow(new Exception("failed"));

            ResponseEntity<Void> response = actionController.completeAction(1L, 2L);

            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        }

        @Test
        @DisplayName("cancelAction returns 200 on success")
        void cancelActionReturns200OnSuccess() {
            ResponseEntity<Void> response = actionController.cancelAction(1L, 2L);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(actionService).deleteActionForUser(1L, 2L);
        }

        @Test
        @DisplayName("cancelAction returns 500 on exception")
        void cancelActionReturns500OnException() {
            when(actionService.deleteActionForUser(1L, 2L)).thenThrow(new RuntimeException("db error"));

            ResponseEntity<Void> response = actionController.cancelAction(1L, 2L);

            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        }
    }
}

