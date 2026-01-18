"""add_favorites_and_teams_tables

Revision ID: b86aa0dc1a41
Revises: 500e1395f9f2
Create Date: 2026-01-18 10:14:22.772240

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b86aa0dc1a41'
down_revision: Union[str, None] = '500e1395f9f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create user_favorites table
    op.create_table('user_favorites',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('superhero_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['superhero_id'], ['superheroes.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'superhero_id', name='unique_user_superhero_favorite')
    )
    op.create_index(op.f('ix_user_favorites_user_id'), 'user_favorites', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_favorites_superhero_id'), 'user_favorites', ['superhero_id'], unique=False)

    # Create teams table
    op.create_table('teams',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_teams_user_id'), 'teams', ['user_id'], unique=False)

    # Create team_members table
    op.create_table('team_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('superhero_id', sa.Integer(), nullable=False),
        sa.Column('position', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['superhero_id'], ['superheroes.id'], ),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_team_members_team_id'), 'team_members', ['team_id'], unique=False)
    op.create_index(op.f('ix_team_members_superhero_id'), 'team_members', ['superhero_id'], unique=False)


def downgrade() -> None:
    # Drop team_members table
    op.drop_index(op.f('ix_team_members_superhero_id'), table_name='team_members', if_exists=True)
    op.drop_index(op.f('ix_team_members_team_id'), table_name='team_members', if_exists=True)
    op.drop_table('team_members', if_exists=True)

    # Drop teams table
    op.drop_index(op.f('ix_teams_user_id'), table_name='teams', if_exists=True)
    op.drop_table('teams', if_exists=True)

    # Drop user_favorites table
    op.drop_index(op.f('ix_user_favorites_superhero_id'), table_name='user_favorites', if_exists=True)
    op.drop_index(op.f('ix_user_favorites_user_id'), table_name='user_favorites', if_exists=True)
    op.drop_table('user_favorites', if_exists=True)
