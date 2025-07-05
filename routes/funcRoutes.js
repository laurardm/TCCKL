const express = require('express');
const funcController = require('../controllers/funcController');
const router = express.Router();

router.get('/', funcController.getAllFuncs);
router.get('/search', funcController.searchFunc); // Adicione esta rota
router.get('/new', funcController.renderCreateForm);
router.post('/', funcController.createFunc);
router.get('/:id', funcController.getFuncByCod);
router.get('/:id/edit', funcController.renderEditForm);
router.put('/:id', funcController.updateFunc);
router.delete('/:id', funcController.deleteFunc);

module.exports = router;