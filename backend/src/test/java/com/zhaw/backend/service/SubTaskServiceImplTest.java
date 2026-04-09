package com.zhaw.backend.service;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.model.dao.SubTaskDao;
import com.zhaw.backend.model.dto.SubTaskCompletionRequestDto;
import com.zhaw.backend.model.dto.SubTaskDto;
import com.zhaw.backend.model.entities.GpsActionTask;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("SubTaskServiceImpl - Unit Tests")
class SubTaskServiceImplTest {

    @Mock
    private SubTaskDao subTaskDao;

    private SubTaskServiceImpl subTaskService;

    @BeforeEach
    void setUp() {
        subTaskService = new SubTaskServiceImpl(subTaskDao);
    }

    @Nested
    @DisplayName("getSubTasks")
    class GetSubTasksTests {

        @Test
        @DisplayName("Should return GPS subtasks for GPS action type")
        void shouldReturnGpsSubTasksForGpsType() throws Exception {
            // Given
            Long actionId = 1L;
            GpsActionTask gpsTask = new GpsActionTask();
            gpsTask.setId(10L);
            gpsTask.setDescription("GPS Task 1");
            gpsTask.setDisplayName("Task 1");
            gpsTask.setActionId(actionId);
            gpsTask.setGpsX(10.0f);
            gpsTask.setGpsY(20.0f);
            List<GpsActionTask> gpsTasks = List.of(gpsTask);
            when(subTaskDao.findGpsSubTask(actionId)).thenReturn(gpsTasks);

            // When
            List<SubTaskDto> result = subTaskService.getSubTasks(actionId, ActionType.GPS);

            // Then
            assertEquals(1, result.size());
            assertEquals("GPS Task 1", result.getFirst().getDescription());
        }

        @Test
        @DisplayName("Should throw exception when actionId is null")
        void shouldThrowExceptionWhenActionIdIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subTaskService.getSubTasks(null, ActionType.GPS));
            assertEquals("Action ID and Action Type must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when actionType is null")
        void shouldThrowExceptionWhenActionTypeIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subTaskService.getSubTasks(1L, null));
            assertEquals("Action ID and Action Type must not be null", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("completeSubActionForUser")
    class CompleteSubTaskForUserTests {

        @Test
        @DisplayName("Should complete GPS subtask successfully when coordinates match")
        void shouldCompleteGpsSubTaskSuccessfully() throws Exception {
            // Given
            Long userId = 1L;
            Long actionId = 1L;
            Long subtaskId = 10L;
            Float gpsx = 10.0f;
            Float gpsy = 20.0f;

            Map<String, Object> additionalData = new HashMap<>();
            additionalData.put("gpsX", gpsx);
            additionalData.put("gpsY", gpsy);

            SubTaskCompletionRequestDto requestDto = SubTaskCompletionRequestDto.builder()
                    .userId(userId)
                    .actionId(actionId)
                    .subTaskId(subtaskId)
                    .actionType(ActionType.GPS)
                    .additionalData(additionalData)
                    .build();

            GpsActionTask gpsTask = new GpsActionTask();
            gpsTask.setId(10L);
            gpsTask.setGpsX(10.0f);
            gpsTask.setGpsY(20.0f);
            when(subTaskDao.findGpsSubTaskById(10L)).thenReturn(gpsTask);
            when(subTaskDao.completeSubTaskForUser(userId, actionId, true, subtaskId.toString())).thenReturn(true);

            // When
            boolean result = subTaskService.completeSubTaskForUser(requestDto);

            // Then
            assertTrue(result);
        }

        @Test
        @DisplayName("Should return false when GPS coordinates are outside threshold")
        void shouldReturnFalseWhenGpsCoordinatesOutsideThreshold() throws Exception {
            // Given
            Long userId = 1L;
            Long actionId = 1L;
            Long subtaskId = 10L;
            Float gpsx = 25.0f; // Outside 10.0 threshold from target 10.0
            Float gpsy = 20.0f;

            Map<String, Object> additionalData = new HashMap<>();
            additionalData.put("gpsX", gpsx);
            additionalData.put("gpsY", gpsy);

            SubTaskCompletionRequestDto requestDto = SubTaskCompletionRequestDto.builder()
                    .userId(userId)
                    .actionId(actionId)
                    .subTaskId(subtaskId)
                    .actionType(ActionType.GPS)
                    .additionalData(additionalData)
                    .build();

            GpsActionTask gpsTask = new GpsActionTask();
            gpsTask.setId(10L);
            gpsTask.setGpsX(10.0f);
            gpsTask.setGpsY(20.0f);
            when(subTaskDao.findGpsSubTaskById(10L)).thenReturn(gpsTask);

            // When
            boolean result = subTaskService.completeSubTaskForUser(requestDto);

            // Then
            assertFalse(result);
        }

        @Test
        @DisplayName("Should throw exception when GPS coordinates are null")
        void shouldThrowExceptionWhenGpsCoordinatesAreNull() {
            // Given
            Map<String, Object> additionalData = new HashMap<>();
            additionalData.put("gpsX", null);
            additionalData.put("gpsY", null);

            SubTaskCompletionRequestDto requestDto = SubTaskCompletionRequestDto.builder()
                    .userId(1L)
                    .actionId(1L)
                    .subTaskId(10L)
                    .actionType(ActionType.GPS)
                    .additionalData(additionalData)
                    .build();

            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subTaskService.completeSubTaskForUser(requestDto));
            assertEquals("GPS coordinates must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when GPS subtask is not found")
        void shouldThrowExceptionWhenGpsSubactionNotFound() {
            // Given
            Map<String, Object> additionalData = new HashMap<>();
            additionalData.put("gpsX", 10.0f);
            additionalData.put("gpsY", 20.0f);

            SubTaskCompletionRequestDto requestDto = SubTaskCompletionRequestDto.builder()
                    .userId(1L)
                    .actionId(1L)
                    .subTaskId(10L)
                    .actionType(ActionType.GPS)
                    .additionalData(additionalData)
                    .build();

            when(subTaskDao.findGpsSubTaskById(10L)).thenReturn(null);

            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subTaskService.completeSubTaskForUser(requestDto));
            assertTrue(exception.getMessage().contains("GPS SubTask not found"));
        }

        @Test
        @DisplayName("Should throw exception when unsupported action type is provided")
        void shouldThrowExceptionWhenUnsupportedActionType() {
            // Given
            Map<String, Object> additionalData = new HashMap<>();
            SubTaskCompletionRequestDto requestDto = SubTaskCompletionRequestDto.builder()
                    .userId(1L)
                    .actionId(1L)
                    .subTaskId(10L)
                    .actionType(ActionType.PHOTO)  // Unsupported
                    .additionalData(additionalData)
                    .build();

            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subTaskService.completeSubTaskForUser(requestDto));
            assertTrue(exception.getMessage().contains("Unsupported SubTask Type"));
        }
    }
}
