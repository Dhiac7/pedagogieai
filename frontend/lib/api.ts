const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let details = ''
      try {
        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const json = await response.json()
          details = (json && (json.detail || json.error || JSON.stringify(json))) || ''
        } else {
          details = await response.text()
        }
      } catch {}

      const baseMsg = `Erreur HTTP ${response.status}: ${response.statusText}`
      const message = details ? `${baseMsg} - ${details}` : baseMsg
      throw new Error(message)
    }

    // For DELETE requests, the response might be empty (204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return { data: undefined as T };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API call failed:', error);
    return { error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

// API functions for different models
export const api = {
  // Niveaux
  getNiveaux: () => apiCall<Niveau[]>('niveaux/'),
  createNiveau: (data: Partial<Niveau>) => 
    apiCall<Niveau>('niveaux/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateNiveau: (id: number, data: Partial<Niveau>) => 
    apiCall<Niveau>(`niveaux/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteNiveau: (id: number) => 
    apiCall<void>(`niveaux/${id}/`, {
      method: 'DELETE',
    }),
  
  // Matieres
  getMatieres: () => apiCall<Matiere[]>('matieres/'),
  createMatiere: (data: Partial<Matiere>) => 
    apiCall<Matiere>('matieres/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMatiere: (id: number, data: Partial<Matiere>) => 
    apiCall<Matiere>(`matieres/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMatiere: (id: number) => 
    apiCall<void>(`matieres/${id}/`, {
      method: 'DELETE',
    }),
  
  // Thematiques
  getThematiques: () => apiCall<Thematique[]>('thematiques/'),
  getThematiquesByMatiere: (matiereId: number) => 
    apiCall<Thematique[]>(`thematiques/?id_matiere=${matiereId}`),
  createThematique: (data: Partial<Thematique>) => 
    apiCall<Thematique>('thematiques/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateThematique: (id: number, data: Partial<Thematique>) => 
    apiCall<Thematique>(`thematiques/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteThematique: (id: number) => 
    apiCall<void>(`thematiques/${id}/`, {
      method: 'DELETE',
    }),
  
  // Competences
  getCompetences: () => apiCall<Competence[]>('competences/'),
  getCompetencesByThematique: (thematiqueId: number) => 
    apiCall<Competence[]>(`competences/?id_thematique=${thematiqueId}`),
  createCompetence: (data: Partial<Competence>) => 
    apiCall<Competence>('competences/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCompetence: (id: number, data: Partial<Competence>) => 
    apiCall<Competence>(`competences/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCompetence: (id: number) => 
    apiCall<void>(`competences/${id}/`, {
      method: 'DELETE',
    }),
  
  // Sous-competences
  getSousCompetences: () => apiCall<SousCompetence[]>('sous-competences/'),
  getSousCompetencesByCompetence: (competenceId: number) => 
    apiCall<SousCompetence[]>(`sous-competences/?id_competence=${competenceId}`),
  createSousCompetence: (data: Partial<SousCompetence>) => 
    apiCall<SousCompetence>('sous-competences/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSousCompetence: (id: number, data: Partial<SousCompetence>) => 
    apiCall<SousCompetence>(`sous-competences/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSousCompetence: (id: number) => 
    apiCall<void>(`sous-competences/${id}/`, {
      method: 'DELETE',
    }),
  
  // Questions
  getQuestions: () => apiCall<Question[]>('questions/'),
  getQuestionsByCompetence: (competenceId: number) => 
    apiCall<Question[]>(`questions/competence/${competenceId}/`),
  getQuestionsByThematique: (thematiqueId: number) => 
    apiCall<Question[]>(`questions/thematique/${thematiqueId}/`),
  createQuestion: (data: Partial<Question>) => 
    apiCall<Question>('questions/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  generateQuestion: (payload: GeneratePayload) =>
    apiCall<GeneratedResult>('generate/question/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Local LLM (ctransformers)
  generateLocal: (payload: { prompt: string; max_new_tokens?: number; temperature?: number; top_p?: number }) =>
    apiCall<{ text: string }>('generate/local/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  
  // Reponses
  getReponses: () => apiCall<Reponse[]>('reponses/'),
  getReponsesByQuestion: (questionId: number) => 
    apiCall<Reponse[]>(`reponses/?id_question=${questionId}`),
  createReponse: (data: Partial<Reponse>) => 
    apiCall<Reponse>('reponses/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Types for the data models
export interface Niveau {
  id: number;
  nom: string;
}

export interface Matiere {
  id: number;
  nom: string;
}

export interface Thematique {
  id: number;
  nom: string;
  id_matiere: number;
}

export interface Competence {
  id: number;
  description: string;
  id_thematique: number;
}

export interface SousCompetence {
  id: number;
  description: string;
  id_competence: number;
}

export interface Question {
  id: number;
  description: string;
  type: string;
  reponses?: Reponse[];
}

export interface Reponse {
  id: number;
  valide: boolean;
  description: string;
  id_question: number;
}

export interface GeneratePayload {
  niveau_id: number;
  thematique_id: number;
  competence_id: number;
  sous_competence_id?: number;
  format: 'quiz' | 'true-false' | 'question';
  difficulte: 'easy' | 'medium' | 'hard';
}

export interface GeneratedResult {
  question: Question;
  reponses: Reponse[];
  meta: {
    niveau: string;
    thematique: string;
    competence: string;
    sous_competence?: string;
    difficulte: string;
  };
}