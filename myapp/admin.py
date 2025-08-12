from django.contrib import admin
from .models import (
    Niveau, Matiere, Thematique, Competence, SousCompetence,
    PromptTemplate, Question, Generation, Quiz, QuizQuestion, Attempt, Answer
)

admin.site.register(Niveau)
admin.site.register(Matiere)
admin.site.register(Thematique)
admin.site.register(Competence)
admin.site.register(SousCompetence)
admin.site.register(PromptTemplate)
admin.site.register(Question)
admin.site.register(Generation)
admin.site.register(Quiz)
admin.site.register(QuizQuestion)
admin.site.register(Attempt)
admin.site.register(Answer)
