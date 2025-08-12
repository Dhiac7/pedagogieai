from rest_framework import serializers
from .models import (
    Niveau, Matiere, Thematique, Competence, SousCompetence,
    PromptTemplate, Question, Generation, Quiz, QuizQuestion, Attempt, Answer
)


class NiveauSerializer(serializers.ModelSerializer):
    class Meta:
        model = Niveau
        fields = ['id', 'nom']


class MatiereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matiere
        fields = ['id', 'nom']


class ThematiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thematique
        fields = ['id', 'nom', 'matiere']


class CompetenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competence
        fields = ['id', 'titre', 'description', 'thematique', 'niveau']


class SousCompetenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SousCompetence
        fields = ['id', 'titre', 'description', 'competence']


class PromptTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PromptTemplate
        fields = ['id', 'nom', 'contenu', 'created_at']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            'id', 'texte', 'format', 'difficulte', 'source',
            'competence', 'sous_competence', 'statut',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class GenerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Generation
        fields = [
            'id', 'competence', 'sous_competence', 'prompt',
            'model', 'params', 'output_text', 'score_quality', 'statut',
            'created_at', 'finished_at'
        ]
        read_only_fields = ['id', 'output_text', 'score_quality', 'statut', 'created_at', 'finished_at']


class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'titre', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']


class QuizQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizQuestion
        fields = ['id', 'quiz', 'question', 'ordre', 'points']


class AttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attempt
        fields = ['id', 'quiz', 'score', 'started_at', 'finished_at']
        read_only_fields = ['id', 'started_at']


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'attempt', 'question', 'response_text', 'is_correct'] 