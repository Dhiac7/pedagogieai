from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.shortcuts import get_object_or_404
import json

from .models import (
    Niveau, Matiere, Thematique, Competence, SousCompetence,
    Question, Reponse
)
from .serializers import (
    NiveauSerializer, MatiereSerializer, ThematiqueSerializer, CompetenceSerializer,
    SousCompetenceSerializer, QuestionSerializer, ReponseSerializer
)


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


class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [AllowAllPermission]


class ReponseViewSet(viewsets.ModelViewSet):
    queryset = Reponse.objects.all()
    serializer_class = ReponseSerializer
    permission_classes = [AllowAllPermission]


class QuestionsByCompetenceView(APIView):
    permission_classes = [AllowAllPermission]

    def get(self, request, competence_id):
        questions = Question.objects.filter(
            reponses__id_competence__id=competence_id
        ).distinct()
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)


class QuestionsByThematiqueView(APIView):
    permission_classes = [AllowAllPermission]

    def get(self, request, thematique_id):
        questions = Question.objects.filter(
            reponses__id_competence__id_thematique__id=thematique_id
        ).distinct()
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)


class ThematiquesByMatiereView(APIView):
    permission_classes = [AllowAllPermission]

    def get(self, request, matiere_id):
        thematiques = Thematique.objects.filter(id_matiere__id=matiere_id)
        serializer = ThematiqueSerializer(thematiques, many=True)
        return Response(serializer.data)


class CompetencesByThematiqueView(APIView):
    permission_classes = [AllowAllPermission]

    def get(self, request, thematique_id):
        competences = Competence.objects.filter(id_thematique__id=thematique_id)
        serializer = CompetenceSerializer(competences, many=True)
        return Response(serializer.data)


class SousCompetencesByCompetenceView(APIView):
    permission_classes = [AllowAllPermission]

    def get(self, request, competence_id):
        sous_competences = SousCompetence.objects.filter(id_competence__id=competence_id)
        serializer = SousCompetenceSerializer(sous_competences, many=True)
        return Response(serializer.data)


class ReponsesByQuestionView(APIView):
    permission_classes = [AllowAllPermission]

    def get(self, request, question_id):
        reponses = Reponse.objects.filter(id_question__id=question_id)
        serializer = ReponseSerializer(reponses, many=True)
        return Response(serializer.data)


class GenerateQuestionView(APIView):
    permission_classes = [AllowAllPermission]

    def post(self, request):
        from .services.llm_client import generate_with_model

        niveau_id = request.data.get('niveau_id')
        thematique_id = request.data.get('thematique_id')
        competence_id = request.data.get('competence_id')
        sous_competence_id = request.data.get('sous_competence_id')
        format_ = request.data.get('format')  # 'quiz' | 'true-false' | 'question'
        difficulte = request.data.get('difficulte')  # 'easy' | 'medium' | 'hard'

        if not all([niveau_id, thematique_id, competence_id, format_, difficulte]):
            return Response({'error': 'Champs requis manquants.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            niveau = Niveau.objects.get(id=niveau_id)
            thematique = Thematique.objects.get(id=thematique_id)
            competence = Competence.objects.get(id=competence_id)
            sous_competence = None
            if sous_competence_id:
                sous_competence = SousCompetence.objects.get(id=sous_competence_id)
        except Exception:
            return Response({'error': "Identifiants invalides fournis."}, status=status.HTTP_400_BAD_REQUEST)

        task_description = competence.description
        topic_text = f"Niveau: {niveau.nom} | Thématique: {thematique.nom} | Compétence: {task_description}"
        if sous_competence:
            topic_text += f" | Sous-compétence: {sous_competence.description}"

        # Ask the model to return strict JSON that we can parse
        prompt = (
            "Tu es un expert en pédagogie. Génère une question et des réponses au format JSON strict.\n"
            f"Contexte: {topic_text}.\n"
            f"Format de question: {format_}. Difficulté: {difficulte}.\n"
            "Contraintes:\n"
            "- Réponds UNIQUEMENT avec du JSON valide, sans texte additionnel.\n"
            "- Schéma attendu: {\n"
            "  \"question\": \"texte de la question\",\n"
            "  \"answers\": [ { \"text\": \"réponse\", \"is_correct\": true|false }, ... ]\n"
            "}.\n"
            "- Pour 'quiz': 1 bonne réponse et 3 distracteurs.\n"
            "- Pour 'true-false': donne 2 entrées (Vrai et Faux) avec la bonne marquée is_correct=true.\n"
            "- Pour 'question' (ouverte): fournis 1 \"réponse modèle\" (is_correct=true) et 2 pistes incorrectes.\n"
        )

        try:
            raw = generate_with_model(prompt, model_name='ollama:mistral')
            # Extract JSON portion if model added explanations
            json_str = raw.strip()
            first_brace = json_str.find('{')
            last_brace = json_str.rfind('}')
            if first_brace != -1 and last_brace != -1:
                json_str = json_str[first_brace:last_brace+1]
            data = json.loads(json_str)
        except Exception as exc:
            return Response({'error': f"Échec génération/parsing: {exc}"}, status=status.HTTP_502_BAD_GATEWAY)

        question_text = str(data.get('question', '')).strip()
        answers = data.get('answers') or []
        if not question_text or not isinstance(answers, list) or len(answers) == 0:
            return Response({'error': 'Sortie du modèle invalide.'}, status=status.HTTP_502_BAD_GATEWAY)

        question = Question.objects.create(description=question_text, type=format_)
        created_answers = []
        for ans in answers:
            try:
                ans_text = str(ans.get('text', '')).strip()
                is_correct = bool(ans.get('is_correct', False))
            except Exception:
                continue
            if not ans_text:
                continue
            created = Reponse.objects.create(
                description=ans_text,
                valide=is_correct,
                id_question=question,
            )
            created_answers.append(created)

        serializer = QuestionSerializer(question)
        answers_serializer = ReponseSerializer(created_answers, many=True)
        return Response({
            'question': serializer.data,
            'reponses': answers_serializer.data,
            'meta': {
                'niveau': niveau.nom,
                'thematique': thematique.nom,
                'competence': task_description,
                'sous_competence': sous_competence.description if sous_competence else '',
                'difficulte': difficulte,
            }
        }, status=status.HTTP_201_CREATED)


class LocalLLMGenerateView(APIView):
    permission_classes = [AllowAllPermission]

    def post(self, request):
        """
        Génère une question pédagogique via un modèle local GGUF (ctransformers).
        Deux modes d'entrée sont supportés:
        1) Mode prompt direct:
           { "prompt": str, "max_new_tokens"?: int, "temperature"?: float, "top_p"?: float }
        2) Mode structuré (recommandé):
           {
             "niveau": str,
             "thematique": str,
             "competence": str,
             "sous_competence"?: str,
             "max_new_tokens"?: int,
             "temperature"?: float,
             "top_p"?: float
           }
        Réponse: { "text": str }
        """
        user_prompt = request.data.get('prompt')
        max_new_tokens = request.data.get('max_new_tokens') or 300
        temperature = request.data.get('temperature')
        top_p = request.data.get('top_p')

        # Fields for structured mode
        niveau = str(request.data.get('niveau', '') or '').strip()
        thematique = str(request.data.get('thematique', '') or '').strip()
        competence = str(request.data.get('competence', '') or '').strip()
        sous_competence = str(request.data.get('sous_competence', '') or '').strip()

        # Build prompt: prefer user prompt if provided, else compose from structured fields
        if isinstance(user_prompt, str) and user_prompt.strip():
            prompt = user_prompt.strip()
        else:
            if not (niveau and thematique and competence):
                return Response({
                    'error': "Les champs 'niveau', 'thematique' et 'competence' sont obligatoires (ou fournissez 'prompt')."
                }, status=status.HTTP_400_BAD_REQUEST)

            prompt_parts = [
                "You are a question generator for pedagogy.",
                "Your task is to produce EXACTLY ONE clear, well‑formed question in ENGLISH.",
                "Write in simple English suitable for the specified level so a student can self‑assess.",
                "",
                "Strict rules:",
                "- Produce a DIRECT academic content question about the topic that assesses the competence.",
                "- Use concrete values/examples where natural; for math, include numbers.",
                "- Do NOT use meta language (no 'Can you', 'Could you', 'Please', 'Write', 'Create', 'Give me', 'Make', 'Formulate', 'Answer', 'about', 'regarding').",
                "- Do NOT start with phrases like 'Here is', 'Thanks', 'Thank you', 'Sure', etc.",
                "- Do NOT provide explanations, introductions, or justifications.",
                "- Do NOT provide any answers, only the question.",
                "- Output must be ONE interrogative sentence ending with a question mark '?'.",
                f"- The question must be appropriate for the level: {niveau}.",
                f"- The topic is: {thematique}.",
                f"- The targeted competence is: {competence}.",
                "",
                "Bad examples (do NOT write like this):",
                "- Can you answer a simple question about numbers?",
                "- Please create a question about place value.",
                "",
                "Good examples (structure to imitate):",
                "- What is 37 + 25?",
                "- Which digit shows the tens place in 84?",
            ]
            if sous_competence:
                prompt_parts.append(f"- The sub‑competence to respect is: {sous_competence}.")
            prompt_parts.extend([
                "",
                "Expected example:",
                "Which number is greater: 243 or 578?",
                "",
                "Now generate exactly one suitable question:",
            ])
            prompt = "\n".join(prompt_parts)

        try:
            from .services.ctransformers_client import generate_locally
            # Utilise le même chemin que dans le notebook
            model_path = "./models/llama-2-7b-chat.Q4_K_M.gguf"
            gen_kwargs = {
                'max_new_tokens': int(max_new_tokens),
            }
            if temperature is not None:
                gen_kwargs['temperature'] = float(temperature)
            if top_p is not None:
                gen_kwargs['top_p'] = float(top_p)
            raw_text = generate_locally(prompt.strip(), model_path=model_path, **gen_kwargs)
            # --- Sanitize: keep only a single clean question sentence ---
            import re
            text = (raw_text or "").strip()
            # Drop common polite fillers or prefaces on their own line (tolerant to spaces/punct.)
            filler_line_re = r"^(?:merci|thanks|ok|bien\s*s[uû]r)\s*[!\.?]*$"
            lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
            lines = [ln for ln in lines if not re.match(filler_line_re, ln, flags=re.IGNORECASE)]
            text = " \n".join(lines) if lines else ""
            # Remove prefaces like "Pas de problème,", "Voici", etc. at start
            text = re.sub(r"^(?:[\"'“”‘’\s]*(?:pas de problème|voici|here is|ok[:,]?|bien sûr[:,]?)[^\n]*?[:\-]\s*)",
                          "", text, flags=re.IGNORECASE)
            # Prefer a quoted question like "... ?" or “ … ? ” if present
            quoted = re.search(r"[\"“]([^\"”\n]{3,}?\?)[\"”]", text)
            if quoted:
                candidate = quoted.group(1).strip()
            else:
                # Find first sentence that ends with a question mark across the whole text
                qmatch = re.search(r"([A-ZÀ-ÖØ-Þ\"“‘'\(][^?]{3,}?\?)", text)
                candidate = qmatch.group(1).strip() if qmatch else (lines[0] if lines else "")
            # Strip numbering/bullets and leading labels
            candidate = re.sub(r"^\s*(?:\d+[\).:]\s*|[-*]\s*|Q\s*[:\-]\s*|Question\s*[:\-]\s*)", "", candidate)
            # Trim surrounding quotes
            candidate = candidate.strip().strip('\"\'“”‘’').strip()
            # If the candidate contains 'exemple' or similar prefix, remove it
            candidate = re.sub(r"^(exemple\s*[:\-]\s*)", "", candidate, flags=re.IGNORECASE)
            # Hard cut: everything after the first '?' must be dropped
            if '?' in candidate:
                candidate = candidate.split('?', 1)[0].strip() + '?'
            # Ensure it ends with '?', with robust fallback if detection failed
            # If the candidate is still a filler or too short, search again or synthesize
            def looks_like_filler(s: str) -> bool:
                return bool(re.match(filler_line_re, s or "", flags=re.IGNORECASE))

            if candidate and not looks_like_filler(candidate) and len(candidate.split()) >= 3:
                question = candidate if candidate.endswith('?') else (candidate + '?')
            else:
                # Try to find any question sentence in the whole text
                all_qs = re.findall(r"([^?]{3,}?\?)", text)
                chosen = next((q.strip() for q in all_qs if not looks_like_filler(q)), "")
                fallback = chosen or (lines[0] if lines else text).strip()
                fallback = re.sub(r"^\s*(?:\d+[\).:]\s*|[-*]\s*|Q\s*[:\-]\s*|Question\s*[:\-]\s*)", "", fallback)
                fallback = fallback.strip().strip('\"\'“”‘’').strip()
                if looks_like_filler(fallback) or len(fallback.split()) < 3 or re.match(r"^(can|could|please|write|create|give|make|formulate|answer|about|regarding)\b", fallback, flags=re.IGNORECASE):
                    # Synthesize a minimal safe academic question from context
                    ctx_niv = niveau or "this level"
                    ctx_theme = thematique or "this topic"
                    # Prefer a concrete arithmetic pattern when relevant
                    if re.search(r"(number|digit|add|plus|sum|place\s*value|tens|ones|arithmetic|count)", f"{ctx_theme} {competence}", flags=re.IGNORECASE):
                        fallback = "What is 7 + 8?"
                    else:
                        fallback = f"Which statement is true about {ctx_theme}?"
                elif fallback and not fallback.endswith('?'):
                    fallback = fallback.rstrip('.!;:') + '?'
                # Remove any trailing filler like 'merci'
                question = re.sub(filler_line_re, '', fallback, flags=re.IGNORECASE).strip()
                if '?' in question:
                    question = question.split('?', 1)[0].strip() + '?'
        except FileNotFoundError as fnf:
            return Response({'error': str(fnf)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except RuntimeError as dep:
            return Response({'error': str(dep)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as exc:
            return Response({'error': f"Échec génération locale: {exc}"}, status=status.HTTP_502_BAD_GATEWAY)

        return Response({'text': question})