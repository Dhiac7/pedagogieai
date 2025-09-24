import os
import requests
from typing import Dict, Any

# Allow overriding the Ollama endpoint via environment variable
# Example: OLLAMA_URL=http://remote-host:11434/api/generate
DEFAULT_OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434/api/generate')


def generate_with_model(prompt: str, model_name: str = 'mistral', params: Dict[str, Any] | None = None) -> str:
    params = params or {}
    if model_name.startswith('ollama:'):
        model = model_name.split(':', 1)[1]
    else:
        model = model_name

    payload = {
        'model': model,
        'prompt': prompt,
        'stream': False,
    }
    payload.update(params)

    try:
        resp = requests.post(DEFAULT_OLLAMA_URL, json=payload, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        # Ollama returns {"response": "..."}
        return data.get('response', '')
    except Exception as exc:
        raise RuntimeError(f"Appel au modèle échoué: {exc}") 