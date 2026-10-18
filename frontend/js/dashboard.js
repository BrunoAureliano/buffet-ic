document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificação de Segurança (Apenas usuarios logados)
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Acesso negado. Por favor, inicie sessão.');
        window.location.href = 'login.html';
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

    // 4. Buscar Todos os Agendamentos da Base de Dados
    async function carregarTodosAgendamentos() {
        const tbody = document.getElementById('tabelaAgendamentosAdmin');
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-secundario py-4">A carregar orçamentos...</td></tr>';

        try {
            const resposta = await fetch('http://localhost:3000/agendamentos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const agendamentos = await resposta.json();
            tbody.innerHTML = ''; 

            if (agendamentos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-secundario py-4">Nenhum pedido de orçamento encontrado.</td></tr>';
                return;
            }

            agendamentos.forEach(agendamento => {
                const dataFormatada = new Date(agendamento.data_festa).toLocaleDateString('pt-BR', {timeZone: 'UTC'});
                const totalConvidados = agendamento.qtd_adultos + agendamento.qtd_criancas_isentas + agendamento.qtd_criancas_pagantes;
                
                let corBadge = 'bg-warning text-dark'; 
                if (agendamento.status === 'Aprovado') corBadge = 'bg-success';
                if (agendamento.status === 'Recusado') corBadge = 'bg-danger';

                let botoesAcao = '';
                if (agendamento.status !== 'Aprovado' && agendamento.status !== 'Recusado') {
                    botoesAcao = `
                        <button class="btn btn-success btn-sm me-2 fw-bold" onclick="atualizarStatus(${agendamento.idAgendamento}, 'Aprovado')">Aprovar</button>
                        <button class="btn btn-danger btn-sm fw-bold" onclick="atualizarStatus(${agendamento.idAgendamento}, 'Recusado')">Recusar</button>
                    `;
                } else {
                    botoesAcao = `<span class="text-secundario small">Processado</span>`;
                }

                const linhaHTML = `
                    <tr>
                        <td class="text-bege fw-bold">#${agendamento.idAgendamento}</td>
                        <td class="text-bege">${dataFormatada}</td>
                        <td class="text-bege">${agendamento.horario_inicio}</td>
                        <td class="text-bege">${totalConvidados}</td>
                        <td><span class="badge ${corBadge}">${agendamento.status || 'Aguardando Aprovação'}</span></td>
                        <td class="text-center">${botoesAcao}</td>
                    </tr>
                `;
                tbody.innerHTML += linhaHTML;
            });

        } catch (erro) {
            console.error('Erro ao carregar agendamentos:', erro);
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-4">Erro ao carregar os dados do servidor.</td></tr>';
        }
    }

    // Inicia o carregamento da tabela assim que a página abre
    carregarTodosAgendamentos();

    // 5. Função Global para Atualizar o Estado (Aprovar/Recusar)
    window.atualizarStatus = async function(id, novoStatus) {
        if (!confirm(`Tem a certeza que deseja alterar o estado do pedido #${id} para ${novoStatus.toLowerCase()}?`)) {
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
                alert(`Pedido ${novoStatus.toLowerCase()} com sucesso!`);
                // Recarrega a tabela para atualizar a cor da etiqueta e esconder os botões instantaneamente
                carregarTodosAgendamentos(); 
            } else {
                alert(`Erro: ${dados.erro || 'Não foi possível atualizar o pedido.'}`);
            }
        } catch (erro) {
            console.error('Erro ao atualizar status:', erro);
            alert('Falha na comunicação com o servidor ao tentar atualizar o pedido.');
        }
    };
});