package gym.demo.security;


import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import io.jsonwebtoken.Claims;

@Service
public class JwtService {

    private  static final String SECRET="DjRF4ERBXoj7hPfRiPJUMeXq0um8PLoYrUeYWOliXdUV360x23BrvPv8Q7gb0iO2";

    private static final SecretKey key= Keys.hmacShaKeyFor(SECRET.getBytes());

    public String generateToken(String email){
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();

    }
    public String extractEmail(String token){
        return extractClaims(token).getSubject();
    }
    public boolean validateToken(String token,String email){
        return extractEmail(token).equals(email)&&!isTokenExpired(token);
    }

    private boolean isTokenExpired(String token){
        return extractClaims(token)
                .getExpiration()
                .before(new Date());
    }

    private Claims extractClaims(String token){
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }



}
