import express from 'express';
import { criarAgendamento } from '../controllers/agendamentoController.js';

const router = express.Router();

router.post('/novo', criarAgendamento);

export default router;