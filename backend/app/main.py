from . import crud
from fastapi import FastAPI, Depends
from .database import create_db_and_tables
from .models import Course, Lesson, User, Quiz, Enrollment, LessonProgress
from .database import engine
from sqlmodel import Session, SQLModel
from .security import verify_password, create_access_token, get_current_user
from fastapi.middleware.cors import CORSMiddleware # <-- Add this line


# creating the App
app= FastAPI(title='LearnAfrica-lite')

# --- CORS Approved Origins List ---
# This is the list of frontend addresses allowed to talk to your backend
origins = [
    "http://localhost:3000",   # Common React port
    "http://localhost:5173",   # Common Vite/React port
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

# Attach the security gatekeeper to your application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, "*" means "Allow any frontend tool to test me"
    allow_credentials=True,
    allow_methods=["*"], # Allows Kingsford to use GET, POST, PUT, and DELETE
    allow_headers=["*"], # Allows Kingsford to send secure headers (like our JWT tokens!)
)
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
    # 1. Fetch the course from the database using your CRUD tool
    course = crud.get_course(session=db, course_id=course_id)
    
    # Security Check: If the course doesn't exist, stop immediately
    if not course:
        return {"error": "Course not found"}
        
    # 2. Build a custom package that nests the lessons inside the course metadata
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "instructor": course.instructor,
        "price": course.price,
        "is_free": course.is_free,
        
        # MAGIC HAPPENS HERE: SQLModel instantly scans the lesson table 
        # and grabs everything where lesson.course_id == course.id
        "lessons": course.lessons 
    }

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




# --- Course Enrollment Endpoint ---
@app.post("/enroll/{course_id}")
def enroll_in_course(
    course_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    # Grab the logged-in user's ID from their digital wristband
    user_id = current_user.get("user_id")
    
    # Create a new registration entry
    new_enrollment = Enrollment(user_id=user_id, course_id=course_id)
    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)
    
    return {"message": "Successfully enrolled in course!", "enrollment": new_enrollment}


# --- Mark Lesson Completed Endpoint ---
@app.post("/lessons/{lesson_id}/complete")
def mark_lesson_complete(
    lesson_id: int, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    
    # Check if this lesson was already marked complete by this user
    existing_progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == user_id, 
        LessonProgress.lesson_id == lesson_id
    ).first()
    
    if existing_progress:
        return {"message": "Lesson already completed!", "progress": existing_progress}
        
    # If not, create a new completion timestamp record
    progress_record = LessonProgress(user_id=user_id, lesson_id=lesson_id, is_completed=True)
    db.add(progress_record)
    db.commit()
    db.refresh(progress_record)
    
    return {"message": "Lesson progress updated successfully!", "progress": progress_record}

from .models import Course, Lesson

@app.on_event("startup")
def seed_database():
    """
    The Onboarding Script: Automatically populates the database 
    with Kingsford's real courses if the database is empty.
    """
    db = next(get_db())
    
    # Check if we already have data
    course_count = db.query(Course).count()
    if course_count == 0:
        print("INFO: Database is empty. Commencing automatic data seeding...")
        
        # 1. Seed Course #1
        web_dev_course = Course(
            title="Introduction to Web Development",
            description="Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites from scratch.",
            instructor_id="inst-1",
            thumbnail="/images/Book2.jpg",
            category="Software Development",
            difficulty="Beginner",
            duration="8 weeks",
            language="English",
            price=0.0,
            is_free=True,
            tags="HTML, CSS, JavaScript",
            learning_outcomes="Understand how the web works, Build responsive layouts, Master JavaScript fundamentals"
        )
        db.add(web_dev_course)
        db.commit() # Saves the course so it gets an ID
        
        # Seed Lesson for Course #1
        html_lesson = Lesson(
            title="Introduction to HTML",
            description="Learn the basic structure of HTML documents and common tags.",
            duration="45 min",
            video_url="https://youtu.be/Wkn2hqIo0iE",
            content="HTML is the standard markup language for web pages.",
            order=1,
            course_id=web_dev_course.id # Pinned directly to the newly created course ID
        )
        db.add(html_lesson)
        db.commit()
        # 2. Seed Course #2
        python_course = Course(
            title="Python for Data Science",
            description="Master Python programming with a focus on data analysis, visualization, and machine learning basics.",
            instructor_id="inst-1",
            thumbnail="/placeholder.jpg",
            category="Data Science & AI",
            difficulty="Intermediate",
            duration="10 weeks",
            language="English",
            price=0.0,
            is_free=True,
            tags="Python, Pandas, NumPy",
            learning_outcomes="Write Python scripts confidently, Analyze datasets, Build simple ML models"
        )
        db.add(python_course)
        
        db.commit()
        print("INFO: Database seeding completed successfully! 2 Courses loaded.")