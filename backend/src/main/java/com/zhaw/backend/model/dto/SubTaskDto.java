package com.zhaw.backend.model.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.persistence.MappedSuperclass;
import lombok.*;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = GpsActionTaskDto.class, name = "GPS")
})
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
public class SubTaskDto {

    private Long id;
    private String description;
    private String displayName;
    private Long   actionId;
}
