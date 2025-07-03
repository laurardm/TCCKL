const db = require('../config/db');

const Func = {
    create: (func, callback) => {
        const query = 'INSERT INTO funcionario (cod, nome, data_nasc, email, telefone, foto, matricula, senha, cargo, genero, turma) VALUES (?, ?, ?)';
        db.query(query, [func.cod, func.nome, func.data_nasc, func.email, func.telefone, func.foto, func.matricula, func.senha, func.cargo, func.genero, func.turma], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.insertCod);
        });
    },

    findByCod: (cod, callback) => {
        const query = 'SELECT * FROM funcionario WHERE cod = ?';
        db.query(query, [cod], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    },

    findByNome: (nome, callback) => {
        const query = 'SELECT * FROM funcionario WHERE nome = ?';
        db.query(query, [nome], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    },

    update: (cod, func, callback) => {
        const query = 'UPDATE funcionario SET cod = ?, nome = ?, data_nasc = ?, email= ?, telefone = ?, foto = ?, matricula = ?, senha = ?, cargo = ?, genero = ?, turma = ?)';
        db.query(query, [func.cod, func.nome, func.data_nasc, func.email, func.telefone, func.foto, func.matricula, func.senha, func.cargo, func.genero, func.turma], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    delete: (cod, callback) => {
        const query = 'DELETE FROM funcionario WHERE cod = ?';
        db.query(query, [cod], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getAll: (callback) => {
        const query = 'SELECT * FROM funcionario';
        db.query(query, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    searchByName: (name, callback) => {
        const query = 'SELECT * FROM funcionario WHERE nome LIKE ?';
        db.query(query, [`%${name}%`], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },    
};

module.exports = Func;
