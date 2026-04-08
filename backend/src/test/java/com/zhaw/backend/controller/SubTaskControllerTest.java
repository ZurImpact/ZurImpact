package com.zhaw.backend.controller;

import com.zhaw.backend.model.dto.GpsActionTaskDto;
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
        @DisplayName("returns 404 when subtask not found")
        void returns404WhenNotFound() {
            GpsActionTaskDto dto = new GpsActionTaskDto();
            when(subTaskService.updateSubTask(99L, dto)).thenReturn(false);

            ResponseEntity<Void> response = subTaskController.updateSubTask(99L, dto);

            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        }

        @Test
        @DisplayName("returns 500 when service throws exception")
        void returns500OnException() {
            GpsActionTaskDto dto = new GpsActionTaskDto();
            when(subTaskService.updateSubTask(1L, dto)).thenThrow(new RuntimeException("db error"));

            ResponseEntity<Void> response = subTaskController.updateSubTask(1L, dto);

            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
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
        @DisplayName("returns 404 when subtask not found")
        void returns404WhenNotFound() {
            when(subTaskService.deleteSubTask(99L)).thenReturn(false);

            ResponseEntity<Void> response = subTaskController.deleteSubTask(99L);

            assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        }

        @Test
        @DisplayName("returns 500 when service throws exception")
        void returns500OnException() {
            when(subTaskService.deleteSubTask(1L)).thenThrow(new RuntimeException("db error"));

            ResponseEntity<Void> response = subTaskController.deleteSubTask(1L);

            assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        }
    }
}