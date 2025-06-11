document.addEventListener('DOMContentLoaded', (event) => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    const resultText = document.getElementById('result-text');

    const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        // Quando um QR code é detectado com sucesso
        if (decodedText) {
            resultText.textContent = decodedText;
            // Opcional: parar a leitura após o primeiro QR code ser detectado
            // html5QrCode.stop().then(() => {
            //     console.log("Leitor parado.");
            // }).catch((err) => {
            //     console.error("Erro ao parar o leitor:", err);
            // });
        }
    };

    const qrCodeErrorCallback = (errorMessage) => {
        // Chamado quando não há QR codes detectados ou há um erro
        // console.warn(`QR Code scanning error: ${errorMessage}`);
        // Você pode optar por não mostrar erros de "nenhum QR code detectado"
        // para não poluir a saída, mas pode ser útil para depuração.
    };

    const config = {
        fps: 10, // Quadros por segundo para a leitura
        qrbox: { width: 250, height: 250 }, // Tamanho da caixa de escaneamento
        // Considerar priorizar a câmera traseira em dispositivos móveis
        facingMode: { exact: "environment" }
    };

    // Solicitar permissão para usar a câmera e iniciar a leitura
    html5QrCode.start(
        { facingMode: "environment" }, // Preferir a câmera traseira
        config,
        qrCodeSuccessCallback,
        qrCodeErrorCallback
    ).catch((err) => {
        // Se houver um erro ao iniciar a câmera (ex: permissão negada)
        resultText.textContent = `Erro ao iniciar a câmera: ${err}. Verifique se a permissão foi concedida.`;
        console.error("Erro ao iniciar a câmera:", err);
    });
});