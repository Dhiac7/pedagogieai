from rest_framework import serializers
from .models import (
    Niveau, Matiere, Thematique, Competence, SousCompetence,
    Question, Reponse
)


class NiveauSerializer(serializers.ModelSerializer):
    # Allow frontend to send a description even though the model doesn't store it
    description = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Niveau
        fields = '__all__'

    def create(self, validated_data):
        # Ignore non-model field
        validated_data.pop('description', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('description', None)
        return super().update(instance, validated_data)


class MatiereSerializer(serializers.ModelSerializer):
    # Allow frontend to send a description even though the model doesn't store it
    description = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Matiere
        fields = '__all__'

    def create(self, validated_data):
        validated_data.pop('description', None)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('description', None)
        return super().update(instance, validated_data)


class ThematiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thematique
        fields = '__all__'


class CompetenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competence
        fields = '__all__'


class SousCompetenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SousCompetence
        fields = '__all__'


class ReponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reponse
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    reponses = ReponseSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = '__all__'