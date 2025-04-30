const express = require('express');
const path = require('path');
const app = express();

// Подключение роутов
const volunteerRoutes = require('./routes/volunteerRoutes');
const eventRoutes = require('./routes/eventRoutes');
const participationRoutes = require('./routes/participationRoutes');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Обслуживание статических файлов

// Роуты API
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/participations', participationRoutes);

// Все остальные запросы перенаправляем на index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
