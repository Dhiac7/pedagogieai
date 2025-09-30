from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NiveauViewSet, MatiereViewSet, ThematiqueViewSet, CompetenceViewSet,
    SousCompetenceViewSet, QuestionViewSet, ReponseViewSet,
    QuestionsByCompetenceView, QuestionsByThematiqueView,
    ThematiquesByMatiereView, CompetencesByThematiqueView,
    SousCompetencesByCompetenceView, ReponsesByQuestionView,
    GenerateQuestionView, LocalLLMGenerateView
)

router = DefaultRouter()
router.register(r'niveaux', NiveauViewSet)
router.register(r'matieres', MatiereViewSet)
router.register(r'thematiques', ThematiqueViewSet)
router.register(r'competences', CompetenceViewSet)
router.register(r'sous-competences', SousCompetenceViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'reponses', ReponseViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('questions/competence/<int:competence_id>/', QuestionsByCompetenceView.as_view(), name='questions-by-competence'),
    path('questions/thematique/<int:thematique_id>/', QuestionsByThematiqueView.as_view(), name='questions-by-thematique'),
    path('thematiques/matiere/<int:matiere_id>/', ThematiquesByMatiereView.as_view(), name='thematiques-by-matiere'),
    path('competences/thematique/<int:thematique_id>/', CompetencesByThematiqueView.as_view(), name='competences-by-thematique'),
    path('sous-competences/competence/<int:competence_id>/', SousCompetencesByCompetenceView.as_view(), name='souscompetences-by-competence'),
    path('reponses/question/<int:question_id>/', ReponsesByQuestionView.as_view(), name='reponses-by-question'),
    path('generate/question/', GenerateQuestionView.as_view(), name='generate-question'),
    path('generate/local/', LocalLLMGenerateView.as_view(), name='generate-local'),
]