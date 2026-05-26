package com.zhaw.backend.service;

import com.zhaw.backend.model.dto.UserResponseDto;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.model.entities.User;

import java.util.List;
import java.util.Optional;

/**
 * Service contract for {@link User} business operations.
 */
public interface UserService {

    Optional<User> findUserById(Long id);

    Optional<UserResponseDto> getUserProfile(Long id);

    UserDto findUserByUsername(String username);

    List<User> findAllUsers();

    User saveUser(User user);

    void deleteUserById(Long id);

    boolean addPointsToUser(Long userId, Integer points);

    boolean deductPointsFromUser(Long userId, Integer points);

    boolean changeUsername(Long userId, String newUsername);
}
