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
                alert('As senhas não coincidem. Por favor, verifique e tente novamente.');
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

                            // Reencaminha para o painel
                            window.location.href = 'painel.html';
                        } else {
                            
                            // Fallback seguro
                            alert('Conta criada com sucesso! Por favor, inicie sessão.');
                            window.location.href = 'login.html';
                        }
                    } catch (erroLogin) {
                        alert('Conta criada! Redirecionando para a tela de acesso...');
                        window.location.href = 'login.html';
                    }

                } else {
                    alert(`Erro: ${dados.erro || 'Não foi possível criar a conta.'}`);
                }
            } catch (erro) {
                console.error('Erro na requisição:', erro);
                alert('Erro de comunicação com o servidor.');
            }
        });
    }
});