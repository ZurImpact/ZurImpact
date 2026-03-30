package com.zhaw.backend.service;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.model.dao.ActionDao;
import com.zhaw.backend.model.dto.SubActionDto;
import com.zhaw.backend.model.dto.UserActionHistoryDto;
import com.zhaw.backend.model.entities.Action;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ActionServiceImpl - Unit Tests")
class ActionServiceImplTest {

    @Mock
    private ActionDao actionDao;

    @Mock
    private SubActionService subActionService;

    @InjectMocks
    private ActionServiceImpl actionService;

    private Action buildAction(Long id, boolean hasSubtasks) {
        return Action.builder()
                .id(id)
                .description("desc " + id)
                .displayName("name " + id)
                .points(10)
                .tags("food,travel")
                .type(ActionType.GPS.name())
                .hasSubtasks(hasSubtasks)
                .validUntil(LocalDateTime.of(2026, 3, 1, 10, 0))
                .createdOn(LocalDateTime.of(2026, 1, 1, 8, 0))
                .build();
    }

    @Nested
    @DisplayName("getActions")
    class GetActions {

        @Test
        @DisplayName("does not call SubActionService when no subtasks")
        void doesNotCallSubActionServiceWhenNoSubtasks() throws Exception {
            Action action = buildAction(1L, false);
            when(actionDao.findAllFiltered(any())).thenReturn(List.of(action));

            List<?> result = actionService.getActions(null, null, null, null);

            assertEquals(1, result.size());
            verify(subActionService, never()).getSubActionIds(any(), any());
        }

        @Test
        @DisplayName("populates subActionDtoIdList when subtasks exist")
        void populatesSubActionIdsWhenSubtasksExist() throws Exception {
            Action action = buildAction(2L, true);
            when(actionDao.findAllFiltered(any())).thenReturn(List.of(action));
            when(subActionService.getSubActionIds(2L, ActionType.GPS)).thenReturn(List.of(11L, 12L));

            var result = actionService.getActions("text", 10, "food", null);

            assertEquals(1, result.size());
            assertEquals(List.of(11L, 12L), result.getFirst().getSubActionDtoIdList());
            verify(subActionService).getSubActionIds(2L, ActionType.GPS);
        }
    }

    @Nested
    @DisplayName("getActionById")
    class GetActionById {

        @Test
        @DisplayName("returns null when action not found")
        void returnsNullWhenNotFound() throws Exception {
            when(actionDao.findById(404L)).thenReturn(null);

            var result = actionService.getActionById(404L);

            assertNull(result);
            verify(subActionService, never()).getSubActions(any(), any());
        }

        @Test
        @DisplayName("does not call SubActionService when no subtasks")
        void doesNotCallSubActionServiceWhenNoSubtasks() throws Exception {
            Action action = buildAction(3L, false);
            when(actionDao.findById(3L)).thenReturn(action);

            var result = actionService.getActionById(3L);

            assertEquals(3L, result.getId());
            assertNull(result.getSubActionDtoList());
            verify(subActionService, never()).getSubActions(any(), any());
        }

        @Test
        @DisplayName("populates subActionDtoList when subtasks exist")
        void populatesSubActionListWhenSubtasksExist() throws Exception {
            Action action = buildAction(4L, true);
            when(actionDao.findById(4L)).thenReturn(action);
            List<SubActionDto> subActions = List.of(SubActionDto.builder().id(21L).actionId(4L).build());
            when(subActionService.getSubActions(4L, ActionType.GPS)).thenReturn(subActions);

            var result = actionService.getActionById(4L);

            assertEquals(4L, result.getId());
            assertEquals(subActions, result.getSubActionDtoList());
            verify(subActionService).getSubActions(4L, ActionType.GPS);
        }
    }

    @Nested
    @DisplayName("delegation methods")
    class DelegationMethods {

        @Test
        @DisplayName("getUserActions delegates to DAO")
        void getUserActionsDelegatesToDao() {
            List<UserActionHistoryDto> history = Collections.singletonList(UserActionHistoryDto.builder().actionId(1L).build());
            when(actionDao.findUserActionHistory(5L, true)).thenReturn(history);

            var result = actionService.getUserActions(5L, true);

            assertEquals(1, result.size());
            verify(actionDao).findUserActionHistory(5L, true);
        }

        @Test
        @DisplayName("startActionForUser delegates to DAO")
        void startActionForUserDelegatesToDao() {
            when(actionDao.startAction(7L, 8L, true, "sub-1")).thenReturn(true);

            boolean result = actionService.startActionForUser(7L, 8L, true, "sub-1");

            assertTrue(result);
            verify(actionDao).startAction(7L, 8L, true, "sub-1");
        }

        @Test
        @DisplayName("completeActionForUser with non-subtask delegates to DAO")
        void completeActionForUserWithNonSubtaskDelegatesToDao() throws Exception {
            when(subActionService.getSubActionsCompletionStatesForUser(7L, 8L)).thenReturn(null);
            when(actionDao.completeAction(7L, 8L, false, null)).thenReturn(true);

            boolean result = actionService.completeActionForUser(7L, 8L);

            assertTrue(result);
            verify(subActionService).getSubActionsCompletionStatesForUser(7L, 8L);
            verify(actionDao).completeAction(7L, 8L, false, null);
        }

        @Test
        @DisplayName("deleteActionForUser delegates to DAO")
        void deleteActionForUserDelegatesToDao() {
            when(actionDao.deleteAction(9L, 10L)).thenReturn(true);

            boolean result = actionService.deleteActionForUser(9L, 10L);

            assertTrue(result);
            verify(actionDao).deleteAction(9L, 10L);
        }
    }

    @Nested
    @DisplayName("completeActionForUser")
    class CompleteActionForUserTests {

        @Test
        @DisplayName("completes action when there are no sub-action completion states")
        void completesActionWhenNoSubActionStatesExist() throws Exception {
            when(subActionService.getSubActionsCompletionStatesForUser(1L, 2L)).thenReturn(null);
            when(actionDao.completeAction(1L, 2L, false, null)).thenReturn(true);

            boolean result = actionService.completeActionForUser(1L, 2L);

            assertTrue(result);
            verify(subActionService).getSubActionsCompletionStatesForUser(1L, 2L);
            verify(actionDao).completeAction(1L, 2L, false, null);
        }

        @Test
        @DisplayName("returns false and does not call DAO when any sub-action is not completed")
        void returnsFalseWhenACompletionStateIsNotCompleted() throws Exception {
            when(subActionService.getSubActionsCompletionStatesForUser(1L, 2L))
                    .thenReturn(List.of(Map.of("subaction_id", CompletionState.IN_PROGRESS)));

            boolean result = actionService.completeActionForUser(1L, 2L);

            assertFalse(result);
            verify(subActionService).getSubActionsCompletionStatesForUser(1L, 2L);
            verify(actionDao, never()).completeAction(anyLong(), anyLong(), any(), any());
        }

        @Test
        @DisplayName("returns false when DAO fails to complete action")
        void returnsFalseWhenDaoFailsToCompleteAction() throws Exception {
            when(subActionService.getSubActionsCompletionStatesForUser(1L, 2L)).thenReturn(Collections.emptyList());
            when(actionDao.completeAction(1L, 2L, false, null)).thenReturn(false);

            boolean result = actionService.completeActionForUser(1L, 2L);

            assertFalse(result);
            verify(actionDao).completeAction(1L, 2L, false, null);
        }
    }
}
