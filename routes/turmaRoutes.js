const express = require('express');
const turmaController = require('../controllers/turmaController');
const router = express.Router();

router.get('/', turmaController.getAllTurma);
router.get('/new', turmaController.renderCreateForm);
router.get('/:cod/edit', turmaController.renderEditForm); // mover esta linha para cima
router.get('/:cod', turmaController.getTurmaByCod);
router.post('/', turmaController.createTurma);
router.put('/:cod', turmaController.updateTurma);
router.delete('/:cod', turmaController.deleteTurma);

module.exports = router;