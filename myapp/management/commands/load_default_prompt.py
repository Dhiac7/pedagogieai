from django.core.management.base import BaseCommand
from myapp.models import PromptTemplate

DEFAULT_PROMPT = (
    "Tu es un assistant pédagogique spécialisé pour le primaire en Tunisie.\n"
    "Génère une question pédagogique en {langue} destinée à un élève de {niveau}.\n"
    "Compétence : \"{competence}\"\n"
    "Sous-compétence : \"{sous_competence}\"\n"
    "Forme la question de façon claire, fournis 1 variante principale + 2 variantes alternatives et indique la réponse attendue en une ligne."
)


class Command(BaseCommand):
    help = 'Charge un prompt template par défaut dans la base de données'

    def handle(self, *args, **options):
        obj, created = PromptTemplate.objects.get_or_create(
            nom='template_par_defaut',
            defaults={'contenu': DEFAULT_PROMPT}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Prompt template créé.'))
        else:
            self.stdout.write(self.style.WARNING('Prompt template existait déjà.')) 