const db = require('../config/db');

const Turma = {
    create: (turma, callback) => {
        const query = 'INSERT INTO turma (nome) VALUES (?)';
        db.query(query, [turma.nome], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.insertCod);
        });
    },

    findByCod: (cod, callback) => {
        const query = 'SELECT * FROM turma WHERE cod = ?';
        db.query(query, [cod], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    },

    findByTurmaname: (nome, callback) => {
        const query = 'SELECT * FROM turma WHERE nome = ?';
        db.query(query, [nome], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    },

    update: (cod, turma, callback) => {
        const query = 'UPDATE turma SET nome = ? WHERE cod = ?';
        db.query(query, [turma.nome,cod], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    delete: (cod, callback) => {
        const query = 'DELETE FROM turma WHERE cod = ?';
        db.query(query, [cod], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getAll: (callback) => {
        const query = 'SELECT * FROM turma';
        db.query(query, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
};


module.exports = Turma;