package com.zhaw.backend.service;

import com.zhaw.backend.mappers.UserActionHistoryMapper;
import com.zhaw.backend.model.dao.UserActionHistoryDao;
import com.zhaw.backend.model.dto.UserActionHistoryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserActionHistoryServiceImpl implements UserActionHistoryService{

    private final UserActionHistoryDao userActionHistoryDao;

    /**
     * Get all actions with a user has done
     * @param userId id of the user for which the action history should be retrieved
     * @return all actions done by that user
     */
    @Override
    public List<UserActionHistoryDto> getUserActions(Long userId, Boolean active){
        return UserActionHistoryMapper.toDtoList(userActionHistoryDao.findUserActionHistory(userId, active));
    }
}
