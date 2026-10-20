package com.anwar.cloudshareapi.security;

import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ClerkWebhookSignatureVerifierTest {
    private static final byte[] SECRET = "test-webhook-secret".getBytes(StandardCharsets.UTF_8);
    private final ClerkWebhookSignatureVerifier verifier = new ClerkWebhookSignatureVerifier(
            Base64.getEncoder().encodeToString(SECRET));

    @Test
    void acceptsValidRecentSignature() throws Exception {
        String timestamp = Long.toString(Instant.now().getEpochSecond());
        String payload = "{\"type\":\"user.created\"}";

        assertTrue(verifier.verify("msg_123", timestamp, signature("msg_123", timestamp, payload), payload));
    }

    @Test
    void rejectsPayloadModifiedAfterSigning() throws Exception {
        String timestamp = Long.toString(Instant.now().getEpochSecond());
        String payload = "{\"type\":\"user.created\"}";

        assertFalse(verifier.verify("msg_123", timestamp, signature("msg_123", timestamp, payload),
                "{\"type\":\"user.deleted\"}"));
    }

    @Test
    void rejectsExpiredSignature() throws Exception {
        String timestamp = Long.toString(Instant.now().getEpochSecond() - 301);
        String payload = "{\"type\":\"user.created\"}";

        assertFalse(verifier.verify("msg_123", timestamp, signature("msg_123", timestamp, payload), payload));
    }

    private String signature(String messageId, String timestamp, String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET, "HmacSHA256"));
        byte[] digest = mac.doFinal((messageId + "." + timestamp + "." + payload).getBytes(StandardCharsets.UTF_8));
        return "v1," + Base64.getEncoder().encodeToString(digest);
    }
}
