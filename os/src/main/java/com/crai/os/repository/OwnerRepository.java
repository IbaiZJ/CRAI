package com.crai.os.repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

import com.crai.os.model.Owner;

@Repository
public class OwnerRepository {

    private final Map<String, Owner> owners = new ConcurrentHashMap<>();
    private final Owner[] rangeOwners;

    public OwnerRepository() {
        // Default owners used for fixed range assignment (0000-9999).
        rangeOwners = new Owner[] {
                new Owner("0000AAA", "ibai.zorrilla@alumni.mondragon.edu", "Ibai Zorrilla"),
                new Owner("0000BBB", "aitor.mirguzurl@alumni.mondragon.edu", "Aitor Murguzur"),
                new Owner("0000CCC", "alex.zabaleta@alumni.mondragon.edu", "Alex Zabaleta"),
                new Owner("0000DDD", "aitor.ortiz@alumni.mondragon.edu", "Aitor Ortiz")
        };

        // Sample owners for specific plates (optional explicit overrides).
        addOwners("Ibai Zorrilla", "ibai.zorrilla@alumni.mondragon.edu",
                "1234BCD", "2345BCF", "3456BFG");

        addOwners("Aitor Murguzur", "aitor.mirguzurl@alumni.mondragon.edu",
                "1111BCF", "2222CGH", "3333DFJ");

        addOwners("Alex Zabaleta", "alex.zabaleta@alumni.mondragon.edu",
                "1357BCH", "2468DFK", "3579GHL");

        addOwners("Aitor Ortiz", "aitor.ortiz@alumni.mondragon.edu",
                "1023BCF", "2134CGK", "3245DFL");
    }

    private void addOwners(String name, String email, String... plates) {
        for (String plate : plates) {
            save(new Owner(plate, email, name));
        }
    }

    /*
        0000–2499 → Ibai Zorrilla
        2500–4999 → Aitor Murguzur
        5000–7499 → Alex Zabaleta
        7500–9999 → Aitor Ortiz
    */

    public Owner findByPlate(String plate) {
        Owner exact = owners.get(plate);
        if (exact != null) {
            return exact;
        }

        int number = parsePlateNumber(plate);
        if (number < 0) {
            return null;
        }

        int bucket = number / 2500; // 0-2499, 2500-4999, 5000-7499, 7500-9999
        if (bucket >= rangeOwners.length) {
            return null;
        }

        Owner base = rangeOwners[bucket];
        return new Owner(plate, base.getEmail(), base.getName());
    }

    public void save(Owner owner) {
        owners.put(owner.getPlate(), owner);
    }

    private int parsePlateNumber(String plate) {
        if (plate == null || plate.length() < 4) {
            return -1;
        }
        try {
            return Integer.parseInt(plate.substring(0, 4));
        } catch (NumberFormatException ex) {
            return -1;
        }
    }
}

