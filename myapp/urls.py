from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NiveauViewSet, MatiereViewSet, ThematiqueViewSet, CompetenceViewSet,
    SousCompetenceViewSet, PromptTemplateViewSet, QuestionViewSet,
    GenerationViewSet, QuizViewSet, QuizQuestionViewSet, AttemptViewSet,
    AnswerViewSet, GenerateQuestionView
)

router = DefaultRouter()
router.register(r'niveaux', NiveauViewSet)
router.register(r'matieres', MatiereViewSet)
router.register(r'thematiques', ThematiqueViewSet)
router.register(r'competences', CompetenceViewSet)
router.register(r'sous-competences', SousCompetenceViewSet)
router.register(r'prompt-templates', PromptTemplateViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'generations', GenerationViewSet, basename='generation')
router.register(r'quiz', QuizViewSet)
router.register(r'quiz-questions', QuizQuestionViewSet)
router.register(r'attempts', AttemptViewSet)
router.register(r'answers', AnswerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('generate/', GenerateQuestionView.as_view(), name='generate-question'),
] 