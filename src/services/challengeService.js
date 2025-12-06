import axios from "axios";

const API_BASE = "http://localhost:8000/api";

export function getMyQuizzes(uid) {
  return axios.get(`${API_BASE}/challenges/?created_by=${uid}`);
}

export function getChallenge(id, uid) {
  const qs = uid ? `?created_by=${uid}` : "";
  return axios.get(`${API_BASE}/challenges/${id}${qs}`);
}

export async function deleteQuiz(id, uid) {
  return axios.delete(`${API_BASE}/challenges/${id}/`, {
    headers: { "X-User-UID": uid }
  });
}


export function updateQuiz(id, data, uid) {
  const headers = uid ? { "X-User-UID": uid } : undefined;
  return axios.put(`${API_BASE}/challenges/${id}/`, data, { headers });
}


export function createQuiz(data, uid) {
  const headers = uid ? { "X-User-UID": uid } : undefined;
  return axios.post(`${API_BASE}/challenges/`, data, { headers });
}