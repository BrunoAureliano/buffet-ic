document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificação de Segurança
    const token = localStorage.getItem('token');
    if (!token) {
        mostrarNotificacao('Acesso negado. Por favor, inicie sessão.', 'erro');
        setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        return;
    }

    // 2. Carregar Dados do Gestor
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (usuarioLogado && usuarioLogado.nome) {
        document.getElementById('nomeAdmin').textContent = usuarioLogado.nome.split(' ')[0];
    }

    // 3. Sair (Logout)
    document.getElementById('btnSairAdmin').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioLogado');
        window.location.href = 'login.html';
    });

    // 4. Buscar e Renderizar Agendamentos em Accordions
    async function carregarTodosAgendamentos() {
        const accPendentes = document.getElementById('accordionPendentes');
        const accAprovados = document.getElementById('accordionAprovados');
        const accRecusados = document.getElementById('accordionRecusados');

        try {
            const resposta = await fetch('http://localhost:3000/agendamentos', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const agendamentos = await resposta.json();
            if (!resposta.ok) {
                if (resposta.status === 401 || resposta.status === 403) {
                    mostrarNotificacao('Sua sessão expirou. Faça login novamente.', 'aviso');
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuarioLogado');
                    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                    return;
                }
                throw new Error(agendamentos.erro || 'Erro ao carregar orçamentos');
            }

            // Limpar containers
            accPendentes.innerHTML = '';
            accAprovados.innerHTML = '';
            accRecusados.innerHTML = '';

            // Filtrar as 3 categorias
            const pendentes = agendamentos.filter(a => a.status !== 'Aprovado' && a.status !== 'Recusado');
            const aprovados = agendamentos.filter(a => a.status === 'Aprovado');
            const recusados = agendamentos.filter(a => a.status === 'Recusado');

            // Ordenar aprovados por data do evento (Cronológica)
            aprovados.sort((a, b) => new Date(a.data_festa) - new Date(b.data_festa));

            // Função auxiliar para criar os itens do Accordion
            const renderizarLista = (lista, container, idPai, tipo) => {
                if (lista.length === 0) {
                    container.innerHTML = `<div class="text-secundario px-3 py-2">Nenhum registro encontrado.</div>`;
                    return;
                }

                lista.forEach((agendamento, index) => {
                    const idItem = `collapse_${tipo}_${agendamento.idAgendamento}`;
                    const dataFormatada = new Date(agendamento.data_festa).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
                    const totalConvidados = agendamento.qtd_adultos + agendamento.qtd_criancas_isentas + agendamento.qtd_criancas_pagantes;
                    
                    // Formatação do Valor Final
                    const valorFormatado = agendamento.valor_final 
                        ? Number(agendamento.valor_final).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : 'A calcular';

                    // Definir botões com base no contexto
                    let botoesHTML = '';
                    if (tipo === 'pendentes') {
                        botoesHTML = `
                            <button class="btn btn-success fw-bold w-100 mb-2" onclick="atualizarStatus(${agendamento.idAgendamento}, 'Aprovado')">Aprovar Pedido</button>
                            <button class="btn btn-outline-danger fw-bold w-100" onclick="atualizarStatus(${agendamento.idAgendamento}, 'Recusado')">Recusar Pedido</button>
                        `;
                    } else if (tipo === 'recusados') {
                        botoesHTML = `
                            <button class="btn btn-success fw-bold w-100" onclick="atualizarStatus(${agendamento.idAgendamento}, 'Aprovado')">Reativar e Aprovar</button>
                        `;
                    } else if (tipo === 'aprovados') {
                        botoesHTML = `
                            <div class="alert alert-success p-2 text-center mb-2 w-100 fw-bold">Evento Confirmado</div>
                            <button class="btn btn-outline-danger fw-bold w-100" onclick="atualizarStatus(${agendamento.idAgendamento}, 'Recusado')">Cancelar Evento</button>
                        `;
                    }

                    const html = `
                        <div class="accordion-item" style="background-color: rgba(0,0,0,0.2); border-color: rgba(255,255,255,0.1);">
                            <h2 class="accordion-header">
                                <button class="accordion-button collapsed fw-bold text-bege" type="button" data-bs-toggle="collapse" data-bs-target="#${idItem}">
                                    #${agendamento.idAgendamento} &nbsp;|&nbsp; ${dataFormatada} &nbsp;|&nbsp; ${totalConvidados} Convidados
                                </button>
                            </h2>
                            <div id="${idItem}" class="accordion-collapse collapse" data-bs-parent="#${idPai}">
                                <div class="accordion-body text-bege">
                                    <div class="row">
                                        <div class="col-12 col-md-6 mb-3">
                                            <p class="mb-1"><strong>⏰ Horário:</strong> ${agendamento.horario_inicio}</p>
                                            <p class="mb-1"><strong>🥗 Salada:</strong> ${agendamento.adicional_salada ? 'Sim' : 'Não'}</p>
                                            <p class="mb-1"><strong>🍽️ Cardápio:</strong> ${agendamento.tipo_cardapio || 'Não informado'}</p>
                                            <p class="mb-0 text-warning fs-5 mt-2"><strong>💰 Total: ${valorFormatado}</strong></p>
                                        </div>
                                        <div class="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center border-start border-secondary pt-3 pt-md-0">
                                            ${botoesHTML}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.innerHTML += html;
                });
            };

            renderizarLista(pendentes, accPendentes, 'accordionPendentes', 'pendentes');
            renderizarLista(aprovados, accAprovados, 'accordionAprovados', 'aprovados');
            renderizarLista(recusados, accRecusados, 'accordionRecusados', 'recusados');

        } catch (erro) {
            console.error('Erro ao carregar agendamentos:', erro);
            mostrarNotificacao('Erro ao carregar os orçamentos do servidor.', 'erro');
        }
    }

    carregarTodosAgendamentos();

    // 5. Função para Atualizar Status
    window.atualizarStatus = async function(id, novoStatus) {
        if (!confirm(`Confirma a alteração do pedido #${id} para ${novoStatus.toLowerCase()}?`)) {
            return;
        }

        try {
            const resposta = await fetch(`http://localhost:3000/agendamentos/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: novoStatus })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                mostrarNotificacao(`Pedido ${novoStatus.toLowerCase()} com sucesso!`, 'sucesso');
                carregarTodosAgendamentos(); 
            } else {
                mostrarNotificacao(`Erro: ${dados.erro || 'Não foi possível atualizar o pedido.'}`, 'erro');
                if (resposta.status === 401 || resposta.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuarioLogado');
                    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                }
            }
        } catch (erro) {
            console.error('Erro ao atualizar status:', erro);
            mostrarNotificacao('Falha de comunicação com o servidor.', 'erro');
        }
    };
});