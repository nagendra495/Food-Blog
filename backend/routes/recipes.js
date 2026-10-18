const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [recipes] = await db.query('SELECT id, title, description, image_url, badge, likes FROM recipes ORDER BY created_at DESC');
    res.json({ success: true, recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [recipes] = await db.query('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
    if (recipes.length === 0) return res.status(404).json({ error: 'Recipe not found' });

    const [ingredients] = await db.query('SELECT ingredient FROM recipe_ingredients WHERE recipe_id = ?', [req.params.id]);
    const recipe = recipes[0];
    recipe.ingredients = ingredients.map(i => i.ingredient);
    recipe.steps = recipe.steps ? recipe.steps.split('\n') : [];
    res.json({ success: true, recipe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/match', async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!Array.isArray(ingredients) || ingredients.length === 0) return res.status(400).json({ error: 'Ingredients required' });

    const userIngredients = ingredients.map(i => i.trim().toLowerCase()).filter(Boolean);
    if (userIngredients.length === 0) return res.status(400).json({ error: 'No valid ingredients' });

    const [rows] = await db.query(`
      SELECT r.id, r.title, r.description, r.image_url, r.badge, r.likes, ri.ingredient
      FROM recipes r JOIN recipe_ingredients ri ON ri.recipe_id = r.id
    `);

    const recipeMap = {};
    for (const row of rows) {
      if (!recipeMap[row.id]) {
        recipeMap[row.id] = { id: row.id, title: row.title, description: row.description, image_url: row.image_url, badge: row.badge, likes: row.likes, ingredients: [] };
      }
      recipeMap[row.id].ingredients.push(row.ingredient);
    }

    const results = Object.values(recipeMap).map(recipe => {
      const matched = recipe.ingredients.filter(ing => userIngredients.includes(ing));
      const score = Math.round((matched.length / recipe.ingredients.length) * 100);
      return { ...recipe, matchedIngredients: matched, matchScore: score };
    });

    const filtered = results.filter(r => r.matchedIngredients.length > 0)
      .sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
    res.json({ success: true, results: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
