import express from 'express';
import { criarAgendamento, listarAgendamentos } from '../controllers/agendamentoController.js';

const router = express.Router();

router.post('/novo', criarAgendamento);

router.get('/', listarAgendamentos);

export default router;