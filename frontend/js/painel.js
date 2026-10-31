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

                // Formatação do Valor Final em Reais
                const valorFormatado = agendamento.valor_final 
                    ? Number(agendamento.valor_final).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : 'A calcular';

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
                            
                            <!-- Nova linha com o Valor Final -->
                            <p class="text-warning mb-1 mt-2 fs-5"><strong>💰 Total: ${valorFormatado}</strong></p>
                            
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

    // --- 5. LÓGICA DE ATUALIZAÇÃO EM TEMPO REAL (CARDÁPIO E PREÇO) ---

    // Dicionário de Cardápios [[[[AINDA TENHO QUE ATUALIZAR]]]]
    const descricoesCardapio = {
        'Churrasco Tradicional': 'Espetinhos de carne, frango e linguiça, arroz branco, farofa da casa e vinagrete.',
        'Churrasco Premium': 'Tudo do Tradicional + pão de alho, queijo coalho, medalhão de frango e picanha.',
        'Festa Infantil': 'Mini hambúrguer, cachorro-quente, batata frita, pipoca e docinhos tradicionais.'
    };

    const selectCardapio = document.getElementById('tipoCardapio');
    const infoCardapio = document.getElementById('infoCardapio');
    const textoCardapio = document.getElementById('textoCardapio');

    selectCardapio.addEventListener('change', (e) => {
        const selecionado = e.target.value;
        if (descricoesCardapio[selecionado]) {
            textoCardapio.textContent = descricoesCardapio[selecionado];
            infoCardapio.classList.remove('d-none');
        } else {
            infoCardapio.classList.add('d-none');
        }
    });

    // Calculadora baseada no banco de dados
    function calcularValorEmTempoReal() {
        const qtdAdultos = parseInt(document.getElementById('qtdAdultos').value) || 0;
        const qtdCriancasPagam = parseInt(document.getElementById('qtdCriancasPagam').value) || 0;
        const adicionalSalada = document.getElementById('adicionalSalada').checked;

        const valorAdultos = qtdAdultos * 65.00;
        const valorCriancas = qtdCriancasPagam * 32.50;
        const taxaSalada = adicionalSalada ? ((qtdAdultos + qtdCriancasPagam) * 10.00) : 0;
        
        const valorFinal = valorAdultos + valorCriancas + taxaSalada;

        document.getElementById('valorEstimadoTela').textContent = valorFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    
    document.getElementById('qtdAdultos').addEventListener('input', calcularValorEmTempoReal);
    document.getElementById('qtdCriancasPagam').addEventListener('input', calcularValorEmTempoReal);
    document.getElementById('adicionalSalada').addEventListener('change', calcularValorEmTempoReal);

    document.getElementById('modalNovoAgendamento').addEventListener('shown.bs.modal', calcularValorEmTempoReal);


    // --- 6. Envio do Formulário de Novo Agendamento ---
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
                infoCardapio.classList.add('d-none');
                calcularValorEmTempoReal();

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