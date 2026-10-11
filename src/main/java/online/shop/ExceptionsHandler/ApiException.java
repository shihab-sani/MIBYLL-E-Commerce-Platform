package online.shop.ExceptionsHandler;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    private final HttpStatus status;

    public ApiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public static ApiException notFound(String msg) {
        return new ApiException(msg, HttpStatus.NOT_FOUND);
    }

    public static ApiException badRequest(String msg) {
        return new ApiException(msg, HttpStatus.BAD_REQUEST);
    }

    public HttpStatus getStatus() {
        return status;
    }
}
