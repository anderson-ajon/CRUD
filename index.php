<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <title>CRUD Produtos</title>
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
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

        <input class="w3-input w3-margin-bottom" type="text" id="descricao" placeholder="Descrição">

        <input class="w3-input w3-margin-bottom" type="number" id="valor" placeholder="Valor" step="0.01">

        <input class="w3-input w3-margin-bottom" type="file" id="foto" name="foto">

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
                    <th class="w3-center">Valor</th>
                    <th class="w3-center">Ações</th>
                </tr>
            </thead>
            <tbody id="tabela"></tbody>
        </table>

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
    <div id="previewImg" style="display:none;position:fixed;z-index:999;border:1px solid #ccc;background:#fff;padding:5px;">
        <img id="previewImgTag" style="width:250px;">
    </div>
    <script src="js.js"></script>

</body>

</html>