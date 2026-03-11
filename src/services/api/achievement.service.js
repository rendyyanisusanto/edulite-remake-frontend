import api from '../api';

export const achievementService = {
    // Achievements
    getAll(params) {
        return api.get('/achievements', { params });
    },
    getById(id) {
        return api.get(`/achievements/${id}`);
    },
    create(data) {
        return api.post('/achievements', data);
    },
    update(id, data) {
        return api.put(`/achievements/${id}`, data);
    },
    delete(id) {
        return api.delete(`/achievements/${id}`);
    },

    // Participants
    getParticipants(params) {
        return api.get('/achievements/participants', { params });
    },
    createParticipant(data) {
        return api.post('/achievements/participants', data);
    },
    updateParticipant(id, data) {
        return api.put(`/achievements/participants/${id}`, data);
    },
    deleteParticipant(id) {
        return api.delete(`/achievements/participants/${id}`);
    },

    // Results
    getResults(params) {
        return api.get('/achievements/results', { params });
    },
    createResult(data) {
        return api.post('/achievements/results', data);
    },
    updateResult(id, data) {
        return api.put(`/achievements/results/${id}`, data);
    },
    deleteResult(id) {
        return api.delete(`/achievements/results/${id}`);
    },

    // Point Rules
    getPointRules(params) {
        return api.get('/achievements/point-rules', { params });
    },
    createPointRule(data) {
        return api.post('/achievements/point-rules', data);
    },
    updatePointRule(id, data) {
        return api.put(`/achievements/point-rules/${id}`, data);
    },
    deletePointRule(id) {
        return api.delete(`/achievements/point-rules/${id}`);
    }
};
