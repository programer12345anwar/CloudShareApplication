package com.anwar.cloudshareapi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"spring.data.mongodb.uri=mongodb://localhost:27017/cloudshare_test",
		"spring.data.mongodb.auto-index-creation=false",
		"clerk.issuer=https://issuer.test",
		"clerk.jwks-url=https://issuer.test/jwks",
		"clerk.webhook.secret=dGVzdA==",
		"razorpay.key.id=test-key",
		"razorpay.key.secret=test-secret",
		"razorpay.webhook.secret=test-secret",
		"cloudinary.cloud.name=test-cloud",
		"cloudinary.api.key=test-key",
		"cloudinary.api.secret=test-secret"
})
class CloudshareapiApplicationTests {

	@Test
	void contextLoads() {
	}

}
