import { useState, useEffect } from 'react';
import { api, ApiResponse } from './api';

export function useApiData<T>(
  apiCall: () => Promise<ApiResponse<T[]>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setData(result.data);
      }
      
      setLoading(false);
    };

    fetchData();
  }, dependencies);

  const refetch = () => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setData(result.data);
      }
      
      setLoading(false);
    };

    fetchData();
  };

  return { data, loading, error, refetch };
}

export function useApiDataById<T>(
  apiCall: (id: number) => Promise<ApiResponse<T>>,
  id: number | null
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      const result = await apiCall(id);
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setData(result.data);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [id, apiCall]);

  return { data, loading, error };
}

// Specific hooks for common data
export const useNiveaux = () => useApiData(api.getNiveaux);
export const useMatieres = () => useApiData(api.getMatieres);
export const useThematiques = () => useApiData(api.getThematiques);
export const useCompetences = () => useApiData(api.getCompetences);
export const useSousCompetences = () => useApiData(api.getSousCompetences);
export const useQuestions = () => useApiData(api.getQuestions);
export const useGenerations = () => useApiData(api.getGenerations);
export const useQuiz = () => useApiData(api.getQuiz);
export const usePromptTemplates = () => useApiData(api.getPromptTemplates);

// Hook for filtered data
export const useCompetencesByThematique = (thematiqueId: number | null) => 
  useApiData(
    () => thematiqueId ? api.getCompetencesByThematique(thematiqueId) : api.getCompetences(),
    [thematiqueId]
  );

export const useQuestionsByCompetence = (competenceId: number | null) => 
  useApiData(
    () => competenceId ? api.getQuestionsByCompetence(competenceId) : api.getQuestions(),
    [competenceId]
  );
