### Générateur Pédagogique

Application complète pour gérer des compétences, questions et quiz, et générer des questions avec un modèle IA (Ollama).

### 🚀 Fonctionnalités

- **Gestion des compétences**: niveaux, matières, thématiques, compétences, sous-compétences
- **Questions**: création, filtrage, statuts (brouillon, générée, validée, archivée)
- **Génération IA**: endpoint d’orchestration avec Celery (mode eager) + Ollama (ex. modèle `mistral`)
- **Quiz**: création de quiz, association questions, tentatives et réponses
- **Frontend moderne**: Next.js 15 + React 19 + Tailwind v4

### 🏗️ Architecture

- **Backend**: Django 5 + Django REST Framework
- **Tâches**: Celery (exécution synchrone en dev, pas de broker requis)
- **Base de données**: PostgreSQL (config par défaut dans `myproject/settings.py`)
- **Frontend**: Next.js (TypeScript), UI Radix + Tailwind
- **IA**: Ollama local sur `http://localhost:11434`

### ✅ Prérequis

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Ollama installé et un modèle présent localement (ex.: `mistral`)

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

# Lancer l’API
python manage.py runserver
```

Configuration BD par défaut (voir `myproject/settings.py`):

```
ENGINE: django.db.backends.postgresql
NAME:   pedagogieai
USER:   postgres
PASSWORD: dhia
HOST:   localhost
PORT:   5432
```

Adaptez ces valeurs directement dans `myproject/settings.py` si nécessaire. Un fichier `db.sqlite3` est présent mais non utilisé par défaut.

Celery est configuré en mode « eager » pour le développement (aucun Redis/Broker requis).

Ollama attendu sur `http://localhost:11434`. Assurez-vous d’avoir lancé le service et téléchargé un modèle: `ollama run mistral`.

#### 2) Frontend (Next.js)

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
myapp/                 # App Django (modèles, vues, sérialiseurs, tâches)
frontend/              # App Next.js (App Router)
myproject/             # Config Django (settings, urls, celery)
```

### 🔌 API principale

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

Exemple de génération IA:

```bash
curl -X POST http://localhost:8000/api/generate/ \
  -H "Content-Type: application/json" \
  -d '{
    "competence_id": 1,
    "sous_competence_id": 2,
    "prompt": "Génère une question de mathématiques niveau CE2 sur les fractions.",
    "model": "ollama:mistral",
    "params": {"temperature": 0.7}
  }'
```

Le traitement est asynchrone côté API mais exécuté immédiatement en dev (Celery eager). Consultez `GET /api/generations/` pour suivre le statut et récupérer `output_text`.

### 🧪 Données de démo

- `python manage.py load_default_data` crée des niveaux, matières, thématiques, compétences et quelques templates de prompt.
- `python manage.py load_default_prompt` ajoute un template générique `template_par_defaut`.

### 🔐 Sécurité et CORS

- `DEBUG=True` en dev et permissions ouvertes (toutes les routes accessibles). À verrouiller en production.
- CORS autorise `http://localhost:3000` par défaut.

### 🧰 Développement quotidien

- Terminal 1 (API): `python manage.py runserver`
- Terminal 2 (Frontend): `cd frontend && npm run dev`
- Ollama: service en tâche de fond (modèle `mistral` téléchargé)

### ❗Dépannage

- **Connexion PostgreSQL**: vérifiez les identifiants dans `myproject/settings.py` et que le serveur tourne sur le port 5432.
- **CORS**: si vous changez l’URL du frontend, ajoutez-la dans `CORS_ALLOWED_ORIGINS` et `CSRF_TRUSTED_ORIGINS`.
- **Ollama**: assurez-vous que `http://localhost:11434` répond et que le modèle défini (ex. `mistral`) est disponible.
- **Port API**: par défaut `8000`. Adaptez `NEXT_PUBLIC_API_URL` côté frontend si vous le modifiez.

### 📄 Licence

Projet privé/interne (ajustez selon vos besoins).