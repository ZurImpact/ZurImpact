package com.zhaw.backend.controller;

import com.zhaw.backend.exception.NotFoundException;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
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
        void returns200WhenServiceSucceeds() {
            LocalDateTime validUntil = LocalDateTime.of(2026, 12, 1, 10, 0);
            when(actionService.getActions("bike", 10, "FOOD", validUntil)).thenReturn(List.of(actionDto(1L)));

            ResponseEntity<List<ActionDto>> response = actionController.getActions("bike", 10, "FOOD", validUntil);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals(1, response.getBody().size());
            verify(actionService).getActions("bike", 10, "FOOD", validUntil);
        }

        @Test
        @DisplayName("propagates service exception to the global handler")
        void propagatesWhenServiceThrows() {
            when(actionService.getActions(null, null, null, null)).thenThrow(new RuntimeException("db error"));

            assertThrows(RuntimeException.class, () -> actionController.getActions(null, null, null, null));
        }
    }

    @Nested
    @DisplayName("getAction")
    class GetAction {

        @Test
        @DisplayName("returns 200 when action exists")
        void returns200WhenActionExists() {
            when(actionService.getActionById(1L)).thenReturn(actionDto(1L));

            ResponseEntity<ActionDto> response = actionController.getAction(1L);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertNotNull(response.getBody());
            assertEquals(1L, response.getBody().getId());
        }

        @Test
        @DisplayName("throws NotFoundException when action does not exist")
        void throwsNotFoundWhenActionDoesNotExist() {
            when(actionService.getActionById(99L)).thenReturn(null);

            assertThrows(NotFoundException.class, () -> actionController.getAction(99L));
        }

        @Test
        @DisplayName("propagates service exception to the global handler")
        void propagatesWhenServiceThrows() {
            when(actionService.getActionById(1L)).thenThrow(new RuntimeException("db error"));

            assertThrows(RuntimeException.class, () -> actionController.getAction(1L));
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
        @DisplayName("propagates service exception to the global handler")
        void propagatesWhenCreateThrows() {
            ActionDto input = actionDto(null);
            when(actionService.createAction(input)).thenThrow(new RuntimeException("db error"));

            assertThrows(RuntimeException.class, () -> actionController.createAction(input));
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
        @DisplayName("throws NotFoundException when action was not found")
        void throwsNotFoundWhenNotFound() {
            ActionDto dto = actionDto(99L);
            when(actionService.updateAction(99L, dto)).thenReturn(false);

            assertThrows(NotFoundException.class, () -> actionController.updateAction(99L, dto));
        }

        @Test
        @DisplayName("propagates service exception to the global handler")
        void propagatesWhenUpdateThrows() {
            ActionDto dto = actionDto(1L);
            when(actionService.updateAction(1L, dto)).thenThrow(new RuntimeException("db error"));

            assertThrows(RuntimeException.class, () -> actionController.updateAction(1L, dto));
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
        @DisplayName("throws NotFoundException when action was not found")
        void throwsNotFoundWhenNotFound() {
            when(actionService.deleteAction(99L)).thenReturn(false);

            assertThrows(NotFoundException.class, () -> actionController.deleteAction(99L));
        }

        @Test
        @DisplayName("propagates service exception to the global handler")
        void propagatesWhenDeleteThrows() {
            when(actionService.deleteAction(1L)).thenThrow(new RuntimeException("db error"));

            assertThrows(RuntimeException.class, () -> actionController.deleteAction(1L));
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
        @DisplayName("startAction propagates service exception")
        void startActionPropagatesException() {
            when(actionService.startActionForUser(1L, 2L, true, "5")).thenThrow(new RuntimeException("db error"));

            assertThrows(RuntimeException.class, () -> actionController.startAction(1L, 2L, true, "5"));
        }

        @Test
        @DisplayName("completeAction returns 200 on success")
        void completeActionReturns200OnSuccess() {
            ResponseEntity<Void> response = actionController.completeAction(1L, 2L);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(actionService).completeActionForUser(1L, 2L);
        }

        @Test
        @DisplayName("completeAction propagates service exception")
        void completeActionPropagatesException() {
            when(actionService.completeActionForUser(1L, 2L)).thenThrow(new RuntimeException("failed"));

            assertThrows(RuntimeException.class, () -> actionController.completeAction(1L, 2L));
        }

        @Test
        @DisplayName("cancelAction returns 200 on success")
        void cancelActionReturns200OnSuccess() {
            ResponseEntity<Void> response = actionController.cancelAction(1L, 2L);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(actionService).deleteActionForUser(1L, 2L);
        }

        @Test
        @DisplayName("cancelAction propagates service exception")
        void cancelActionPropagatesException() {
            when(actionService.deleteActionForUser(1L, 2L)).thenThrow(new RuntimeException("db error"));

            assertThrows(RuntimeException.class, () -> actionController.cancelAction(1L, 2L));
        }
    }
}
