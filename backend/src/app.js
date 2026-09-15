const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const messageRoutes = require('./routes/message.routes');
const vacationRoutes = require('./routes/vacation.routes');
const settingsRoutes = require('./routes/settings.routes');
const studentDashboardRoutes = require('./routes/studentDashboard.routes');
const rabbiDashboardRoutes = require('./routes/rabbiDashboard.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  }),
);
app.use(express.json({ limit: '2mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/vacations', vacationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/student/dashboard', studentDashboardRoutes);
app.use('/api/rabbi/dashboard', rabbiDashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
