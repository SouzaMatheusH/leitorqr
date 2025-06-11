document.addEventListener('DOMContentLoaded', () => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    const resultText = document.getElementById('result-text');

    // Callback executado quando um QR Code é lido com sucesso
    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        if (decodedText) {
            resultText.textContent = decodedText; // Exibe o texto decodificado
            
            // Opcional: Parar a leitura após o primeiro QR Code ser detectado.
            // Isso economiza bateria e evita leituras duplicadas.
            html5QrCode.stop().then(() => {
                console.log("Leitor de QR Code parado após detecção bem-sucedida.");
                // Você pode adicionar um botão aqui para "Iniciar Nova Leitura" se desejar.
            }).catch((err) => {
                console.error("Erro ao parar o leitor:", err);
            });
        }
    };

    // Callback executado quando há um erro ou nenhum QR Code é detectado.
    // Geralmente, para uma experiência de usuário limpa, evitamos exibir
    // mensagens de erro contínuas de "nenhum QR Code detectado".
    const qrCodeErrorCallback = (errorMessage) => {
        // console.warn(`Erro na leitura do QR Code: ${errorMessage}`);
    };

    // Configurações para o leitor de QR Code
    const config = {
        fps: 10, // Quadros por segundo para tentar decodificar o QR Code
        qrbox: { width: 250, height: 250 }, // Tamanho da "caixa" de escaneamento na tela
        // Para celulares, você pode ajustar o qrbox para ser uma porcentagem da tela
        // qrbox: (viewfinderWidth, viewfinderHeight) => {
        //     const minEdgePercentage = 0.7; // Usa 70% da menor dimensão do visor
        //     const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight) * minEdgePercentage;
        //     return { width: minEdgeSize, height: minEdgeSize };
        // }
    };

    // Tentar iniciar a leitura com a câmera traseira (ambiente)
    html5QrCode.start(
        { facingMode: "environment" }, // Preferir a câmera traseira do dispositivo
        config,
        qrCodeSuccessCallback,
        qrCodeErrorCallback
    )
    .catch((err) => {
        // Se a câmera traseira não puder ser acessada (ex: permissão negada, não existe),
        // tentamos a câmera frontal (user).
        console.error("Erro ao iniciar a câmera traseira. Tentando câmera frontal:", err);
        resultText.textContent = `Solicitando permissão para câmera. Se não funcionar, verifique as permissões do navegador.`;

        html5QrCode.start(
            { facingMode: "user" }, // Tentar a câmera frontal
            config,
            qrCodeSuccessCallback,
            qrCodeErrorCallback
        )
        .catch((err2) => {
            // Se ambas as câmeras falharem
            resultText.textContent = `Não foi possível acessar nenhuma câmera. Por favor, verifique as permissões do seu navegador e tente novamente. Detalhes: ${err2}`;
            console.error("Erro ao iniciar qualquer câmera:", err2);
        });
    });
});
