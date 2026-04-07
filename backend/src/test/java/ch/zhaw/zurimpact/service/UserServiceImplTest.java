package ch.zhaw.zurimpact.service;

import com.zhaw.backend.model.dao.UserDao;
import com.zhaw.backend.model.entities.User;
import com.zhaw.backend.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit tests for {@link com.zhaw.backend.service.UserServiceImpl}.
 * Uses Mockito to isolate the service layer from the DAO.
 * No database is involved — these tests are fast and deterministic.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl – Unit Tests")
class UserServiceImplTest {

    @Mock
    private UserDao userDao;

    private UserServiceImpl userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl(userDao);
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("testuser");
        sampleUser.setEmail("test@example.com");
        sampleUser.setPasswordHash("hashed_pw");
        sampleUser.setCreatedAt(LocalDateTime.of(2025, 1, 1, 12, 0));
    }

    // ── findUserById ────────────────────────────────────────────────────

    @Nested
    @DisplayName("findUserById")
    class FindUserById {

        @Test
        @DisplayName("returns the user when found")
        void returnsUser_whenFound() {
            when(userDao.findById(1L)).thenReturn(Optional.of(sampleUser));

            Optional<User> result = userService.findUserById(1L);

            assertTrue(result.isPresent());
            assertEquals("testuser", result.get().getUsername());
            verify(userDao).findById(1L);
            verifyNoMoreInteractions(userDao);
        }

        @Test
        @DisplayName("returns empty when user does not exist")
        void returnsEmpty_whenNotFound() {
            when(userDao.findById(99L)).thenReturn(Optional.empty());

            Optional<User> result = userService.findUserById(99L);

            assertTrue(result.isEmpty());
            verify(userDao).findById(99L);
        }
    }

    // ── findUserByUsername ───────────────────────────────────────────────

    @Nested
    @DisplayName("findUserByUsername")
    class FindUserByUsername {

        @Test
        @DisplayName("returns the user when found")
        void returnsUser_whenFound() {
            when(userDao.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));

            Optional<User> result = userService.findUserByUsername("testuser");

            assertTrue(result.isPresent());
            assertEquals("test@example.com", result.get().getEmail());
            verify(userDao).findByUsername("testuser");
        }

        @Test
        @DisplayName("returns empty when username does not exist")
        void returnsEmpty_whenNotFound() {
            when(userDao.findByUsername("unknown")).thenReturn(Optional.empty());

            Optional<User> result = userService.findUserByUsername("unknown");

            assertTrue(result.isEmpty());
            verify(userDao).findByUsername("unknown");
        }
    }

    // ── findAllUsers ────────────────────────────────────────────────────

    @Nested
    @DisplayName("findAllUsers")
    class FindAllUsers {

        @Test
        @DisplayName("returns all users")
        void returnsAllUsers() {
            User anotherUser = new User();
            anotherUser.setId(2L);
            anotherUser.setUsername("another");
            when(userDao.findAll()).thenReturn(Arrays.asList(sampleUser, anotherUser));

            List<User> result = userService.findAllUsers();

            assertEquals(2, result.size());
            verify(userDao).findAll();
        }

        @Test
        @DisplayName("returns empty list when no users exist")
        void returnsEmptyList_whenNoUsers() {
            when(userDao.findAll()).thenReturn(Collections.emptyList());

            List<User> result = userService.findAllUsers();

            assertNotNull(result);
            assertTrue(result.isEmpty());
            verify(userDao).findAll();
        }
    }

    // ── saveUser ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("saveUser")
    class SaveUser {

        @Test
        @DisplayName("delegates to DAO and returns saved user")
        void delegatesToDao() {
            when(userDao.save(any(User.class))).thenReturn(sampleUser);

            User result = userService.saveUser(sampleUser);

            assertEquals(sampleUser.getId(), result.getId());
            assertEquals(sampleUser.getUsername(), result.getUsername());
            verify(userDao).save(sampleUser);
        }

        @Test
        @DisplayName("passes through a new user (id == null) to DAO")
        void savesNewUser() {
            User newUser = new User();
            newUser.setUsername("newuser");
            newUser.setEmail("new@example.com");
            newUser.setPasswordHash("pw");

            User savedUser = new User();
            savedUser.setId(10L);
            savedUser.setUsername("newuser");
            when(userDao.save(newUser)).thenReturn(savedUser);

            User result = userService.saveUser(newUser);

            assertEquals(10L, result.getId());
            verify(userDao).save(newUser);
        }
    }

    // ── deleteUserById ──────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteUserById")
    class DeleteUserById {

        @Test
        @DisplayName("delegates to DAO")
        void delegatesToDao() {
            doNothing().when(userDao).deleteById(1L);

            userService.deleteUserById(1L);

            verify(userDao, times(1)).deleteById(1L);
            verifyNoMoreInteractions(userDao);
        }
    }
}
