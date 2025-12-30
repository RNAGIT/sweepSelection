const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');
const { join } = require('path');
const { readFileSync } = require('fs');

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

  // Serve static files using express
  const publicPath = join(__dirname, '..', 'public');
  expressApp.use(express.static(publicPath));

  // Serve index.html for root route
  expressApp.get('/', (req, res) => {
    try {
      const indexPath = join(publicPath, 'index.html');
      const indexContent = readFileSync(indexPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.send(indexContent);
    } catch (error) {
      console.error('Error serving index.html:', error);
      res.status(500).send('Error loading application');
    }
  });

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

module.exports = async function handler(req, res) {
  try {
    const app = await bootstrap();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

