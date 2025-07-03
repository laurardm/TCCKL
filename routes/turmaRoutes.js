const express = require('express');
const turmaController = require('../controllers/turmaController');
const router = express.Router();

router.get('/', turmaController.getAllTurma);
router.get('/new', turmaController.renderCreateForm);
router.post('/', turmaController.createTurma);
router.get('/:cod', turmaController.getTurmaByCod);
router.get('/:cod/edit', turmaController.renderEditForm);
router.put('/:cod', turmaController.updateTurma);
router.delete('/:cod', turmaController.deleteTurma);

module.exports = router;