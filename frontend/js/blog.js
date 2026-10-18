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

const recipeGrid = document.getElementById('recipeGrid');

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderRecipeCard(r) {
  return `
    <div class="recipe-card">
      <div class="card-img" style="background-image: url('${r.image_url}');"><span class="badge">${r.badge || 'recipe'}</span></div>
      <div class="card-content">
        <h3>${escapeHtml(r.title)}</h3>
        <p>${escapeHtml(r.description || '')}</p>
        <div class="card-meta">
          <span><i class="far fa-heart"></i> ${r.likes || 0}</span>
          <span><i class="fas fa-book"></i> #${r.id}</span>
        </div>
      </div>
    </div>
  `;
}

async function loadRecipes() {
  recipeGrid.innerHTML = `<p class="loading"><span class="spinner"></span> Loading recipes…</p>`;
  try {
    const data = await RecipeAPI.getAll();
    if (!data.recipes || data.recipes.length === 0) {
      recipeGrid.innerHTML = `<p class="loading">No recipes yet.</p>`;
      return;
    }
    recipeGrid.innerHTML = data.recipes.map(renderRecipeCard).join('');
  } catch (err) {
    recipeGrid.innerHTML = `<p class="loading" style="color:#a54b2e;">⚠ Failed: ${err.message}</p>`;
  }
}
loadRecipes();
