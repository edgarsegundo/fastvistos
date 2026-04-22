// Carrega variáveis de ambiente do arquivo .env
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import express from 'express';
const router = express.Router();

export default (BlogService) => {

  // Middleware de autenticação para /admin
  router.use('/admin', (req, res, next) => {
      const token = req.query.token || req.headers['x-api-key'];
      console.log(`* token received: ${token}`);
      console.log(`* expected token: ${process.env.MYSITESAPP_API_KEY}`);
      if (token !== process.env.MYSITESAPP_API_KEY) {
          console.log('* access denied');
          return res.status(401).send('<h1>401 — Acesso negado</h1>');
      }
      console.log('* access granted');
      next();
  });

  // Rota para servir o uploader
  router.get('/admin/image-uploader', (req, res) => {
      const htmlPath = path.join(__dirname, '../admin/image-uploader.html');
      if (fs.existsSync(htmlPath)) {
          res.sendFile(htmlPath);
      } else {
          res.status(404).send('Uploader não encontrado');
      }
  });

  return router;
};