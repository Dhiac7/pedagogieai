from django.db import models
from django.utils import timezone


class Matiere(models.Model):
    nom = models.CharField(max_length=100)

    def __str__(self) -> str:
        return self.nom


class Niveau(models.Model):
    nom = models.CharField(max_length=100)
    
    def __str__(self) -> str:
        return self.nom


class Thematique(models.Model):
    nom = models.CharField(max_length=100)
    # Map to conventional DB column name if existing schema uses `matiere_id`
    id_matiere = models.ForeignKey(
        Matiere,
        on_delete=models.CASCADE,
        related_name='thematiques',
        db_column='matiere_id',
    )

    def __str__(self) -> str:
        return f"{self.nom} ({self.id_matiere})"


class Competence(models.Model):
    description = models.TextField()
    # Map to conventional DB column name if existing schema uses `thematique_id`
    id_thematique = models.ForeignKey(
        Thematique,
        on_delete=models.CASCADE,
        related_name='competences',
        db_column='thematique_id',
    )

    def __str__(self) -> str:
        return f"Compétence {self.id} - {self.description[:50]}..."


class SousCompetence(models.Model):
    description = models.TextField()
    # Map to conventional DB column name if existing schema uses `competence_id`
    id_competence = models.ForeignKey(
        Competence,
        on_delete=models.CASCADE,
        related_name='sous_competences',
        db_column='competence_id',
    )

    def __str__(self) -> str:
        return f"Sous-compétence {self.id} - {self.description[:50]}..."


class Question(models.Model):
    description = models.TextField()
    type = models.CharField(max_length=50)

    def __str__(self) -> str:
        return f"Question {self.id} - {self.description[:50]}..."


class Reponse(models.Model):
    valide = models.BooleanField()
    description = models.TextField()
    id_question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='reponses')

    def __str__(self) -> str:
        return f"Réponse {self.id} - {'✓' if self.valide else '✗'} {self.description[:30]}..."
