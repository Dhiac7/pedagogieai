from django.contrib import admin
from .models import (
    Niveau, Matiere, Thematique, Competence, SousCompetence,
    Question, Reponse
)


class ReponseInline(admin.TabularInline):
    model = Reponse
    extra = 1


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'description', 'type']
    list_filter = ['type']
    search_fields = ['description']
    inlines = [ReponseInline]


@admin.register(Reponse)
class ReponseAdmin(admin.ModelAdmin):
    list_display = ['id', 'description', 'valide', 'id_question']
    list_filter = ['valide', 'id_question__type']
    search_fields = ['description']


@admin.register(Competence)
class CompetenceAdmin(admin.ModelAdmin):
    list_display = ['id', 'description', 'id_thematique']
    list_filter = ['id_thematique']
    search_fields = ['description']


@admin.register(SousCompetence)
class SousCompetenceAdmin(admin.ModelAdmin):
    list_display = ['id', 'description', 'id_competence']
    list_filter = ['id_competence']
    search_fields = ['description']


@admin.register(Thematique)
class ThematiqueAdmin(admin.ModelAdmin):
    list_display = ['id', 'nom', 'id_matiere']
    list_filter = ['id_matiere']
    search_fields = ['nom']


admin.site.register(Niveau)
admin.site.register(Matiere)