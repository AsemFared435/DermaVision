"""
Simple SMTP email service
"""
import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailServiceNotConfigured(RuntimeError):
    """Raised when SMTP settings are missing."""


class EmailService:
    """SMTP-backed email sender."""

    def is_configured(self) -> bool:
        has_basic_smtp = bool(settings.SMTP_HOST and settings.SMTP_FROM_EMAIL)
        has_complete_auth = bool(settings.SMTP_USERNAME) == bool(settings.SMTP_PASSWORD)
        return has_basic_smtp and has_complete_auth

    def send_password_reset_email(self, to_email: str, reset_link: str) -> None:
        if not self.is_configured():
            raise EmailServiceNotConfigured("SMTP settings are not configured")

        message = EmailMessage()
        message["Subject"] = "DermaVision Password Reset"
        message["From"] = settings.SMTP_FROM_EMAIL
        message["To"] = to_email
        message.set_content(
            "Hello,\n\n"
            "A password reset was requested for your DermaVision account.\n\n"
            f"Reset your password using this link:\n{reset_link}\n\n"
            f"This link expires in {settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes and can be used only once.\n\n"
            "If you did not request a password reset, you can safely ignore this email.\n"
        )

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(message)

        logger.info("Password reset email sent")


email_service = EmailService()
