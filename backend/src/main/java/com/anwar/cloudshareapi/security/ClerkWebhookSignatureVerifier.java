package com.anwar.cloudshareapi.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;

@Component
public class ClerkWebhookSignatureVerifier {
    private static final long MAX_TIMESTAMP_AGE_SECONDS = 300;
    private static final String SECRET_PREFIX = "whsec_";

    private final byte[] secret;

    public ClerkWebhookSignatureVerifier(@Value("${clerk.webhook.secret}") String webhookSecret) {
        String encodedSecret = webhookSecret.startsWith(SECRET_PREFIX)
                ? webhookSecret.substring(SECRET_PREFIX.length())
                : webhookSecret;
        this.secret = Base64.getDecoder().decode(encodedSecret);
    }

    public boolean verify(String messageId, String timestamp, String signatures, String payload) {
        if (messageId == null || timestamp == null || signatures == null || payload == null) {
            return false;
        }

        try {
            long eventTimestamp = Long.parseLong(timestamp);
            if (Math.abs(Instant.now().getEpochSecond() - eventTimestamp) > MAX_TIMESTAMP_AGE_SECONDS) {
                return false;
            }

            String signedContent = messageId + "." + timestamp + "." + payload;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            byte[] expectedSignature = mac.doFinal(signedContent.getBytes(StandardCharsets.UTF_8));

            for (String versionedSignature : signatures.trim().split("\\s+")) {
                String[] parts = versionedSignature.split(",", 2);
                if (parts.length == 2 && "v1".equals(parts[0])) {
                    byte[] suppliedSignature = Base64.getDecoder().decode(parts[1]);
                    if (MessageDigest.isEqual(expectedSignature, suppliedSignature)) {
                        return true;
                    }
                }
            }
        } catch (GeneralSecurityException | IllegalArgumentException e) {
            return false;
        }

        return false;
    }
}
