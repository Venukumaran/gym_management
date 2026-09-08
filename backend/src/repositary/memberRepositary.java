package gym.demo.repositary;

import gym.demo.entity.member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface memberRepositary extends JpaRepository<member,Long> {

    List<member> findByNameContainingIgnoreCase(String name);

    // Active / Expired
    List<member> findByStatusIgnoreCase(String status);

    // Membership plan
    List<member> findByMembershipPlanIgnoreCase(String membershipPlan);

    // Gender filter
    List<member> findByGenderIgnoreCase(String gender);

    // Exact age
    List<member> findByAge(int age);

    // Age range
    List<member> findByAgeBetween(int minAge, int maxAge);

    // Recent joinees
    List<member> findByJoiningDateAfter(LocalDate date);

    // Expiring soon
    List<member> findByExpiryDateBetween(
            LocalDate startDate,
            LocalDate endDate
    );
}

