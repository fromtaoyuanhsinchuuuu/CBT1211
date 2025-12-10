const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export type HomeworkSubmission = {
  patientId: number | string;
  sessionId?: number | string;
  title: string;
  description?: string;
  content: string;
};

export async function submitHomework(payload: HomeworkSubmission) {
  const body = {
    patientId: payload.patientId,
    sessionId: payload.sessionId ?? null,
    title: payload.title,
    status: 'submitted',
    dueDate: new Date().toISOString().slice(0, 10),
    description: payload.description || '',
    submission: {
      content: payload.content,
      submittedAt: new Date().toISOString(),
    },
    feedback: null,
  };

  const res = await fetch(`${API_BASE}/api/homeworks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || '提交失敗，請稍後再試');
  }

  return res.json();
}

export async function fetchHomeworks(patientId?: number | string) {
  const res = await fetch(`${API_BASE}/api/homeworks`);
  if (!res.ok) throw new Error('無法取得作業資料');
  const data = await res.json();
  if (!patientId) return data;
  return data.filter((hw: any) => `${hw.patientId}` === `${patientId}`);
}
