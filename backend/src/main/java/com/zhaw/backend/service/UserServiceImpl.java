package com.zhaw.backend.service;

import com.zhaw.backend.mappers.UserMapper;
import com.zhaw.backend.model.dao.UserDao;
import com.zhaw.backend.model.dto.UserDto;
import com.zhaw.backend.model.entities.User;
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

    public UserServiceImpl(UserDao userDao) {
        this.userDao = userDao;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findUserById(Long id) {
        return userDao.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto findUserByUsername(String username) {
        Optional<User> user = userDao.findByUsername(username);
        return user.map(UserMapper::toDto).orElse(null);
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

}
