package com.crai.os.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SimulationStateTest {

    @Test
    void togglesRunningFlag() {
        SimulationState state = new SimulationState();
        assertThat(state.isRunning()).isFalse();
        state.setRunning(true);
        assertThat(state.isRunning()).isTrue();
    }
}
