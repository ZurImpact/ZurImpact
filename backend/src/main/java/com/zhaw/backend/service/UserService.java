package com.zhaw.backend.service;

import com.zhaw.backend.model.entities.User;

import java.util.List;
import java.util.Optional;

/**
 * Service contract for {@link User} business operations.
 */
public interface UserService {

    Optional<User> findUserById(Long id);

    Optional<User> findUserByUsername(String username);

    List<User> findAllUsers();

    User saveUser(User user);

    void deleteUserById(Long id);

    boolean addPointsToUser(Long userId, Integer points);
}
