package online.shop.Security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class SecurityHeadersFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletResponse r = (HttpServletResponse) res;

        r.setHeader("X-Content-Type-Options", "nosniff");
        r.setHeader("X-Frame-Options", "DENY");
        r.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        r.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
        r.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        r.setHeader("Cross-Origin-Resource-Policy", "same-site");
        r.setHeader("X-XSS-Protection", "0"); // modern browsers; CSP is the real protection

        chain.doFilter(req, res);
    }
}
