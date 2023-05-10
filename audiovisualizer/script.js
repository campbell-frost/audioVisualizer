window.addEventListener('load', function () {
    // Get the audio file input and audio player
    var audioFileInput = document.getElementById('audio-file');
    var audioPlayer = document.getElementById('audio-player');

    // Get the canvas element and context
    var canvas = document.getElementById('visualizer-canvas');
    var canvasCtx = canvas.getContext('2d');

    // Set the canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Load the audio file when the user selects a file
    audioFileInput.addEventListener('change', function (event) {
        // Get the selected file
        var file = event.target.files[0];

        // Set the audio player source to the file
        audioPlayer.src = URL.createObjectURL(file);

        // Create a new audio context
        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        // Create a new source node for the audio
        var source = audioCtx.createMediaElementSource(audioPlayer);

        // Create a new analyzer node for the frequency data
        var analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;

        // Connect the nodes together
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        // Set the current visualizer style to 1
        var currentStyle = 1;

        // Render the visualizer
        function renderVisualizer() {
            // Get the frequency data for the audio
            var frequencyData = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(frequencyData);

            // Clear the canvas
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw the frequency spectrum
            if (currentStyle === 1) {
                var barWidth = canvas.width / frequencyData.length;
                var barHeight;
                var x = 0;
                canvasCtx.fillStyle = "#f2f2f2";
                canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
                for (var i = 0; i < frequencyData.length; i++) {
                    var barHeight = frequencyData[i] / 2;
                    var r = barHeight + (25 * (i / frequencyData.length));
                    var g = 250 * (i / frequencyData.length);
                    var b = 50;
                    canvasCtx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
                    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                    x += barWidth + 1;
                }
            }
            // Draw the frequency spectrum in a ring
            else if (currentStyle === 2) {
                var radius = canvas.height / 2 - 20;
                var bars = frequencyData.length;
                var barWidth = 2 * Math.PI / bars;
                var x = canvas.width / 2;
                var y = canvas.height / 2;
                for (var i = 0; i < bars; i++) {
                  var barHeight = frequencyData[i] / 2;
                  var radians = i * barWidth;
                  var barX = x + radius * Math.cos(radians - Math.PI / 2);
                  var barY = y + radius * Math.sin(radians - Math.PI / 2);
                  var hue = i / bars * 360;
                  canvasCtx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
                  canvasCtx.beginPath();
                  canvasCtx.arc(barX, barY, barHeight, 0, 2 * Math.PI);
                  canvasCtx.fill();
                }
              }
              
            // Draw a different visualization
            else if (currentStyle === 3) {
                var radius = canvas.height / 2 - 20;
                var bars = frequencyData.length;
                var barWidth = 2 * Math.PI / bars;
                var x = canvas.width / 2;
                var y = canvas.height / 2;
                for (var i = 0; i < bars; i++) {
                    var barHeight = frequencyData[i] / 2;
                    var radians = i * barWidth;
                    var barX = x + radius * Math.cos(radians - Math.PI / 2);
                    var barY = y + radius * Math.sin(radians - Math.PI / 2);
                    canvasCtx.fillStyle = '#333';
                    canvasCtx.fillRect(barX, barY, 2, barHeight);
                }
            }

            // Request the next frame
            requestAnimationFrame(renderVisualizer);
        }

        // Start rendering the visualizer
        renderVisualizer();

        // Add event listeners to the style buttons
        var style1Button = document.getElementById('style1');
        var style2Button = document.getElementById('style2');
        var style3Button = document.getElementById('style3');

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



    });
});      