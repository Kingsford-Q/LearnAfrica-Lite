from . import crud
from fastapi import FastAPI, Depends
from .database import create_db_and_tables
from .models import Course, Lesson, User, Quiz, Enrollment
from .database import engine
from sqlmodel import Session, SQLModel
from .security import verify_password, create_access_token, get_current_user


# creating the App
app= FastAPI(title='LearnAfrica-lite')

# importing the database session generator
def get_db():
    with Session(engine) as session:
        yield session

# the on switch on event to create the database and tables
@app.on_event('startup')
def on_startup():
    create_db_and_tables()

# A simple root endpoint to test the API
@app.get('/')
def read_root():
    return {"message": "Welcome to LearnAfrica-lite API!"}

# endpoint to create a course 
@app.post('/courses/')
def create_course(course: Course, db: Session = Depends(get_db)):
    new_course= crud.create_course(session=db, course_data=course)
    return new_course

@app.get("/courses/")
def read_courses(db: Session = Depends(get_db)):
    # Go to the brain and ask for the list
    courses = crud.get_all_courses(session=db)
    return courses

# endpoint to get a course by id
@app.get("/courses/{course_id}")
def read_course(course_id: int, db: Session = Depends(get_db)):
    course = crud.get_course(session=db, course_id=course_id)
    return course

# endpoint to update a course
@app.patch("/courses/{course_id}")
def update_course(course_id: int, updated_data: dict, db: Session = Depends(get_db)):
    course = crud.update_course(session=db, course_id=course_id, updated_data=updated_data)
    if not course:
        return {"error": "Course not found"}
    return course

# endpoint to delete a course
@app.delete("/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    success = crud.delete_course(session=db, course_id=course_id)
    if not success:
        return {"error": "Course not found"}
    return {"message": f"Course {course_id} deleted successfully"}

# --- Lesson Endpoints ---

@app.post("/lessons/")
def create_new_lesson(
    lesson: Lesson, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user) # <-- The Scanner is now active!
):
    # The rest of your code inside this function stays exactly the same!
    return crud.create_lesson(db, lesson)

@app.get("/lessons/")
def read_lessons(db: Session = Depends(get_db)):
    return crud.get_lessons(session=db)

@app.get("/lessons/{lesson_id}")
def read_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = crud.get_lesson(session=db, lesson_id=lesson_id)
    if not lesson:
        return {"error": "Lesson not found"}
    return lesson

@app.patch("/lessons/{lesson_id}")
def update_lesson(lesson_id: int, updated_data: dict, db: Session = Depends(get_db)):
    lesson = crud.update_lesson(session=db, lesson_id=lesson_id, updated_data=updated_data)
    if not lesson:
        return {"error": "Lesson not found"}
    return lesson

@app.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: int, db: Session = Depends(get_db)):
    success = crud.delete_lesson(session=db, lesson_id=lesson_id)
    if not success:
        return {"error": "Lesson not found"}
    return {"message": "Lesson deleted"}

# --- User Endpoints ---
@app.post("/users/")
def add_user(user: User, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@app.get("/users/")
def read_users(db: Session = Depends(get_db)):
    return crud.get_users(db)

# --- Quiz Endpoints ---
@app.post("/quizzes/")
def add_quiz(quiz: Quiz, db: Session = Depends(get_db)):
    return crud.create_quiz(db, quiz)

@app.get("/quizzes/")
def read_quizzes(db: Session = Depends(get_db)):
    return crud.get_quizzes(db)

# --- Enrollment Endpoints ---
@app.post("/enrollments/")
def enroll_user(enrollment: Enrollment, db: Session = Depends(get_db)):
    return crud.create_enrollment(db, enrollment)

@app.get("/enrollments/")
def read_enrollments(db: Session = Depends(get_db)):
    return crud.get_enrollments(db)

# Login request class
class LoginRequest(SQLModel):
    email: str
    password: str

@app.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    # 1. Look up the user by email
    user = crud.get_user_by_email(db, email=login_data.email)
    if not user:
        return {"error": "Invalid email or password"}
        
    # 2. Verify their password
    is_valid = verify_password(login_data.password, user.hashed_password)
    if not is_valid:
        return {"error": "Invalid email or password"}
        
    # --- NEW UPGRADE HAPPENS HERE ---
    
    # 3. Decide what information to write inside the token card (The Payload)
    # We store their unique database ID and email so we know exactly who they are later
    token_payload = {"user_id": user.id, "email": user.email}
    
    # 4. Drop that information into our token factory to get the crazy text string
    generated_token = create_access_token(data=token_payload)
    
    # 5. Hand the wristband back to Kingsford's frontend!
    return {
        "access_token": generated_token,
        "token_type": "bearer",
        "user_name": user.full_name
    }