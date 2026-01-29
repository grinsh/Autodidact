let accessToken = null;
let updateTokenInApp = null;

/* ======================
   Token helpers
====================== */

export const setToken = (token) => {
  accessToken = token;
  if (updateTokenInApp) updateTokenInApp(token);
};

export const setTokenAdapter = (fn) => {
  updateTokenInApp = fn;
};

export const refreshToken = async () => {
  const res = await fetch(`${API_URL}/api/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to refresh token");

  const data = await res.json();
  setToken(data.accessToken);
  return data.accessToken;
};

/* ======================
   Core fetch
====================== */

export const fetchWithAuth = async (url, options = {}) => {
  let res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken?.trim()}`,
    },
  });

  if (res.status === 401) {
    const newToken = await refreshToken();

    res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${newToken}`,
      },
    });

    if (res.status === 401) {
      throw new Error("Unauthorized after refresh");
    }
  }

  return res;
};

/* ======================
   API calls
====================== */

export const getUsers = async () => {
  const res = await fetchWithAuth(`${API_URL}/api/users`);
  return res.json();
};

export const getCourses = async () => {
  const res = await fetchWithAuth(`${API_URL}/api/courses`);
  return res.json();
};

export const getSchools = async () => {
  const res = await fetchWithAuth(`${API_URL}/api/schools`);
  return res.json();
};

export const login = async (schoolCode, username) => {
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schoolCode, username }),
  });

  const data = await res.json();
  return { ok: res.ok, data };
};

export const checkAssignment = async (
  code,
  assignment,
  studentName,
  studentEmail
) => {
  const res = await fetchWithAuth(`${API_URL}/api/check-assignment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, assignment, studentName, studentEmail }),
  });

  if (!res.ok) throw new Error("Failed to check assignment");
  return res.json();
};

export const getStatistic = async (userId, courseId) => {
  const res = await fetchWithAuth(
    `${API_URL}/api/users/${userId}/courses/${courseId}`
  );
  return res.json();
};

export const submitAssignment = async (
  studentName,
  studentEmail,
  courseName,
  chapterTitle,
  grade,
  feedback
) => {
  const res = await fetchWithAuth(`${API_URL}/api/submit-assignment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentName,
      studentEmail,
      courseName,
      chapterTitle,
      grade,
      feedback,
    }),
  });

  if (!res.ok) throw new Error("Failed to submit assignment");
  return res.json();
};

export const saveMark = async (
  studentId,
  courseId,
  chapterId,
  grade,
  feedback
) => {
  const res = await fetchWithAuth(`${API_URL}/api/save-mark`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId,
      courseId,
      chapterId,
      grade,
      feedback,
    }),
  });

  if (!res.ok) throw new Error("Failed to save mark");
  return res.json();
};

export const checkIfSubmitted = async (userId, courseId, chapterId) => {
  const res = await fetchWithAuth(`${API_URL}/api/check-submission`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, courseId, chapterId }),
  });

  if (!res.ok) throw new Error("Failed to check submission");
  return res.json();
};

export const logout = async () => {
  const res = await fetchWithAuth(`${API_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
  });

  return res.ok;
};
