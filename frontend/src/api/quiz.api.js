import apiClient from './client';

/** Public: all quiz rows with populated `animal` (Education hub). */
export const getAllQuizzes = () => apiClient.get('/quiz').then((r) => r.data);

export const getQuizzesByAnimal = (animalId) => apiClient.get(`/quiz/animal/${animalId}`).then(r => r.data);
export const createQuiz = (data) => apiClient.post('/quiz', data).then(r => r.data);
export const updateQuiz = (id, data) => apiClient.put(`/quiz/${id}`, data).then(r => r.data);
export const deleteQuiz = (id) => apiClient.delete(`/quiz/${id}`).then(r => r.data);
