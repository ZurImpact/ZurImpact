package com.zhaw.backend.service;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.model.dao.SubActionDao;
import com.zhaw.backend.model.dto.SubActionDto;
import com.zhaw.backend.model.entities.GpsActionTask;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("SubActionServiceImpl - Unit Tests")
class SubActionServiceImplTest {

    @Mock
    private SubActionDao subActionDao;

    @InjectMocks
    private SubActionServiceImpl subActionService;

    @Nested
    @DisplayName("getSubActionIds")
    class GetSubActionIdsTests {

        @Test
        @DisplayName("Should return GPS subaction IDs for GPS action type")
        void shouldReturnGpsSubActionIdsForGpsType() throws Exception {
            // Given
            Long actionId = 1L;
            List<Long> expectedIds = List.of(10L, 20L);
            when(subActionDao.findGpsSubActionIds(actionId)).thenReturn(expectedIds);

            // When
            List<Long> result = subActionService.getSubActionIds(actionId, ActionType.GPS);

            // Then
            assertEquals(expectedIds, result);
        }

        @Test
        @DisplayName("Should throw exception when actionId is null")
        void shouldThrowExceptionWhenActionIdIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.getSubActionIds(null, ActionType.GPS));
            assertEquals("Action ID and Action Type must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when actionType is null")
        void shouldThrowExceptionWhenActionTypeIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.getSubActionIds(1L, null));
            assertEquals("Action ID and Action Type must not be null", exception.getMessage());
        }
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
            gpsTask.setGpsZ(5.0f);
            List<GpsActionTask> gpsTasks = List.of(gpsTask);
            when(subActionDao.findGpsSubAction(actionId)).thenReturn(gpsTasks);

            // When
            List<SubActionDto> result = subActionService.getSubActions(actionId, ActionType.GPS);

            // Then
            assertEquals(1, result.size());
            assertEquals("GPS Task 1", result.get(0).getDescription());
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
    @DisplayName("validateCompletionForSubaction")
    class ValidateCompletionForSubactionTests {

        @Test
        @DisplayName("Should validate GPS subaction completion successfully")
        void shouldValidateGpsSubactionCompletionSuccessfully() throws Exception {
            // Given
            Long userId = 1L;
            Long actionId = 1L;
            String subactionId = "10";
            Float gpsx = 10.0f;
            Float gpsy = 20.0f;
            Float gpsz = 5.0f;

            GpsActionTask gpsTask = new GpsActionTask();
            gpsTask.setId(10L);
            gpsTask.setGpsX(10.0f);
            gpsTask.setGpsY(20.0f);
            gpsTask.setGpsZ(5.0f);
            when(subActionDao.findGpsSubActionById(10L)).thenReturn(gpsTask);

            // When
            boolean result = subActionService.validateCompletionForSubaction(userId, actionId, ActionType.GPS, subactionId, gpsx, gpsy, gpsz);

            // Then
            assertTrue(result);
        }

        @Test
        @DisplayName("Should throw exception for unsupported action type")
        void shouldThrowExceptionForUnsupportedActionType() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.validateCompletionForSubaction(1L, 1L, ActionType.PHOTO, "10", 10.0f, 20.0f, 5.0f));
            assertEquals("Unsupported Action Type: PHOTO", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when userId is null")
        void shouldThrowExceptionWhenUserIdIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.validateCompletionForSubaction(null, 1L, ActionType.GPS, "10", 10.0f, 20.0f, 5.0f));
            assertEquals("User ID, Action ID, Subaction ID and Action Type must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when actionId is null")
        void shouldThrowExceptionWhenActionIdIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.validateCompletionForSubaction(1L, null, ActionType.GPS, "10", 10.0f, 20.0f, 5.0f));
            assertEquals("User ID, Action ID, Subaction ID and Action Type must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when subactionId is null")
        void shouldThrowExceptionWhenSubactionIdIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.validateCompletionForSubaction(1L, 1L, ActionType.GPS, null, 10.0f, 20.0f, 5.0f));
            assertEquals("User ID, Action ID, Subaction ID and Action Type must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when actionType is null")
        void shouldThrowExceptionWhenActionTypeIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.validateCompletionForSubaction(1L, 1L, null, "10", 10.0f, 20.0f, 5.0f));
            assertEquals("User ID, Action ID, Subaction ID and Action Type must not be null", exception.getMessage());
        }
    }

    @Nested
    @DisplayName("completeGpsSubActionForUser")
    class CompleteGpsSubActionForUserTests {

        @Test
        @DisplayName("Should complete GPS subaction successfully when coordinates match")
        void shouldCompleteGpsSubactionSuccessfully() throws Exception {
            // Given
            Long userId = 1L;
            Long actionId = 1L;
            String subactionId = "10";
            Float gpsx = 10.0f;
            Float gpsy = 20.0f;
            Float gpsz = 5.0f;

            GpsActionTask gpsTask = new GpsActionTask();
            gpsTask.setId(10L);
            gpsTask.setGpsX(10.0f);
            gpsTask.setGpsY(20.0f);
            gpsTask.setGpsZ(5.0f);
            when(subActionDao.findGpsSubActionById(10L)).thenReturn(gpsTask);

            // When
            boolean result = subActionService.completeGpsSubActionForUser(userId, actionId, subactionId, gpsx, gpsy, gpsz);

            // Then
            assertTrue(result);
        }

        @Test
        @DisplayName("Should return false when GPS coordinates are outside threshold")
        void shouldReturnFalseWhenGpsCoordinatesOutsideThreshold() throws Exception {
            // Given
            Long userId = 1L;
            Long actionId = 1L;
            String subactionId = "10";
            Float gpsx = 25.0f; // Outside 10.0 threshold from target 10.0
            Float gpsy = 20.0f;
            Float gpsz = 5.0f;

            GpsActionTask gpsTask = new GpsActionTask();
            gpsTask.setId(10L);
            gpsTask.setGpsX(10.0f);
            gpsTask.setGpsY(20.0f);
            gpsTask.setGpsZ(5.0f);
            when(subActionDao.findGpsSubActionById(10L)).thenReturn(gpsTask);

            // When
            boolean result = subActionService.completeGpsSubActionForUser(userId, actionId, subactionId, gpsx, gpsy, gpsz);

            // Then
            assertFalse(result);
        }

        @Test
        @DisplayName("Should throw exception when userId is null")
        void shouldThrowExceptionWhenUserIdIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.completeGpsSubActionForUser(null, 1L, "10", 10.0f, 20.0f, 5.0f));
            assertEquals("User ID, Action ID, Subaction ID and GPS coordinates must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when actionId is null")
        void shouldThrowExceptionWhenActionIdIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.completeGpsSubActionForUser(1L, null, "10", 10.0f, 20.0f, 5.0f));
            assertEquals("User ID, Action ID, Subaction ID and GPS coordinates must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when subactionId is null")
        void shouldThrowExceptionWhenSubactionIdIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.completeGpsSubActionForUser(1L, 1L, null, 10.0f, 20.0f, 5.0f));
            assertEquals("User ID, Action ID, Subaction ID and GPS coordinates must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when gpsx is null")
        void shouldThrowExceptionWhenGpsxIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.completeGpsSubActionForUser(1L, 1L, "10", null, 20.0f, 5.0f));
            assertEquals("User ID, Action ID, Subaction ID and GPS coordinates must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when gpsy is null")
        void shouldThrowExceptionWhenGpsyIsNull() {
            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.completeGpsSubActionForUser(1L, 1L, "10", 10.0f, null, 5.0f));
            assertEquals("User ID, Action ID, Subaction ID and GPS coordinates must not be null", exception.getMessage());
        }

        @Test
        @DisplayName("Should throw exception when GPS subaction is not found")
        void shouldThrowExceptionWhenGpsSubactionNotFound() {
            // Given
            when(subActionDao.findGpsSubActionById(10L)).thenReturn(null);

            // When & Then
            Exception exception = assertThrows(Exception.class, () ->
                subActionService.completeGpsSubActionForUser(1L, 1L, "10", 10.0f, 20.0f, 5.0f));
            assertEquals("GPS SubAction not found for ID: 10", exception.getMessage());
        }
    }
}
