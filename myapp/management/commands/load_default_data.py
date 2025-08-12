from django.core.management.base import BaseCommand
from myapp.models import Niveau, Matiere, Thematique, Competence, PromptTemplate

class Command(BaseCommand):
    help = 'Charge des données par défaut pour l\'application'

    def handle(self, *args, **options):
        self.stdout.write('Chargement des données par défaut...')
        
        # Créer les niveaux
        niveaux = []
        for nom in ['CP', 'CE1', 'CE2', 'CM1', 'CM2']:
            niveau, created = Niveau.objects.get_or_create(nom=nom)
            niveaux.append(niveau)
            if created:
                self.stdout.write(f'Niveau créé: {nom}')
        
        # Créer les matières
        matieres = []
        for nom in ['Mathématiques', 'Français', 'Sciences', 'Histoire-Géographie']:
            matiere, created = Matiere.objects.get_or_create(nom=nom)
            matieres.append(matiere)
            if created:
                self.stdout.write(f'Matière créée: {nom}')
        
        # Créer les thématiques
        thematiques = []
        for matiere in matieres:
            if matiere.nom == 'Mathématiques':
                themes = ['Nombres et calculs', 'Géométrie', 'Mesures', 'Résolution de problèmes']
            elif matiere.nom == 'Français':
                themes = ['Lecture', 'Écriture', 'Grammaire', 'Vocabulaire']
            elif matiere.nom == 'Sciences':
                themes = ['Vivant', 'Matière', 'Technologie', 'Environnement']
            else:
                themes = ['Histoire', 'Géographie', 'Éducation civique']
            
            for theme in themes:
                thematique, created = Thematique.objects.get_or_create(
                    nom=theme,
                    matiere=matiere
                )
                thematiques.append(thematique)
                if created:
                    self.stdout.write(f'Thématique créée: {theme} ({matiere.nom})')
        
        # Créer quelques compétences
        competences = []
        for thematique in thematiques[:8]:  # Limiter pour éviter trop de données
            if thematique.matiere.nom == 'Mathématiques':
                titre = f"Compétence en {thematique.nom}"
                description = f"Maîtriser les concepts de {thematique.nom}"
            elif thematique.matiere.nom == 'Français':
                titre = f"Compétence en {thematique.nom}"
                description = f"Développer les compétences en {thematique.nom}"
            else:
                titre = f"Compétence en {thematique.nom}"
                description = f"Acquérir des connaissances en {thematique.nom}"
            
            competence, created = Competence.objects.get_or_create(
                titre=titre,
                thematique=thematique,
                niveau=niveaux[2]  # CE2 par défaut
            )
            competences.append(competence)
            if created:
                self.stdout.write(f'Compétence créée: {titre}')
        
        # Créer des templates de prompts
        prompt_templates = [
            {
                'nom': 'Question Mathématiques',
                'contenu': '''Tu es un enseignant de mathématiques pour le primaire.
Génère une question de mathématiques pour un élève de {niveau} sur la compétence "{competence}".

La question doit être :
- Adaptée au niveau de l'élève
- Claire et précise
- Avec une réponse attendue
- Format QCM avec 4 choix de réponses

Compétence : {competence}
Niveau : {niveau}'''
            },
            {
                'nom': 'Question Français',
                'contenu': '''Tu es un enseignant de français pour le primaire.
Génère une question de français pour un élève de {niveau} sur la compétence "{competence}".

La question doit être :
- Adaptée au niveau de l'élève
- Claire et précise
- Avec une réponse attendue
- Format QCM avec 4 choix de réponses

Compétence : {competence}
Niveau : {niveau}'''
            },
            {
                'nom': 'Question Sciences',
                'contenu': '''Tu es un enseignant de sciences pour le primaire.
Génère une question de sciences pour un élève de {niveau} sur la compétence "{competence}".

La question doit être :
- Adaptée au niveau de l'élève
- Claire et précise
- Avec une réponse attendue
- Format QCM avec 4 choix de réponses

Compétence : {competence}
Niveau : {niveau}'''
            }
        ]
        
        for template_data in prompt_templates:
            template, created = PromptTemplate.objects.get_or_create(
                nom=template_data['nom'],
                defaults={'contenu': template_data['contenu']}
            )
            if created:
                self.stdout.write(f'Template créé: {template_data["nom"]}')
        
        self.stdout.write(self.style.SUCCESS('Chargement des données terminé avec succès!'))
        self.stdout.write(f'- {len(niveaux)} niveaux')
        self.stdout.write(f'- {len(matieres)} matières')
        self.stdout.write(f'- {len(thematiques)} thématiques')
        self.stdout.write(f'- {len(competences)} compétences')
        self.stdout.write(f'- {len(prompt_templates)} templates de prompts')
