import jwt from 'jsonwebtoken';

// Verifica Login
export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ erro: 'Acesso negado. Nenhum token fornecido.' });
    }

    // O padrão da web é enviar a palavra "Bearer " antes do token. 
    // O split é usado para pegar apenas o código do token (a segunda parte)
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decodificado) => {
        if (err) {
            return res.status(401).json({ erro: 'Sessão inválida ou expirada. Faça login novamente.' });
        }
        req.usuarioLogado = decodificado;
        
        next(); 
    });
};

// Verifica Gestor
export const verificarGestor = (req, res, next) => {
    const perfil = req.usuarioLogado.perfil;

    if (perfil !== 'gestor') {
        return res.status(403).json({ erro: 'Acesso negado. Ação restrita a gestores do buffet.' });
    }

    next();
};