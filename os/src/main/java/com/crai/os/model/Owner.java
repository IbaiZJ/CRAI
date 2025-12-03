package com.crai.os.model;

public class Owner {

    private final String plate;
    private final String email;
    private final String name;

    public Owner(String plate, String email, String name) {
        this.plate = plate;
        this.email = email;
        this.name = name;
    }

    public String getPlate() {
        return plate;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }
}

