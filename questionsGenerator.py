from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pedagogieQuestions_logic import answer_question  

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.13:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    school_level: str  # e.g., "Primary", "Secondary", "High School", "Grade 5", etc.
    module: str        # e.g., "Mathematics", "Science", "History", etc.
    thematic: str      # e.g., "Algebra", "Geometry", "Biology", etc.
    competence: str    # e.g., "Problem solving", "Critical thinking", etc.
    sous_competence: str  # e.g., "Solve linear equations", "Analyze data", etc.
    num_questions: int = 3
    question_type: str = "quiz"  # "quiz", "essay", "multiple_choice", etc.

@app.get("/")
def health_check():
    return {"status": "ok", "message": "FastAPI service is running"}

@app.post("/generate-questions")
def generate_pedagogical_questions(req: QuestionRequest):
    try:
        questions = answer_question(
            school_level=req.school_level,
            module=req.module,
            thematic=req.thematic,
            competence=req.competence,
            sous_competence=req.sous_competence,
            num_questions=req.num_questions,
            question_type=req.question_type
        )
        return {
            "questions": questions,
            "status": "success"
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "error"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)