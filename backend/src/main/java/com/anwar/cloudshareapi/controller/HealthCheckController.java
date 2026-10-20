package com.anwar.cloudshareapi.controller;

import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthCheckController {
    private final MongoTemplate mongoTemplate;

    @GetMapping
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("timestamp", System.currentTimeMillis() + "");

        try {
            mongoTemplate.executeCommand(new Document("ping", 1));
            response.put("status", "UP");
            response.put("message", "CloudShare API and database are available");
            return ResponseEntity.ok(response);
        } catch (DataAccessException e) {
            response.put("status", "DOWN");
            response.put("message", "Database is unavailable");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}
