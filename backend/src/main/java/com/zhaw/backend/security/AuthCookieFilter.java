package com.zhaw.backend.security;

import com.zhaw.backend.service.session.SessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
public class AuthCookieFilter extends OncePerRequestFilter {

    public static final String AUTH_COOKIE_NAME = "AUTH_SESSION";
    private final SessionService sessionService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = readAuthCookie(request);

        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<SessionService.SessionRecord> sessionOpt = sessionService.validate(token);

            if (sessionOpt.isPresent()) {
                SessionService.SessionRecord session = sessionOpt.get();

                List<SimpleGrantedAuthority> authorities = session.role() == null
                        ? List.of()
                        : List.of(new SimpleGrantedAuthority(session.role().name()));

                AuthenticatedUser principal = new AuthenticatedUser(session.userId(), session.username());
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(principal, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String readAuthCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (AUTH_COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
