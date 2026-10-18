const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', async (req, res) => {
  try {
    const { recipe_id, user_id, rating, comment } = req.body;
    if (!recipe_id || !rating) return res.status(400).json({ error: 'recipe_id and rating required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating 1–5' });

    const [result] = await db.query(
      'INSERT INTO feedback (recipe_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [recipe_id, user_id || null, rating, comment || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:recipeId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.id, f.rating, f.comment, f.created_at, u.name AS user_name
      FROM feedback f LEFT JOIN users u ON u.id = f.user_id
      WHERE f.recipe_id = ? ORDER BY f.created_at DESC
    `, [req.params.recipeId]);

    const total = rows.length;
    const avg = total > 0 ? (rows.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : 0;
    res.json({ success: true, summary: { total, average: Number(avg) }, feedback: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
