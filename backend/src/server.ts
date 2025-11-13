import express, { Application, Request, Response, NextFunction } from 'express';
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

// Connect to database
connectDB();

// ============================================================================
// MANUAL CORS MIDDLEWARE - Handle ALL CORS manually for maximum control
// ============================================================================
app.use((req: Request, res: Response, next: NextFunction) => {
  // Allow any origin in development
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS Preflight: ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
    res.status(204).end();
    return;
  }

  // Log all other requests
  console.log(`📥 Request: ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging (in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Compression
app.use(compression());

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5001,
    cors: 'enabled'
  });
});

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
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ============================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🚀 CORS: Enabled for all origins');
  console.log('🚀 ============================================');
  console.log('');
  console.log('📍 Health check: http://localhost:' + PORT + '/health');
  console.log('📍 API base URL: http://localhost:' + PORT + '/api');
  console.log('');
});

export default app;
