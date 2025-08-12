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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API call failed:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// API functions for different models
export const api = {
  // Niveaux
  getNiveaux: () => apiCall<any[]>('niveaux/'),
  
  // Matieres
  getMatieres: () => apiCall<any[]>('matieres/'),
  
  // Thematiques
  getThematiques: () => apiCall<any[]>('thematiques/'),
  getThematiquesByMatiere: (matiereId: number) => 
    apiCall<any[]>(`thematiques/?matiere=${matiereId}`),
  
  // Competences
  getCompetences: () => apiCall<any[]>('competences/'),
  getCompetencesByThematique: (thematiqueId: number) => 
    apiCall<any[]>(`competences/?thematique=${thematiqueId}`),
  getCompetencesByNiveau: (niveauId: number) => 
    apiCall<any[]>(`competences/?niveau=${niveauId}`),
  
  // Sous-competences
  getSousCompetences: () => apiCall<any[]>('sous-competences/'),
  getSousCompetencesByCompetence: (competenceId: number) => 
    apiCall<any[]>(`sous-competences/?competence=${competenceId}`),
  
  // Questions
  getQuestions: () => apiCall<any[]>('questions/'),
  getQuestionsByCompetence: (competenceId: number) => 
    apiCall<any[]>(`questions/?competence=${competenceId}`),
  getQuestionsByStatut: (statut: string) => 
    apiCall<any[]>(`questions/?statut=${statut}`),
  createQuestion: (data: any) => 
    apiCall<any>('questions/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Generations
  getGenerations: () => apiCall<any[]>('generations/'),
  getGeneration: (id: number) => apiCall<any>(`generations/${id}/`),
  createGeneration: (data: any) => 
    apiCall<any>('generate/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Quiz
  getQuiz: () => apiCall<any[]>('quiz/'),
  getQuizById: (id: number) => apiCall<any>(`quiz/${id}/`),
  
  // Prompt Templates
  getPromptTemplates: () => apiCall<any[]>('prompt-templates/'),
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
  matiere: number;
}

export interface Competence {
  id: number;
  titre: string;
  description: string;
  thematique: number;
  niveau: number;
}

export interface SousCompetence {
  id: number;
  titre: string;
  description: string;
  competence: number;
}

export interface Question {
  id: number;
  texte: string;
  format: string;
  difficulte: string;
  source: string;
  competence: number | null;
  sous_competence: number | null;
  statut: 'draft' | 'generated' | 'validated' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: number;
  competence: number | null;
  sous_competence: number | null;
  prompt: string;
  model: string;
  params: any;
  output_text: string;
  score_quality: number | null;
  statut: 'pending' | 'running' | 'done' | 'error';
  created_at: string;
  finished_at: string | null;
}

export interface Quiz {
  id: number;
  titre: string;
  description: string;
  created_at: string;
}

export interface PromptTemplate {
  id: number;
  nom: string;
  contenu: string;
  created_at: string;
}
