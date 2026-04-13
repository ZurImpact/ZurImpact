package com.zhaw.backend.service;

import com.zhaw.backend.model.dao.UserDao;
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
    public Optional<User> findUserByUsername(String username) {
        return userDao.findByUsername(username);
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

}
