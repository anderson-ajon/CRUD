<?php
session_start();

if (!isset($_SESSION['backup_verificado'])) {
    // chama ao abrir o sistema

    $comandoBackup = "\"C:\\xampp\\mysql\\bin\\mysqldump.exe\" -u root 2026crud";
    $pastaBackup = __DIR__ . "/backups";

    // verificarBackupDiario($pastaBackup, $comandoBackup);
    echo verificarBackupDiario($pastaBackup, $comandoBackup);

    $_SESSION['backup_verificado'] = true;
    // Encerra a sessão após 24 horas (86400 segundos)

}

// echo $_SESSION['backup_verificado'] = time();
// echo $_SESSION['backup_verificado'];

function verificarBackupDiario($pastaBackup, $comandoBackup) {
    // Define o nome do arquivo com a data atual
    $dataHoje = date('Y-m-d');
    $arquivoBackup = $pastaBackup . "/backup-$dataHoje.sql";

    // Verifica se já existe
    if (!file_exists($arquivoBackup)) {

        // Executa o backup (ex: mysqldump)
        $comando = $comandoBackup . " > " . escapeshellarg($arquivoBackup);
        exec($comando);

        return "Backup criado: backup-$dataHoje.sql";
    }

    // return "Backup já existe hoje.";
    return null; // Retorna null se o backup já existir, para não exibir mensagem
}
?>
<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <title>CRUD Produtos</title>
    <link rel="stylesheet" href="w3.css">
    <link rel="stylesheet" href="css.css">
</head>

<body class="w3-light-grey">
    <div class="w3-container w3-padding-16 w3-white w3-card-4"
        style="margin:30px;margin-top:30px;margin-bottom:200px;">

        <div class="w3-panel w3-sand ">
            <h2 class="w3-opacity w3-center">
                <b>Cadastro de Produtos</b>
            </h2>
        </div>

        <input type="hidden" id="id">

        <input class="w3-input w3-margin-bottom" type="text" id="descricao" placeholder="Descrição" maxlength="120">
        <div class="w3-row">

            <div class="w3-quarter w3-container">

                <input class="w3-input w3-margin-bottom" type="number" id="quantidade" placeholder="Quantidade" step="0.001" min="0">

            </div>

            <div class="w3-quarter w3-container">

                <!-- <input class="w3-input w3-margin-bottom" type="text" id="localizacao" placeholder="Localização (ex: P1 F2)"> -->
                <datalist id="localizacoes">
                    <!-- Opções serão carregadas dinamicamente -->
                </datalist>

                <input class="w3-input w3-margin-bottom" type="text" id="localizacao" placeholder="Localização (ex: P1 F2)" list="localizacoes" maxlength="21">

            </div>

            <div class="w3-quarter w3-container">

                <input class="w3-input w3-margin-bottom" type="number" id="valor" placeholder="Valor" step="0.01" min="0" value="0">

            </div>

            <div class="w3-quarter w3-container">

                <select class="w3-input w3-margin-bottom" id="unidade" required>
                    <optgroup label="Unidades de medida">
                        <!-- <option disabled selected value="">Selecione a unidade...</option> -->
                        <option selected value="un">Unidade</option>
                        <option value="m">Metro</option>
                        <option value="cm">Centímetro</option>
                        <option value="g">Grama</option>
                        <option value="kg">Quilo</option>
                        <option value="l">Litro</option>
                    </optgroup>
                </select>

            </div>

        </div>

        <div class="w3-row">

            <div class="w3-third w3-container">

                <input class="w3-input w3-margin-bottom" type="file" id="foto" name="foto" capture="camera">

            </div>

        </div>


        <button class="w3-button w3-green w3-margin-right" onclick="salvar()">Salvar</button>
        <button class="w3-button w3-blue" onclick="limpar()">Limpar</button>

        <!-- Filtro -->
        <input class="w3-input w3-border w3-border-black w3-sand w3-margin-top" type="text" id="filtro"
            placeholder="Filtrar produtos" onkeyup="filtrarTabela()">

        <!-- Tabela -->
        <!-- <table class="w3-table w3-striped w3-bordered w3-margin-top"> -->
        <table class="w3-table-all w3-hoverable w3-margin-top">
            <thead>
                <tr class="w3-light-grey">
                    <th class="w3-center">ID</th>
                    <th class="w3-center">Foto</th>
                    <th class="w3-center">Descrição</th>
                    <th class="w3-center">Quantidade</th>
                    <!-- <th class="w3-center">Unidade</th> -->
                    <!-- <th class="w3-center">Valor</th> -->
                    <th class="w3-center">Localização</th>
                    <th class="w3-center">Data</th>
                    <th class="w3-center">Ações</th>
                </tr>
            </thead>
            <tbody id="tabela"></tbody>
        </table>
        <!-- <div class="w3-margin-top w3-small">
            <span class="w3-text-black">● Até 60 dias</span> &nbsp; | &nbsp;
            <span class="w3-text-orange">● 60 a 90 dias</span> &nbsp; | &nbsp;
            <span class="w3-text-red">● Mais de 90 dias</span>
        </div> -->
        <div class="w3-margin-top w3-small w3-center">
            <span class="w3-text-black"><b>● Até 30 dias</b></span>
            &nbsp;&nbsp;
            <span class="w3-text-blue"><b>● 31 a 60 dias</b></span>
            &nbsp;&nbsp;
            <span class="w3-text-orange"><b>● 61 a 90 dias</b></span>
            &nbsp;&nbsp;
            <span class="w3-text-red"><b>● Mais de 90 dias</b></span>
        </div>
        <!-- <div id="totalRegistros" class="w3-right w3-margin-top"></div> -->
        <!-- <div id="tempo" class="w3-right w3-small w3-text-gray"></div> -->

        <!-- <div class="w3-border-top w3-padding w3-small w3-light-grey w3-margin-top">
            <span id="totalRegistros"></span>
            <span class="w3-right" id="tempo"></span>
        </div>

        <hr class="w3-margin-top w3-margin-bottom"> -->

        <!-- <div class="w3-row">
            <div class="w3-left" id="totalRegistros"></div>
            <div class="w3-right" id="tempo"></div>
        </div> -->

        <hr class="w3-margin-top w3-margin-bottom">

        <div class="w3-row w3-small w3-text-gray">
            <div class="w3-left" id="totalRegistros"></div>
            <div class="w3-right" id="tempo"></div>
        </div>

    </div>
    <div id="previewImg" style="display:none;position:fixed;z-index:999;border:1px solid #ccc;background:#fff;padding:10px;">
        <!-- <img id="previewImgTag" style="width:300px;"> -->
        <img id="previewImgTag">
    </div>
    <script>
        //  TECLA DE ATALHO: Ctrl + L para reabrir o PIN
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                pedirPin();
            }
        });

        console.log("Pressione Ctrl + L para inserir o código novamente");
    </script>
    <script src="js.js"></script>

</body>

</html>