package com.zhaw.backend.service;

import com.zhaw.backend.mappers.UserMapper;
import com.zhaw.backend.model.dao.UserDao;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.model.entities.User;
import com.zhaw.backend.service.auth.EmailChangeTokenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Default implementation of {@link UserService}.
 * Owns the transactional boundaries; delegates CRUD to {@link UserDao}.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserDao userDao;
    private final EmailChangeTokenService emailChangeTokenService;

    public UserServiceImpl(UserDao userDao, EmailChangeTokenService emailChangeTokenService) {
        this.userDao = userDao;
        this.emailChangeTokenService = emailChangeTokenService;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findUserById(Long id) {
        return userDao.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto findUserByUsername(String username) {
        return userDao.findByUsername(username)
                .map(user -> UserMapper.toDto(user, emailChangeTokenService.hasPendingEmailToken(user.getId())))
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> findAllUsers() {
        return userDao.findAll();
    }

    @Override
    @Transactional
    public User saveUser(User user) {
        return userDao.save(user);
    }

    @Override
    @Transactional
    public void deleteUserById(Long id) {
        userDao.deleteById(id);
    }

    @Override
    @Transactional
    public boolean addPointsToUser(Long userId, Integer points) {
        Optional<User> userOpt = userDao.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPoints(user.getPoints() + points);
            userDao.save(user);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public boolean deductPointsFromUser(Long userId, Integer points) {
        Optional<User> userOpt = userDao.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPoints() < points) {
                return false;
            }
            user.setPoints(user.getPoints() - points);
            userDao.save(user);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public boolean changeUsername(Long userId, String newUsername) {
        if (newUsername == null) {
            return false;
        }
        String normalized = newUsername.trim();
        if(normalized.length() < 3 || normalized.length() > 50) {
            throw new IllegalArgumentException("Username must be between 3 and 50 characters");
        }
        Optional<User> userOptional = userDao.findById(userId);
        if(userOptional.isEmpty()){
            throw new IllegalArgumentException("User with id " + userId + " not found");
        }
        userOptional = userDao.findByUsername(normalized);
        if(userOptional.isPresent() && !userOptional.get().getId().equals(userId)){
            throw new IllegalArgumentException("Username " + normalized + " is already taken");
        }

        try {
            userDao.updateUsername(userId, normalized);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update username for user with id " + userId, e);
        }
    }
}
