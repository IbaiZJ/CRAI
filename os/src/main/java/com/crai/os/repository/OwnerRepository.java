package com.crai.os.repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

import com.crai.os.model.Owner;

@Repository
public class OwnerRepository {

    private final Map<String, Owner> owners = new ConcurrentHashMap<>();

    public OwnerRepository() {
        // Datos de ejemplo; sustituir por origen real si se dispone.
        save(new Owner("1234ABC", "ibai.zorrilla@alumni.mondragon.edu", "Ibai Zorrilla"));
        save(new Owner("5678DEF", "aitor.mirguzurl@alumni.mondragon.edu", "Aitor Murguzur"));
        save(new Owner("9012GHI", "alex.zabaleta@alumni.mondragon.edu", "Alex Zabaleta"));
    }

    public Owner findByPlate(String plate) {
        return owners.get(plate);
    }

    public void save(Owner owner) {
        owners.put(owner.getPlate(), owner);
    }
}

