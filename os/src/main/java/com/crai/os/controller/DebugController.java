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
        for (Map.Entry<Thread, StackTraceElement[]> entry : all.entrySet()) {
            Thread t = entry.getKey();
            StackTraceElement[] stack = entry.getValue();
            Map<String, Object> m = new HashMap<>();
            m.put("id", t.getId());
            m.put("name", t.getName());
            m.put("state", t.getState().toString());
            m.put("daemon", t.isDaemon());
            m.put("priority", t.getPriority());
            m.put("stackDepth", stack != null ? stack.length : 0);
            out.add(m);
        }
        return out;
    }
}
