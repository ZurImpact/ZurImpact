package com.zhaw.backend.service;

import com.zhaw.backend.mappers.UserActionHistoryMapper;
import com.zhaw.backend.model.dto.UserActionHistoryDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserActionHistoryServiceImpl implements UserActionHistoryService{

    /**
     * Get all actions with a user has done
     * @param userId id of the user for which the action history should be retrieved
     * @return all actions done by that user
     */
    @Override
    public List<UserActionHistoryDto> getUserActions(Long userId, Boolean active){
        return UserActionHistoryMapper.toDtoList(actionDao.findUserActionHistory(userId, active));
    }
}
