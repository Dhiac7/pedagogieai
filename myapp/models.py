from django.db import models
from django.utils import timezone


class Niveau(models.Model):
    nom = models.CharField(max_length=100)

    def __str__(self) -> str:
        return self.nom


class Matiere(models.Model):
    nom = models.CharField(max_length=100)

    def __str__(self) -> str:
        return self.nom


class Thematique(models.Model):
    nom = models.CharField(max_length=150)
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name='thematiques')

    def __str__(self) -> str:
        return f"{self.nom} ({self.matiere})"


class Competence(models.Model):
    titre = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    thematique = models.ForeignKey(Thematique, on_delete=models.CASCADE, related_name='competences')
    niveau = models.ForeignKey(Niveau, on_delete=models.CASCADE, related_name='competences')

    def __str__(self) -> str:
        return self.titre


class SousCompetence(models.Model):
    titre = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    competence = models.ForeignKey(Competence, on_delete=models.CASCADE, related_name='sous_competences')

    def __str__(self) -> str:
        return self.titre


class PromptTemplate(models.Model):
    nom = models.CharField(max_length=150, unique=True)
    contenu = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.nom


class Question(models.Model):
    class Statut(models.TextChoices):
        DRAFT = 'draft', 'Brouillon'
        GENERATED = 'generated', 'Générée'
        VALIDATED = 'validated', 'Validée'
        ARCHIVED = 'archived', 'Archivée'

    texte = models.TextField()
    format = models.CharField(max_length=50, default='texte')
    difficulte = models.CharField(max_length=50, blank=True)
    source = models.CharField(max_length=100, blank=True)
    competence = models.ForeignKey(Competence, on_delete=models.SET_NULL, null=True, blank=True, related_name='questions')
    sous_competence = models.ForeignKey(SousCompetence, on_delete=models.SET_NULL, null=True, blank=True, related_name='questions')
    statut = models.CharField(max_length=20, choices=Statut.choices, default=Statut.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Question #{self.id} ({self.statut})"


class Generation(models.Model):
    STATUT_CHOICES = [
        ('pending', 'En attente'),
        ('running', 'En cours'),
        ('done', 'Terminée'),
        ('error', 'Erreur'),
    ]

    competence = models.ForeignKey(Competence, on_delete=models.SET_NULL, null=True, blank=True)
    sous_competence = models.ForeignKey(SousCompetence, on_delete=models.SET_NULL, null=True, blank=True)
    prompt = models.TextField()
    model = models.CharField(max_length=100, default='ollama:mistral')
    params = models.JSONField(default=dict, blank=True)
    output_text = models.TextField(blank=True)
    score_quality = models.FloatField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    def mark_done(self, output_text: str):
        self.output_text = output_text
        self.statut = 'done'
        self.finished_at = timezone.now()
        self.save(update_fields=['output_text', 'statut', 'finished_at'])

    def mark_error(self, message: str):
        self.output_text = message
        self.statut = 'error'
        self.finished_at = timezone.now()
        self.save(update_fields=['output_text', 'statut', 'finished_at'])


class Quiz(models.Model):
    titre = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.titre


class QuizQuestion(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='quiz_questions')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='quiz_usages')
    ordre = models.PositiveIntegerField(default=0)
    points = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('quiz', 'question')
        ordering = ['ordre']


class Attempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.FloatField(null=True, blank=True)
    started_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(null=True, blank=True)


class Answer(models.Model):
    attempt = models.ForeignKey(Attempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    response_text = models.TextField(blank=True)
    is_correct = models.BooleanField(null=True, blank=True)
