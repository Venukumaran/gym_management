package gym.demo.security;

import gym.demo.entity.Owner;
import gym.demo.repositary.OwnerRepositary;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

//used to get userDetails from DB  bcuz spring security doesnt know about entity so we need this file to ghet detail from repo and convert back to user

@Service
public class OwnerDetailsService implements UserDetailsService {

    private final OwnerRepositary ownerRepositary;

    public OwnerDetailsService(OwnerRepositary ownerRepositary) {
        this.ownerRepositary = ownerRepositary;
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Owner owner = ownerRepositary.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Owner not found"));

        return User.builder()
                .username(owner.getEmail())
                .password(owner.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER")))
                .build(); //changing owner ob to used ob
    }
}