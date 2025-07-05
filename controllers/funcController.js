const Func = require('../models/funcModel');

const funcController = {
    createFunc: (req, res) => {
        const newFunc = {
            cod: req.body.cod,
            nome: req.body.nome,
            data_nasc: req.body.data_nasc,
            email: req.body.email,
            telefone: req.body.telefone,
            foto: req.body.foto,
            matricula: req.body.matricula,
            senha: req.body.senha,
            cargo: req.body.cargo,
            genero: req.body.genero,
            turma: req.body.turma,
        };

        Func.create(newFunc, (err, funcCod) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.redirect('/func');
        });
    },

    getFuncByCod: (req, res) => {
        const funcCod = req.params.cod;

        Func.findByCod(funcCod, (err, func) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (!func) {
                return res.status(404).json({ message: 'Func not found' });
            }
            res.render('func/show', { func });
        });
    },

    getAllFuncs: (req, res) => {
        Func.getAll((err, func) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.render('func/index', { func });
        });
    },

    renderCreateForm: (req, res) => {
        res.render('func/create');
    },

    renderEditForm: (req, res) => {
        const funcCod = req.params.cod;

        Func.findByCod(funcCod, (err, func) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (!func) {
                return res.status(404).json({ message: 'Func not found' });
            }
            res.render('func/edit', { func });
        });
    },

    updateFunc: (req, res) => {
        const funcCod = req.params.cod;
        const updatedFunc = {
            cod: req.body.cod,
            nome: req.body.nome,
            data_nasc: req.body.data_nasc,
            email: req.body.email,
            telefone: req.body.telefone,
            foto: req.body.foto,
            matricula: req.body.matricula,
            senha: req.body.senha,
            cargo: req.body.cargo,
            genero: req.body.genero,
            turma: req.body.turma,
        };

        Func.update(funcCod, updatedFunc, (err) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.redirect('/func');
        });
    },

    deleteFunc: (req, res) => {
        const funcCod = req.params.cod;

        Func.delete(funcCod, (err) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.redirect('/func');
        });
    },

    searchFunc: (req, res) => {
        const search = req.query.search || '';

        Func.searchByName(search, (err, func) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ func });
        });
    },
};

module.exports = funcController;
