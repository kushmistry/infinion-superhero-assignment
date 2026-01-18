import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from ..config import settings
from ..utils import get_logger

logger = get_logger("email_utils")

class EmailService:
    """
    Email service for sending password reset emails.

    To configure email:
    1. Set up SMTP settings in your .env file:
       SMTP_SERVER=smtp.gmail.com
       SMTP_PORT=587
       SMTP_USERNAME=your_email@gmail.com
       SMTP_PASSWORD=your_app_password  # Not regular password!
       FROM_EMAIL=your_email@gmail.com
       SMTP_USE_TLS=true

    2. For Gmail:
       - Enable 2-factor authentication
       - Generate an App Password: https://myaccount.google.com/apppasswords
       - Use the App Password as SMTP_PASSWORD

    3. For other providers, check their SMTP settings.
    """
    def __init__(self):
        self.smtp_server = getattr(settings, 'SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = getattr(settings, 'SMTP_PORT', 587)
        self.smtp_username = getattr(settings, 'SMTP_USERNAME', '')
        self.smtp_password = getattr(settings, 'SMTP_PASSWORD', '')
        self.from_email = getattr(settings, 'FROM_EMAIL', self.smtp_username)
        self.use_tls = getattr(settings, 'SMTP_USE_TLS', True)

        # Check if email is configured
        self.is_configured = bool(self.smtp_username and self.smtp_password)
        if not self.is_configured:
            logger.warning("Email service not configured. Set SMTP_USERNAME and SMTP_PASSWORD in .env file.")

    def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        """
        Send password reset email with reset token

        Args:
            to_email: Recipient email address
            reset_token: Password reset token

        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Password Reset Request'
            msg['From'] = self.from_email
            msg['To'] = to_email

            # Create the body of the message (HTML version)
            html = f"""
            <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>You have requested to reset your password for your Superhero API account.</p>
                <p>Please click the link below to reset your password:</p>
                <p><a href="http://localhost:3000/reset-password?token={reset_token}">Reset Password</a></p>
                <p>This link will expire in 10 minutes.</p>
                <p>If you didn't request this password reset, please ignore this email.</p>
                <br>
                <p>Best regards,<br>Superhero API Team</p>
            </body>
            </html>
            """

            # Plain text version
            text = f"""
            Password Reset Request

            You have requested to reset your password for your Superhero API account.

            Please use this token to reset your password: {reset_token}

            This token will expire in 10 minutes.

            If you didn't request this password reset, please ignore this email.

            Best regards,
            Superhero API Team
            """

            # Attach parts
            part1 = MIMEText(text, 'plain')
            part2 = MIMEText(html, 'html')
            msg.attach(part1)
            msg.attach(part2)

            # Send email
            if self._send_email(msg):
                logger.info(f"Password reset email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"Failed to send password reset email to {to_email}")
                return False

        except Exception as e:
            logger.error(f"Error sending password reset email to {to_email}: {e}")
            return False

    def _send_email(self, msg) -> bool:
        """
        Send email using SMTP

        Args:
            msg: Email message

        Returns:
            bool: True if sent successfully
        """
        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.ehlo()

            if self.use_tls:
                server.starttls()
                server.ehlo()

            if self.smtp_username and self.smtp_password:
                server.login(self.smtp_username, self.smtp_password)

            server.sendmail(self.from_email, msg['To'], msg.as_string())
            server.quit()

            return True

        except Exception as e:
            logger.error(f"SMTP error: {e}")
            return False

# Global email service instance
email_service = EmailService()

def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Convenience function to send password reset email

    Args:
        to_email: Recipient email address
        reset_token: Password reset token

    Returns:
        bool: True if email sent successfully
    """
    return email_service.send_password_reset_email(to_email, reset_token)