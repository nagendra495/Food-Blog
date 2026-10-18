if (!requireLogin()) throw new Error('Not logged in');

const authArea = document.getElementById('authArea');
function renderHeader() {
  const user = getSession();
  if (!user) return;
  authArea.innerHTML = `
    <div class="welcome-tag"><i class="fas fa-user-circle"></i> ${user.name.split(' ')[0]}</div>
    <button class="btn btn-outline btn-sm" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</button>
  `;
  document.getElementById('logoutBtn').addEventListener('click', () => {
    setSession(null);
    window.location.href = 'login.html';
  });
}
renderHeader();

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const ingredientForm = document.getElementById('ingredientForm');
const ingredientInput = document.getElementById('ingredientInput');
const resultsGrid = document.getElementById('resultsGrid');
const resultsMessage = document.getElementById('resultsMessage');

ingredientForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const raw = ingredientInput.value.trim();
  if (!raw) return showMsg(resultsMessage, 'Enter at least one ingredient.', 'error');

  const ingredients = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (ingredients.length === 0) return showMsg(resultsMessage, 'Enter valid ingredients.', 'error');

  resultsGrid.innerHTML = `<p class="loading"><span class="spinner"></span> Finding recipes…</p>`;
  hideMsg(resultsMessage);

  try {
    const data = await RecipeAPI.match(ingredients);
    if (!data.results || data.results.length === 0) {
      resultsGrid.innerHTML = '';
      return showMsg(resultsMessage, `No recipes found for: ${ingredients.join(', ')}.`, 'error');
    }
    showMsg(resultsMessage, `✓ Found ${data.results.length} recipe(s)!`, 'success');
    resultsGrid.innerHTML = data.results.map(renderMatchCard).join('');
    document.querySelectorAll('.feedback-btn').forEach(btn => {
      btn.addEventListener('click', () => openFeedbackModal(btn.dataset.recipeId, btn.dataset.recipeTitle));
    });
  } catch (err) {
    resultsGrid.innerHTML = '';
    showMsg(resultsMessage, 'Failed: ' + err.message, 'error');
  }
});

document.querySelectorAll('.quick-tag').forEach(tag => {
  tag.addEventListener('click', () => {
    ingredientInput.value = tag.dataset.ing;
    ingredientForm.dispatchEvent(new Event('submit'));
  });
});

function renderMatchCard(r) {
  const matched = (r.matchedIngredients || []).map(i => `<span>${escapeHtml(i)}</span>`).join('');
  return `
    <div class="recipe-card">
      <div class="card-img" style="background-image: url('${r.image_url}');">
        <span class="badge">${r.badge || 'recipe'}</span>
        <span class="match-badge">${r.matchScore}% match</span>
      </div>
      <div class="card-content">
        <h3>${escapeHtml(r.title)}</h3>
        <p>${escapeHtml(r.description || '')}</p>
        ${matched ? `<div class="matched-ingredients">${matched}</div>` : ''}
        <div class="card-meta" style="margin-top:1rem;">
          <span><i class="far fa-heart"></i> ${r.likes || 0}</span>
          <span><i class="fas fa-percentage"></i> ${r.matchScore}%</span>
        </div>
        <button class="feedback-btn" data-recipe-id="${r.id}" data-recipe-title="${escapeHtml(r.title)}">
          <i class="fas fa-star"></i> Give Feedback
        </button>
      </div>
    </div>
  `;
}

const modal = document.getElementById('feedbackModal');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalRecipeTitle');
const starsEl = document.getElementById('stars');
const commentEl = document.getElementById('feedbackComment');
const submitBtn = document.getElementById('submitFeedbackBtn');
const feedbackMsg = document.getElementById('feedbackMessage');
const feedbackList = document.getElementById('feedbackList');

let currentRecipeId = null;
let currentRating = 0;

async function openFeedbackModal(recipeId, recipeTitle) {
  currentRecipeId = recipeId;
  currentRating = 0;
  modalTitle.textContent = recipeTitle;
  commentEl.value = '';
  feedbackMsg.className = 'message';
  updateStars(0);
  modal.classList.add('show');
  await loadFeedback(recipeId);
}

function closeFeedbackModal() {
  modal.classList.remove('show');
  currentRecipeId = null;
  currentRating = 0;
}

modalClose.addEventListener('click', closeFeedbackModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeFeedbackModal(); });

starsEl.querySelectorAll('i').forEach(star => {
  star.addEventListener('click', () => { currentRating = Number(star.dataset.star); updateStars(currentRating); });
  star.addEventListener('mouseenter', () => updateStars(Number(star.dataset.star), true));
});
starsEl.addEventListener('mouseleave', () => updateStars(currentRating));

function updateStars(count, hover = false) {
  starsEl.querySelectorAll('i').forEach(s => {
    s.className = Number(s.dataset.star) <= count ? 'fas fa-star' : 'far fa-star';
  });
}

submitBtn.addEventListener('click', async () => {
  if (!currentRating) return showMsg(feedbackMsg, 'Please select a rating.', 'error');
  const user = getSession();
  if (!user) return showMsg(feedbackMsg, 'Session expired.', 'error');

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Submitting…';
  hideMsg(feedbackMsg);

  try {
    await FeedbackAPI.submit(currentRecipeId, user.id, currentRating, commentEl.value.trim() || null);
    showMsg(feedbackMsg, '✓ Thank you!', 'success');
    commentEl.value = '';
    currentRating = 0;
    updateStars(0);
    await loadFeedback(currentRecipeId);
  } catch (err) {
    showMsg(feedbackMsg, err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
  }
});

async function loadFeedback(recipeId) {
  feedbackList.innerHTML = `<p class="loading" style="padding:0.5rem 0;"><span class="spinner"></span> Loading…</p>`;
  try {
    const data = await FeedbackAPI.getForRecipe(recipeId);
    if (!data.feedback || data.feedback.length === 0) {
      feedbackList.innerHTML = `<p class="empty-feedback">No feedback yet. Be the first!</p>`;
      return;
    }
    feedbackList.innerHTML = data.feedback.map(fb => {
      const stars = '★'.repeat(fb.rating) + '☆'.repeat(5 - fb.rating);
      const date = new Date(fb.created_at).toLocaleDateString();
      return `
        <div class="feedback-item">
          <div class="fb-head">
            <span class="fb-user">${escapeHtml(fb.user_name || 'Guest')}</span>
            <span class="fb-stars">${stars}</span>
          </div>
          ${fb.comment ? `<div class="fb-comment">${escapeHtml(fb.comment)}</div>` : ''}
          <span class="fb-date">${date}</span>
        </div>
      `;
    }).join('');
  } catch (err) {
    feedbackList.innerHTML = `<p class="empty-feedback">Could not load feedback.</p>`;
  }
}
