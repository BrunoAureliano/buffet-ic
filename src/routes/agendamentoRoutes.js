import express from 'express';
import { criarAgendamento, listarAgendamentos, atualizarStatus } from '../controllers/agendamentoController.js';

const router = express.Router();

router.post('/novo', criarAgendamento);
router.get('/', listarAgendamentos);
router.put('/:id/status', atualizarStatus);

export default router;