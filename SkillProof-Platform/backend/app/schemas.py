from typing import List, Literal, Optional

from pydantic import BaseModel, Field

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(pattern=EMAIL_PATTERN, max_length=180)
    password: str = Field(min_length=8, max_length=128)
    role: Literal["learner", "employer", "institution"] = "learner"


class LoginIn(BaseModel):
    email: str = Field(max_length=180)
    password: str = Field(max_length=128)


class ProfileIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    headline: str = Field(default="", max_length=180)
    location: str = Field(default="", max_length=120)


class AttemptIn(BaseModel):
    challenge_id: int
    answers: List[Optional[int]] = Field(max_length=50)
    seconds: int = Field(default=0, ge=0, le=86400)


class ProjectIn(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    description: str = Field(min_length=10, max_length=2000)
    technologies: List[str] = Field(default_factory=list, max_length=12)
    repository_url: str = Field(default="", max_length=500, pattern=r"^(https?://\S+)?$")


class ShortlistIn(BaseModel):
    candidate_id: int
