package com.zhaw.backend.service;

import com.zhaw.backend.model.dao.UserActionHistoryDao;
import com.zhaw.backend.model.entities.UserActionHistory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserActionHistoryServiceImpl - Unit Tests")
public class UserActionHistoryServiceImplTest {

    @Mock
    private UserActionHistoryDao userActionHistoryDao;
    
    private UserActionHistoryServiceImpl userActionHistoryService;

    @BeforeEach
    void setUp() {
        userActionHistoryService = new UserActionHistoryServiceImpl(userActionHistoryDao);
    }

    @Nested
    @DisplayName("delegation methods")
    class DelegationMethods {

        @Test
        @DisplayName("getUserActions delegates to DAO")
        void getUserActionsDelegatesToDao() {
            List<UserActionHistory> history = Collections.singletonList(UserActionHistory.builder().actionId(1L).build());
            when(userActionHistoryDao.findUserActionHistory(5L, true)).thenReturn(history);

            var result = userActionHistoryService.getUserActions(5L, true);

            assertEquals(1, result.size());
            assertEquals(1L, result.getFirst().getActionId());
            verify(userActionHistoryDao).findUserActionHistory(5L, true);
        }
    }
}
