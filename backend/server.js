const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/recipes',  require('./routes/recipes'));
app.use('/api/feedback', require('./routes/feedback'));

app.get('/api', (req, res) => res.json({ status: 'ok', message: '🍳 Food Blog API' }));
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
