"""Add password reset fields to users table

Revision ID: 500e1395f9f2
Revises: 7b360cd1eb7e
Create Date: 2026-01-17 15:58:50.671598

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '500e1395f9f2'
down_revision: Union[str, None] = '7b360cd1eb7e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add password reset columns to users table
    op.add_column('users', sa.Column('reset_token', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('reset_token_expires_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    # Remove password reset columns from users table
    op.drop_column('users', 'reset_token_expires_at')
    op.drop_column('users', 'reset_token')
