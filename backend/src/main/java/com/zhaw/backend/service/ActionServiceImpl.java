package com.zhaw.backend.service;

import com.zhaw.backend.mappers.ActionFilterMapper;
import com.zhaw.backend.mappers.ActionMapper;
import com.zhaw.backend.model.dao.ActionDao;
import com.zhaw.backend.model.dto.ActionDto;
import com.zhaw.backend.model.dto.UserActionHistoryDto;
import com.zhaw.backend.model.dto.filters.ActionFilterDto;
import com.zhaw.backend.model.entities.Action;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;


/**
 * Service implementation for managing actions.
 */
@Service
public class ActionServiceImpl implements ActionService {

    @Autowired
    private ActionDao actionDao;

    /**
     * Gets all Actions in DB available with filtering options for text, points, tags and validUntil
     * @param text gets all Actions with text in description or displayName, case-insensitive
     * @param points points limit
     * @param tags filters on specific tasks
     * @param validUntil filters on validUntil, gets all Actions with validUntil before the given date
     * @return List of all Actions available in DB with filtering options for text, points, tags and validUntil
     */
    @Override
    @Transactional(readOnly = true)
    public List<ActionDto> getActions(String text, Integer points, String tags, LocalDateTime validUntil) {
        ActionFilterDto filter = ActionFilterMapper.fromRequest(text, points, tags, validUntil);
        List<Action> actions = actionDao.findAllFiltered(filter);
        return ActionMapper.toDtoList(actions);
    }

    @Override
    public ActionDto getActionById(Long actionId) {
        Action action = actionDao.findById(actionId);
        if (action != null) {
            return ActionMapper.toDto(action);
        } else {
            return null; // or throw an exception if you prefer
        }
    }

    /**
     * Get all actions with a user has done
     * @param userId id of the user for which the action history should be retrieved
     * @return all actions done by that user
     */
    @Override
    public List<UserActionHistoryDto> getUserActions(Long userId){
        return actionDao.findUserActionHistory(userId);
    }

    /**
     * Starts an action for a user, creates a mapping in DB with state "IN_PROGRESS"
     * @param userId id of the user for which the action should be started
     * @param actionId id of the action which should be started
     * @return true if the action was successfully started, false if not (e.g. if the mapping already exists)
     */
    @Override
    public boolean startActionForUser(Long userId, Long actionId) {
        return actionDao.startAction(userId, actionId);
    }

    /**
     * Completes an action for a user, updates the mapping in DB to state "COMPLETED"
     * @param userId id of the user for which the action should be completed
     * @param actionId id of the action which should be completed
     * @return true if the action was successfully completed, false if not (e.g. if the mapping does not exist or is already completed)
     */
    @Override
    public boolean completeActionForUser(Long userId, Long actionId) {
        return actionDao.completeAction(userId, actionId);
    }

    @Override
    public boolean deleteActionForUser(Long userId, Long actionId){
        return actionDao.deleteAction(userId, actionId);
    }
}
