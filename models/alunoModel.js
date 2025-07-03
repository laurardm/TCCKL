const db = require('../config/db');

const Aluno = {
    create: (aluno, callback) => {
        const query = 'INSERT INTO aluno (cod, nome, data_nasc, turma, genero, agenda) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(query, [aluno.cod, aluno.nome, aluno.data_nasc, aluno.turma, aluno.genero, aluno.agenda], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results.insertCod);
        });
    },

    findByCod: (cod, callback) => {
        const query = 'SELECT aluno.*, turma.nome AS turma_nome FROM aluno JOIN aluno ON aluno.turma = turma.cod WHERE aluno.cod = ?';
        db.query(query, [cod], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results[0]);
        });
    },

    update: (cod, aluno, callback) => {
        const query = 'UPDATE aluno SET cod = ? nome = ?, data_nasc = ?, turma = ?, genero = ?, agenda = ? WHERE cod = ?';
        db.query(query, [aluno.cod, aluno.nome, aluno.data_nasc, aluno.turma, aluno.genero, aluno.agenda, cod], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    delete: (cod, callback) => {
        const query = 'DELETE FROM aluno WHERE cod = ?';
        db.query(query, [cod], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getAll: (aluno, callback) => {
        let query = 'SELECT aluno.cod, aluno.nome, aluno.data_nasc, aluno.turma, aluno.genero, aluno.nome AS aluno_nome FROM aluno JOIN aluno ON aluno.turma = aluno.cod';
        
        if (aluno) {
            query += ' WHERE aluno.turma = ?';
        }
    
        db.query(query, [aluno], (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },
    
};

module.exports = Aluno;