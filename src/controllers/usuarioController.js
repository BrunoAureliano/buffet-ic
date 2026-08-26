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


export const loginUsuario = async (req, res) => {
    const { email, senha } = req.body;

    const sql = 'SELECT * FROM Usuario WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ erro: 'Falha na comunicação com o banco.' });
        }

        // Verifica se encontrou algum usuário com esse e-mail
        if (results.length === 0) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        const usuarioEncontrado = results[0];

        try {
            // Compara a senha digitada com a senha criptografada do banco
            const senhaValida = await bcrypt.compare(senha, usuarioEncontrado.senha);

            if (!senhaValida) {
                return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
            }

            res.status(200).json({
                mensagem: 'Login realizado com sucesso!',
                usuario: {
                    id: usuarioEncontrado.idUsuario,
                    nome: usuarioEncontrado.nome,
                    email: usuarioEncontrado.email,
                    perfil: usuarioEncontrado.perfil
                }
            });

        } catch (erro) {
            console.error('Erro na validação da senha:', erro);
            res.status(500).json({ erro: 'Erro ao validar o acesso.' });
        }
    });
};