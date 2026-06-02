package com.zhaw.backend.controller;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.exception.NotFoundException;
import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.model.dto.SubTaskCompletionRequestDto;
import com.zhaw.backend.service.SubTaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("SubTaskController - Unit Tests")
class SubTaskControllerTest {

    @Mock
    private SubTaskService subTaskService;

    @InjectMocks
    private SubTaskController subTaskController;

    @Nested
    @DisplayName("completeSubTask")
    class CompleteSubTask {

        private SubTaskCompletionRequestDto buildRequest() {
            return SubTaskCompletionRequestDto.builder()
                    .userId(1L).actionId(2L).subTaskId(3L)
                    .actionType(ActionType.GPS).build();
        }

        @Test
        @DisplayName("returns 200 when subtask is completed successfully")
        void returns200WhenCompleted() throws Exception {
            SubTaskCompletionRequestDto dto = buildRequest();
            when(subTaskService.completeSubTaskForUser(dto)).thenReturn(true);

            ResponseEntity<Void> response = subTaskController.completeSubTask(dto);

            assertEquals(HttpStatus.OK, response.getStatusCode());
            verify(subTaskService).completeSubTaskForUser(dto);
        }

        @Test
        @DisplayName("propagates service exception to the global handler")
        void propagatesOnException() throws Exception {
            SubTaskCompletionRequestDto dto = buildRequest();
            when(subTaskService.completeSubTaskForUser(dto)).thenThrow(new RuntimeException("gps error"));

            assertThrows(RuntimeException.class, () -> subTaskController.completeSubTask(dto));
        }
    }

    @Nested
    @DisplayName("updateSubTask")
    class UpdateSubTask {

        @Test
        @DisplayName("returns 204 when subtask is updated")
        void returns204WhenUpdated() {
            GpsActionTaskDto dto = new GpsActionTaskDto();
            when(subTaskService.updateSubTask(1L, dto)).thenReturn(true);

            ResponseEntity<Void> response = subTaskController.updateSubTask(1L, dto);

            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
            verify(subTaskService).updateSubTask(1L, dto);
        }

        @Test
        @DisplayName("throws NotFoundException when subtask not found")
        void throwsNotFoundWhenNotFound() {
            GpsActionTaskDto dto = new GpsActionTaskDto();
            when(subTaskService.updateSubTask(99L, dto)).thenReturn(false);

            assertThrows(NotFoundException.class, () -> subTaskController.updateSubTask(99L, dto));
        }

        @Test
        @DisplayName("propagates service exception to the global handler")
        void propagatesOnException() {
            GpsActionTaskDto dto = new GpsActionTaskDto();
            when(subTaskService.updateSubTask(1L, dto)).thenThrow(new RuntimeException("db error"));

            assertThrows(RuntimeException.class, () -> subTaskController.updateSubTask(1L, dto));
        }
    }

    @Nested
    @DisplayName("deleteSubTask")
    class DeleteSubTask {

        @Test
        @DisplayName("returns 204 when subtask is deleted")
        void returns204WhenDeleted() {
            when(subTaskService.deleteSubTask(1L)).thenReturn(true);

            ResponseEntity<Void> response = subTaskController.deleteSubTask(1L);

            assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
            verify(subTaskService).deleteSubTask(1L);
        }

        @Test
        @DisplayName("throws NotFoundException when subtask not found")
        void throwsNotFoundWhenNotFound() {
            when(subTaskService.deleteSubTask(99L)).thenReturn(false);

            assertThrows(NotFoundException.class, () -> subTaskController.deleteSubTask(99L));
        }

        @Test
        @DisplayName("propagates service exception to the global handler")
        void propagatesOnException() {
            when(subTaskService.deleteSubTask(1L)).thenThrow(new RuntimeException("db error"));

            assertThrows(RuntimeException.class, () -> subTaskController.deleteSubTask(1L));
        }
    }
}
