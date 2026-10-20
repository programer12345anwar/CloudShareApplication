package com.anwar.cloudshareapi.repository;

import com.anwar.cloudshareapi.document.PaymentTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentTransactionRepository extends MongoRepository<PaymentTransaction,String> {
    Optional<PaymentTransaction> findFirstByOrderId(String orderId);

    List<PaymentTransaction> findByClerkId(String clerkId);

    List<PaymentTransaction> findByClerkIdOrderByTransactionDateDesc(String clerkId);

    List<PaymentTransaction> findByClerkIdAndStatusOrderByTransactionDateDesc(String clerkId,String status);
}
