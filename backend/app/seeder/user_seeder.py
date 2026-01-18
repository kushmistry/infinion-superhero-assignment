import bcrypt
import logging
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models.user import User
from ..utils import setup_logger

class UserSeeder:
    def __init__(self):
        self.logger = setup_logger("user_seeder", level=logging.INFO)

    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def create_admin_user(self, db: Session):
        """Create the admin user"""
        admin_email = "superhero@mailinator.com"
        admin_password = "Admin@123"

        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        if existing_admin:
            self.logger.info("Admin user already exists")
            return existing_admin

        # Create admin user
        admin_user = User(
            email=admin_email,
            username="superhero_admin",
            first_name="Superhero",
            last_name="Admin",
            password_hash=self.hash_password(admin_password),
            role="admin",
            is_active=True
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        self.logger.info(f"Created admin user: {admin_email}")
        return admin_user

    def seed_users(self):
        """Main seeding function"""
        self.logger.info("Starting user seeding...")

        db = SessionLocal()
        try:
            # Create admin user
            admin = self.create_admin_user(db)
            self.logger.info(f"Admin user created with ID: {admin.id}")

            self.logger.info("User seeding completed successfully!")

        except Exception as e:
            db.rollback()
            self.logger.error(f"Error during user seeding: {e}")
            raise
        finally:
            db.close()

def run_user_seeder():
    """Convenience function to run the user seeder"""
    seeder = UserSeeder()
    seeder.seed_users()

if __name__ == "__main__":
    run_user_seeder()