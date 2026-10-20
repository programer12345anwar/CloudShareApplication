package com.anwar.cloudshareapi.document;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document(collection = "payment_transactions")
@CompoundIndexes({
        @CompoundIndex(name = "payment_user_date_idx", def = "{'clerkId': 1, 'transactionDate': -1}"),
        @CompoundIndex(name = "payment_user_status_date_idx", def = "{'clerkId': 1, 'status': 1, 'transactionDate': -1}")
})
public class PaymentTransaction {
    private String id;
    private String clerkId;
    @Indexed(name = "payment_order_id_idx")
    private String orderId;
    private String paymentId;
    private String planId;
    private int amount;
    private String currency;
    private int creditsAdded;
    private String status;
    private LocalDateTime transactionDate;
    private String userEmail;
    private String userName;
}
