document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('formCadastro');

    if (formCadastro) {
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmarSenha').value;

            if (senha !== confirmarSenha) {
                mostrarNotificacao('As senhas não coincidem. Por favor, verifique e tente novamente.', 'erro');
                return;
            }

            const novoUsuario = {
                nome: nome,
                email: email,
                senha: senha,
                perfil: 'Cliente'
            };

            try {
                const resposta = await fetch('http://localhost:3000/usuarios/cadastro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(novoUsuario)
                });

                const dados = await resposta.json();

                if (resposta.ok) {
                    
                    try {
                        const respostaLogin = await fetch('http://localhost:3000/usuarios/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: email, senha: senha })
                        });

                        const dadosLogin = await respostaLogin.json();

                        if (respostaLogin.ok) {
                            localStorage.setItem('token', dadosLogin.token);
                            localStorage.setItem('usuarioLogado', JSON.stringify(dadosLogin.usuario));

                            mostrarNotificacao('Conta criada com sucesso! Entrando no sistema...', 'sucesso');
                            
                            // Reencaminha para o painel após 1 segundo
                            setTimeout(() => {
                                window.location.href = 'painel.html';
                            }, 1000);
                        } else {
                            
                            // Fallback seguro
                            mostrarNotificacao('Conta criada com sucesso! Por favor, inicie sessão.', 'sucesso');
                            setTimeout(() => {
                                window.location.href = 'login.html';
                            }, 1500);
                        }
                    } catch (erroLogin) {
                        mostrarNotificacao('Conta criada! Redirecionando para a tela de acesso...', 'sucesso');
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1500);
                    }

                } else {
                    mostrarNotificacao(`Erro: ${dados.erro || 'Não foi possível criar a conta.'}`, 'erro');
                }
            } catch (erro) {
                console.error('Erro na requisição:', erro);
                mostrarNotificacao('Erro de comunicação com o servidor.', 'erro');
            }
        });
    }
});