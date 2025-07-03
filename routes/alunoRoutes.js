const express = require('express');
const alunoController = require('../controllers/alunoController');
const router = express.Router();

router.get('/', alunoController.getAllAlunos);
router.get('/new', alunoController.renderCreateForm);
router.post('/', alunoController.createAluno);
router.get('/:cod/edit', alunoController.renderEditForm);
router.put('/:cod', alunoController.updateAluno);
router.delete('/:cod', alunoController.deleteAluno);

module.exports = router;