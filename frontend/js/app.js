const formLogin = document.getElementById('formLogin');

if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault(); // Impede o recarregamento padrão da página

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            const resposta = await fetch('http://localhost:3000/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                // Salva o token JWT e os dados do usuário no Local Storage do navegador
                localStorage.setItem('token', dados.token);
                localStorage.setItem('usuarioLogado', JSON.stringify(dados.usuario));

                mostrarNotificacao('Login realizado com sucesso!', 'sucesso');
                
                // Aguarda 1 segundo para o usuário ler a mensagem antes de redirecionar
                setTimeout(() => {
                    if (dados.usuario.perfil === 'gestor') {
                        window.location.href = 'dashboard.html';
                    } else {
                        window.location.href = 'painel.html';
                    }
                }, 1000);
                
            } else {
                mostrarNotificacao(`Erro: ${dados.erro || 'Falha ao realizar login'}`, 'erro');
            }
        } catch (erro) {
            console.error('Erro na requisição:', erro);
            mostrarNotificacao('Erro de conexão com o servidor. Verifique se o back-end está rodando.', 'erro');
        }
    });
}