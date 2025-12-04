package com.crai.os.repository;

import com.crai.os.model.ITVRecord;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class ITVRepository {

    private final Map<String, ITVRecord> records = new ConcurrentHashMap<>();

    public ITVRecord find(String plate) {
        return records.get(plate);
    }

    public void save(ITVRecord record) {
        records.put(record.getPlate(), record);
    }

    public boolean exists(String plate) {
        return records.containsKey(plate);
    }
}
