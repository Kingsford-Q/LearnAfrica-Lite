from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

# The truth for a course
class Course(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    instructor: str
    price: float= 0.0
    is_free: bool = True

# The truth for a lesson
class Lesson(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    duration: str 
    video_url: str
    content: str
    order: int
    is_completed: bool= False
    course_id: int= Field(foreign_key='course.id') # links the lesson to it's corresponding course

#The truth for a quiz
class Quiz(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    duration: str
    questions_data: str
    lesson_id: int= Field(foreign_key='lesson.id') # links the quiz to it's corresponding lesson
    course_id: int= Field(foreign_key='course.id') # links the quiz to it's corresponding course


# The truth for a user
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    email: str = Field(index=True, unique=True)# email should be unique for each user and indexed for faster lookups
    hashed_password: str
    is_instructor: bool= False

# The truth for an enrollment
class Enrollment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    enrollment_date: datetime = Field(default_factory=datetime.utcnow) # automatically set the enrollment date to the current date and time
    status: str = 'active'
    user_id: int = Field(foreign_key='user.id') # links the enrollment to the corresponding user
    course_id: int = Field(foreign_key='course.id') # links the enrollment