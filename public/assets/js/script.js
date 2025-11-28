    // 1. Obter o formulário pelo ID
    const form = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');
    const statusTitle = statusDiv?.querySelector('.status-title');
    const statusMessage = statusDiv?.querySelector('.status-message');
    const statusIcon = statusDiv?.querySelector('.status-icon i');
    const statusProgress = statusDiv?.querySelector('.status-progress');

    function showStatus(type, title, message, iconClass) {
        if (!statusDiv) return;
        statusDiv.hidden = false;
        statusDiv.style.display = 'block';
        statusDiv.classList.remove('success', 'error', 'loading');
        statusDiv.classList.add(type);
        if (statusTitle) statusTitle.textContent = title;
        if (statusMessage) statusMessage.textContent = message;
        if (statusIcon) {
            statusIcon.className = iconClass;
        }
        if (type === 'loading') {
            if (statusProgress) statusProgress.style.display = 'block';
        } else {
            if (statusProgress) statusProgress.style.display = 'none';
        }
    }

    function hideStatus(delay = 6000) {
        if (!statusDiv) return;
        setTimeout(() => {
            statusDiv.style.display = 'none';
            statusDiv.hidden = true;
        }, delay);
    }

    // 2. Adicionar o Listener para o evento de submit
    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Impede o envio padrão (que te levaria para a tela do Formspree)

        showStatus('loading', 'Enviando', 'Enviando sua mensagem... Aguarde.', 'fa-solid fa-circle-notch fa-spin');

        const data = new FormData(form); // Cria um objeto com os dados do formulário
        const params = new URLSearchParams();
        for (const [key, value] of data.entries()) {
            params.append(key, value);
        }
        // Renomeia 'message' -> 'mensagem' para compatibilidade com o backend
        if (params.has('message')) {
            params.set('mensagem', params.get('message'));
            params.delete('message');
        }
        
        try {
            // 3. Enviar os dados para o Formspree usando Fetch API
            const response = await fetch(event.target.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': 'application/json'
                },
                body: params.toString()
            });

            if (response.ok) {
                // 4. Se o envio for bem-sucedido
                showStatus('success', 'Mensagem enviada', '✅ Recebi sua mensagem! Em breve retorno o contato.', 'fa-solid fa-check');
                form.reset(); // Limpa os campos do formulário
                hideStatus(5000);
            } else {
                // 5. Se houver um erro no envio (ex: campos inválidos, limite de envio)
                let responseData = {};
                try { responseData = await response.json(); } catch {}
                const errorMsg = responseData.error || 'Ocorreu um erro no envio. Tente novamente mais tarde.';
                showStatus('error', 'Falha no envio', `❌ ${errorMsg}`, 'fa-solid fa-triangle-exclamation');
            }
        } catch (error) {
            // 6. Se houver um erro de rede (conexão)
            showStatus('error', 'Erro de conexão', '❌ Verifique sua conexão com a internet e tente novamente.', 'fa-solid fa-wifi');
            console.error('Erro de rede:', error);
        }
    });

    
    // Reveal on scroll using IntersectionObserver
    const revealOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px', // start a bit before fully in view
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const delay = el.getAttribute('data-delay');
                if (delay) el.style.setProperty('--delay', `${parseInt(delay, 20)}ms`);
                el.classList.add('show');
                observer.unobserve(el);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal').forEach((el) => {
        // ensure initial hidden state if loaded mid-page
        el.classList.remove('show');
        revealObserver.observe(el);
    });

    // 3D tilt hover for skill cards (no HTML changes required)
    (() => {
        const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (!canHover) return;

        const cards = document.querySelectorAll('.skill');
        const maxTilt = 7; // degrees
        const baseLift = -3; // px

        cards.forEach((card) => {
            let raf = null;
            let rx = 0, ry = 0;

            function apply() {
                card.style.transform = `translateY(${baseLift}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
                raf = null;
            }

            function onEnter() {
                // start with base lift
                card.style.transition = 'transform 150ms ease, box-shadow 150ms ease';
                card.style.transform = `translateY(${baseLift}px)`;
            }

            function onMove(e) {
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2);  // -1 .. 1
                const dy = (e.clientY - cy) / (rect.height / 2); // -1 .. 1
                ry = dx * maxTilt;      // left/right => rotateY
                rx = -dy * maxTilt;     // up/down    => rotateX
                if (!raf) raf = requestAnimationFrame(apply);
            }

            function onLeave() {
                card.style.transition = 'transform 250ms ease, box-shadow 150ms ease';
                card.style.transform = '';
            }

            card.addEventListener('mouseenter', onEnter);
            card.addEventListener('mousemove', onMove);
            card.addEventListener('mouseleave', onLeave);
        });
    })();

