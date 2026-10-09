import client from "./client";

export const login = (credentials) => client.post("/login/", credentials).then((r) => r.data);
export const register = (payload) => client.post("/register/", payload).then((r) => r.data);
export const getStats = () => client.get("/stats/").then((r) => r.data);
