<?php
// ADICIONADO: iniciar tempo
$inicio = microtime(true);

require 'conexao.php';

header('Content-Type: application/json; charset=utf-8');

$acao = $_POST['acao'] ?? '';

switch ($acao) {

    case 'listar':
        $stmt = $conexao->query("SELECT * FROM produtos ORDER BY descricao ASC");

        // ADICIONADO: calcular tempo
        $fim = microtime(true);
        $tempo = round(($fim - $inicio) * 1000, 2); // ms

        // CORREÇÃO: novo formato com tempo
        echo json_encode([
            'dados' => $stmt->fetchAll(),
            'tempo' => $tempo
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'cadastrar':
    case 'atualizar':

        $descricao = trim($_POST['descricao'] ?? '');
        $descricao = mb_strtoupper($descricao, 'UTF-8');
        $valor = trim($_POST['valor'] ?? '');
        $valor = floatval(str_replace(',', '.', $valor));

        // VALIDAÇÃO
        if ($descricao === '' || $valor <= 0) {
            echo json_encode(['erro' => 'Preencha todos os campos']);
            exit;
        }

        if (!is_numeric($valor) || $valor <= 0) {
            echo json_encode(['erro' => 'Valor inválido']);
            exit;
        }

        // Upload da imagem (se tiver)
        // $fotoNome = null;
        if ($acao === 'cadastrar') {
            $fotoNome = 'sem-foto.jpg';
        } else {
            $fotoNome = null;
        }

        if (isset($_FILES['foto']) && $_FILES['foto']['error'] == 0) {

            $tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
            if (!in_array($_FILES['foto']['type'], $tiposPermitidos)) {
                echo json_encode(['erro' => 'Tipo de imagem inválido']);
                exit;
            }

            $pasta = 'uploads/';

            if (!is_dir($pasta)) {
                mkdir($pasta, 0777, true);
            }

            $ext = pathinfo($_FILES['foto']['name'], PATHINFO_EXTENSION);
            $fotoNome = uniqid() . '.' . $ext;
            move_uploaded_file($_FILES['foto']['tmp_name'], $pasta . $fotoNome);
        }

        if ($acao === 'cadastrar') {
            // CADASTRAR

            $stmt = $conexao->prepare("
                INSERT INTO produtos (descricao, valor, foto)
                VALUES (?, ?, ?)
            ");

            $stmt->execute([$descricao, $valor, $fotoNome]);
        } else {
            // ATUALIZAR

            $id = $_POST['id'] ?? 0;

            if (!$id) {
                echo json_encode(['erro' => 'ID inválido']);
                exit;
            }

            // Buscar imagem antiga
            $stmt = $conexao->prepare("SELECT foto FROM produtos WHERE id=?");
            $stmt->execute([$id]);
            $produto = $stmt->fetch(PDO::FETCH_ASSOC);
            $fotoAntiga = $produto['foto'] ?? null;

            // Apagar imagem antiga se houver nova            
            if ($fotoNome && $fotoAntiga && $fotoAntiga !== 'sem-foto.jpg') {
                $caminho = 'uploads/' . $fotoAntiga;

                if (file_exists($caminho)) {
                    unlink($caminho);
                }
            }

            // Atualizar banco
            if ($fotoNome) {
                $stmt = $conexao->prepare("
                    UPDATE produtos SET descricao=?, valor=?, foto=? WHERE id=?
                ");
                $stmt->execute([$descricao, $valor, $fotoNome, $id]);
            } else {
                $stmt = $conexao->prepare("
                    UPDATE produtos SET descricao=?, valor=? WHERE id=?
                ");
                $stmt->execute([$descricao, $valor, $id]);
            }
        }

        echo json_encode(['status' => 'ok']);
        break;

    case 'buscar':
        $id = $_POST['id'] ?? 0;

        $stmt = $conexao->prepare("SELECT * FROM produtos WHERE id=?");
        $stmt->execute([$id]);

        echo json_encode($stmt->fetch(), JSON_UNESCAPED_UNICODE);
        break;

    case 'excluir':
        $id = $_POST['id'] ?? 0;

        // buscar imagem
        $stmt = $conexao->prepare("SELECT foto FROM produtos WHERE id=?");
        $stmt->execute([$id]);
        $produto = $stmt->fetch(PDO::FETCH_ASSOC);

        // excluir imagem do servidor
        if ($produto && $produto['foto'] && $produto['foto'] !== 'sem-foto.jpg') {
            $caminho = 'uploads/' . $produto['foto'];

            if (file_exists($caminho)) {
                unlink($caminho);
            }
        }

        // excluir do banco
        $stmt = $conexao->prepare("DELETE FROM produtos WHERE id=?");
        $stmt->execute([$id]);

        echo json_encode(['status' => 'ok']);
        break;

    default:
        echo json_encode(['erro' => 'Ação inválida'], JSON_UNESCAPED_UNICODE);
}
