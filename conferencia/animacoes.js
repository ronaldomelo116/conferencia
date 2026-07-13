document.addEventListener("DOMContentLoaded", () => {
    const nsList = document.getElementById('nsList');
    if (!nsList) return;

    /* =========================================================
       IDEIA 1: ENTRADA EM CASCATA (STAGGER) NA LISTA
       ========================================================= */
    let itensParaAnimar = [];
    let timerAnimacao = null;

    const observadorLista = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'LI' && node.id !== 'mensagemVazia') {
                        gsap.set(node, { opacity: 0, y: 15 });
                        itensParaAnimar.push(node);
                    }
                });
            }
        });

        if (itensParaAnimar.length > 0) {
            clearTimeout(timerAnimacao);
            timerAnimacao = setTimeout(() => {
                gsap.to(itensParaAnimar, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    stagger: 0.03,
                    ease: "power2.out",
                    clearProps: "opacity,y" 
                });
                itensParaAnimar = [];
            }, 50);
        }
    });

    observadorLista.observe(nsList, { childList: true });

    /* =========================================================
       IDEIA 2: FEEDBACK TÁTIL VISUAL AO BIPAR (POP & COLOR)
       ========================================================= */
    const observadorBipe = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const linha = mutation.target;
                
                if (linha.classList.contains('verificado') && !linha.dataset.animadoBipe) {
                    linha.dataset.animadoBipe = "true"; 

                    gsap.fromTo(linha,
                        { scale: 0.96, backgroundColor: "#fbbc04" }, 
                        { 
                            scale: 1, 
                            backgroundColor: "#137333", 
                            duration: 0.5, 
                            ease: "back.out(2)", 
                            clearProps: "scale,backgroundColor" 
                        }
                    );
                }
            }
        });
    });

    observadorBipe.observe(nsList, { 
        attributes: true, 
        subtree: true, 
        attributeFilter: ['class'] 
    });

    /* =========================================================
       IDEIAS 3 E 6: CONTADOR PULANDO + BRILHO DE 100% CONCLUÍDO
       ========================================================= */
    const painelContagem = document.querySelector('.painel-contagem');
    const spanBipados = document.getElementById('qtdBipados');
    const spanTotal = document.getElementById('qtdTotal');

    if (painelContagem && spanBipados && spanTotal) {
        const observadorContador = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const bipados = parseInt(spanBipados.textContent);
                    const total = parseInt(spanTotal.textContent);
                    
                    if (bipados > 0 && bipados < total) {
                        // Pulso normal a cada bipe
                        gsap.fromTo(painelContagem,
                            { scale: 1.15, borderColor: "#137333" }, 
                            { 
                                scale: 1, 
                                borderColor: "var(--primary-color)", 
                                duration: 0.4, 
                                ease: "back.out(1.5)", 
                                clearProps: "scale,borderColor" 
                            }
                        );
                    } else if (bipados > 0 && bipados === total) {
                        // COMEMORAÇÃO DE 100%: Pulso maior e sombra neon verde
                        gsap.fromTo(painelContagem,
                            { scale: 1.2, backgroundColor: "#137333", color: "#ffffff" }, 
                            { 
                                scale: 1, 
                                backgroundColor: "var(--bg-section)", 
                                color: "var(--text-title)",
                                boxShadow: "0 0 30px rgba(19, 115, 51, 0.8)", // Glow Verde
                                duration: 1.5, 
                                ease: "elastic.out(1, 0.3)",
                                clearProps: "scale,backgroundColor,color,boxShadow"
                            }
                        );
                    }
                }
            });
        });

        observadorContador.observe(spanBipados, { 
            childList: true, 
            characterData: true, 
            subtree: true 
        });
    }

    /* =========================================================
       IDEIA 4: APARIÇÃO SOFISTICADA DA CAIXA DE RESUMO
       ========================================================= */
    const resumoFlutuante = document.getElementById('resumoFlutuante');
    
    if (resumoFlutuante) {
        let resumoVisivel = false; 

        const observadorResumo = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const isBlock = resumoFlutuante.style.display === 'block';
                    
                    if (isBlock && !resumoVisivel) {
                        resumoVisivel = true;
                        
                        gsap.fromTo(resumoFlutuante,
                            { opacity: 0, x: 50 },
                            { 
                                opacity: 1, 
                                x: 0, 
                                duration: 0.5, 
                                ease: "power3.out", 
                                clearProps: "opacity,x" 
                            }
                        );
                    } 
                    else if (!isBlock && resumoVisivel) {
                        resumoVisivel = false;
                    }
                }
            });
        });

        observadorResumo.observe(resumoFlutuante, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }

    /* =========================================================
       IDEIA 5: FEEDBACK DE ERRO (SHAKE NA BARRA DE BUSCA)
       ========================================================= */
    const alertBox = document.getElementById('alert-box');
    const searchBar = document.getElementById('searchBar');

    if (alertBox && searchBar) {
        const observadorErro = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    if (alertBox.style.display === 'block') {
                        // Shake rápido para esquerda e direita indicando erro
                        gsap.fromTo(searchBar, 
                            { x: -8, borderColor: "#c5221f" }, 
                            { 
                                x: 8, 
                                duration: 0.1, 
                                repeat: 3, 
                                yoyo: true, 
                                ease: "power1.inOut",
                                onComplete: () => {
                                    gsap.set(searchBar, { x: 0, clearProps: "borderColor" });
                                }
                            }
                        );
                    }
                }
            });
        });
        
        observadorErro.observe(alertBox, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }

    /* =========================================================
       IDEIA 7: BOTÕES COM FÍSICA DE MOLA (SQUISH)
       ========================================================= */
    const botoes = document.querySelectorAll('.btn-limpar, .btn-pdf, .btn-carregar, .theme-toggle');
    
    botoes.forEach(btn => {
        // Quando aperta o botão, ele afunda
        btn.addEventListener('mousedown', () => {
            gsap.to(btn, { scale: 0.92, duration: 0.1, ease: "power1.out" });
        });
        
        // Quando solta, ele volta dando um leve quique
        btn.addEventListener('mouseup', () => {
            gsap.to(btn, { scale: 1, duration: 0.4, ease: "back.out(2)" });
        });
        
        // Se arrastar o mouse para fora antes de soltar o clique
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { scale: 1, duration: 0.4, ease: "back.out(2)" });
        });
    });
});
/* =========================================================
       IDEIA 11: EFEITO SANFONA (ACCORDION) NA ÁREA DE UPLOAD
       ========================================================= */
    const toggleUploadBtn = document.getElementById('toggleUploadBtn');
    const uploadContent = document.getElementById('uploadContent');
    const toggleIcon = toggleUploadBtn ? toggleUploadBtn.querySelector('.toggle-icon') : null;

    if (toggleUploadBtn && uploadContent) {
        let isUploadOpen = true; // O sistema começa com a caixa aberta

        toggleUploadBtn.addEventListener('click', () => {
            isUploadOpen = !isUploadOpen; // Inverte o estado (Aberto <-> Fechado)

            if (isUploadOpen) {
                // 1. ABRIR: Aumenta a altura para "auto" e gira a seta de volta
                gsap.to(uploadContent, { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" });
                gsap.to(toggleIcon, { rotation: 0, duration: 0.3 });
                
                // 2. CASCATA: Faz os botões e a caixa de texto caírem suavemente um por um
                gsap.fromTo(uploadContent.children, 
                    { opacity: 0, y: -15 }, 
                    { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: "power2.out", delay: 0.1 }
                );
            } else {
                // 3. FECHAR: Encolhe a altura para zero e gira a seta para cima
                gsap.to(uploadContent, { height: 0, opacity: 0, duration: 0.4, ease: "power2.inOut" });
                gsap.to(toggleIcon, { rotation: -180, duration: 0.3 });
            }
        });
    }
