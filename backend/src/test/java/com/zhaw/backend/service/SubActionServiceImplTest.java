package com.zhaw.backend.service;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.model.dao.SubActionDao;
import com.zhaw.backend.model.dto.SubActionCompletionRequestDto;
import com.zhaw.backend.model.dto.SubActionDto;
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
@DisplayName("SubActionServiceImpl - Unit Tests")
class SubActionServiceImplTest {

    @Mock
    private SubActionDao subActionDao;

    private SubActionServiceImpl subActionService;

    @BeforeEach
    void setUp() {
        subActionService = new SubActionServiceImpl(subActionDao);
    }

    @Nested
    @DisplayName("getSubActions")
    class GetSubActionsTests {

        @Test
        @DisplayName("Should return GPS subactions for GPS action type")
        void shouldReturnGpsSubActionsForGpsType() throws Exception {
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
            when(subActionDao.findGpsSubAction(actionId)).thenReturn(gpsTasks);

            // When
            List<SubActionDto> result = subActionService.getSubActions(actionId, ActionType.GPS);

            // Then
            assertEquals(1, result.size());
            assertEquals("GPS Task 1", result.getFirst().getDescription());
        }

        @Test
        @DisplayName("Should throw exception when actionId is null")
        void shouldThrowExceptionWhenActionIdIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.getSubActions(null, ActionType.GPS));
            assertEquals("Action ID and Action Type must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when actionType is null")
        void shouldThrowExceptionWhenActionTypeIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.getSubActions(1L, null));
            assertEquals("Action ID and Action Type must not be null", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("completeSubActionForUser")
    class CompleteSubActionForUserTests {

        @Test
        @DisplayName("Should complete GPS subaction successfully when coordinates match")
        void shouldCompleteGpsSubactionSuccessfully() throws Exception {
            // Given
            Long userId = 1L;
            Long actionId = 1L;
            Long subactionId = 10L;
            Float gpsx = 10.0f;
            Float gpsy = 20.0f;

            Map<String, Object> additionalData = new HashMap<>();
            additionalData.put("gpsX", gpsx);
            additionalData.put("gpsY", gpsy);

            SubActionCompletionRequestDto requestDto = SubActionCompletionRequestDto.builder()
                    .userId(userId)
                    .actionId(actionId)
                    .subActionId(subactionId)
                    .actionType(ActionType.GPS)
                    .additionalData(additionalData)
                    .build();

            GpsActionTask gpsTask = new GpsActionTask();
            gpsTask.setId(10L);
            gpsTask.setGpsX(10.0f);
            gpsTask.setGpsY(20.0f);
            when(subActionDao.findGpsSubActionById(10L)).thenReturn(gpsTask);
            when(subActionDao.completeSubActionForUser(userId, actionId, true, subactionId.toString())).thenReturn(true);

            // When
            boolean result = subActionService.completeSubActionForUser(requestDto);

            // Then
            assertTrue(result);
        }

        @Test
        @DisplayName("Should return false when GPS coordinates are outside threshold")
        void shouldReturnFalseWhenGpsCoordinatesOutsideThreshold() throws Exception {
            // Given
            Long userId = 1L;
            Long actionId = 1L;
            Long subactionId = 10L;
            Float gpsx = 25.0f; // Outside 10.0 threshold from target 10.0
            Float gpsy = 20.0f;

            Map<String, Object> additionalData = new HashMap<>();
            additionalData.put("gpsX", gpsx);
            additionalData.put("gpsY", gpsy);

            SubActionCompletionRequestDto requestDto = SubActionCompletionRequestDto.builder()
                    .userId(userId)
                    .actionId(actionId)
                    .subActionId(subactionId)
                    .actionType(ActionType.GPS)
                    .additionalData(additionalData)
                    .build();

            GpsActionTask gpsTask = new GpsActionTask();
            gpsTask.setId(10L);
            gpsTask.setGpsX(10.0f);
            gpsTask.setGpsY(20.0f);
            when(subActionDao.findGpsSubActionById(10L)).thenReturn(gpsTask);

            // When
            boolean result = subActionService.completeSubActionForUser(requestDto);

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

            SubActionCompletionRequestDto requestDto = SubActionCompletionRequestDto.builder()
                    .userId(1L)
                    .actionId(1L)
                    .subActionId(10L)
                    .actionType(ActionType.GPS)
                    .additionalData(additionalData)
                    .build();

            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.completeSubActionForUser(requestDto));
            assertEquals("GPS coordinates must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when GPS subaction is not found")
        void shouldThrowExceptionWhenGpsSubactionNotFound() {
            // Given
            Map<String, Object> additionalData = new HashMap<>();
            additionalData.put("gpsX", 10.0f);
            additionalData.put("gpsY", 20.0f);

            SubActionCompletionRequestDto requestDto = SubActionCompletionRequestDto.builder()
                    .userId(1L)
                    .actionId(1L)
                    .subActionId(10L)
                    .actionType(ActionType.GPS)
                    .additionalData(additionalData)
                    .build();

            when(subActionDao.findGpsSubActionById(10L)).thenReturn(null);

            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.completeSubActionForUser(requestDto));
            assertTrue(exception.getMessage().contains("GPS SubAction not found"));
        }

        @Test
        @DisplayName("Should throw exception when unsupported action type is provided")
        void shouldThrowExceptionWhenUnsupportedActionType() {
            // Given
            Map<String, Object> additionalData = new HashMap<>();
            SubActionCompletionRequestDto requestDto = SubActionCompletionRequestDto.builder()
                    .userId(1L)
                    .actionId(1L)
                    .subActionId(10L)
                    .actionType(ActionType.PHOTO)  // Unsupported
                    .additionalData(additionalData)
                    .build();

            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.completeSubActionForUser(requestDto));
            assertTrue(exception.getMessage().contains("Unsupported SubAction Type"));
        }
    }
}
