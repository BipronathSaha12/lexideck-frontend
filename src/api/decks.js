import client from "./client";

export const listDecks = (params) => client.get("/decks/", { params }).then((r) => r.data);
export const getDeck = (id) => client.get(`/decks/${id}/`).then((r) => r.data);
export const createDeck = (payload) => client.post("/decks/", payload).then((r) => r.data);
export const updateDeck = (id, payload) => client.patch(`/decks/${id}/`, payload).then((r) => r.data);
export const deleteDeck = (id) => client.delete(`/decks/${id}/`);
export const getStudySession = (id) => client.get(`/decks/${id}/study/`).then((r) => r.data);
export const importCsv = (id, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return client.post(`/decks/${id}/import_csv/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};
