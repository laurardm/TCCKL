const express = require('express');
const respController = require('../controllers/respController');
const router = express.Router();

router.get('/', respController.getAllResp);
router.get('/search', respController.searchResp); // Adicione esta rota
router.get('/new', respController.renderCreateForm);
router.post('/', respController.createResp);
router.get('/:id', respController.getRespByCod);
router.get('/:id/edit', respController.renderEditForm);
router.put('/:id', respController.updateResp);
router.delete('/:id', respController.deleteResp);

module.exports = router;