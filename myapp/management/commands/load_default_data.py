from django.core.management.base import BaseCommand
from myapp.models import (
    Niveau,
    Matiere,
    Thematique,
    Competence,
    SousCompetence,
    Question,
    Reponse,
)

class Command(BaseCommand):
    help = 'Charge des données réelles et cohérentes avec le schéma actuel'

    def handle(self, *args, **options):
        self.stdout.write('Chargement des données...')

        # Niveaux (1er degré)
        niveaux = []
        for nom in ['CP', 'CE1', 'CE2', 'CM1', 'CM2']:
            niveau, created = Niveau.objects.get_or_create(nom=nom)
            niveaux.append(niveau)
            if created:
                self.stdout.write(f'- Niveau créé: {nom}')

        # Matières principales
        matieres_map = {}
        for nom in ['Mathématiques', 'Français', 'Sciences', 'Histoire-Géographie', 'EMC']:
            matiere, created = Matiere.objects.get_or_create(nom=nom)
            matieres_map[nom] = matiere
            if created:
                self.stdout.write(f'- Matière créée: {nom}')

        # Thématiques par matière (réalistes)
        thematiques_specs = {
            'Mathématiques': [
                'Nombres et calcul',
                'Géométrie',
                'Grandeurs et mesures',
                'Problèmes'
            ],
            'Français': [
                'Lecture et compréhension',
                'Orthographe et grammaire',
                'Vocabulaire',
                'Expression écrite'
            ],
            'Sciences': [
                'Le vivant, sa diversité et les fonctions',
                'La matière et ses états',
                'Objets, techniques et société',
                'La Terre et l\'Univers'
            ],
            'Histoire-Géographie': [
                'Repères historiques',
                'Le temps et l\'espace',
                'Territoires et paysages'
            ],
            'EMC': [
                'Règles de vie et respect',
                'Coopération et entraide'
            ],
        }

        thematiques = []
        for matiere_nom, themes in thematiques_specs.items():
            matiere = matieres_map[matiere_nom]
            for theme in themes:
                thematique, created = Thematique.objects.get_or_create(
                    nom=theme,
                    id_matiere=matiere,
                )
                thematiques.append(thematique)
                if created:
                    self.stdout.write(f'- Thématique créée: {theme} ({matiere_nom})')

        # Compétences réalistes par thématique
        # Le modèle attend uniquement une description et un lien vers la thématique
        competences_data = {
            'Nombres et calcul': [
                'Comprendre la valeur des chiffres et composer/décomposer des nombres',
                'Poser et effectuer des additions et soustractions (avec retenues)'
            ],
            'Géométrie': [
                'Reconnaître et tracer des figures géométriques simples (carré, rectangle, triangle)',
                'Identifier des axes de symétrie'
            ],
            'Grandeurs et mesures': [
                'Mesurer des longueurs avec la règle et convertir cm/mm',
                'Lire l\'heure sur une horloge (heures et demi-heures)'
            ],
            'Problèmes': [
                'Résoudre des problèmes additifs et soustractifs en une étape',
                'Choisir l\'opération adaptée à une situation'
            ],
            'Lecture et compréhension': [
                'Repérer des informations explicites dans un court texte',
                'Inférer une information implicite simple'
            ],
            'Orthographe et grammaire': [
                'Accorder le nom et l\'adjectif en genre et en nombre',
                'Conjuguer au présent les verbes du 1er groupe'
            ],
            'Vocabulaire': [
                'Utiliser des mots de sens proche (synonymes) pour enrichir un texte'
            ],
            'Expression écrite': [
                'Rédiger 5 à 8 phrases cohérentes sur un sujet connu'
            ],
            'Le vivant, sa diversité et les fonctions': [
                'Identifier les besoins vitaux des êtres vivants (air, eau, nourriture)'
            ],
            'La matière et ses états': [
                'Différencier solide, liquide, gaz et observer des changements d\'état'
            ],
            'Objets, techniques et société': [
                'Décrire le fonctionnement d\'objets techniques du quotidien'
            ],
            'La Terre et l\'Univers': [
                'Connaître l\'alternance jour/nuit et les saisons'
            ],
            'Repères historiques': [
                'Situer des événements sur une frise chronologique simple'
            ],
            'Le temps et l\'espace': [
                'Lire un plan simple et se repérer'
            ],
            'Territoires et paysages': [
                'Identifier des paysages ruraux et urbains'
            ],
            'Règles de vie et respect': [
                'Adopter des comportements responsables à l\'école'
            ],
            'Coopération et entraide': [
                'Participer à un travail d\'équipe et écouter les autres'
            ],
        }

        thematiques_by_name = {t.nom: t for t in thematiques}
        competences = []
        for theme_nom, descriptions in competences_data.items():
            thematique = thematiques_by_name.get(theme_nom)
            if not thematique:
                continue
            for desc in descriptions:
                comp, created = Competence.objects.get_or_create(
                    description=desc,
                    id_thematique=thematique,
                )
                competences.append(comp)
                if created:
                    self.stdout.write(f'- Compétence créée: {desc[:60]}…')

        # Sous-compétences (découpage opérationnel)
        sous_comp_examples = [
            'Identifier les unités',
            'Appliquer une procédure',
            'Vérifier le résultat',
        ]
        sous_total = 0
        for comp in competences:
            for sc_desc in sous_comp_examples:
                sc, created = SousCompetence.objects.get_or_create(
                    description=f"{sc_desc} — {comp.description[:40]}",
                    id_competence=comp,
                )
                if created:
                    sous_total += 1

        # Quelques questions QCM par thème avec réponses
        # On génère 1 question par thématique avec 4 réponses (1 correcte)
        questions_crees = 0
        reponses_crees = 0
        for thematique in thematiques:
            q, q_created = Question.objects.get_or_create(
                description=f"Question QCM sur: {thematique.nom}",
                type='QCM',
            )
            if q_created:
                questions_crees += 1
                # 3 propositions fausses + 1 vraie
                propositions = [
                    (f"Proposition liée à {thematique.nom} — A", False),
                    (f"Proposition liée à {thematique.nom} — B", False),
                    (f"Proposition liée à {thematique.nom} — C", False),
                    (f"Bonne réponse pour {thematique.nom}", True),
                ]
                for texte, valide in propositions:
                    _, r_created = Reponse.objects.get_or_create(
                        description=texte,
                        valide=valide,
                        id_question=q,
                    )
                    if r_created:
                        reponses_crees += 1

        self.stdout.write(self.style.SUCCESS('Chargement des données terminé.'))
        self.stdout.write(f'- {len(niveaux)} niveaux')
        self.stdout.write(f'- {len(matieres_map)} matières')
        self.stdout.write(f'- {len(thematiques)} thématiques')
        self.stdout.write(f'- {len(competences)} compétences')
        self.stdout.write(f'- {sous_total} sous-compétences')
        self.stdout.write(f'- {questions_crees} questions / {reponses_crees} réponses')
