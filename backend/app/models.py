from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List  # <-- Added List here
from datetime import datetime


# --- 1. THE COURSE BLUEPRINT ---
class Course(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    instructor: str
    price: float = 0.0
    is_free: bool = True

    # PYTHON LINK: Automatically bundles all lessons belonging to this course
    lessons: List["Lesson"] = Relationship(back_populates="course")


# --- 2. THE LESSON BLUEPRINT ---
class Lesson(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    duration: str 
    video_url: str
    content: str
    order: int
    is_completed: bool = False
    
    # DATABASE LINK: The hard identifier linking back to the course table
    course_id: int = Field(foreign_key='course.id') 

    # PYTHON LINK: Allows a lesson to look up its parent course instantly
    course: Optional[Course] = Relationship(back_populates="lessons")


# --- 3. THE QUIZ BLUEPRINT ---
class Quiz(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    duration: str
    questions_data: str
    lesson_id: int = Field(foreign_key='lesson.id') 
    course_id: int = Field(foreign_key='course.id') 


# --- 4. THE USER BLUEPRINT ---
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    email: str = Field(index=True, unique=True)
    hashed_password: str
    is_instructor: bool = False


# --- 5. THE ENROLLMENT BLUEPRINT (REPAIRED) ---
class Enrollment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # automatically sets the enrollment date to the current date and time
    enrollment_date: datetime = Field(default_factory=datetime.utcnow) 
    status: str = 'active'
    user_id: int = Field(foreign_key='user.id') 
    course_id: int = Field(foreign_key='course.id') 