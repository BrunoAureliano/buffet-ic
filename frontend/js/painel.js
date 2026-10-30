document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificação de Segurança 
    const token = localStorage.getItem('token');
    if (!token) {
        mostrarNotificacao('Acesso negado. Por favor, inicie sessão.', 'erro');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    // 2. Carregar Dados do usuário
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (usuarioLogado && usuarioLogado.nome) {
        document.getElementById('nomeUsuario').textContent = usuarioLogado.nome.split(' ')[0];
    }

    // 3. Logout
    document.getElementById('btnSair').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuarioLogado');
        window.location.href = 'login.html';
    });

    // 4. Função para Buscar e Exibir os Orçamentos do Banco de Dados
    async function carregarAgendamentos() {
        const container = document.getElementById('listaAgendamentos');
        container.innerHTML = '<p class="text-secundario">A carregar orçamentos...</p>';

        try {
            const resposta = await fetch('http://localhost:3000/agendamentos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const agendamentos = await resposta.json();
            if (!resposta.ok) {
                if (resposta.status === 401 || resposta.status === 403) {
                    mostrarNotificacao('Sua sessão expirou. Faça login novamente.', 'aviso');
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuarioLogado');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                    return;
                }
                throw new Error(agendamentos.erro || 'Erro ao carregar dados');
            }
            container.innerHTML = ''; 

            if (agendamentos.length === 0) {
                container.innerHTML = '<p class="text-secundario">Ainda não tem orçamentos solicitados.</p>';
                return;
            }

            agendamentos.forEach(agendamento => {
                const dataFormatada = new Date(agendamento.data_festa).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
                
                let corBadge = 'bg-warning text-dark'; 
                if (agendamento.status === 'Aprovado') corBadge = 'bg-success';
                if (agendamento.status === 'Recusado') corBadge = 'bg-danger';

                const totalConvidados = agendamento.qtd_adultos + agendamento.qtd_criancas_isentas + agendamento.qtd_criancas_pagantes;

                const cardHTML = `
                    <div class="col-md-6 col-lg-4">
                        <div class="agendamento-card p-4 rounded-3 shadow-sm h-100">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <h5 class="fw-bold mb-0" style="color: var(--destaque-mostarda);">Pedido #${agendamento.idAgendamento}</h5>
                                <span class="badge ${corBadge}">${agendamento.status || 'Aguardando Aprovação'}</span>
                            </div>
                            <p class="text-bege mb-1">📅 <strong>Data:</strong> ${dataFormatada}</p>
                            <p class="text-bege mb-1">⏰ <strong>Horário:</strong> ${agendamento.horario_inicio} (4h de evento)</p>
                            <p class="text-bege mb-1">🥗 <strong>Salada:</strong> ${agendamento.adicional_salada ? 'Sim' : 'Não'}</p>
                            <p class="text-bege mb-1">🍽️ <strong>Cardápio:</strong> ${agendamento.tipo_cardapio || 'Não informado'}</p>
                            <hr class="border-secondary">
                            <p class="text-secundario small mb-0">Total de Convidados: ${totalConvidados}</p>
                        </div>
                    </div>
                `;
                container.innerHTML += cardHTML;
            });

        } catch (erro) {
            console.error('Erro ao carregar agendamentos:', erro);
            container.innerHTML = '<p class="text-danger">Erro ao carregar a lista de orçamentos.</p>';
        }
    }

    carregarAgendamentos();

    // 5. Envio do Formulário de Novo Agendamento
    const formAgendamento = document.getElementById('formAgendamento');
    formAgendamento.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dataInput = document.getElementById('dataEvento').value;
        const dataEscolhida = new Date(dataInput + 'T00:00:00'); 
        const dataHoje = new Date();
        dataHoje.setHours(0, 0, 0, 0); 

        if (dataEscolhida < dataHoje) {
            mostrarNotificacao('Não é possível agendar festas no passado. Escolha uma data válida.', 'aviso');
            return;
        }

        const qtdAdultos = parseInt(document.getElementById('qtdAdultos').value) || 0;
        const qtdCriancasIsentas = parseInt(document.getElementById('qtdCriancasIsentas').value) || 0;
        const qtdCriancasPagam = parseInt(document.getElementById('qtdCriancasPagam').value) || 0;
        const totalPessoas = qtdAdultos + qtdCriancasIsentas + qtdCriancasPagam;

        if (totalPessoas > 500) {
            mostrarNotificacao('A capacidade máxima do buffet é de 500 pessoas. Por favor, reduza a lista de convidados.', 'aviso');
            return;
        }

        const novoAgendamento = {
            data_festa: document.getElementById('dataEvento').value,
            horario_inicio: document.getElementById('horaEvento').value,
            qtd_adultos: parseInt(document.getElementById('qtdAdultos').value),
            qtd_criancas_isentas: parseInt(document.getElementById('qtdCriancasIsentas').value) || 0,
            qtd_criancas_pagantes: parseInt(document.getElementById('qtdCriancasPagam').value) || 0,
            adicional_salada: document.getElementById('adicionalSalada').checked,
            tipo_cardapio: document.getElementById('tipoCardapio').value,
            materiais_fornecidos: "Pratos, talheres, réchaud, guardanapo de papel, carvão e toalha",
            usuario_id: usuarioLogado.id || usuarioLogado.idUsuario 
        };

        try {
            const resposta = await fetch('http://localhost:3000/agendamentos/novo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(novoAgendamento)
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                mostrarNotificacao('Orçamento solicitado com sucesso!', 'sucesso');
                
                const modalElement = document.getElementById('modalNovoAgendamento');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
                
                formAgendamento.reset();

                carregarAgendamentos();
            } else {
                mostrarNotificacao(`Erro: ${dados.erro || 'Não foi possível solicitar o orçamento.'}`, 'erro');

                if (resposta.status === 401 || resposta.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuarioLogado');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                }
            }
        } catch (erro) {
            console.error('Erro ao enviar agendamento:', erro);
            mostrarNotificacao('Falha na comunicação com o servidor.', 'erro');
        }
    });
});