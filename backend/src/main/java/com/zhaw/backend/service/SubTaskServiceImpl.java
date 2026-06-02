package com.zhaw.backend.service;

import com.zhaw.backend.enums.ActionType;
import com.zhaw.backend.enums.CompletionState;
import com.zhaw.backend.exception.BadRequestException;
import com.zhaw.backend.exception.NotFoundException;
import com.zhaw.backend.mappers.SubTaskMapper;
import com.zhaw.backend.model.dao.SubTaskDao;
import com.zhaw.backend.model.dto.GpsActionTaskDto;
import com.zhaw.backend.model.dto.SubTaskCompletionRequestDto;
import com.zhaw.backend.model.dto.SubTaskDto;
import com.zhaw.backend.model.entities.GpsActionTask;
import com.zhaw.backend.validator.SubTaskValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class SubTaskServiceImpl implements SubTaskService {

    private final SubTaskDao subTaskDao;

    private final Map<ActionType, Function<Long, List<SubTaskDto>>> handlersForEntities = initHandlers();

    private Map<ActionType, Function<Long, List<SubTaskDto>>> initHandlers() {
        Map<ActionType, Function<Long, List<SubTaskDto>>> handlers = new EnumMap<>(ActionType.class);
        handlers.put(ActionType.GPS, this::getGpsSubTask);
        handlers.put(ActionType.PHOTO, this::getPhotoSubTask);
        handlers.put(ActionType.TICKET, this::getTicketSubTask);
        return handlers;
    }

    @Override
    public List<SubTaskDto> getSubTasks(Long actionId, ActionType actionType) {
        if (actionId == null || actionType == null) {
            throw new BadRequestException("Action ID and Action Type must not be null");
        }
        return handlersForEntities.getOrDefault(actionType, id -> List.of()).apply(actionId);
    }

    @Override
    public Map<Long, CompletionState> getSubTasksCompletionStatesForUser(Long userId, Long actionId){
        return subTaskDao.findSubTaskCompletionStates(userId, actionId);
    }

    private List<SubTaskDto> getGpsSubTask(Long actionId) {
        List<GpsActionTask> gpsActionTaskList = subTaskDao.findGpsSubTask(actionId);
        return SubTaskMapper.GpsActionTaskToDtoList(gpsActionTaskList);
    }

    @Override
    public boolean completeSubTaskForUser(SubTaskCompletionRequestDto requestDto) {
        return switch (requestDto.getActionType()) {
            case GPS -> completeGpsSubTaskForUser(requestDto.getUserId(), requestDto.getActionId(), requestDto.getSubTaskId(),
                    (Double) requestDto.getAdditionalData().get("latitude"), (Double) requestDto.getAdditionalData().get("longitude"));
            default -> throw new BadRequestException("Unsupported SubTask Type: " + requestDto.getActionType());
        };
    }

    private boolean completeGpsSubTaskForUser(Long userId, Long actionId, Long subtaskId, Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new BadRequestException("GPS coordinates must not be null");
        }
        GpsActionTask gpsActionTaskEntity;
        try {
            gpsActionTaskEntity = subTaskDao.findGpsSubTaskById(subtaskId);
        } catch (Exception e) {
            throw new RuntimeException("Error retrieving GPS SubTask for ID: " + subtaskId, e);
        }
        GpsActionTaskDto gpsActionTask = gpsActionTaskEntity != null ? (GpsActionTaskDto) SubTaskMapper.GpsActionTaskToDto(gpsActionTaskEntity) : null;
        if (gpsActionTask == null) {
            throw new NotFoundException("GPS SubTask not found for ID: " + subtaskId);
        }
        if(SubTaskValidator.validateGpsSubTask(latitude, longitude, gpsActionTask.getLatitude(), gpsActionTask.getLongitude(), gpsActionTask.getDistanceThresholdLevel().getOffsett())){
            return subTaskDao.completeSubTaskForUser(userId, actionId, true, subtaskId.toString());
        }
        return false;

    }

    private List<SubTaskDto> getPhotoSubTask(Long actionId) {
        return List.of();
    }

    private List<SubTaskDto> getTicketSubTask(Long actionId) {
        return List.of();
    }

    @Override
    public void createSubTask(Long actionId, GpsActionTaskDto dto) {
        subTaskDao.createGpsSubTask(actionId, dto);
    }

    @Override
    public boolean updateSubTask(Long id, GpsActionTaskDto dto) {
        return subTaskDao.updateGpsSubTask(id, dto);
    }

    @Override
    public boolean deleteSubTask(Long id) {
        return subTaskDao.deleteSubTask(id);
    }
}
