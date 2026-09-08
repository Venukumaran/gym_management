package gym.demo.service;

import gym.demo.entity.Owner;
import gym.demo.repositary.OwnerRepositary;
import gym.demo.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class OwnerService {

    private final OwnerRepositary ownerRepositary;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public OwnerService(OwnerRepositary ownerRepositary,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService) {

        this.ownerRepositary = ownerRepositary;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String login(String email, String password) {

        Owner owner = ownerRepositary.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Invalid Email"));

        if (!passwordEncoder.matches(password, owner.getPassword())) {
            throw new RuntimeException("Invalid Password");
        }

        return jwtService.generateToken(owner.getEmail());
    }
}