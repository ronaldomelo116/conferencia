const themeToggleBtn = document.getElementById('themeToggleBtn');
const savedTheme = localStorage.getItem('themeBrisanet') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
atualizarBotaoTema(savedTheme);

themeToggleBtn.addEventListener('click', () => {
    let currentTheme = document.documentElement.getAttribute('data-theme');
    let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('themeBrisanet', newTheme);
    atualizarBotaoTema(newTheme);
});

function atualizarBotaoTema(theme) {
    if (theme === 'light') {
        themeToggleBtn.innerHTML = '🌙 Modo Escuro';
    } else {
        themeToggleBtn.innerHTML = '☀️ Modo Claro';
    }
}

const fileInput = document.getElementById('txtFile');
const btnLimpar = document.getElementById('btnLimpar');
const btnBaixarPDF = document.getElementById('btnBaixarPDF');
const searchBar = document.getElementById('searchBar');
const inputTransacao = document.getElementById('inputTransacao'); 
const nsList = document.getElementById('nsList');
const listHeader = document.getElementById('listHeader');
const alertBox = document.getElementById('alert-box');
const alertWarning = document.getElementById('alert-warning');
const infoFiltro = document.getElementById('info-filtro');
const spanBipados = document.getElementById('qtdBipados');
const spanTotal = document.getElementById('qtdTotal');

const pasteArea = document.getElementById('pasteArea');
const btnCarregarTexto = document.getElementById('btnCarregarTexto');

let totalItens = 0;
let itensBipados = 0;
let typingTimer;
const tempoDeEspera = 150; 

let estoqueDados = []; 

let currentSortColumn = -1;
let currentSortDirection = 'asc';

window.onload = function() {
    const dadosSalvos = localStorage.getItem('dadosConferenciaBrisanet');
    if (dadosSalvos) {
        estoqueDados = JSON.parse(dadosSalvos);
        if (estoqueDados.length > 0) {
            renderizarDaMemoria();
            btnLimpar.disabled = false;
            btnBaixarPDF.disabled = false;
        }
    }
    
    const transacaoSalva = localStorage.getItem('codigoTransacaoBrisanet');
    if (transacaoSalva) {
        inputTransacao.value = transacaoSalva;
    }
};

function salvarNaMemoria() {
    localStorage.setItem('dadosConferenciaBrisanet', JSON.stringify(estoqueDados));
}

inputTransacao.addEventListener('input', function() {
    localStorage.setItem('codigoTransacaoBrisanet', this.value.trim());
});

btnLimpar.addEventListener('click', function() {
    nsList.innerHTML = '<li id="mensagemVazia" class="mensagem-vazia">Os itens da transação aparecerão aqui organizados em colunas.</li>';
    listHeader.style.display = 'none'; 
    
    totalItens = 0;
    itensBipados = 0;
    spanTotal.textContent = totalItens;
    spanBipados.textContent = itensBipados;
    spanBipados.style.color = 'var(--primary-color)'; 
    
    fileInput.value = '';
    pasteArea.value = ''; 
    searchBar.value = '';
    searchBar.disabled = true;
    btnLimpar.disabled = true;
    btnBaixarPDF.disabled = true; 
    
    inputTransacao.value = '';
    localStorage.removeItem('codigoTransacaoBrisanet');
    
    alertBox.style.display = 'none';
    alertWarning.style.display = 'none';
    infoFiltro.style.display = 'none';
    
    document.querySelectorAll('.sortable').forEach(h => {
        h.classList.remove('active');
        h.querySelector('.sort-icon').textContent = '↕';
    });
    currentSortColumn = -1;

    estoqueDados = [];
    localStorage.removeItem('dadosConferenciaBrisanet');
    
    // Esconde o resumo flutuante ao limpar a lista
    document.getElementById('resumoFlutuante').style.display = 'none';
});

function processarConteudo(content) {
    let linhas = content.split(/\r?\n/).filter(line => line.trim() !== '');
    
    if (linhas.length > 0 && linhas[0].toLowerCase().includes('código')) {
        linhas.shift(); 
    }

    let novosDados = linhas.map(linha => {
        return {
            linhaOriginal: linha.trim(),
            linhaUpper: linha.trim().toUpperCase(),
            verificado: false,
            dataConferencia: null
        };
    });

    estoqueDados = estoqueDados.concat(novosDados);

    salvarNaMemoria(); 
    renderizarDaMemoria(); 
    btnLimpar.disabled = false;
    btnBaixarPDF.disabled = false; 
    
    pasteArea.value = '';
}

fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        processarConteudo(e.target.result);
        fileInput.value = ''; 
    };
    reader.readAsText(file);
});

btnCarregarTexto.addEventListener('click', function() {
    const textoColado = pasteArea.value;
    if (!textoColado.trim()) {
        alert('Por favor, cole os dados da tabela na caixa de texto primeiro!');
        pasteArea.focus();
        return;
    }
    processarConteudo(textoColado);
});

document.querySelectorAll('.sortable').forEach(header => {
    header.addEventListener('click', () => {
        const colIndex = parseInt(header.dataset.col);
        
        if (currentSortColumn === colIndex) {
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            currentSortColumn = colIndex;
            currentSortDirection = 'asc';
        }

        document.querySelectorAll('.sortable').forEach(h => {
            h.classList.remove('active');
            h.querySelector('.sort-icon').textContent = '↕';
        });
        header.classList.add('active');
        header.querySelector('.sort-icon').textContent = currentSortDirection === 'asc' ? '▲' : '▼';

        renderizarDaMemoria();
    });
});

function getColValue(item, colIndex) {
    if (colIndex === 8) return item.verificado ? 'OK' : 'Pendente';

    let limpo = item.linhaOriginal.replace(/"/g, ''); 
    let separador = '\t';
    if (limpo.includes('\t')) separador = '\t';
    else if (limpo.includes(';')) separador = ';';
    else if (limpo.includes(',')) separador = ',';

    let colunas = limpo.split(separador);
    let val = colunas[colIndex] ? colunas[colIndex].trim() : '-';

    if (colIndex === 1 && item.dataConferencia) {
        val = item.dataConferencia.replace(/<[^>]*>?/gm, ' '); 
    }
    return val;
}

btnBaixarPDF.addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); 
    
    doc.setFontSize(16);
    
    const codTransacao = inputTransacao.value.trim();
    let tituloPDF = "Relatório de Conferência de transações";
    
    if (codTransacao) {
        tituloPDF += ` - Transação: ${codTransacao}`;
    }
    doc.text(tituloPDF, 14, 15);
    
    doc.setFontSize(11);
    doc.text(`Total de Itens: ${totalItens}  |  Conferidos: ${itensBipados}  |  Pendentes: ${totalItens - itensBipados}`, 14, 23);

    const tableColumn = ["Código", "Data", "Nome do Equipamento", "Nº Série", "Nº Série Interno", "Estado", "Qtd", "Funcionário", "Status"];
    const tableRows = [];

    estoqueDados.forEach(item => {
        let limpo = item.linhaOriginal.replace(/"/g, ''); 
        let separador = '\t';
        if (limpo.includes('\t')) separador = '\t';
        else if (limpo.includes(';')) separador = ';';
        else if (limpo.includes(',')) separador = ',';

        let colunas = limpo.split(separador);
        
        if (item.dataConferencia) {
            colunas[1] = item.dataConferencia.replace(/<br>/g, '\n').replace(/<[^>]*>?/gm, '');
        }
        
        let rowData = [];
        for(let i = 0; i < 8; i++) {
            rowData.push(colunas[i] ? colunas[i].trim() : '-');
        }
        
        rowData.push(item.verificado ? 'OK' : 'Pendente');
        tableRows.push(rowData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 28,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [243, 112, 33] },
        didParseCell: function(data) {
            if (data.column.index === 8) {
                if (data.cell.raw === 'OK') {
                    data.cell.styles.textColor = [19, 115, 51]; 
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [197, 34, 31]; 
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        }
    });

    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    
    let fileName = codTransacao 
        ? `Transacao_${codTransacao}_${dia}-${mes}-${ano}.pdf` 
        : `Relatorio_Estoque_${dia}-${mes}-${ano}.pdf`;
        
    doc.save(fileName);
});

function renderizarDaMemoria() {
    nsList.innerHTML = ''; 
    listHeader.style.display = 'flex'; 
    
    totalItens = estoqueDados.length;
    itensBipados = estoqueDados.filter(item => item.verificado).length; 
    
    spanTotal.textContent = totalItens;
    spanBipados.textContent = itensBipados;
    spanBipados.style.color = (itensBipados === totalItens && totalItens > 0) ? '#137333' : 'var(--primary-color)'; 

    if (currentSortColumn !== -1) {
        estoqueDados.sort((a, b) => {
            let valA = getColValue(a, currentSortColumn);
            let valB = getColValue(b, currentSortColumn);

            if (currentSortDirection === 'asc') {
                return valA.localeCompare(valB, undefined, {numeric: true, sensitivity: 'base'});
            } else {
                return valB.localeCompare(valA, undefined, {numeric: true, sensitivity: 'base'});
            }
        });
    }

    estoqueDados.forEach((item, index) => {
        let limpo = item.linhaOriginal.replace(/"/g, ''); 
        
        let separador = '\t';
        if (limpo.includes('\t')) separador = '\t';
        else if (limpo.includes(';')) separador = ';';
        else if (limpo.includes(',')) separador = ',';

        let colunas = limpo.split(separador);

        if (item.dataConferencia) {
            colunas[1] = item.dataConferencia;
        }

        let colsHTML = '';
        for(let i = 0; i < 8; i++) {
            let valor = colunas[i] ? colunas[i].trim() : '-';
            
            if(i === 1) { 
                let titleAjustado = valor.replace(/<[^>]*>?/gm, ' ');
                colsHTML += `<div class="col-text" style="white-space: normal; line-height: 1.3; font-size: 13px;" title="${titleAjustado}">${valor}</div>`;
            } else if(i === 3) { 
                colsHTML += `<div class="col-text col-ns" title="${valor}">${valor}</div>`;
            } else { 
                colsHTML += `<div class="col-text" title="${valor}">${valor}</div>`;
            }
        }

        const li = document.createElement('li');
        li.dataset.index = index; 
        li.dataset.linhaRaw = item.linhaUpper; 
        
        if (item.verificado) {
            li.classList.add('verificado');
            li.innerHTML = `
                <div class="grid-row">${colsHTML}</div>
                <div class="status-container">
                    <span class="status-badge">OK</span>
                </div>
            `;
        } else {
            li.innerHTML = `
                <div class="grid-row">${colsHTML}</div>
                <div class="status-container">
                    <span class="status-badge">Pendente</span>
                </div>
            `;
        }
        nsList.appendChild(li);
    });

    searchBar.disabled = false;
    searchBar.focus();

    if (searchBar.value.trim() !== '') {
        searchBar.dispatchEvent(new Event('input')); 
    }
    
    // Atualiza o resumo flutuante sempre que a tela for renderizada
    atualizarResumo();
}

searchBar.addEventListener('input', function() {
    clearTimeout(typingTimer); 
    const termo = this.value.trim().toUpperCase();
    const items = nsList.querySelectorAll('li');
    
    alertBox.style.display = 'none';
    alertWarning.style.display = 'none';
    infoFiltro.style.display = 'none';

    if (!termo) {
        items.forEach(li => {
            li.classList.remove('destaque-busca', 'piscar-aviso');
            if (li.id !== 'mensagemVazia') li.style.display = 'flex'; 
        });
        return;
    }

    let pendentes = [];
    let jaVerificados = [];
    let totalEncontrados = 0;

    items.forEach(li => {
        li.classList.remove('destaque-busca', 'piscar-aviso');

        if (li.dataset.linhaRaw.includes(termo)) {
            totalEncontrados++;
            li.style.display = 'flex'; 
            
            if (!li.classList.contains('verificado')) {
                pendentes.push(li);
                li.classList.add('destaque-busca'); 
            } else {
                jaVerificados.push(li);
            }
        } else {
            li.style.display = 'none';
        }
    });

    if (totalEncontrados > 0) {
        infoFiltro.innerHTML = `🔍 Mostrando <strong>${totalEncontrados}</strong> item(ns) encontrado(s) com "${termo}".`;
        infoFiltro.style.display = 'block';
        infoFiltro.className = 'info-filtro-encontrado'; 
    } else {
        infoFiltro.innerHTML = `⚠️ Nenhum item correspondente para "<strong>${termo}</strong>".`;
        infoFiltro.style.display = 'block';
        infoFiltro.className = 'info-filtro-erro'; 
    }

    typingTimer = setTimeout(() => {
        const pareceCodigoBarras = !termo.includes(' ') && termo.length >= 4;

        if (pareceCodigoBarras) {
            if (pendentes.length === 1) {
                confirmarItem(pendentes[0], pendentes[0].dataset.index);
            } 
            else if (pendentes.length === 0 && jaVerificados.length === 1) {
                dispararAvisoVerificado(jaVerificados[0]);
            }
        }
    }, tempoDeEspera);
});

searchBar.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(typingTimer);
        const termo = this.value.trim().toUpperCase();
        if (!termo) return;

        const items = nsList.querySelectorAll('li');
        let matchPendente = null;
        let matchVerificado = null;

        items.forEach(li => {
            if (li.dataset.linhaRaw.includes(termo)) {
                if (!li.classList.contains('verificado')) {
                    if (!matchPendente) matchPendente = li; 
                } else {
                    if (!matchVerificado) matchVerificado = li;
                }
            }
        });

        if (matchPendente) confirmarItem(matchPendente, matchPendente.dataset.index);
        else if (matchVerificado) dispararAvisoVerificado(matchVerificado);
        else dispararErro(); 
    }
});

function confirmarItem(li, index) {
    li.classList.remove('destaque-busca');
    li.classList.add('verificado');
    li.querySelector('.status-badge').textContent = 'OK';
    
    const dataAtual = new Date();
    const dataStr = dataAtual.toLocaleDateString('pt-BR');
    const horaStr = dataAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dataFormatada = `${dataStr}<br><span style="font-size: 0.9em; opacity: 0.85;">${horaStr}</span>`;
    
    estoqueDados[index].verificado = true;
    estoqueDados[index].dataConferencia = dataFormatada;
    
    salvarNaMemoria();
    
    // Atualiza a caixinha de resumo quando um item for bipado
    atualizarResumo(); 

    const colunasDOM = li.querySelectorAll('.col-text');
    if (colunasDOM.length > 1) {
        colunasDOM[1].innerHTML = dataFormatada;
        colunasDOM[1].title = `${dataStr} as ${horaStr}`;
    }

    itensBipados++;
    spanBipados.textContent = itensBipados;
    
    if (itensBipados === totalItens) {
        spanBipados.style.color = '#137333';
    }
    
    limparBarraERestaurarLista();
}

function dispararAvisoVerificado(li) {
    li.style.display = 'flex';
    li.classList.add('piscar-aviso');
    li.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    alertWarning.style.display = 'block';
    infoFiltro.style.display = 'none'; 
    
    let audio = new Audio('https://www.soundjay.com/buttons/sounds/beep-07a.mp3');
    audio.play().catch(() => {}); 
    
    searchBar.select();
}

function dispararErro() {
    alertBox.style.display = 'block';
    infoFiltro.style.display = 'none';
    
    let audio = new Audio('https://www.soundjay.com/buttons/sounds/beep-07a.mp3');
    audio.play().catch(() => {}); 
    
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 3000);
    
    searchBar.select(); 
}

function limparBarraERestaurarLista() {
    searchBar.value = '';
    searchBar.focus();
    searchBar.dispatchEvent(new Event('input')); 
}

// NOVA FUNÇÃO: Atualiza os dados da caixa flutuante de resumo
function atualizarResumo() {
    const resumoFlutuante = document.getElementById('resumoFlutuante');
    const listaResumo = document.getElementById('listaResumo');

    if (estoqueDados.length === 0) {
        resumoFlutuante.style.display = 'none';
        return;
    }

    resumoFlutuante.style.display = 'block';
    const contagem = {};

    // Varre a lista e conta os nomes (Coluna 2)
    estoqueDados.forEach(item => {
        let limpo = item.linhaOriginal.replace(/"/g, ''); 
        let separador = '\t';
        if (limpo.includes('\t')) separador = '\t';
        else if (limpo.includes(';')) separador = ';';
        else if (limpo.includes(',')) separador = ',';

        let colunas = limpo.split(separador);
        let nome = colunas[2] ? colunas[2].trim() : 'Equipamento Desconhecido';

        if (!contagem[nome]) {
            contagem[nome] = { total: 0, verificados: 0 };
        }
        contagem[nome].total++;
        if (item.verificado) {
            contagem[nome].verificados++;
        }
    });

    // Limpa e renderiza a lista na tela em ordem alfabética
    listaResumo.innerHTML = '';
    const nomesOrdenados = Object.keys(contagem).sort();

    nomesOrdenados.forEach(nome => {
        const info = contagem[nome];
        const li = document.createElement('li');
        li.className = 'resumo-item';

        // Mostra algo como "2 / 5" ou "5 / 5"
        const textoBadge = `${info.verificados} / ${info.total}`;
        const classeBadge = info.verificados === info.total ? 'resumo-qtd completo' : 'resumo-qtd';

        li.innerHTML = `
            <span class="resumo-nome" title="${nome}">${nome}</span>
            <span class="${classeBadge}">${textoBadge}</span>
        `;
        listaResumo.appendChild(li);
    });
}
