"""Add superhero table

Revision ID: dfbf2bbb10da
Revises: 5e88b30eed27
Create Date: 2026-01-17 14:36:56.560201

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'dfbf2bbb10da'
down_revision: Union[str, None] = '5e88b30eed27'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create superheroes table
    op.create_table('superheroes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('response_status', sa.String(length=50), nullable=True),
        sa.Column('intelligence', sa.Integer(), nullable=True),
        sa.Column('strength', sa.Integer(), nullable=True),
        sa.Column('speed', sa.Integer(), nullable=True),
        sa.Column('durability', sa.Integer(), nullable=True),
        sa.Column('power', sa.Integer(), nullable=True),
        sa.Column('combat', sa.Integer(), nullable=True),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('alter_egos', sa.Text(), nullable=True),
        sa.Column('place_of_birth', sa.String(length=255), nullable=True),
        sa.Column('first_appearance', sa.String(length=255), nullable=True),
        sa.Column('publisher', sa.String(length=255), nullable=True),
        sa.Column('alignment', sa.String(length=50), nullable=True),
        sa.Column('aliases', sa.Text(), nullable=True),
        sa.Column('gender', sa.String(length=50), nullable=True),
        sa.Column('race', sa.String(length=100), nullable=True),
        sa.Column('height_feet', sa.String(length=50), nullable=True),
        sa.Column('height_cm', sa.String(length=50), nullable=True),
        sa.Column('weight_lbs', sa.String(length=50), nullable=True),
        sa.Column('weight_kg', sa.String(length=50), nullable=True),
        sa.Column('eye_color', sa.String(length=50), nullable=True),
        sa.Column('hair_color', sa.String(length=50), nullable=True),
        sa.Column('occupation', sa.Text(), nullable=True),
        sa.Column('base', sa.String(length=255), nullable=True),
        sa.Column('group_affiliation', sa.Text(), nullable=True),
        sa.Column('relatives', sa.Text(), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    # Create index on name for faster searches
    op.create_index(op.f('ix_superheroes_name'), 'superheroes', ['name'], unique=False)


def downgrade() -> None:
    # Drop index
    op.drop_index(op.f('ix_superheroes_name'), table_name='superheroes')
    # Drop table
    op.drop_table('superheroes')
