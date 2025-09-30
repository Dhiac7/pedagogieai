# Générateur Pédagogique IA

Application complète pour gérer des compétences pédagogiques, créer des questions et générer du contenu éducatif avec l'intelligence artificielle. Le système utilise des modèles de langage locaux pour générer des questions personnalisées selon les niveaux scolaires, matières et compétences spécifiques.

### 🚀 Fonctionnalités

- **Gestion Pédagogique**: niveaux scolaires, matières, thématiques, compétences et sous-compétences
- **Questions**: création, filtrage, statuts (brouillon, générée, validée, archivée)
- **Génération IA Locale**: utilisation de modèles GGUF (Llama 2) via ctransformers
- **Quiz**: création de quiz, association questions, tentatives et réponses
- **Interface Moderne**: Next.js 15 + React 19 + Tailwind CSS v4 + Radix UI
- **API REST**: Django REST Framework avec endpoints complets

### 🏗️ Architecture

- **Backend Principal**: Django 5 + Django REST Framework (port 8000)
- **Service IA**: FastAPI + LangChain (port 8001)
- **Tâches**: Celery (exécution synchrone en dev, pas de broker requis)
- **Base de données**: PostgreSQL (config par défaut dans `myproject/settings.py`)
- **Frontend**: Next.js 15 (TypeScript), UI Radix + Tailwind CSS v4
- **IA Locale**: Modèles GGUF via ctransformers (Llama 2 7B Chat)
- **LangChain**: Intégration pour la gestion des prompts et modèles

### ✅ Prérequis

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Modèle GGUF Llama 2 (inclus: `llama-2-7b-chat.Q4_K_M.gguf`)
- 8GB+ RAM recommandé pour le modèle local

### ⚙️ Configuration et installation

#### 1) Backend (Django)

```powershell
# Depuis la racine du projet
pip install -r requirements.txt

# Configurez PostgreSQL selon vos besoins puis migrez
python manage.py migrate

# (Optionnel) données et prompts par défaut
python manage.py load_default_data
python manage.py load_default_prompt

# Lancer l'API Django (port 8000)
python manage.py runserver
```

#### 2) Service IA (FastAPI)

```powershell
# Lancer le service de génération de questions (port 8001)
python questionsGenerator.py
```

**Test du service FastAPI:**
```powershell
# Vérifier que le service fonctionne
python test_fastapi.py
```

Configuration BD par défaut (voir `myproject/settings.py`):

```
ENGINE: django.db.backends.postgresql
NAME:   pedagogieai
USER:   postgres
PASSWORD: ******
HOST:   localhost
PORT:   5432
```

Adaptez ces valeurs directement dans `myproject/settings.py` si nécessaire. Un fichier `db.sqlite3` est présent mais non utilisé par défaut.

Celery est configuré en mode « eager » pour le développement (aucun Redis/Broker requis).

Le modèle GGUF Llama 2 est inclus dans le dossier `models/`. Le système utilise ctransformers pour charger le modèle localement sans serveur externe.

#### 3) Frontend (Next.js)

```powershell
cd frontend
npm install

# URL de l’API (PowerShell)
$env:NEXT_PUBLIC_API_URL = "http://localhost:8000"

npm run dev
```

Le frontend est accessible sur `http://localhost:3000` et appelle l’API Django via `NEXT_PUBLIC_API_URL`.

### 📁 Structure du projet

```
pedagogieai/
├── myapp/                    # App Django (modèles, vues, sérialiseurs, tâches)
│   ├── models.py            # Modèles de données (Matiere, Niveau, Competence, etc.)
│   ├── services/            # Services IA (ctransformers_client.py, llm_client.py)
│   ├── management/commands/ # Commandes Django personnalisées
│   └── ...
├── frontend/                # App Next.js (App Router)
│   ├── app/                 # Pages et layouts Next.js
│   ├── components/          # Composants React réutilisables
│   ├── lib/                 # Utilitaires et API client
│   └── ...
├── models/                  # Modèles GGUF (Llama 2)
│   └── llama-2-7b-chat.Q4_K_M.gguf
├── myproject/               # Configuration Django
├── pedagogieQuestions_logic.py  # Logique de génération de questions
├── questionsGenerator.py    # Générateur de questions avec LangChain
└── requirements.txt         # Dépendances Python
```

### 🔌 APIs disponibles

#### API Django (Port 8000)
Base: `http://localhost:8000/api/`

- `GET niveaux/`
- `GET matieres/`
- `GET thematiques/`
- `GET competences/`
- `GET sous-competences/`
- `GET questions/`
- `GET generations/`
- `GET quiz/`
- `POST generate/`

#### API FastAPI IA (Port 8001)
Base: `http://localhost:8001/`

- `GET /` - Vérification de l'état du service
- `POST /generate-questions` - Génération directe de questions pédagogiques

#### Exemples d'utilisation

**API Django (génération via Celery):**
```bash
curl -X POST http://localhost:8000/api/generate/ \
  -H "Content-Type: application/json" \
  -d '{
    "competence_id": 1,
    "sous_competence_id": 2,
    "prompt": "Génère une question de mathématiques niveau CE2 sur les fractions.",
    "model": "local:llama-2-7b-chat",
    "params": {"temperature": 0.7, "max_new_tokens": 300}
  }'
```

**API FastAPI (génération directe):**
```bash
curl -X POST http://localhost:8001/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "school_level": "Grade 5",
    "module": "Mathematics",
    "thematic": "Fractions",
    "competence": "Problem solving",
    "sous_competence": "Add and subtract fractions",
    "num_questions": 3,
    "question_type": "quiz"
  }'
```

Le traitement Django est asynchrone via Celery (exécuté immédiatement en dev). L'API FastAPI retourne directement les questions générées.

### 🤖 Génération de Questions IA

Le système utilise un modèle Llama 2 7B Chat quantifié (Q4_K_M) pour générer des questions pédagogiques personnalisées. Les prompts sont optimisés pour:

- **Niveaux scolaires**: Adaptation du contenu selon l'âge et le niveau
- **Compétences spécifiques**: Focus sur les sous-compétences à évaluer
- **Types de questions**: Quiz, QCM, questions ouvertes, etc.
- **Contexte pédagogique**: Alignement avec les programmes éducatifs

### 🧪 Données de démo

- `python manage.py load_default_data` crée des niveaux, matières, thématiques, compétences et quelques templates de prompt.
- `python manage.py load_default_prompt` ajoute un template générique `template_par_defaut`.

### 🔐 Sécurité et CORS

- `DEBUG=True` en dev et permissions ouvertes (toutes les routes accessibles). À verrouiller en production.
- CORS autorise `http://localhost:3000` par défaut.

### 🧰 Développement quotidien

- Terminal 1 (API Django): `python manage.py runserver` (port 8000)
- Terminal 2 (Service IA): `python questionsGenerator.py` (port 8001)
- Terminal 3 (Frontend): `cd frontend && npm run dev` (port 3000)
- Le modèle IA se charge automatiquement au premier appel

### ❗Dépannage

- **Connexion PostgreSQL**: vérifiez les identifiants dans `myproject/settings.py` et que le serveur tourne sur le port 5432.
- **CORS**: si vous changez l'URL du frontend, ajoutez-la dans `CORS_ALLOWED_ORIGINS` et `CSRF_TRUSTED_ORIGINS`.
- **Modèle IA**: assurez-vous que le fichier `models/llama-2-7b-chat.Q4_K_M.gguf` est présent et accessible.
- **Mémoire**: le modèle nécessite environ 4-6GB de RAM. Ajustez `CTRANSFORMERS_THREADS` et `CTRANSFORMERS_GPU_LAYERS` si nécessaire.
- **Ports**: Django (8000), FastAPI (8001), Frontend (3000). Adaptez `NEXT_PUBLIC_API_URL` côté frontend si nécessaire.
- **Service FastAPI**: vérifiez que `python questionsGenerator.py` fonctionne et répond sur le port 8001.
- **CORS**: le service FastAPI est configuré pour accepter les requêtes depuis `localhost:3000`.
- **Test**: utilisez `python test_fastapi.py` pour vérifier le bon fonctionnement du service.

### 🆕 Nouvelles Fonctionnalités

- **Modèle IA Local**: Intégration de Llama 2 7B Chat via ctransformers
- **Interface Moderne**: Dashboard avec Next.js 15 et Tailwind CSS v4
- **Génération Contextuelle**: Questions adaptées aux compétences et niveaux spécifiques
- **API REST Complète**: Endpoints pour toutes les entités pédagogiques
- **Gestion des États**: Système de statuts pour les questions et générations

### 🛠️ Technologies Utilisées

**Backend:**
- Django 5.0 + Django REST Framework (port 8000)
- FastAPI + LangChain (port 8001)
- PostgreSQL + psycopg2
- Celery (mode eager pour le développement)
- ctransformers (modèles GGUF)
- uvicorn (serveur FastAPI)

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Radix UI (composants)
- Lucide React (icônes)

**IA/ML:**
- Llama 2 7B Chat (Q4_K_M quantifié)
- ctransformers (inference locale)
- LangChain (orchestration)

### 📄 Licence

Projet privé/interne (ajustez selon vos besoins).