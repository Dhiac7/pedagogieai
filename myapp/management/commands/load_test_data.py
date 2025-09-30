from django.core.management.base import BaseCommand
from myapp.models import Matiere, Niveau, Thematique, Competence, SousCompetence, Question, Reponse


class Command(BaseCommand):
    help = 'Load test data for the simplified schema'

    def handle(self, *args, **options):
        self.stdout.write('Loading test data...')
        
        # Create Niveaux
        niveaux = []
        for i in range(1, 13):
            niveau, created = Niveau.objects.get_or_create(id=i)
            if created:
                niveaux.append(niveau)
                self.stdout.write(f'Created Niveau {i}')
        
        # Create Matieres
        matieres_data = [
            'Mathématiques',
            'Français', 
            'Histoire-Géographie',
            'Sciences',
            'Anglais',
            'Arts',
            'Sport'
        ]
        
        matieres = []
        for nom in matieres_data:
            matiere, created = Matiere.objects.get_or_create(nom=nom)
            if created:
                matieres.append(matiere)
                self.stdout.write(f'Created Matiere: {nom}')
        
        # Create Thematiques
        thematiques_data = [
            ('Algèbre', 0),  # Mathématiques
            ('Géométrie', 0),
            ('Calcul', 0),
            ('Grammaire', 1),  # Français
            ('Orthographe', 1),
            ('Littérature', 1),
            ('Histoire de France', 2),  # Histoire-Géographie
            ('Géographie physique', 2),
            ('Biologie', 3),  # Sciences
            ('Physique', 3),
            ('Chimie', 3),
        ]
        
        thematiques = []
        for nom, matiere_idx in thematiques_data:
            thematique, created = Thematique.objects.get_or_create(
                nom=nom,
                id_matiere=matieres[matiere_idx]
            )
            if created:
                thematiques.append(thematique)
                self.stdout.write(f'Created Thematique: {nom}')
        
        # Create Competences
        competences_data = [
            ('Résoudre des équations du premier degré', 0),  # Algèbre
            ('Calculer des aires et périmètres', 1),  # Géométrie
            ('Effectuer des opérations de base', 2),  # Calcul
            ('Identifier les classes grammaticales', 3),  # Grammaire
            ('Appliquer les règles d\'orthographe', 4),  # Orthographe
            ('Analyser un texte littéraire', 5),  # Littérature
            ('Connaître les grandes périodes historiques', 6),  # Histoire
            ('Localiser les continents et océans', 7),  # Géographie
            ('Comprendre le fonctionnement du corps humain', 8),  # Biologie
            ('Appliquer les lois de Newton', 9),  # Physique
            ('Équilibrer des équations chimiques', 10),  # Chimie
        ]
        
        competences = []
        for description, thematique_idx in competences_data:
            competence, created = Competence.objects.get_or_create(
                description=description,
                id_thematique=thematiques[thematique_idx]
            )
            if created:
                competences.append(competence)
                self.stdout.write(f'Created Competence: {description[:50]}...')
        
        # Create Sous-Competences
        sous_competences_data = [
            ('Isoler l\'inconnue dans une équation', 0),
            ('Vérifier la solution d\'une équation', 0),
            ('Calculer l\'aire d\'un rectangle', 1),
            ('Calculer l\'aire d\'un triangle', 1),
            ('Additionner des nombres entiers', 2),
            ('Soustraire des nombres entiers', 2),
            ('Identifier un nom commun', 3),
            ('Identifier un verbe', 3),
            ('Accord sujet-verbe', 4),
            ('Accord en genre et en nombre', 4),
            ('Identifier le thème principal', 5),
            ('Analyser les personnages', 5),
        ]
        
        for description, competence_idx in sous_competences_data:
            sous_competence, created = SousCompetence.objects.get_or_create(
                description=description,
                id_competence=competences[competence_idx]
            )
            if created:
                self.stdout.write(f'Created Sous-Competence: {description[:50]}...')
        
        # Create Sample Questions with Responses
        questions_data = [
            {
                'description': 'Quelle est la solution de l\'équation 2x + 5 = 13 ?',
                'type': 'qcm',
                'reponses': [
                    ('x = 4', True),
                    ('x = 3', False),
                    ('x = 5', False),
                    ('x = 6', False),
                ]
            },
            {
                'description': 'Calculez l\'aire d\'un rectangle de longueur 8 cm et de largeur 5 cm.',
                'type': 'calcul',
                'reponses': [
                    ('40 cm²', True),
                    ('26 cm²', False),
                    ('13 cm²', False),
                    ('80 cm²', False),
                ]
            },
            {
                'description': 'Quelle est la classe grammaticale du mot "rapidement" ?',
                'type': 'qcm',
                'reponses': [
                    ('Nom', False),
                    ('Verbe', False),
                    ('Adverbe', True),
                    ('Adjectif', False),
                ]
            },
            {
                'description': 'Conjuguez le verbe "être" au présent de l\'indicatif.',
                'type': 'conjugaison',
                'reponses': [
                    ('je suis, tu es, il est, nous sommes, vous êtes, ils sont', True),
                ]
            },
            {
                'description': 'En quelle année a eu lieu la Révolution française ?',
                'type': 'qcm',
                'reponses': [
                    ('1788', False),
                    ('1789', True),
                    ('1790', False),
                    ('1791', False),
                ]
            },
        ]
        
        for q_data in questions_data:
            question, created = Question.objects.get_or_create(
                description=q_data['description'],
                type=q_data['type']
            )
            if created:
                self.stdout.write(f'Created Question: {q_data["description"][:50]}...')
                
                # Create responses
                for reponse_text, valide in q_data['reponses']:
                    Reponse.objects.get_or_create(
                        description=reponse_text,
                        valide=valide,
                        id_question=question
                    )
        
        self.stdout.write(
            self.style.SUCCESS('Successfully loaded test data!')
        )
