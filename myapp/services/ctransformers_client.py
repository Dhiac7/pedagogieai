from __future__ import annotations

import os
import threading
from pathlib import Path
from typing import Optional

try:
    # Lazy optional import; validated at first use
    from ctransformers import AutoModelForCausalLM  # type: ignore
except Exception:  # pragma: no cover - dependency may not be installed yet
    AutoModelForCausalLM = None  # type: ignore


_MODEL_SINGLETON_LOCK = threading.Lock()
_MODEL_SINGLETON: Optional["AutoModelForCausalLM"] = None


def _load_model(model_path: str | Path) -> "AutoModelForCausalLM":
    global _MODEL_SINGLETON
    if AutoModelForCausalLM is None:
        raise RuntimeError("Le paquet 'ctransformers' n'est pas installé.")

    with _MODEL_SINGLETON_LOCK:
        if _MODEL_SINGLETON is None:
            resolved = Path(model_path).expanduser().resolve()
            if not resolved.exists():
                raise FileNotFoundError(f"Fichier modèle introuvable: {resolved}")
            # Optional performance knobs via env
            # CTRANSFORMERS_THREADS: int, CTRANSFORMERS_GPU_LAYERS: int
            threads = int(os.getenv("CTRANSFORMERS_THREADS", "0")) or None
            gpu_layers = int(os.getenv("CTRANSFORMERS_GPU_LAYERS", "0")) or None

            model_kwargs = {}
            if threads is not None:
                model_kwargs["threads"] = threads
            if gpu_layers is not None and gpu_layers > 0:
                model_kwargs["gpu_layers"] = gpu_layers

            _MODEL_SINGLETON = AutoModelForCausalLM.from_pretrained(str(resolved), **model_kwargs)
        return _MODEL_SINGLETON


def generate_locally(
    prompt: str,
    model_path: str | Path,
    max_new_tokens: int = 300,
    temperature: float = 0.7,
    top_p: float = 0.9,
) -> str:
    """
    Génère un texte en local via ctransformers, en réutilisant un singleton du modèle.
    """
    model = _load_model(model_path)
    output = model(
        prompt,
        max_new_tokens=max_new_tokens,
        temperature=temperature,
        top_p=top_p,
    )
    return (output or "").strip()


