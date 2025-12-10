package com.crai.os.repository;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Repository;

import com.crai.os.model.Owner;

@Repository
public class OwnerRepository {

    private final Map<String, Owner> owners = new ConcurrentHashMap<>();

    public OwnerRepository() {
        // Datos de ejemplo; ampliados para que haya matrículas aleatorias con destinatarios.
        // Matrículas en formato español (#### + 3 consonantes)
        addOwners("Ibai Zorrilla", "ibai.zorrilla@alumni.mondragon.edu",
                "1234BCD", "2345BCF", "3456BFG", "4567BHK", "5678CLM",
                "6789DFG", "7890GHJ", "8901JKL", "9012MNP", "0123RST");

        addOwners("Aitor Murguzur", "aitor.mirguzurl@alumni.mondragon.edu",
                "1111BCF", "2222CGH", "3333DFJ", "4444FGK", "5555GLM",
                "6666HNP", "7777JKL", "8888LMN", "9999PRS", "0000STV");

        addOwners("Alex Zabaleta", "alex.zabaleta@alumni.mondragon.edu",
                "1357BCH", "2468DFK", "3579GHL", "4680JKP", "5791LMT",
                "6802NPQ", "7913RST", "8024TVX", "9135WXY", "0246ZTR");

        addOwners("Aitor Ortiz", "aitor.ortiz@alumni.mondragon.edu",
                "1023BCF", "2134CGK", "3245DFL", "4356FGM", "5467GHP",
                "6578HJK", "7689JLM", "8790LMN", "9801MNP", "0912PRS");
    }

    private void addOwners(String name, String email, String... plates) {
        for (String plate : plates) {
            save(new Owner(plate, email, name));
        }
    }

    public Owner findByPlate(String plate) {
        return owners.get(plate);
    }

    public void save(Owner owner) {
        owners.put(owner.getPlate(), owner);
    }
}

