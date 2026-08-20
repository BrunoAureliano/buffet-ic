import db from '../config/db.js';

export const criarAgendamento = (req, res) => {
    // Recebe os dados do front-end
    const {
        data_festa, horario_inicio, qtd_adultos,
        qtd_criancas_pagantes, qtd_criancas_isentas,
        tipo_cardapio, materiais_fornecidos, adicional_salada, usuario_id
    } = req.body;

    // Calcula o orçamento
    const valor_adultos = qtd_adultos * 65.00;
    const valor_criancas = qtd_criancas_pagantes * 32.50;
    const taxa_salada = adicional_salada ? ((qtd_adultos + qtd_criancas_pagantes) * 10.00) : 0;
    const valor_final = valor_adultos + valor_criancas + taxa_salada;

    const status_inicial = 'Aguardando Aprovação';

    // Insere na tabela Agendamento (usando NOW() para a data exata do clique)
    const sqlAgendamento = `
        INSERT INTO Agendamento 
        (data_festa, horario_inicio, valor_final, status, data_criacao, usuario_id, qtd_adultos, qtd_criancas_pagantes, qtd_criancas_isentas)
        VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?)
    `;

    db.query(sqlAgendamento, [data_festa, horario_inicio, valor_final, status_inicial, usuario_id, qtd_adultos, qtd_criancas_pagantes, qtd_criancas_isentas], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: 'Falha de comunicação com o banco de dados.' });
        }

        const agendamento_id = results.insertId; // Pega o ID gerado automaticamente

        // Insere os detalhes na tabela Festa conectando com o ID do agendamento
        const sqlFesta = `
            INSERT INTO Festa (tipo_cardapio, materiais_fornecidos, adicional_salada, agendamento_id)
            VALUES (?, ?, ?, ?)
        `;

        db.query(sqlFesta, [tipo_cardapio, materiais_fornecidos, adicional_salada, agendamento_id], (errFesta) => {
            if (errFesta) {
                console.error(errFesta);
                return res.status(500).json({ erro: 'Erro ao salvar os detalhes do cardápio.' });
            }

            res.status(201).json({
                mensagem: 'Agendamento solicitado com sucesso!',
                id_reserva: agendamento_id,
                valor_total: valor_final
            });
        });
    });
};

export const listarAgendamentos = (req, res) => {
    // JOIN pega os detalhes da festa junto com o agendamento
    const sql = `
        SELECT 
            A.idAgendamento, A.data_festa, A.horario_inicio, A.status, A.valor_final,
            A.qtd_adultos, A.qtd_criancas_pagantes, A.qtd_criancas_isentas,
            F.tipo_cardapio, F.adicional_salada
        FROM Agendamento A
        LEFT JOIN Festa F ON A.idAgendamento = F.agendamento_id
        ORDER BY A.data_festa ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao listar agendamentos:', err);
            return res.status(500).json({ erro: 'Falha ao buscar os dados no banco.' });
        }
        
        res.status(200).json(results);
    });
};