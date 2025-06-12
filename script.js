document.addEventListener('DOMContentLoaded', () => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    const resultText = document.getElementById('result-text');

    // Função para atualizar a mensagem de status para o usuário
    const updateStatus = (message, color = '#555') => {
        resultText.textContent = message;
        resultText.style.color = color;
    };

    updateStatus("Iniciando leitor de QR Code...");

    // Callback executado quando um QR Code é lido com sucesso
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        if (decodedText) {
            updateStatus(`QR Code Lido: ${decodedText}`, '#28a745'); // Cor verde para sucesso
            console.log("QR Code Decodificado:", decodedText);
            console.log("Resultado Completo:", decodedResult);
            
            // Opcional: Parar a leitura após o primeiro QR Code ser detectado.
            html5QrCode.stop().then(() => {
                console.log("Leitor de QR Code parado após detecção bem-sucedida.");
            }).catch((err) => {
                console.error("Erro ao parar o leitor após detecção:", err);
                updateStatus("QR Code lido, mas houve um erro ao parar a câmera.", '#dc3545');
            });
        }
    };

    // Callback executado quando há um erro ou nenhum QR Code é detectado.
    const qrCodeErrorCallback = (errorMessage) => {
        // Este callback é chamado constantemente quando nenhum QR code é encontrado.
        // Evitamos atualizar a UI com mensagens redundantes aqui para não poluir.
        // console.warn(`Erro na leitura do QR Code: ${errorMessage}`);
    };

    // Configurações para o leitor de QR Code
    const config = {
        fps: 10, // Quadros por segundo para tentar decodificar o QR Code
        qrbox: { width: 250, height: 250 }, // Tamanho da "caixa" de escaneamento na tela
        // Você pode experimentar com o qrbox para melhor ajuste em celulares:
        // qrbox: (viewfinderWidth, viewfinderHeight) => {
        //     let minEdgePercentage = 0.7; // Usa 70% da menor dimensão do visor
        //     let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight) * minEdgePercentage;
        //     return { width: minEdgeSize, height: minEdgeSize };
        // }
    };

    // Função para tentar iniciar a câmera
    const startCamera = async (cameraConfig) => {
        try {
            console.log("Tentando iniciar a câmera com configuração:", cameraConfig.facingMode);
            updateStatus(`Aguardando permissão da câmera (${cameraConfig.facingMode === 'environment' ? 'traseira' : 'frontal'})...`, '#ffc107'); // Amarelo para aguardando
            
            // Solicita permissão e inicia o stream da câmera
            await html5QrCode.start(
                cameraConfig.facingMode, // Usa a configuração de facingMode passada
                config,
                qrCodeSuccessCallback,
                qrCodeErrorCallback
            );
            updateStatus("Câmera ativada! Aponte para um QR Code.", '#007bff'); // Azul para sucesso de ativação
            console.log("Câmera iniciada com sucesso:", cameraConfig.facingMode);

        } catch (err) {
            // Este bloco é executado se houver um erro para iniciar a câmera
            console.error(`Erro ao iniciar a câmera (${cameraConfig.facingMode}):`, err);
            
            if (err.name === 'NotAllowedError') {
                updateStatus("Acesso à câmera negado. Por favor, conceda permissão nas configurações do navegador.", '#dc3545'); // Vermelho para erro
            } else if (err.name === 'NotFoundError') {
                updateStatus("Nenhuma câmera encontrada no dispositivo.", '#dc3545');
            } else if (err.name === 'NotReadableError') {
                updateStatus("A câmera está em uso por outro aplicativo ou o dispositivo não permite leitura. Tente fechar outros apps.", '#dc3545');
            } else if (err.name === 'OverconstrainedError') {
                 // Geralmente ocorre se o facingMode solicitado não está disponível
                updateStatus(`Não foi possível usar a câmera ${cameraConfig.facingMode === 'environment' ? 'traseira' : 'frontal'}.`, '#dc3545');
            } else {
                updateStatus(`Erro inesperado ao iniciar a câmera: ${err.message}.`, '#dc3545');
            }
            throw err; // Propaga o erro para o próximo catch se houver
        }
    };

    // Sequência de tentativas: primeiro câmera traseira, depois frontal
    startCamera({ facingMode: "environment" })
        .catch(() => {
            // Se a câmera traseira falhar, tenta a frontal
            console.log("Tentando iniciar com câmera frontal...");
            return startCamera({ facingMode: "user" });
        })
        .catch(() => {
            // Se ambas falharem, exibe uma mensagem final de erro
            updateStatus("Não foi possível iniciar nenhuma câmera. Verifique as permissões e tente novamente.", '#dc3545');
            console.error("Falha ao iniciar qualquer câmera.");
        });
});
