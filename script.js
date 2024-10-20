const videoCam = document.getElementById('video-cam')

const startDetection = async () => {
    // Get the user media (webcam)
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
    })
    videoCam.srcObject = stream

    // Loading models
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models'),
    ])

    // Create the canvas element on top of video element
    const canvas = faceapi.createCanvasFromMedia(videoCam)
    document.body.append(canvas)
    const displaySize = { width: videoCam.width, height: videoCam.height }
    faceapi.matchDimensions(canvas, displaySize)

    // Start face detection with landmaks
    setInterval(async () => {
        let faceAIData = await faceapi.detectAllFaces(videoCam).withFaceLandmarks().withFaceDescriptors().withFaceExpressions()
        // Cleaning the canvas and draw landmarks in the canvas
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceAIData = faceapi.resizeResults(faceAIData, videoCam)
        faceapi.draw.drawDetections(canvas, faceAIData)
        faceapi.draw.drawFaceLandmarks(canvas, faceAIData)
        faceapi.draw.drawFaceExpressions(canvas, faceAIData)
    }, 100)
}

startDetection()