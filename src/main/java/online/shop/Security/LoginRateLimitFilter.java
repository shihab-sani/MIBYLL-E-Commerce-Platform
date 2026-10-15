package online.shop.Security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimitFilter implements Filter {
    private static final int MAX_ATTEMPTS = 10;      // per window
    private static final long WINDOW_MS = 60_000;    // 1 minute

    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest r = (HttpServletRequest) req;
        HttpServletResponse w = (HttpServletResponse) res;

        if ("/api/auth/login".equals(r.getRequestURI()) && "POST".equalsIgnoreCase(r.getMethod())) {
            String ip = clientIp(r);
            Deque<Long> q = hits.computeIfAbsent(ip, k -> new ArrayDeque<>());
            long now = System.currentTimeMillis();

            synchronized (q) {
                while (!q.isEmpty() && now - q.peekFirst() > WINDOW_MS) q.pollFirst();
                if (q.size() >= MAX_ATTEMPTS) {
                    w.setStatus(429);
                    w.setContentType("application/json");
                    w.getWriter().write("{\"message\":\"Too many login attempts. Try again in a minute.\"}");
                    return;
                }
                q.addLast(now);
            }
        }

        chain.doFilter(req, res);
    }

    private String clientIp(HttpServletRequest r) {
        String xff = r.getHeader("X-Forwarded-For");
        return (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : r.getRemoteAddr();
    }
}
