// admin/image-uploader.html será criado depois

// Stubs dos endpoints para SPEC-blog-mobile-image-editor.md

const express = require('express');
const router = express.Router();

// POST /image-upload
router.post('/image-upload', (req, res) => {
  // TODO: Implementar upload de imagem
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /image-editor/process
router.post('/image-editor/process', (req, res) => {
  // TODO: Implementar processamento de imagem (ajustes, crop, etc)
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;
