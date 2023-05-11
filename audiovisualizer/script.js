

window.addEventListener('load', function () {

    // Get DOM elements
    var hueSlider = document.getElementById('hue-slider');
    var audioFileInput = document.getElementById('audio-file');
    var audioPlayer = document.getElementById('audio-player');
    var canvas = document.getElementById('visualizer-canvas');
    var canvasCtx = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initialize variables
    var hue = 0;
    var currentStyle = 1;
    var isAutoPanActive = false;
    var autoPanIntervalId;
    var frequencyData = new Uint8Array(0);

    // Event listener for hue slider
    hueSlider.addEventListener('input', function (event) {
        hue = event.target.value;
    });

    // Event listener for audio file input
    audioFileInput.addEventListener('change', function (event) {
        var file = event.target.files[0];
        audioPlayer.src = URL.createObjectURL(file);
        var audioCtx = new (window.AudioContext)();

        // Set up audio analyzer
        var source = audioCtx.createMediaElementSource(audioPlayer);
        var analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        // Initialize frequency data array
        frequencyData = new Uint8Array(analyser.frequencyBinCount);

        // Start playing audio
        audioPlayer.play();

        // Render canvas on each animation frame
        renderFrame();
        autoPan();

        // Variables for controlling style
        var style1Button = document.getElementById('style1');
        var style2Button = document.getElementById('style2');
        var style3Button = document.getElementById('style3');

        // Event listners for styles
        style1Button.addEventListener('click', function () {
            currentStyle = 1;
            style1Button.classList.add('active');
            style2Button.classList.remove('active');
            style3Button.classList.remove('active');
        });

        style2Button.addEventListener('click', function () {
            currentStyle = 2;
            style1Button.classList.remove('active');
            style2Button.classList.add('active');
            style3Button.classList.remove('active');
        });

        style3Button.addEventListener('click', function () {
            currentStyle = 3;
            style1Button.classList.remove('active');
            style2Button.classList.remove('active');
            style3Button.classList.add('active');
        });

        var autoPanButton = document.getElementById('auto-pan');

        autoPanButton.addEventListener('click', function () { 
          autoPanButton.classList.toggle('active');
        });
        
        function drawSpectrum() {
            analyser.getByteFrequencyData(frequencyData);

            var barWidth = (canvas.width / frequencyData.length) * 2.5;
            var barHeight;
            var x = 0;

            var scaleFactor = 10;

            for (var i = 0; i < frequencyData.length; i++) {
                barHeight = (frequencyData[i] - 100) * scaleFactor;

                canvasCtx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                //     ctx.fillStyle = 'hsla(' + settings.hue + ',' + settings.backgroundSaturation + '%,' + settings.backgroundBrightness + '%, ' + settings.backgroundAlpha + ')';

                canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth + 1;
            }
        }
        function drawRing() {
            updateHue();
            analyser.getByteFrequencyData(frequencyData);

            var bars = frequencyData.length / 2.25;
            var barWidth = (Math.PI * 2) / bars;
            var centerX = canvas.width / 2;
            var centerY = canvas.height / 2;
            var radius = 150;
            var scalingFactor = 1.4; // scaling factor, bigger values will be 

            canvasCtx.lineWidth = 2;
            canvasCtx.beginPath();

            for (var i = 0; i < bars; i++) {
                var barHeight = frequencyData[i] / 255 * radius;
                var radians = i * barWidth;
                var x = centerX + Math.cos(radians - Math.PI / 2) * radius;
                var y = centerY + Math.sin(radians - Math.PI / 2) * radius;

                var x2 = centerX + Math.cos(radians - Math.PI / 2) * ((barHeight + radius) * scalingFactor);
                var y2 = centerY + Math.sin(radians - Math.PI / 2) * ((barHeight + radius) * scalingFactor);

                var gradient = canvasCtx.createLinearGradient(x, y, x2, y2);
                gradient.addColorStop(0, 'hsl(' + hue + ', 100%, 50%)');
                gradient.addColorStop(1, 'hsl(' + hue + ', 100%, 70%)');
                canvasCtx.strokeStyle = gradient;

                canvasCtx.moveTo(x, y);
                canvasCtx.lineTo(x2, y2);
            }

            canvasCtx.stroke();
        }

        function drawOscillo() {
            updateHue();
            analyser.getByteTimeDomainData(frequencyData);

            var radius = 50;
            var bars = frequencyData.length;
            var barWidth = 2 * Math.PI / bars;
            var centerX = canvas.width / 2;
            var centerY = canvas.height / 2;
            var pointX;
            var pointY;

            var rotationSpeed = 0.01;
            var rotationAngle = rotationSpeed * Date.now();
            pointX = centerX + radius * Math.cos(rotationAngle) - 100;
            pointY = centerY + radius * Math.sin(rotationAngle) - 100;

            canvasCtx.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
            canvasCtx.lineWidth = 2;
            canvasCtx.beginPath();
            for (var i = 0; i < bars; i++) {
                var barHeight = frequencyData[i] / 256 * centerX;
                var radians = i * barWidth;
                var barX = centerX + barHeight * Math.cos(radians - Math.PI / 2);
                var barY = centerY + barHeight * Math.sin(radians - Math.PI / 2);
                canvasCtx.lineTo(barX, barY);
            }
            canvasCtx.stroke();
        }



        function drawCircular() {
            updateHue()
            var bufferLength = analyser.frequencyBinCount;
            analyser.getByteTimeDomainData(frequencyData);

            var centerX = canvas.width / 2;
            var centerY = canvas.height / 2;
            var radius = 250;

            canvasCtx.beginPath();

            for (var i = 0; i < bufferLength; i++) {
                var angle = (i / bufferLength) * 2 * Math.PI;
                var x = centerX + Math.cos(angle) * radius * (frequencyData[i] / 255);
                var y = centerY + Math.sin(angle) * radius * (frequencyData[i] / 255);

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }
            }

            canvasCtx.closePath();
            canvasCtx.stroke();
        }

        function updateHue() {
            var hue = hueSlider.value;
            canvasCtx.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
        }
        function renderFrame() {
            requestAnimationFrame(renderFrame);
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            if (currentStyle === 1) {
                drawSpectrum();
            } else if (currentStyle === 2) {
                drawRing();
            } else if (currentStyle === 3) {
                drawOscillo();
            }
        }

        function autoPan() {
            var autoPanButton = document.getElementById('auto-pan');
            autoPanButton.addEventListener('click', function () {
                if (isAutoPanActive) {
                    clearInterval(autoPanIntervalId);
                    isAutoPanActive = false;
                } else {
                    isAutoPanActive = true;
                    autoPanIntervalId = setInterval(function () {
                        hue += 1;
                        if (hue >= 360) {
                            hue = 0;
                        }
                        canvasCtx.strokeStyle = 'hsl(' + hue + ', 100%, 50%)';
                        hueSlider.value = hue;
                    }, 10);
                }
            });
        }
    });

});