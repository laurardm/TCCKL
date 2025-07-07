const db = require('../config/db');

const Resp = {
    create: (resp, callback) => {
        // Verifica se o código de gênero existe antes de inserir
        db.query('SELECT cod FROM genero WHERE cod = ?', [resp.genero], (err, generoResults) => {
            if (err) return callback(err);
            if (generoResults.length === 0) {
                return callback(new Error('Gênero inválido: código não encontrado na tabela genero.'));
            }

            const query = `
                INSERT INTO responsaveis 
                (cod, nome, data_nasc, email, foto, senha, genero, parentesco) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(query, [
                resp.cod,
                resp.nome,
                resp.data_nasc,
                resp.email,
                resp.foto,
                resp.senha,
                resp.genero,
                resp.parentesco
            ], (err, results) => {
                if (err) {
                    return callback(err);
                }
                callback(null, results.insertId); // ou results.insertCod se for personalizado
            });
        });
    },

    findByCod: (cod, callback) => {
        const query = 'SELECT * FROM responsaveis WHERE cod = ?';
        db.query(query, [cod], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    findByNome: (nome, callback) => {
        const query = 'SELECT * FROM responsaveis WHERE nome = ?';
        db.query(query, [nome], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    update: (cod, resp, callback) => {
        // Verifica se o código de gênero existe antes de atualizar
        db.query('SELECT cod FROM genero WHERE cod = ?', [resp.genero], (err, generoResults) => {
            if (err) return callback(err);
            if (generoResults.length === 0) {
                return callback(new Error('Gênero inválido: código não encontrado na tabela genero.'));
            }

            const query = `
                UPDATE responsaveis 
                SET nome = ?, data_nasc = ?, email = ?, foto = ?, senha = ?, genero = ?, parentesco = ?
                WHERE cod = ?
            `;
            db.query(query, [
                resp.nome,
                resp.data_nasc,
                resp.email,
                resp.foto,
                resp.senha,
                resp.genero,
                resp.parentesco,
                cod
            ], (err, results) => {
                if (err) return callback(err);
                callback(null, results);
            });
        });
    },

    delete: (cod, callback) => {
        const query = 'DELETE FROM responsaveis WHERE cod = ?';
        db.query(query, [cod], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    getAll: (callback) => {
        const query = 'SELECT * FROM responsaveis';
        db.query(query, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    },

    searchByName: (name, callback) => {
        const query = 'SELECT * FROM responsaveis WHERE nome LIKE ?';
        db.query(query, [`%${name}%`], (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
};

module.exports = Resp;
