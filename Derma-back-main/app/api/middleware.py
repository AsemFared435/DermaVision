"""
Custom middleware for the application
"""
import logging
import time
from typing import Callable

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all requests with timing information"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )
        
        # Process request
        response = await call_next(request)
        
        # Calculate duration
        duration = time.time() - start_time
        
        # Log response
        logger.info(
            f"Response: {request.method} {request.url.path} "
            f"status={response.status_code} duration={duration:.3f}s"
        )
        
        # Add timing header
        response.headers["X-Process-Time"] = str(duration)
        
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add conservative security headers to API responses."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
        )

        from app.core.config import settings

        forwarded_proto = request.headers.get("x-forwarded-proto", "")
        if settings.is_production and (request.url.scheme == "https" or forwarded_proto == "https"):
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


class SensitiveEndpointRateLimitMiddleware(BaseHTTPMiddleware):
    """Small in-memory rate limiter for sensitive endpoints."""

    def __init__(self, app, rules: dict[tuple[str, str], tuple[int, int]]):
        super().__init__(app)
        self.rules = rules
        self.clients: dict[tuple[str, str, str], list[float]] = {}

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        method = request.method.upper()
        path = request.url.path
        rule = self.rules.get((method, path))
        if rule is None:
            return await call_next(request)

        calls, period = rule
        client_ip = request.client.host if request.client else "unknown"
        key = (client_ip, method, path)
        current_time = time.time()
        window_start = current_time - period

        recent_calls = [t for t in self.clients.get(key, []) if t > window_start]
        if len(recent_calls) >= calls:
            logger.warning("Rate limit exceeded for %s %s from %s", method, path, client_ip)
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please try again later."},
                headers={"Retry-After": str(period)},
            )

        self.clients[key] = recent_calls + [current_time]

        if len(self.clients) > 10000:
            self.clients = {
                k: [t for t in times if t > current_time - self._period_for_key(k)]
                for k, times in self.clients.items()
                if any(t > current_time - self._period_for_key(k) for t in times)
            }

        return await call_next(request)

    def _period_for_key(self, key: tuple[str, str, str]) -> int:
        _, method, path = key
        return self.rules.get((method, path), (1, 60))[1]


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple rate limiting middleware
    
    Note: For production, use Redis-based rate limiting
    """
    
    def __init__(self, app, calls: int = 10, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients = {}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/ready"]:
            return await call_next(request)
        
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old entries
        self.clients = {
            ip: times
            for ip, times in self.clients.items()
            if any(t > current_time - self.period for t in times)
        }
        
        # Check rate limit
        if client_ip in self.clients:
            recent_calls = [
                t for t in self.clients[client_ip]
                if t > current_time - self.period
            ]
            
            if len(recent_calls) >= self.calls:
                logger.warning(f"Rate limit exceeded for {client_ip}")
                return Response(
                    content="Rate limit exceeded",
                    status_code=429,
                    headers={"Retry-After": str(self.period)}
                )
            
            self.clients[client_ip] = recent_calls + [current_time]
        else:
            self.clients[client_ip] = [current_time]
        
        return await call_next(request)
