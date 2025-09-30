from celery import shared_task
from django.db import transaction
from .models import Question, Reponse
from .services.llm_client import generate_with_model
import json


@shared_task
def generate_question_task(competence_id: int, question_type: str = "qcm", model_name: str = "mistral") -> None:
    """
    Generate a question based on a competence using AI
    """
    try:
        # Create a prompt based on the competence
        from .models import Competence
        competence = Competence.objects.get(id=competence_id)
        
        prompt = f"""
        Créez une question de type {question_type} pour la compétence suivante:
        
        Compétence: {competence.description}
        
        Veuillez générer:
        1. Une question claire et appropriée
        2. Plusieurs réponses possibles (si QCM)
        3. Indiquez quelle(s) réponse(s) est/sont correcte(s)
        
        Format de réponse attendu (JSON):
        {{
            "question": "Texte de la question",
            "type": "{question_type}",
            "reponses": [
                {{"description": "Réponse 1", "valide": true}},
                {{"description": "Réponse 2", "valide": false}},
                {{"description": "Réponse 3", "valide": false}},
                {{"description": "Réponse 4", "valide": false}}
            ]
        }}
        """
        
        # Generate with AI
        output_text = generate_with_model(prompt=prompt, model_name=model_name)
        
        # Parse the JSON response
        try:
            generated_data = json.loads(output_text)
            
            # Create the question
            with transaction.atomic():
                question = Question.objects.create(
                    description=generated_data.get("question", ""),
                    type=generated_data.get("type", question_type)
                )
                
                # Create the responses
                for reponse_data in generated_data.get("reponses", []):
                    Reponse.objects.create(
                        description=reponse_data.get("description", ""),
                        valide=reponse_data.get("valide", False),
                        id_question=question
                    )
                
                return f"Question générée avec succès (ID: {question.id})"
                
        except json.JSONDecodeError:
            # If JSON parsing fails, create a simple question
            with transaction.atomic():
                question = Question.objects.create(
                    description=output_text,
                    type=question_type
                )
                return f"Question générée avec succès (ID: {question.id}) - Format JSON invalide, question simple créée"
                
    except Exception as exc:
        return f"Erreur lors de la génération: {exc}"


@shared_task
def generate_questions_batch_task(competence_ids: list, question_type: str = "qcm", count_per_competence: int = 1) -> None:
    """
    Generate multiple questions for multiple competences
    """
    results = []
    for competence_id in competence_ids:
        for _ in range(count_per_competence):
            result = generate_question_task(competence_id, question_type)
            results.append(result)
    return results