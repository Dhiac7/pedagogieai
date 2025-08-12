from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import (
    Niveau, Matiere, Thematique, Competence, SousCompetence,
    PromptTemplate, Question, Generation, Quiz, QuizQuestion, Attempt, Answer
)
from .serializers import (
    NiveauSerializer, MatiereSerializer, ThematiqueSerializer, CompetenceSerializer,
    SousCompetenceSerializer, PromptTemplateSerializer, QuestionSerializer,
    GenerationSerializer, QuizSerializer, QuizQuestionSerializer, AttemptSerializer,
    AnswerSerializer
)
from .tasks import run_generation_task


class AllowAllPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return True


class NiveauViewSet(viewsets.ModelViewSet):
    queryset = Niveau.objects.all()
    serializer_class = NiveauSerializer
    permission_classes = [AllowAllPermission]


class MatiereViewSet(viewsets.ModelViewSet):
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer
    permission_classes = [AllowAllPermission]


class ThematiqueViewSet(viewsets.ModelViewSet):
    queryset = Thematique.objects.all()
    serializer_class = ThematiqueSerializer
    permission_classes = [AllowAllPermission]


class CompetenceViewSet(viewsets.ModelViewSet):
    queryset = Competence.objects.all()
    serializer_class = CompetenceSerializer
    permission_classes = [AllowAllPermission]


class SousCompetenceViewSet(viewsets.ModelViewSet):
    queryset = SousCompetence.objects.all()
    serializer_class = SousCompetenceSerializer
    permission_classes = [AllowAllPermission]


class PromptTemplateViewSet(viewsets.ModelViewSet):
    queryset = PromptTemplate.objects.all()
    serializer_class = PromptTemplateSerializer
    permission_classes = [AllowAllPermission]


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all().order_by('-created_at')
    serializer_class = QuestionSerializer
    permission_classes = [AllowAllPermission]


class GenerationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Generation.objects.all().order_by('-created_at')
    serializer_class = GenerationSerializer
    permission_classes = [AllowAllPermission]


class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [AllowAllPermission]


class QuizQuestionViewSet(viewsets.ModelViewSet):
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [AllowAllPermission]


class AttemptViewSet(viewsets.ModelViewSet):
    queryset = Attempt.objects.all()
    serializer_class = AttemptSerializer
    permission_classes = [AllowAllPermission]


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [AllowAllPermission]


class GenerateQuestionView(APIView):
    permission_classes = [AllowAllPermission]

    def post(self, request):
        competence_id = request.data.get('competence_id')
        sous_competence_id = request.data.get('sous_competence_id')
        prompt_template_id = request.data.get('prompt_template_id')
        params = request.data.get('params', {})
        model_name = request.data.get('model', 'ollama:mistral')

        prompt_text = request.data.get('prompt')
        if prompt_template_id and not prompt_text:
            template = get_object_or_404(PromptTemplate, id=prompt_template_id)
            prompt_text = template.contenu

        generation = Generation.objects.create(
            competence_id=competence_id,
            sous_competence_id=sous_competence_id,
            prompt=prompt_text or '',
            model=model_name,
            params=params,
            statut='pending',
        )

        run_generation_task.delay(generation.id)

        serializer = GenerationSerializer(generation)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
