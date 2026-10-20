package com.anwar.cloudshareapi.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class ClerkJwtAuthFilterTest {
    private final ClerkJwtAuthFilter filter = new ClerkJwtAuthFilter(mock(ClerkJwksProvider.class));

    @Test
    void skipsAuthenticationForHealthEndpoint() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/health");

        assertTrue(filter.shouldNotFilter(request));
    }

    @Test
    void keepsAuthenticationForPrivateEndpoints() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setServletPath("/files/my");

        assertFalse(filter.shouldNotFilter(request));
    }
}
