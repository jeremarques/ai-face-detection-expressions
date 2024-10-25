const videoCam = document.getElementById('video-cam');

// Pré-carrega modelos para que a função `startDetection` seja executada mais rapidamente.
const loadModels = async () => {
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models'),
    ]);
};

// Inicializa o streaming de vídeo e canvas
const initializeVideoStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 } // Resolução reduzida para melhor desempenho
    });
    videoCam.srcObject = stream;
};

// Configuração do Canvas
let canvas;
const setupCanvas = () => {
    if (!canvas) {
        canvas = faceapi.createCanvasFromMedia(videoCam);
        document.body.append(canvas);
        const displaySize = { width: videoCam.width, height: videoCam.height };
        faceapi.matchDimensions(canvas, displaySize);
    }
};

// Função para iniciar a detecção
const startDetection = async () => {
    await initializeVideoStream();
    await loadModels();
    setupCanvas();

    const displaySize = { width: videoCam.width, height: videoCam.height };

    // Detecção otimizada usando `requestAnimationFrame`
    const detectFaces = async (roi) => {
        const faceAIData = await faceapi
            .detectAllFaces(videoCam, new faceapi.TinyFaceDetectorOptions(), roi)
            .withFaceLandmarks()
            .withFaceExpressions();

        // Limpeza e redimensionamento de resultados
        const resizedResults = faceapi.resizeResults(faceAIData, displaySize);
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Desenha os resultados
        faceapi.draw.drawDetections(canvas, resizedResults);
        faceapi.draw.drawFaceLandmarks(canvas, resizedResults);
        faceapi.draw.drawFaceExpressions(canvas, resizedResults);

        // Solicita próxima detecção
        requestAnimationFrame(detectFaces);
    };

    // Inicia o loop de detecção
    detectFaces();
};

// Chamada inicial para iniciar a detecção
startDetection();
