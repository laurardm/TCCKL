const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Configuração do multer para armazenar a imagem no diretório /public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nomeArquivo = `foto_${Date.now()}${ext}`;
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage });

// Página de perfil do responsável
router.get('/', (req, res) => {
  const responsavel = req.session.usuario;

  if (!responsavel || !responsavel.cod) {
    return res.redirect('/');
  }

  const sql = 'SELECT nome, email, data_nasc, parentesco, foto FROM responsavel WHERE cod = ?';

  db.query(sql, [responsavel.cod], (err, results) => {
    if (err || results.length === 0) {
      console.error('Erro ao buscar dados do responsável:', err);
      return res.render('resp/index', {
        erro: 'Erro ao carregar perfil',
        nome: '',
        email: '',
        data_nasc: '',
        parentesco: '',
        foto: '/imagens/perfil.png'
      });
    }

    const resp = results[0];

    res.render('resp/index', {
      erro: null,
      nome: resp.nome,
      email: resp.email,
      data_nasc: resp.data_nasc ? resp.data_nasc.toISOString().split('T')[0] : '',
      parentesco: resp.parentesco || '',
      foto: resp.foto || '/imagens/perfil.png'
    });
  });
});

// Upload de nova foto de perfil
router.post('/foto', upload.single('foto'), (req, res) => {
  const responsavel = req.session.usuario;

  if (!responsavel || !responsavel.cod) {
    return res.redirect('/');
  }

  if (!req.file) {
    return res.redirect('/perfilr');
  }

  const caminhoFoto = '/uploads/' + req.file.filename;

  const sql = 'UPDATE responsavel SET foto = ? WHERE cod = ?';

  db.query(sql, [caminhoFoto, responsavel.cod], (err) => {
    if (err) {
      console.error('Erro ao atualizar foto:', err);
    }
    res.redirect('/perfilr');
  });
});

module.exports = router;
