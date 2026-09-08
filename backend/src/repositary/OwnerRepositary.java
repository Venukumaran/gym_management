package gym.demo.repositary;

import gym.demo.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OwnerRepositary extends JpaRepository<Owner, Long> {

    Optional<Owner> findByEmail(String email);

}
