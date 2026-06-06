package com.zhaw.backend.service;

import com.zhaw.backend.enums.Role;
import com.zhaw.backend.exception.BadRequestException;
import com.zhaw.backend.exception.ConflictException;
import com.zhaw.backend.exception.NotFoundException;
import com.zhaw.backend.model.dao.ActionDao;
import com.zhaw.backend.model.dao.UserDao;
import com.zhaw.backend.model.dao.VoucherDao;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.model.entities.User;
import com.zhaw.backend.service.auth.EmailChangeTokenService;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link UserServiceImpl}.
 * Uses Mockito to isolate the service layer from the DAO.
 * No database is involved — these tests are fast and deterministic.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserServiceImpl – Unit Tests")
class UserServiceImplTest {

    @Mock
    private UserDao userDao;

    @Mock
    private ActionDao actionDao;

    @Mock
    private VoucherDao voucherDao;

    @Mock
    private EmailChangeTokenService emailChangeTokenService;

    private UserServiceImpl userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl(userDao, actionDao, voucherDao, emailChangeTokenService);
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setUsername("testuser");
        sampleUser.setEmail("test@example.com");
        sampleUser.setPasswordHash("hashed_pw");
        sampleUser.setCreatedAt(LocalDateTime.of(2025, 1, 1, 12, 0));
    }

    private User user(String username, String rawPassword, Role role, boolean verified) {
        return User.builder().id(11L)
                .username(username)
                .email(username + "@example.com")
                .passwordHash("hased_" + rawPassword)
                .role(role.name())
                .emailVerified(verified)
                .build();
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
            when(emailChangeTokenService.hasPendingEmailToken(1L)).thenReturn(false);

            UserDto result = userService.findUserByUsername("testuser");

            assertNotNull(result);
            assertEquals("test@example.com", result.getEmail());
            assertEquals("testuser", result.getUsername());
            assertEquals(1L, result.getId());
            assertFalse(result.getHasPendingEmailChange());
            verify(userDao).findByUsername("testuser");
            verify(emailChangeTokenService).hasPendingEmailToken(1L);
        }

        @Test
        @DisplayName("returns emtpy when username does not exist")
        void returnsEmpty_whenNotFound() {
            when(userDao.findByUsername("unknown")).thenReturn(Optional.empty());

            UserDto result = userService.findUserByUsername("unknown");

            assertNull(result);
            verify(userDao).findByUsername("unknown");
            verify(emailChangeTokenService, never()).hasPendingEmailToken(anyLong());
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
        @DisplayName("deletes action mappings and unassigns vouchers before deleting user")
        void delegatesToDao() {
            doNothing().when(actionDao).deleteAllByUserId(1L);
            doNothing().when(voucherDao).unassignVoucherCodesFromUser(1L);
            doNothing().when(userDao).deleteById(1L);

            userService.deleteUserById(1L);

            verify(actionDao, times(1)).deleteAllByUserId(1L);
            verify(voucherDao, times(1)).unassignVoucherCodesFromUser(1L);
            verify(userDao, times(1)).deleteById(1L);
        }
    }

    // ── addPointsToUser ──────────────────────────────────────────────────

    @Nested
    @DisplayName("addPointsToUser")
    class AddPointsToUser {

        @Test
        @DisplayName("adds points and saves user when user exists")
        void addsPointsAndSavesUser_whenUserExists() {
            sampleUser.setPoints(10);
            when(userDao.findById(1L)).thenReturn(Optional.of(sampleUser));
            when(userDao.save(sampleUser)).thenReturn(sampleUser);

            boolean result = userService.addPointsToUser(1L, 5);

            assertTrue(result);
            assertEquals(15, sampleUser.getPoints());
            verify(userDao).findById(1L);
            verify(userDao).save(sampleUser);
        }

        @Test
        @DisplayName("returns false and does not save when user does not exist")
        void returnsFalseAndDoesNotSave_whenUserMissing() {
            when(userDao.findById(404L)).thenReturn(Optional.empty());

            boolean result = userService.addPointsToUser(404L, 5);

            assertFalse(result);
            verify(userDao).findById(404L);
            verify(userDao, never()).save(any(User.class));
        }
    }

    // ── deductPointsFromUser ─────────────────────────────────────────────

    @Nested
    @DisplayName("deductPointsFromUser")
    class DeductPointsFromUser {

        @Test
        @DisplayName("deducts points and saves when user has enough points")
        void deductsPointsAndSaves_whenSufficient() {
            sampleUser.setPoints(50);
            when(userDao.findById(1L)).thenReturn(Optional.of(sampleUser));
            when(userDao.save(sampleUser)).thenReturn(sampleUser);

            boolean result = userService.deductPointsFromUser(1L, 20);

            assertTrue(result);
            assertEquals(30, sampleUser.getPoints());
            verify(userDao).save(sampleUser);
        }

        @Test
        @DisplayName("returns false and does not save when points are insufficient")
        void returnsFalse_whenInsufficientPoints() {
            sampleUser.setPoints(10);
            when(userDao.findById(1L)).thenReturn(Optional.of(sampleUser));

            boolean result = userService.deductPointsFromUser(1L, 50);

            assertFalse(result);
            assertEquals(10, sampleUser.getPoints());
            verify(userDao, never()).save(any(User.class));
        }

        @Test
        @DisplayName("returns false when user does not exist")
        void returnsFalse_whenUserMissing() {
            when(userDao.findById(404L)).thenReturn(Optional.empty());

            boolean result = userService.deductPointsFromUser(404L, 10);

            assertFalse(result);
            verify(userDao, never()).save(any(User.class));
        }
    }

    @Test
    @DisplayName("changeUsername successfully updates username for valid input")
    void changeUsernameSuccess() {
        User u = User.builder().build();
        user("alice", "secret", Role.ROLE_USER, true);
        when(userDao.findById(11L)).thenReturn(Optional.of(u));
        when(userDao.findByUsername("newusername")).thenReturn(Optional.empty());

        boolean result = userService.changeUsername(11L, "newusername");

        assertTrue(result);
        verify(userDao).updateUsername(11L, "newusername");
    }

    @Test
    @DisplayName("changeUsername trims whitespace from username")
    void changeUsernameTrimmed() {
        User u = user("alice", "secret", Role.ROLE_USER, true);
        when(userDao.findById(11L)).thenReturn(Optional.of(u));
        when(userDao.findByUsername("trimmed")).thenReturn(Optional.empty());

        boolean result = userService.changeUsername(11L, "  trimmed  ");

        assertTrue(result);
        verify(userDao).updateUsername(11L, "trimmed");
    }

    @Test
    @DisplayName("changeUsername throws when username already taken by another user")
    void changeUsernameDuplicateThrows() {
        User u = user("alice", "secret", Role.ROLE_USER, true);
        User other = user("existing", "secret", Role.ROLE_USER, true);
        other.setId(22L);

        when(userDao.findById(11L)).thenReturn(Optional.of(u));
        when(userDao.findByUsername("existing")).thenReturn(Optional.of(other));

        assertThrows(ConflictException.class,
                () -> userService.changeUsername(11L, "existing"));

        verify(userDao, never()).updateUsername(anyLong(), anyString());
    }

    @Test
    @DisplayName("changeUsername allows same username for same user (idempotent)")
    void changeUsernameSameUserAllowed() {
        User u = user("alice", "secret", Role.ROLE_USER, true);
        when(userDao.findById(11L)).thenReturn(Optional.of(u));
        when(userDao.findByUsername("alice")).thenReturn(Optional.of(u));

        boolean result = userService.changeUsername(11L, "alice");

        assertTrue(result);
        verify(userDao).updateUsername(11L, "alice");
    }

    @Test
    @DisplayName("changeUsername handles minimum valid length (3 chars)")
    void changeUsernameMinValidLength() {
        User u = user("alice", "secret", Role.ROLE_USER, true);
        when(userDao.findById(11L)).thenReturn(Optional.of(u));
        when(userDao.findByUsername("abc")).thenReturn(Optional.empty());

        boolean result = userService.changeUsername(11L, "abc");

        assertTrue(result);
        verify(userDao).updateUsername(11L, "abc");
    }

    @Test
    @DisplayName("changeUsername handles maximum valid length (50 chars)")
    void changeUsernameMaxValidLength() {
        String maxLength = "a".repeat(50);
        User u = user("alice", "secret", Role.ROLE_USER, true);
        when(userDao.findById(11L)).thenReturn(Optional.of(u));
        when(userDao.findByUsername(maxLength)).thenReturn(Optional.empty());

        boolean result = userService.changeUsername(11L, maxLength);

        assertTrue(result);
        verify(userDao).updateUsername(11L, maxLength);
    }

    @Test
    @DisplayName("changeUsername returns false for a null username")
    void changeUsernameNullReturnsFalse() {
        assertFalse(userService.changeUsername(11L, null));
        verify(userDao, never()).updateUsername(anyLong(), anyString());
    }

    @Test
    @DisplayName("changeUsername throws BadRequestException when too short")
    void changeUsernameTooShortThrows() {
        assertThrows(BadRequestException.class, () -> userService.changeUsername(11L, "ab"));
        verify(userDao, never()).updateUsername(anyLong(), anyString());
    }

    @Test
    @DisplayName("changeUsername throws NotFoundException when the user does not exist")
    void changeUsernameUserNotFoundThrows() {
        when(userDao.findById(11L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> userService.changeUsername(11L, "validname"));
        verify(userDao, never()).updateUsername(anyLong(), anyString());
    }
}
