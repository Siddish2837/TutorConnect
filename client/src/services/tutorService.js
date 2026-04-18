import api from './api';

export const getTutors = (params) => api.get('/tutors', { params });
export const getTutorById = (id) => api.get(`/tutors/${id}`);
export const updateTutorProfile = (data) => api.put('/tutors/profile', data);
export const getSubjects = () => api.get('/tutors/subjects');
