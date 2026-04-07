package com.zhaw.backend.service;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.mappers.SubActionMapper;
import com.zhaw.backend.model.dao.SubActionDao;
import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.model.dto.SubActionCompletionRequestDto;
import com.zhaw.backend.model.dto.SubActionDto;
import com.zhaw.backend.model.entities.GpsActionTask;
import com.zhaw.backend.validator.SubActionValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class SubActionServiceImpl implements SubActionService {

    private final SubActionDao subActionDao;

    private final Map<ActionType, Function<Long, List<SubActionDto>>> handlersForEntities = initHandlers();
    private final float gpsAccuracyThreshold = 10.0f; // Example threshold for GPS accuracy

    private Map<ActionType, Function<Long, List<SubActionDto>>> initHandlers() {
        Map<ActionType, Function<Long, List<SubActionDto>>> handlers = new EnumMap<>(ActionType.class);
        handlers.put(ActionType.GPS, this::getGpsSubAction);
        handlers.put(ActionType.PHOTO, this::getPhotoSubAction);
        handlers.put(ActionType.TICKET, this::getTicketSubAction);
        return handlers;
    }

    @Override
    public List<SubActionDto> getSubActions(Long actionId, ActionType actionType) throws Exception {
        if (actionId == null || actionType == null) {
            throw new Exception("Action ID and Action Type must not be null");
        }
        return handlersForEntities.getOrDefault(actionType, id -> List.of()).apply(actionId);
    }

    @Override
    public Map<Long, CompletionState> getSubActionsCompletionStatesForUser(Long userId,Long actionId){
        return subActionDao.findSubActionCompletionStates(userId, actionId);
    }

    private List<SubActionDto> getGpsSubAction(Long actionId) {
        List<GpsActionTask> gpsActionTaskList = subActionDao.findGpsSubAction(actionId);
        return SubActionMapper.GpsActionTaskToDtoList(gpsActionTaskList);
    }

    @Override
    public boolean completeSubActionForUser(SubActionCompletionRequestDto requestDto) throws Exception {
        return switch (requestDto.getActionType()) {
            case GPS -> completeGpsSubActionForUser(requestDto.getUserId(), requestDto.getActionId(), requestDto.getSubActionId(),
                    (Float) requestDto.getAdditionalData().get("gpsX"), (Float) requestDto.getAdditionalData().get("gpsY"));
            default -> throw new Exception("Unsupported SubAction Type: " + requestDto.getActionType());
        };
    }

    private boolean completeGpsSubActionForUser(Long userId, Long actionId, Long subactionId, Float gpsx, Float gpsy) throws Exception {
        if (gpsx == null || gpsy == null) {
            throw new Exception("GPS coordinates must not be null");
        }
        GpsActionTask gpsActionTaskEntity;
        try {
            gpsActionTaskEntity = subActionDao.findGpsSubActionById(subactionId);
        } catch (Exception e) {
            throw new Exception("Error retrieving GPS SubAction for ID: " + subactionId, e);
        }
        GpsActionTaskDto gpsActionTask = gpsActionTaskEntity != null ? (GpsActionTaskDto) SubActionMapper.GpsActionTaskToDto(gpsActionTaskEntity) : null;
        if (gpsActionTask == null) {
            throw new Exception("GPS SubAction not found for ID: " + subactionId);
        }
        if(SubActionValidator.validateGpsSubAction(gpsx, gpsy, gpsActionTask.getGpsX(), gpsActionTask.getGpsY(), gpsAccuracyThreshold)){
            return subActionDao.completeSubActionForUser(userId, actionId, true, subactionId.toString());
        }
        return false;
    }

    private List<SubActionDto> getPhotoSubAction(Long actionId) {
        return List.of();
    }

    private List<SubActionDto> getTicketSubAction(Long actionId) {
        return List.of();
    }

    @Override
    public void createSubAction(Long actionId, GpsActionTaskDto dto) {
        subActionDao.createGpsSubAction(actionId, dto);
    }

    @Override
    public boolean updateSubAction(Long id, GpsActionTaskDto dto) {
        return subActionDao.updateGpsSubAction(id, dto);
    }

    @Override
    public boolean deleteSubAction(Long id) {
        return subActionDao.deleteSubAction(id);
    }
}
