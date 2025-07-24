const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    // Cria nome único com timestamp e extensão original
    cb(null, req.session.usuario.cod + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


// GET /perfil - renderiza a página com dados completos do funcionário
router.get('/', (req, res) => {
  const funcionario = req.session.usuario;

  if (!funcionario || !funcionario.cod) {
    return res.redirect('/'); // ou página de erro
  }

  const sql = `
    SELECT f.*, t.nome AS nome_turma, c.descricao AS cargo, g.descricao AS genero
    FROM funcionario f
    LEFT JOIN turma t ON f.turma = t.cod
    LEFT JOIN cargo c ON f.cargo = c.cod
    LEFT JOIN genero g ON f.genero = g.cod
    WHERE f.cod = ?`;

  db.query(sql, [funcionario.cod], (err, results) => {
    if (err || results.length === 0) {
      console.error('Erro ao buscar dados do funcionário:', err);
      return res.render('perfis/perfilf', {
        nome: funcionario.nome,
        data_nasc: funcionario.data_nasc,
        email: funcionario.email,
        celular: funcionario.telefone,
        cargo: '',
        genero: '',
        turmas: '',
        erro: 'Erro ao carregar dados.',
        sucesso: null
      });
    }

    const dados = results[0];

    //para data_nasc funcionar
    const formatarData = (data) => {
      const d = new Date(data);
      const ano = d.getFullYear();
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const dia = String(d.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    };

    res.render('perfis/perfilf', {
      nome: dados.nome,
      data_nasc: formatarData(dados.data_nasc),
      email: dados.email,
      celular: dados.telefone,
      cargo: dados.cargo || 'Sem cargo',
      genero: dados.genero || 'Não informado',
      turmas: dados.nome_turma || 'Nenhuma turma vinculada',
      foto: dados.foto || null,
      erro: null,
      sucesso: null
    });

  });
});

// POST /perfil - atualiza dados do funcionário
router.post('/', upload.single('foto'), (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/');
  }

  const funcionario = req.session.usuario;
  const { nome, data_nasc, email, telefone } = req.body;

  // Se enviou foto, pega o caminho relativo para salvar no banco
  let fotoPath = null;
  if (req.file) {
    fotoPath = '/uploads/' + req.file.filename; // caminho público para acessar no front
  }

  // Se a foto foi enviada, atualiza junto
  const sqlUpdate = fotoPath ?
    `UPDATE funcionario SET nome = ?, data_nasc = ?, email = ?, telefone = ?, foto = ? WHERE cod = ?` :
    `UPDATE funcionario SET nome = ?, data_nasc = ?, email = ?, telefone = ? WHERE cod = ?`;

  const params = fotoPath ? [nome, data_nasc, email, telefone, fotoPath, funcionario.cod] : [nome, data_nasc, email, telefone, funcionario.cod];

  db.query(sqlUpdate, params, (err, result) => {
    if (err) {
      console.error('Erro ao atualizar dados:', err);
      return res.render('perfis/perfilf', {
        nome,
        data_nasc,
        email,
        celular: telefone,
        cargo: funcionario.cargo || '',
        genero: funcionario.genero || '',
        turmas: funcionario.turma || '',
        erro: 'Erro ao atualizar dados.'
      });
    }

    // Atualiza sessão
    req.session.usuario.nome = nome;
    req.session.usuario.data_nasc = data_nasc;
    req.session.usuario.email = email;
    req.session.usuario.telefone = telefone;
    if (fotoPath) req.session.usuario.foto = fotoPath;

    res.redirect('/perfilf');
  });
});


module.exports = router;
