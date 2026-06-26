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
       IDEIA 3: O CONTADOR FLUTUANTE "COMEMORANDO"
       ========================================================= */
    const painelContagem = document.querySelector('.painel-contagem');
    const spanBipados = document.getElementById('qtdBipados');

    if (painelContagem && spanBipados) {
        const observadorContador = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    const quantidade = parseInt(spanBipados.textContent);
                    
                    if (quantidade > 0) {
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
        let resumoVisivel = false; // Memória para saber se já estava na tela

        const observadorResumo = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Checa se o display passou a ser 'block'
                    const isBlock = resumoFlutuante.style.display === 'block';
                    
                    // Se for 'block' e ainda não estava visível, roda a animação
                    if (isBlock && !resumoVisivel) {
                        resumoVisivel = true;
                        
                        // Efeito GSAP: Entra deslizando pela direita com fade-in
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
                    // Se o display voltar para 'none' (ao clicar em Limpar Lista), reseta o estado
                    else if (!isBlock && resumoVisivel) {
                        resumoVisivel = false;
                    }
                }
            });
        });

        // Observa as mudanças no atributo "style" da div
        observadorResumo.observe(resumoFlutuante, { 
            attributes: true, 
            attributeFilter: ['style'] 
        });
    }
});
