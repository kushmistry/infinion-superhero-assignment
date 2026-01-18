from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Team(id={self.id}, name='{self.name}', user_id={self.user_id})>"

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    superhero_id = Column(Integer, ForeignKey("superheroes.id"), nullable=False, index=True)
    position = Column(Integer, default=0)  # Order in the team
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    team = relationship("Team", back_populates="members")

    def __repr__(self):
        return f"<TeamMember(team_id={self.team_id}, superhero_id={self.superhero_id})>"
