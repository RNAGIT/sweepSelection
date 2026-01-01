const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { join } = require('path');
const { readFileSync, existsSync } = require('fs');

let cachedApp;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  
  const app = await NestFactory.create(AppModule, adapter);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Initialize NestJS app first (this registers all API routes)
  await app.init();

  // Serve static files (CSS, JS, images, etc.) - after API routes are registered
  const publicPath = join(__dirname, '..', 'public');
  expressApp.use(express.static(publicPath, { 
    index: false, // Don't serve index.html automatically
    fallthrough: true // Continue to next middleware if file not found
  }));

  // Serve index.html for all non-API, non-file routes (SPA fallback)
  // This must be last so API routes and static files take precedence
  expressApp.use((req, res, next) => {
    // Only handle GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip API routes - they should be handled by NestJS
    if (req.path.startsWith('/csv/') || req.path.startsWith('/spin-wheel/')) {
      return next();
    }

    // Skip files with extensions (they should be served by static middleware)
    if (req.path.includes('.') && req.path !== '/') {
      return next();
    }

    // For all other routes, serve index.html (SPA routing)
    try {
      const indexPath = join(publicPath, 'index.html');
      if (existsSync(indexPath)) {
        const indexContent = readFileSync(indexPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        return res.send(indexContent);
      }
    } catch (error) {
      console.error('Error serving index.html:', error);
    }
    
    next();
  });

  cachedApp = expressApp;
  return expressApp;
}

module.exports = async function handler(req, res) {
  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
};

