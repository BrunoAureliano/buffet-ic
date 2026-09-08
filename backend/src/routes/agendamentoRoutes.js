import express from 'express';
import { criarAgendamento, listarAgendamentos, atualizarStatus, deletarAgendamento } from '../controllers/agendamentoController.js';
import { verificarToken, verificarGestor } from '../middlewares/authMiddlewares.js'; 

const router = express.Router();

// Rotas liberadas para clientes (exigem apenas login)
router.post('/novo', verificarToken, criarAgendamento);
router.get('/', verificarToken, listarAgendamentos);

// Rotas restritas (exigem login e perfil de gestor)
router.put('/:id/status', verificarToken, verificarGestor, atualizarStatus);
router.delete('/:id', verificarToken, verificarGestor, deletarAgendamento);

export default router;