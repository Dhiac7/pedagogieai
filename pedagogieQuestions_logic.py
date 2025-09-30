from ctransformers import AutoModelForCausalLM
from langchain.llms.base import LLM
from langchain.prompts import PromptTemplate
from typing import Optional, List
from pydantic import Field

# ---- 1. Custom LLM wrapper ----
class CTransformersLLM(LLM):
    model_file: str = Field(...)
    model: Optional[AutoModelForCausalLM] = Field(default=None, exclude=True)

    def __init__(self, model_file: str, **kwargs):
        super().__init__(model_file=model_file, **kwargs)
        self.model = AutoModelForCausalLM.from_pretrained(model_file)

    @property
    def _llm_type(self) -> str:
        return "ctransformers"

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        output = self.model(prompt, max_new_tokens=500)
        if stop:
            for s in stop:
                output = output.split(s)[0]
        return output.strip()

# ---- 2. Load the model ----
model_file = "./models/llama-2-7b-chat.Q4_K_M.gguf"
llm = CTransformersLLM(model_file=model_file)

# ---- 3. Enhanced Prompt template ----
template = """You are a pedagogy expert specializing in curriculum design and assessment.

Generate exactly {num_questions} {question_type} questions for:
- School Level: {school_level}
- Module: {module}
- Thematic: {thematic}
- Competence: {competence}
- Sub-competence: {sous_competence}

Requirements:
1. Questions must be appropriate for {school_level} students
2. Focus specifically on the sub-competence: {sous_competence}
3. Align with the competence: {competence}
4. Stay within the thematic area: {thematic} from the {module} module
5. Make questions clear, measurable, and pedagogically sound
6. Ensure questions test understanding at the appropriate cognitive level

Generate ONLY the questions, numbered 1, 2, 3, etc. No additional text or explanations.

Questions:"""

prompt = PromptTemplate(
    input_variables=[
        "num_questions", 
        "question_type", 
        "school_level", 
        "module", 
        "thematic", 
        "competence", 
        "sous_competence"
    ],
    template=template,
)

# ---- 4. Updated API Function ----
def answer_question(
    school_level: str,
    module: str,
    thematic: str,
    competence: str,
    sous_competence: str,
    num_questions: int = 3,
    question_type: str = "quiz"
) -> str:
    """
    Generate pedagogical questions based on specific educational parameters.
    
    Args:
        school_level: Educational level (e.g., "Grade 5", "High School")
        module: Subject module (e.g., "Mathematics", "Science")
        thematic: Specific theme within the module (e.g., "Algebra", "Geometry")
        competence: General competence being assessed (e.g., "Problem solving")
        sous_competence: Specific sub-competence (e.g., "Solve linear equations")
        num_questions: Number of questions to generate
        question_type: Type of questions (e.g., "quiz", "essay", "multiple_choice")
    
    Returns:
        Generated questions as a string
    """
    final_prompt = prompt.format(
        num_questions=num_questions,
        question_type=question_type,
        school_level=school_level,
        module=module,
        thematic=thematic,
        competence=competence,
        sous_competence=sous_competence
    )
    
    response = llm.invoke(final_prompt)
    
    # Clean up the response to return only questions
    lines = response.split('\n')
    questions = []
    for line in lines:
        line = line.strip()
        if line and (line[0].isdigit() or line.startswith('Q')):
            questions.append(line)
    
    return '\n'.join(questions) if questions else response