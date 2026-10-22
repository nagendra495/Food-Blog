const API_BASE = '/api';
const SESSION_KEY = 'tasteful_session';

function getSession() {
  const s = sessionStorage.getItem(SESSION_KEY);
  return s ? JSON.parse(s) : null;
}
function setSession(user) {
  if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else sessionStorage.removeItem(SESSION_KEY);
}
function isLoggedIn() { return getSession() !== null; }
function requireLogin() {
  if (!isLoggedIn()) { window.location.href = 'login.html'; return false; }
  return true;
}

async function apiFetch(endpoint, options = {}) {
  const url = API_BASE + endpoint;
  const config = { headers: { 'Content-Type': 'application/json' }, ...options };
  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

const AuthAPI = {
  register: (name, email, password) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email, password) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
};
const RecipeAPI = {
  getAll: () => apiFetch('/recipes'),
  getById: (id) => apiFetch(`/recipes/${id}`),
  match: (ingredients) => apiFetch('/recipes/match', { method: 'POST', body: JSON.stringify({ ingredients }) })
};
const FeedbackAPI = {
  submit: (recipeId, userId, rating, comment) => apiFetch('/feedback', { method: 'POST', body: JSON.stringify({ recipe_id: recipeId, user_id: userId, rating, comment }) }),
  getForRecipe: (recipeId) => apiFetch(`/feedback/${recipeId}`)
};

function showMsg(el, text, type) {
  if (typeof el === 'string') el = document.getElementById(el);
  el.textContent = text;
  el.className = 'message show ' + type;
}
function hideMsg(el) {
  if (typeof el === 'string') el = document.getElementById(el);
  el.className = 'message';
  el.textContent = '';
}
