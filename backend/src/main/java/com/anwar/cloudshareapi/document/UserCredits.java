package com.anwar.cloudshareapi.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user-credits")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserCredits {
    @Id
    private String id;
    @Indexed(name = "user_credits_clerk_id_idx")
    private String clerkId;
    private Integer credits;
    private String plan; // BASIC, PREMIUM, ULTIMATE
}
