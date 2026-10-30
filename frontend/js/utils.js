window.mostrarNotificacao = function(mensagem, tipo = 'sucesso') {
    // 1. Verifica se já existe a caixa de notificações na tela. Se não, cria uma.
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        // Posiciona no canto superior direito
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
    }

    // 2. Define as cores do Bootstrap baseadas no tipo (sucesso, erro ou aviso)
    let corFundo = 'bg-success';
    if (tipo === 'erro') corFundo = 'bg-danger';
    if (tipo === 'aviso') corFundo = 'bg-warning text-dark';

    const corTexto = tipo === 'aviso' ? '' : 'text-white';

    // 3. Monta o HTML da notificação (Toast)
    const toastHTML = `
        <div class="toast align-items-center ${corFundo} ${corTexto} border-0 mb-2 shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-bold">
                    ${mensagem}
                </div>
                <button type="button" class="btn-close ${tipo !== 'aviso' ? 'btn-close-white' : ''} me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
            </div>
        </div>
    `;

    // 4. Joga a notificação na tela e ativa usando o Bootstrap
    container.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = container.lastElementChild;
    
    // 3000 milissegundos = 3 segundos na tela
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    // 5. Limpeza: remove o elemento do HTML depois que ele sumir da tela
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
};