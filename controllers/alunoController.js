const Aluno = require('../models/alunoModel');
const Turmas = require('../models/turmaModel');

const alunoController = {

    createAluno: (req, res) => {

        const newAluno = {
            cod: req.body.cod,
            nome: req.body.nome,
            data_nasc: req.body.data_nasc,
            turma: req.body.turma,
            genero: req.body.genero,
            agenda: req.body.agenda,
        };

        Aluno.create(newAluno, (err, alunoCod) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.redirect('/alunos');
        });
    },

    getAlunoByCod: (req, res) => {
        const alunoCod = req.params.cod;

        Aluno.findByCod(alunoCod, (err, aluno) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (!aluno) {
                return res.status(404).json({ message: 'Aluno not found' });
            }
            res.render('alunos/show', { aluno });
        });
    },
    
    getAllAlunos: (req, res) => {
        const turmas = req.query.turmas || null;
        
        Aluno.getAll(turmas, (err, alunos) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            Turmas.getAll((err, turmas) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.render('alunos/index', { alunos, turmas, turmasSelecionada: turmas });
            });
        });
    },

    renderCreateForm: (req, res) => {
        Turmas.getAll((err, turmas) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.render('alunos/create', { turmas });
        });
    },

    renderEditForm: (req, res) => {
        const alunoCod = req.params.cod;

        Aluno.findByCod(alunoCod, (err, aluno) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (!aluno) {
                return res.status(404).json({ message: 'Aluno not found' });
            }

            Turmas.getAll((err, turmas) => {
                if (err) {
                    return res.status(500).json({ error: err });
                }
                res.render('alunos/edit', { aluno, turmas });
            });
        });
    },

    updateAluno: (req, res) => {
        const alunoCod = req.params.cod;
        
        const updatedAluno = {
            cod: req.body.cod,
            nome: req.body.nome,
            data_nasc: req.body.data_nasc,
            turma: req.body.turma,
            genero: req.body.genero,
            agenda: req.body.agenda,
        };

        Aluno.update(alunoCod, updatedAluno, (err) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.redirect('/alunos');
        });
    },

    deleteAluno: (req, res) => {
        const alunoCod = req.params.cod;

        Aluno.delete(alunoCod, (err) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.redirect('/alunos');
        });
    }
};

module.exports = alunoController;