import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import './src/config/db.js'; 
import agendamentoRoutes from './src/routes/agendamentoRoutes.js';
import usuarioRoutes from './src/routes/usuarioRoutes.js';

const app = express();

// Middlewares essenciais
app.use(cors());
app.use(express.json());

// Prefixo para as rotas de agendamento
app.use('/agendamentos', agendamentoRoutes);
app.use('/usuarios', usuarioRoutes);

// Rota de teste
app.get('/', (req, res) => {
    res.send('API online!');
});

// Ligando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});