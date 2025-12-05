const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:400/api";

export async function createQueue(name: string) {
    const res = await fetch(`${API_BASE}/queue`, { method: "POST", headers: { "Content-Type": "application/json"}, body: JSON.stringify({ name }) });
    return res.json();
}

export async function joinQueue(queueId: number, userName: string){
    const res = await fetch(`${API_BASE}/queues/${queueId}/join`, { method: "POST", headers: { "Content-Type" : "application/json" }, body : JSON.stringify({ userName }) });
    return res.json();
}

export async function listItems(queueId: number){
    const res = await fetch(`${API_BASE}/queue/${queueId}/items`);
    return res.json();
}