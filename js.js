// ADICIONADO: evita variável global implícita
let produtos = [];

// CONTROLE DE ACESSO
let acessoLiberado = false;

// PIN (simples "ofuscado" com base64)

//const PIN_HASH = btoa(""); // "MTAxMA==" Apagar essa linha se usar na 
// produção e colocar o hash direto, sem mostrar o valor original

const PIN_HASH = "MTAxMA==";

const STORAGE_KEY = "acesso_status";


// A
// ----------------------------------------------------------------------------

// B
// ----------------------------------------------------------------------------

// C
function controlarBotoes() {
    let botoes = document.querySelectorAll("button");
    let inputs = document.querySelectorAll("input");

    botoes.forEach(btn => {

        // NÃO bloqueia botões que não são ações
        if (btn.innerText.includes("Salvar") ||
            btn.innerText.includes("Excluir") ||
            btn.innerText.includes("Limpar") ||
            btn.innerText.includes("Editar")) {

            btn.disabled = !acessoLiberado;
        }
    });

    inputs.forEach(input => {

        // NÃO bloqueia campos que não são ações
        if (input.id !== "filtro") {
            input.disabled = !acessoLiberado;
        }
    });


}



function carregarLocalizacoes() {
    fetch('gerencia.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'acao=prateleiras'
    })
        .then(res => res.json())
        .then(data => {
            const datalist = document.getElementById("localizacoes");
            datalist.innerHTML = "";

            data.forEach(loc => {
                let option = document.createElement("option");
                option.value = loc;
                datalist.appendChild(option);
            });
        });
}
// ----------------------------------------------------------------------------

// D
// ----------------------------------------------------------------------------

// E
// escapeHTML Faz proteção contra XSS
function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]));
}

// EDITAR
function editar(id) {
    post('gerencia.php', {
        acao: 'buscar',
        id: id
    })
        .then(p => {
            document.getElementById('id').value = p.id;
            document.getElementById('descricao').value = p.descricao;
            document.getElementById('quantidade').value = p.quantidade;
            document.getElementById('unidade').value = p.unidade;
            document.getElementById('valor').value = p.valor;
            document.getElementById('localizacao').value = p.localizacao;
            document.getElementById('descricao').focus();
        });
}

// EXCLUIR
function excluir(id) {

    if (confirm('Excluir registro nº ' + id + '?')) {
        post('gerencia.php', {
            acao: 'excluir',
            id: id
        })
            .then(() => listar());
    }
}
// ----------------------------------------------------------------------------

// F
// FORMATAÇÃO DE MOEDA
function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// FORMATAÇÃO DE DATA
// function formatarData(dataStr) {
//     const data = new Date(dataStr);
//     return data.toLocaleDateString('pt-BR');
// }

// essa é à prova de fuso horário
// function formatarData(dataStr) {
//     const [ano, mes, dia] = dataStr.split(" ")[0].split("-");
//     return `${dia}/${mes}/${ano.slice(-2)}`;
// }
function formatarData(dataStr) {
    const data = new Date(dataStr + "T00:00:00"); // força horário local
    // const data = new Date(dataStr.replace(" ", "T")); // evita problema de compatibilidade
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}

// FORMATAÇÃO DE DATA BR para ISO (para enviar ao servidor)
function formatarBrParaISO(dataBR) {
    const [dia, mes, ano] = dataBR.split("/");
    return `${ano}-${mes}-${dia}`;
}

// FILTRAR POR DATA (exemplo de uso: filtrarPorData(produtos, "2026-03-29"))
function filtrarPorData(lista, dataFiltro) {
    return lista.filter(item => {
        const dataItem = item.criado_em.split(" ")[0]; // "2026-03-29"
        return dataItem === dataFiltro;
    });
}


// FILTRAR TABELA
function filtrarTabela() {
    let filtro = document.getElementById('filtro').value.toLowerCase().replace(',', '.');

    let html = '';

    // filtra o array produtos
    let filtrados = produtos.filter(p => {
        let quantidade = String(p.quantidade);  // quantidade (10)
        let unidade = String(p.unidade);        // unidade (kg, g, L, etc.)
        // let valor = String(p.valor);            // valor real (10.5)
        // let valorFormatado = Number(p.valor)
        //     .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        //     .toLowerCase();
        let localizacao = String(p.localizacao); // localização (ex: P1 F2)
        // let alterado_em = String(p.alterado_em); // data de alteração (ex: 2024-08-01 12:34:56)
        let alterado_em = formatarData(p.alterado_em).toLowerCase();
        let dataFormatada = formatarData(p.alterado_em).toLowerCase();
        let dataOriginal = String(p.alterado_em).toLowerCase();

        return (
            p.descricao.toLowerCase().includes(filtro) ||
            String(p.id).includes(filtro) ||
            quantidade.includes(filtro) ||
            unidade.toLowerCase().includes(filtro) ||
            // valor.includes(filtro) ||                       // 10.5
            // valorFormatado.includes(filtro) ||              // R$ 10,50
            localizacao.toLowerCase().includes(filtro) ||   // P1 F2
            alterado_em.includes(filtro) ||
            dataOriginal.includes(filtro) ||
            dataFormatada.includes(filtro)
        );
    });

    if (filtrados.length === 0) {
        html = `<tr><td colspan="5" class="w3-center">Nenhum produto encontrado</td></tr>`;
    } else {
        filtrados.forEach(p => {

            //let classeData = maisDe90Dias(p.alterado_em) ? 'w3-text-red' : '';
            const data = new Date(p.alterado_em.replace(" ", "T"));
            const hoje = new Date();
            //const dias = (hoje - data) / (1000 * 60 * 60 * 24);
            const dias = Math.floor((hoje - data) / (1000 * 60 * 60 * 24));

            let classeData = '';
            let n1 = '<b>';
            let n2 = '</b>';

            if (dias > 90) {
                classeData = 'w3-text-red';
            } else if (dias > 60) {
                classeData = 'w3-text-orange';
            } else if (dias > 30) {
                classeData = 'w3-text-blue';
            } else {
                n1 = '';
                n2 = '';
                classeData = 'w3-text-black'; // opcional (já é padrão)
            }

            html += `
            <tr>
                <td class="w3-right-align">${p.id}</td>                
                <td class="w3-center">
                    <img src="uploads/${p.foto || 'sem-foto.jpg'}" style="width:50px;height:50px;object-fit:cover;" onmouseover="mostrarPreview(event, this.src)" onmouseout="ocultarPreview()">
                </td>                
                <td class="w3-left-align">${escapeHTML(p.descricao)}</td>
                <td class="w3-right-align">${Number(p.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })}</td>
                
                <!-- <td class="w3-center">${p.unidade}</td> -->
                <!-- <td class="w3-right-align">${Number(p.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td> -->
                <td class="w3-center">${escapeHTML(p.localizacao)}</td>                
                <!-- <td class="w3-center">${formatarData(p.alterado_em)}</td> -->
                <td class="w3-center ${classeData}">${n1}${formatarData(p.alterado_em)}${n2}</td>
                <!-- <td class="w3-center">${p.unidade}</td> -->
                <td class="w3-center">
                    <button class="w3-button w3-yellow w3-small w3-round-large" onclick="editar(${p.id})">Editar</button>
                    <button class="w3-button w3-red w3-small w3-round-large" onclick="excluir(${p.id})">Excluir</button>
                </td>
            </tr>`;
        });
    }

    document.getElementById('tabela').innerHTML = html;

    let total = produtos.length;
    let filtradosCount = filtrados.length;

    if (total < 1) {
        document.getElementById('totalRegistros').innerHTML = `Mostrando ${filtradosCount} de ${total} registro`;
    } else {
        document.getElementById('totalRegistros').innerHTML = `Mostrando ${filtradosCount} de ${total} registros`;
    }
    // ADICIONADO: garantir estado dos botões após renderização
    controlarBotoes();
}
// ----------------------------------------------------------------------------

// L
// LISTAR
function listar() {

    let inicio = performance.now();

    post('gerencia.php', {
        acao: 'listar'
    }).then(res => {

        // CORREÇÃO: novo formato vindo do PHP
        produtos = res.dados;

        // ADICIONADO: tempo do servidor
        if (res.tempo !== undefined) {
            document.getElementById('tempo').innerHTML =
                `Servidor: ${res.tempo} ms`;
        }

        filtrarTabela();

        let fim = performance.now();
        let tempo = (fim - inicio).toFixed(2);

        // MELHORIA: tempo total
        document.getElementById('tempo').innerHTML +=
            ` | Total: ${tempo} ms`;

    }).catch(err => {
        console.error("Erro no listar:", err);
    });
}

// LIMPAR
function limpar() {
    document.getElementById('id').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = 0;
    document.getElementById('filtro').value = '';
    document.getElementById('descricao').focus();
    document.getElementById('quantidade').value = '';
    // document.getElementById('unidade').value = '';
    document.getElementById('unidade').value = 'un'; // valor padrão
    document.getElementById('localizacao').value = '';
    carregarLocalizacoes(); // recarrega opções de localização
    document.getElementById('foto').value = '';
    filtrarTabela();

}
// ----------------------------------------------------------------------------

// M
// MOSTRAR PREVIEW
function mostrarPreview(e, src) {
    let preview = document.getElementById('previewImg');
    let img = document.getElementById('previewImgTag');

    img.src = src;

    preview.style.display = 'block';
    preview.style.top = (e.clientY - 100) + 'px';
    preview.style.left = (e.clientX + 50) + 'px';
}

function maisDe90Dias(dataStr) {
    const hoje = new Date();
    const data = new Date(dataStr.replace(" ", "T"));

    const diff = hoje - data; // diferença em ms
    const dias = diff / (1000 * 60 * 60 * 24);

    return dias > 90;
}

function mostrarTamanhoTela() {
    const larguraTela = screen.width;
    const alturaTela = screen.height;

    const larguraJanela = window.innerWidth;
    const alturaJanela = window.innerHeight;

    console.log("Tela total: " + larguraTela + "x" + alturaTela);
    console.log("Janela (viewport): " + larguraJanela + "x" + alturaJanela);

    alert(
        "Tela total: " + larguraTela + "x" + alturaTela + "\n" +
        "Janela (viewport): " + larguraJanela + "x" + alturaJanela
    );
}

// ----------------------------------------------------------------------------

// O
// OCULTAR PREVIEW
function ocultarPreview() {
    document.getElementById('previewImg').style.display = 'none';
}
// ----------------------------------------------------------------------------

// P
// POST genérico
function post(url, data) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(data)
    }).then(res => res.json());
}

function pedirPin() {
    let pin = prompt("Digite o código de acesso:");

    if (pin && btoa(pin) === PIN_HASH) {

        acessoLiberado = true;

        // SALVA como liberado
        localStorage.setItem(STORAGE_KEY, "ok");

        alert("Acesso liberado");

    } else {

        acessoLiberado = false;

        // SALVA como bloqueado
        localStorage.setItem(STORAGE_KEY, "bloqueado");

        alert("Acesso bloqueado");
    }

    controlarBotoes();
}
// ----------------------------------------------------------------------------

// S
function salvar() {
    let id = document.getElementById('id').value;
    let descricao = document.getElementById('descricao').value.trim();
    let quantidade = document.getElementById('quantidade').value.trim();
    let unidade = document.getElementById('unidade').value.trim();
    let localizacao = document.getElementById('localizacao').value.trim();
    let valor = document.getElementById('valor').value.trim();
    let foto = document.getElementById('foto').files[0];



    // Validação de campos obrigatórios
    if (!descricao) {
        alert('Digite a descrição do produto');
        document.getElementById('descricao').focus();
        return;
    }


    const num = parseFloat(valor);
    // Validação de valor numérico
    // isNaN = "não é um número"
    // parseFloat = tenta converter para número, retorna NaN se falhar
    // if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) <= 0) {
    if (valor === "" || isNaN(num) || num < 0) {
        alert('Digite um valor numérico válido');
        document.getElementById('valor').focus();
        return;
    }

    if (!quantidade || isNaN(parseFloat(quantidade))) {
        alert('Digite uma quantidade numérica válida');
        document.getElementById('quantidade').focus();
        return;
    }



    let formData = new FormData();
    formData.append('acao', id ? 'atualizar' : 'cadastrar');
    formData.append('id', id);
    formData.append('descricao', descricao);
    formData.append("quantidade", document.getElementById("quantidade").value);
    formData.append("unidade", document.getElementById("unidade").value);
    formData.append('localizacao', localizacao);
    formData.append('valor', valor);

    if (foto) {
        formData.append('foto', foto);
    }

    fetch('gerencia.php', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(res => {

            if (res.erro) {
                alert(res.erro);
                return;
            }

            listar();
            limpar();
        });
}
// ----------------------------------------------------------------------------



// T
// ----------------------------------------------------------------------------



// V
function verificarStorage() {
    //const status = localStorage.getItem(STORAGE_KEY);
    let acessoStatus = localStorage.getItem(STORAGE_KEY);

    if (acessoStatus === "ok") {
        acessoLiberado = true;
    } else {
        acessoLiberado = false;
    }

    controlarBotoes();
}



// VERIFICAR ACESSO
function verificarAcesso() {
    let pin = prompt("Digite o código de acesso:");

    // BLOQUEIA se for null (cancelar) OU errado
    if (pin === PIN_CORRETO) {
        acessoLiberado = true;
    } else {
        acessoLiberado = false;
        alert("Acesso bloqueado");
    }

    controlarBotoes();
}






// ----------------------------------------------------------------------------
// INICIALIZAÇÃO
// ----------------------------------------------------------------------------

// Tem que ficar por último, depois de todas as funções estarem definidas.

// INICIAR
// 1. carrega dados normalmente
listar();

//console.log("rodou");
// mostrarTamanhoTela();

carregarLocalizacoes();
document.getElementById('descricao').focus();

// 2. verifica estado salvo
verificarStorage();

// 3. só pergunta se NUNCA foi definido
// const status = localStorage.getItem(STORAGE_KEY);
let acessoStatus = localStorage.getItem(STORAGE_KEY);

if (acessoStatus === null) {
    setTimeout(() => {
        pedirPin();
    }, 300);
}



/* Anotações:
Regra prática(use isso no dia a dia)
* Use const sempre que possível
* Use let quando precisar mudar valor
* Evite var

let(moderno)
Escopo: bloco { }
Não pode redeclarar no mesmo escopo
Pode alterar valor

var (antigo, evite usar)
Escopo: função
Pode redeclarar
Pode alterar valor

1. var em loop (BUG clássico)
for (var i = 0; i < 3; i++) {
    setTimeout(() => {
        console.log(i);
    }, 100);
}
Saída:
3
3
3

Correto com let
for (let i = 0; i < 3; i++) {
    setTimeout(() => {
        console.log(i);
    }, 100);
}

Saída:
0
1
2
porque let respeita o bloco

4. Escopo vazando (var)
if (true) {
    var x = 10;
}
console.log(x); // 10
variável “vazou” do bloco

Com let
if (true) {
    let x = 10;
}
console.log(x); // erro
comportamento correto



// SALVAR COM VALIDAÇÃO
function salvar2() {
    let id = document.getElementById('id').value;
    let descricao = document.getElementById('descricao').value.trim();
    let valor = document.getElementById('valor').value.trim();

    if (!descricao) {
        alert('Digite a descrição');
        return;
    }

    if (!valor) {
        alert('Digite o valor');
        return;
    }

    if (parseFloat(valor) <= 0) {
        alert('Valor deve ser maior que zero');
        return;
    }

    // Se tiver ID, é atualização, senão é cadastro
    let acao = id ? 'atualizar' : 'cadastrar';

    post('gerencia.php', {
        acao: acao,
        id: id,
        descricao: descricao,
        valor: valor
    }).then(res => {

        if (res.erro) {
            alert(res.erro);
            return;
        }

        limpar();
        listar();
    });
}


// Tabela sem filtro
function listar2() {
    post('gerencia.php', {
        acao: 'listar'
    })
        .then(dados => {
            let html = '';

            dados.forEach(p => {
                html += `
            <tr>
                <td class="w3-right-align">${p.id}</td>
                <td class="w3-left-align">${escapeHTML(p.descricao)}</td>
                <td class="w3-right-align">${formatarMoeda(p.valor)}</td>
                <td class="w3-center">
                    <button onclick="editar(${p.id})">Editar</button>
                    <button onclick="excluir(${p.id})">Excluir</button>
                </td>
            </tr>`;
            });

            document.getElementById('tabela').innerHTML = html;
        });
}

// TECLA DE ATALHO: Ctrl + L para reabrir o PIN
// document.addEventListener('keydown', function (e) {
//     if (e.ctrlKey && e.key.toLowerCase() === 'l') {
//         e.preventDefault();
//         pedirPin();
//     }
// });

// console.log("Pressione Ctrl + L para inserir o código novamente");

*/