const Turma = require('../models/turmaModel');

const turmaController = {
    createTurma: (req, res) => {
        const newTurma = {
            cod: req.body.cod,
            nome: req.body.nome,
            fotost: req.body.fotost,
        };

        Turma.create(newTurma, (err, turmaCod) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.redirect('/turma');
        });
    },

    getTurmaByCod: (req, res) => {
        const turmaCod = req.params.cod;

        Turma.findByCod(turmaCod, (err, turma) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (!turma) {
                return res.status(404).json({ message: 'Turma not found' });
            }
            res.render('turma/show', { turma });
        });
    },

    getAllTurma: (req, res) => {
        Turma.getAll((err, turma) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.render('turma/index', { turma });
        });
    },

    renderCreateForm: (req, res) => {
        res.render('turma/create');
    },

    renderEditForm: (req, res) => {
        const turmaCod = req.params.cod;

        Turma.findByCod(turmaCod, (err, turma) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (!turma) {
                return res.status(404).json({ message: 'Turma not found' });
            }
            res.render('turma/edit', { turma });
        });
    },

    updateTurma: (req, res) => {
        const turmaCod = req.params.cod;
        const updatedTurma = {
            cod: req.body.cod,
            nome: req.body.nome,
            fotost: req.body.fotost,
        };

        Turma.update(turmaCod, updatedTurma, (err) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.redirect('/turma');
        });
    },

    deleteTurma: (req, res) => {
        const turmaCod = req.params.cod;

        Turma.delete(turmaCod, (err) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.redirect('/turma');
        });
    }
};

module.exports = turmaController;
