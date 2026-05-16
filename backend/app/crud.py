from sqlmodel import Session, select
from .models import Lesson, User, Quiz, Enrollment
from .models import Course
from .security import hash_password

# this is what creates a course
def create_course(session: Session, course_data: Course):
    session.add(course_data)
    session.commit()
    session.refresh(course_data)
    return course_data


def get_all_courses(session: Session):
    # 1. Write the query: "Select everything from the Course table"
    statement = select(Course)
    
    # 2. Execute the query and get the results
    results = session.exec(statement)
    
    # 3. Return all of them as a list
    return results.all()

# this is what gets a course by id
def get_course(session: Session, course_id: int):
    return session.get(Course, course_id)


# this is what updates a course
def update_course(session: Session, course_id: int, updated_data: dict):
    # 1. Find the course
    db_course = session.get(Course, course_id)
    if not db_course:
        return None
    
    # 2. Update the fields
    for key, value in updated_data.items():
        setattr(db_course, key, value)
    
    # 3. Save and refresh
    session.add(db_course)
    session.commit()
    session.refresh(db_course)
    return db_course

# this is what deletes a course
def delete_course(session: Session, course_id: int):
    db_course = session.get(Course, course_id)
    if db_course:
        session.delete(db_course)
        session.commit()
        return True
    return False



# --- Lesson CRUD ---

def create_lesson(session: Session, lesson_data: Lesson):
    session.add(lesson_data)
    session.commit()
    session.refresh(lesson_data)
    return lesson_data

def get_lessons(session: Session):
    return session.exec(select(Lesson)).all()

def get_lesson(session: Session, lesson_id: int):
    return session.get(Lesson, lesson_id)

def update_lesson(session: Session, lesson_id: int, updated_data: dict):
    db_lesson = session.get(Lesson, lesson_id)
    if not db_lesson:
        return None
    for key, value in updated_data.items():
        setattr(db_lesson, key, value)
    session.add(db_lesson)
    session.commit()
    session.refresh(db_lesson)
    return db_lesson

def delete_lesson(session: Session, lesson_id: int):
    db_lesson = session.get(Lesson, lesson_id)
    if db_lesson:
        session.delete(db_lesson)
        session.commit()
        return True
    return False

def create_user(session: Session, user_data: User):
    # 1. Take the plain password, grind it up, and overwrite it with applesauce!
    user_data.hashed_password = hash_password(user_data.hashed_password)
    
    # 2. Now save the secured user data into the database drawer
    session.add(user_data)
    session.commit()
    session.refresh(user_data)
    return user_data

def get_users(session: Session):
    return session.exec(select(User)).all()

def get_user(session: Session, user_id: int):
    return session.get(User, user_id)

def update_user(session: Session, user_id: int, updated_data: dict):
    db_user = session.get(User, user_id)
    if not db_user: return None
    for key, value in updated_data.items():
        setattr(db_user, key, value)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def delete_user(session: Session, user_id: int):
    db_user = session.get(User, user_id)
    if db_user:
        session.delete(db_user)
        session.commit()
        return True
    return False

# --- Quiz CRUD ---
def create_quiz(session: Session, quiz_data: Quiz):
    session.add(quiz_data)
    session.commit()
    session.refresh(quiz_data)
    return quiz_data

def get_quizzes(session: Session):
    return session.exec(select(Quiz)).all()

# --- Enrollment CRUD ---
def create_enrollment(session: Session, enrollment_data: Enrollment):
    session.add(enrollment_data)
    session.commit()
    session.refresh(enrollment_data)
    return enrollment_data

def get_enrollments(session: Session):
    return session.exec(select(Enrollment)).all()


def get_user_by_email(session: Session, email: str):
    """Searches the database for a user with a specific email."""
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()