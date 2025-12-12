package com.crai.os.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DebugController {

    @GetMapping("/debug/threads")
    public List<Map<String, Object>> threads() {
        Map<Thread, StackTraceElement[]> all = Thread.getAllStackTraces();
        List<Map<String, Object>> out = new ArrayList<>();
        for (Thread t : all.keySet()) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", t.getId());
            m.put("name", t.getName());
            m.put("state", t.getState().toString());
            m.put("daemon", t.isDaemon());
            m.put("priority", t.getPriority());
            m.put("stackDepth", all.get(t) != null ? all.get(t).length : 0);
            out.add(m);
        }
        return out;
    }
}
