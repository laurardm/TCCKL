const Resp = require('../models/respModel');

const respController = {
    createResp: (req, res) => {
        const newResp = {
            cod: req.body.cod,
            nome: req.body.nome,
            data_nasc: req.body.data_nasc,
            email: req.body.email,
            telefone: req.body.telefone,
            foto: req.body.foto,
            senha: req.body.senha,
            genero: req.body.genero,
            parentesco: req.body.parentesco,
        };

        Resp.create(newResp, (err, respCod) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.redirect('/resp');
        });
    },

    getRespByCod: (req, res) => {
        const respCod = req.params.cod;

        Resp.findByCod(respCod, (err, resp) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (!resp) {
                return res.status(404).json({ message: 'Resp not found' });
            }
            res.render('resp/show', { resp });
        });
    },

    getAllResp: (req, res) => {
        Resp.getAll((err, resp) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.render('resp/index', { resp });
        });
    },

    renderCreateForm: (req, res) => {
        res.render('resp/create');
    },

    renderEditForm: (req, res) => {
        const respCod = req.params.cod;

        Resp.findByCod(respCod, (err, resp) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            if (!resp) {
                return res.status(404).json({ message: 'Resp not found' });
            }
            res.render('resp/edit', { resp });
        });
    },

    updateResp: (req, res) => {
        const respCod = req.params.cod;
        const updatedResp = {
            cod: req.body.cod,
            nome: req.body.nome,
            data_nasc: req.body.data_nasc,
            email: req.body.email,
            telefone: req.body.telefone,
            foto: req.body.foto,
            senha: req.body.senha,
            genero: req.body.genero,
            parentesco: req.body.parentesco,
        };

        Resp.update(respCod, updatedResp, (err) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.redirect('/resp');
        });
    },

    deleteResp: (req, res) => {
        const respCod = req.params.cod;

        Resp.delete(respCod, (err) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.redirect('/resp');
        });
    },

    searchResp: (req, res) => {
        const search = req.query.search || '';

        Resp.searchByName(search, (err, resp) => {
            if (err) {
                return res.status(500).json({ error: err });
            }
            res.json({ resp });
        });
    },
};

module.exports = respController;
