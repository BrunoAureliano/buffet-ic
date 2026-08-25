import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const cadastrarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        // Criptografia usando bcrypt
        const hashSenha = await bcrypt.hash(senha, 10);

        const sql = `
            INSERT INTO Usuario (nome, email, senha, perfil) 
            VALUES (?, ?, ?, 'cliente')
        `;

        db.query(sql, [nome, email, hashSenha], (err, results) => {
            if (err) {
                console.error('Erro ao cadastrar usuário:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
                }
                return res.status(500).json({ erro: 'Erro interno no servidor.' });
            }

            res.status(201).json({
                mensagem: 'Usuário cadastrado com segurança!',
                idUsuario: results.insertId
            });
        });
    } catch (erro) {
        console.error('Erro na criptografia:', erro);
        res.status(500).json({ erro: 'Falha ao processar a segurança da senha.' });
    }
};