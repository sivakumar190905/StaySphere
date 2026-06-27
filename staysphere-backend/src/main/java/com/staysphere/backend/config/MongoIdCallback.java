package com.staysphere.backend.config;

import org.springframework.data.mongodb.core.mapping.event.BeforeConvertCallback;
import org.springframework.stereotype.Component;
import java.lang.reflect.Field;

@Component
public class MongoIdCallback implements BeforeConvertCallback<Object> {

    @Override
    public Object onBeforeConvert(Object entity, String collection) {
        try {
            Field idField = entity.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            Object idValue = idField.get(entity);
            if (idValue == null && idField.getType().equals(Long.class)) {
                idField.set(entity, IdGenerator.nextId());
            }
        } catch (NoSuchFieldException e) {
            // No 'id' field, ignore
        } catch (IllegalAccessException e) {
            // Cannot access field, ignore
        }
        return entity;
    }
}
