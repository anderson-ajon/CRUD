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
// ATALHO: Ctrl + L para reabrir o PIN
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        pedirPin();
    }
});
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
            document.getElementById('valor').value = p.valor;
            document.getElementById('descricao').focus();
        });
}
// Versão Busca no Array
function editar2(id) {
    let produto = produtos.find(p => p.id == id);

    if (!produto) return;

    document.getElementById('id').value = produto.id;
    document.getElementById('descricao').value = produto.descricao;
    document.getElementById('valor').value = produto.valor;
    document.getElementById('descricao').focus();
}

// EXCLUIR
function excluir(id) {

    if (confirm('Excluir?')) {
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

// FILTRAR TABELA
function filtrarTabela() {
    let filtro = document.getElementById('filtro').value.toLowerCase().replace(',', '.');
    let html = '';

    // filtra o array produtos
    let filtrados = produtos.filter(p => {
        let valor = String(p.valor); // valor real (10.5)
        let valorFormatado = Number(p.valor)
            .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            .toLowerCase();

        return (
            p.descricao.toLowerCase().includes(filtro) ||
            String(p.id).includes(filtro) ||
            valor.includes(filtro) ||                // 10.5
            valorFormatado.includes(filtro)          // R$ 10,50
        );
    });

    if (filtrados.length === 0) {
        html = `<tr><td colspan="5" class="w3-center">Nenhum produto encontrado</td></tr>`;
    } else {
        filtrados.forEach(p => {
            html += `
            <tr>
                <td class="w3-right-align">${p.id}</td>                
                <td class="w3-center">
                    <img src="uploads/${p.foto || 'sem-foto.jpg'}" style="width:50px;height:50px;object-fit:cover;" onmouseover="mostrarPreview(event, this.src)" onmouseout="ocultarPreview()">
                </td>                
                <td class="w3-left-align">${escapeHTML(p.descricao)}</td>
                <td class="w3-right-align">${Number(p.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                <td class="w3-center">
                    <button class="w3-button w3-yellow w3-small" onclick="editar(${p.id})">Editar</button>
                    <button class="w3-button w3-red w3-small" onclick="excluir(${p.id})">Excluir</button>
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

// LIMPAR
function limpar() {
    document.getElementById('id').value = '';
    document.getElementById('descricao').value = '';
    document.getElementById('valor').value = '';
    document.getElementById('filtro').value = '';
    document.getElementById('descricao').focus();
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
    let valor = document.getElementById('valor').value.trim();
    let foto = document.getElementById('foto').files[0];

    if (!descricao) {
        alert('Digite a descrição');
        return;
    }

    if (!valor) {
        alert('Digite o valor');
        return;
    }

    let formData = new FormData();
    formData.append('acao', id ? 'atualizar' : 'cadastrar');
    formData.append('id', id);
    formData.append('descricao', descricao);
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

console.log("Pressione Ctrl + L para inserir o código novamente");

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

*/