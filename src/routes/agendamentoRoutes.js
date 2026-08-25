import express from 'express';
import { criarAgendamento, listarAgendamentos, atualizarStatus, deletarAgendamento } from '../controllers/agendamentoController.js';

const router = express.Router();

router.post('/novo', criarAgendamento);
router.get('/', listarAgendamentos);
router.put('/:id/status', atualizarStatus);
router.delete('/:id', deletarAgendamento);

export default router;