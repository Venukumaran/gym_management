package gym.demo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final OwnerDetailsService ownerDetailsService;

    public JwtFilter(JwtService jwtService,
                     OwnerDetailsService ownerDetailsService) {

        this.jwtService = jwtService;
        this.ownerDetailsService = ownerDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7); //extracting token

        String email = jwtService.extractEmail(token);

        if (email != null &&
                SecurityContextHolder.getContext().getAuthentication() == null) //checking user is not authenticated
            {

            UserDetails userDetails =
                    ownerDetailsService.loadUserByUsername(email);
            //getting details from ownerdetail class from db as userdetails bcuz spring take email,name everything as userdetails

            if (jwtService.validateToken(token, userDetails.getUsername()))  //validating token and userdetail(name or email)
            {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()); // creates a authentication object for details used to tell spring that validated token uname is authenticated



                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)); //used to set ipadrres and session id details

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication); //stores user as authenticated
            }
        }

        filterChain.doFilter(request, response); //done filter move to process req
    }
}
