import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();

// Middlewares essenciais
app.use(cors());
app.use(express.json());

// Conectando ao Banco de Dados MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Falha ao conectar no banco de dados:', err);
        return;
    }
    console.log('Conexão com o banco MySQL (buffet_tcc) estabelecida com sucesso!');
});

// Uma rota de teste para o navegador
app.get('/', (req, res) => {
    res.send('API do TCC está online!');
});

// Ligando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});