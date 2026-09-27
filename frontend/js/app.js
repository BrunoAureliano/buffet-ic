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

                alert('Login realizado com sucesso!');
                
                if (dados.usuario.tipo === 'Gestor') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'painel.html';
                }
            } else {
                alert(`Erro: ${dados.erro || 'Falha ao realizar login'}`);
            }
        } catch (erro) {
            console.error('Erro na requisição:', erro);
            alert('Erro de conexão com o servidor. Verifique se o back-end está rodando.');
        }
    });
}