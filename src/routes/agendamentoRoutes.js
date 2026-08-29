import express from 'express';
import { criarAgendamento, listarAgendamentos, atualizarStatus, deletarAgendamento } from '../controllers/agendamentoController.js';
import { verificarToken } from '../middlewares/authMiddlewares.js'; 

const router = express.Router();

router.post('/novo', verificarToken, criarAgendamento);
router.get('/', verificarToken, listarAgendamentos);
router.put('/:id/status', verificarToken, atualizarStatus);
router.delete('/:id', verificarToken, deletarAgendamento);

export default router;