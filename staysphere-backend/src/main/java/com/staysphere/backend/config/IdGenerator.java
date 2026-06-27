package com.staysphere.backend.config;

import java.util.concurrent.atomic.AtomicLong;

public class IdGenerator {
    private static final AtomicLong counter = new AtomicLong(System.currentTimeMillis());

    public static Long nextId() {
        return counter.incrementAndGet();
    }
}
