package com.zhaw.backend.security;

import com.zhaw.backend.model.dao.HttpPermissionDao;
import com.zhaw.backend.model.entities.HttpPermission;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HttpPermissionService {
    private static final String ANY_METHOD = "*";

    private final HttpPermissionDao httpPermissionDao;

    public AuthorizationDecision authorize(Authentication authentication, HttpServletRequest request) {
        for (HttpPermissionRule rule : loadRules()) {
            if (rule.matches(request)) {
                return new AuthorizationDecision(rule.isAllowed(authentication));
            }
        }
        return new AuthorizationDecision(false);
    }

    private List<HttpPermissionRule> loadRules() {
        return httpPermissionDao.findAll().stream()
                .map(this::toRule)
                .sorted(HttpPermissionRule.ORDER)
                .toList();
    }

    private HttpPermissionRule toRule(HttpPermission permission) {
        String pathPattern = permission.getPathPattern();
        String method = normalizeMethod(permission.getHttpMethod());
        RequestMatcher matcher = method == null
                ? new AntPathRequestMatcher(pathPattern)
                : new AntPathRequestMatcher(pathPattern, method);
        return new HttpPermissionRule(pathPattern, method, matcher, parseRoles(permission.getRoles()));
    }

    private String normalizeMethod(String method) {
        if (method == null || method.isBlank()) {
            return null;
        }
        String normalized = method.trim().toUpperCase(Locale.ROOT);
        return ANY_METHOD.equals(normalized) ? null : normalized;
    }

    private Set<String> parseRoles(String rolesCsv) {
        if (rolesCsv == null || rolesCsv.isBlank()) {
            return Set.of();
        }
        Set<String> roles = Arrays.stream(rolesCsv.split("\\s*[,;]\\s*"))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .filter(value -> !ANY_METHOD.equals(value))
                .map(this::normalizeRole)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        return Collections.unmodifiableSet(roles);
    }

    private String normalizeRole(String role) {
        if (role.startsWith("ROLE_")) {
            return role;
        }
        return "ROLE_" + role;
    }

    private static boolean isAuthenticated(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken);
    }

    static final class HttpPermissionRule {
        static final Comparator<HttpPermissionRule> ORDER = Comparator
                .comparingInt((HttpPermissionRule rule) -> rule.pathPattern.length()).reversed()
                .thenComparing(rule -> rule.httpMethod == null);

        private final String pathPattern;
        private final String httpMethod;
        private final RequestMatcher matcher;
        private final Set<String> roles;

        HttpPermissionRule(String pathPattern, String httpMethod, RequestMatcher matcher, Set<String> roles) {
            this.pathPattern = pathPattern;
            this.httpMethod = httpMethod;
            this.matcher = matcher;
            this.roles = roles;
        }

        boolean matches(HttpServletRequest request) {
            return matcher.matches(request);
        }

        boolean isAllowed(Authentication authentication) {
            if (roles.isEmpty()) {
                return true;
            }
            if (!isAuthenticated(authentication)) {
                return false;
            }
            for (GrantedAuthority authority : authentication.getAuthorities()) {
                if (roles.contains(authority.getAuthority())) {
                    return true;
                }
            }
            return false;
        }
    }
}
