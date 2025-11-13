import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import compression from 'compression';
import morgan from 'morgan';
import connectDB from './config/database';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import savedSearchRoutes from './routes/savedSearchRoutes';
import conversationRoutes from './routes/conversationRoutes';

// Create Express app
const app: Application = express();

// Health check route - MUST be first, no middleware
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000
  });
});

// Connect to database
connectDB();

// CORS configuration - MUST be FIRST before any other middleware
app.use(
  cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400 // Cache preflight requests for 24 hours
  })
);

// Debug middleware to log all requests
app.use((_req: Request, _res: Response, next: NextFunction) => {
  console.log(`${_req.method} ${_req.url} - Origin: ${_req.headers.origin || 'no origin'}`);
  next();
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Compression
app.use(compression());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/saved-searches', savedSearchRoutes);
app.use('/api/conversations', conversationRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;
