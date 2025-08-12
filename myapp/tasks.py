from celery import shared_task
from django.db import transaction
from .models import Generation
from .services.llm_client import generate_with_model


@shared_task
def run_generation_task(generation_id: int) -> None:
    generation = Generation.objects.get(id=generation_id)
    generation.statut = 'running'
    generation.save(update_fields=['statut'])

    try:
        output_text = generate_with_model(prompt=generation.prompt, model_name=generation.model, params=generation.params)
    except Exception as exc:
        generation.mark_error(f"Erreur de génération: {exc}")
        return

    generation.mark_done(output_text) 