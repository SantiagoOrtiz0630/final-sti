//canvas
let canvas = document.getElementById("canvas");

canvas.style.height = canvas.clientWidth + "px";

var visualizer = function (p) {

    let id = idSonido;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;

    let song;

    let audioSpect = [];

    let audioSpectDos = [];

    let spectrum;

    p.preload = function () {
        p.soundFormats('mp3', 'ogg');
        let s = p.loadSound('/songs/' + id + '.mp3');
        song = s;
        fft = new p5.FFT();
    }

    p.setup = function () {
        p.createCanvas(width, height);
        p.noStroke();
        song.loop();

        spectrum = fft.waveform();

        audioSpect = new Array(8);
        for (var i = 0; i < audioSpect.length; i++) {
            audioSpect[i] = new Array(10);
        }

        for (let a = 0; a < audioSpect.length; a++) {
            for (let b = 0; b < audioSpect[a].length; b++) {
                audioSpect[a][b] = false;
            }
        }

        audioSpectDos = new Array(8);
        for (var i = 0; i < audioSpectDos.length; i++) {
            audioSpectDos[i] = new Array(10);
        }

        for (let a = 0; a < audioSpectDos.length; a++) {
            for (let b = 0; b < audioSpectDos[a].length; b++) {
                audioSpectDos[a][b] = false;
            }
        }

        p.frameRate(60);
    };

    p.draw = function () {
        p.background(5, 5, 7);

        let marX = width / 53.3333;
        let marY = height / 53.3333;

        let tamX = width / 9.6269;
        let tamY = height / 12.5;

        p.rectMode(p.CORNER);
        for (let x = 0; x < audioSpectDos.length; x++) {
            let i = 0;
            for (let y = 0; y < audioSpectDos[0].length; y++) {
                if (audioSpectDos[x][y]) {
                    let op = 33 - (i * 3);
                    p.fill(240, 240, 250, op);
                    p.rect((width - tamX) - (marX + (x * (tamX + marX))), (height - (marY + tamY)) - (y * (tamY + marY)), tamX,
                        tamY);
                    p.noFill();
                    p.fill(255);
                    p.noFill();
                    i++;

                    audioSpectDos[x][y] = false;
                }
            }
        }

        p.rectMode(p.CENTER);

        p.noFill();

        p.rectMode(p.CORNER);
        for (let x = 0; x < audioSpect.length; x++) {
            let i = 0;
            for (let y = 0; y < audioSpect[0].length; y++) {
                if (audioSpect[x][y]) {
                    let op = 55 - (i * 5);
                    p.fill(43, 184, 239, op);
                    p.rect((marX + (x * (tamX + marX))), (height - (marY + tamY)) - (y * (tamY + marY)), tamX,
                        tamY);
                    p.noFill();
                    p.fill(255);
                    p.noFill();
                    i++;

                    audioSpect[x][y] = false;
                }
            }
        }

        p.rectMode(p.CENTER);

        p.noFill();


        spectrum = fft.analyze();

        let num = 50;

        //
        let mov = 25;

        for (let i = mov; i < 1000; i += num) {
            let val = 0;

            for (let j = 0; j < num; j++) {
                let valor = Math.abs(spectrum[i + j]);
                val += (valor * 1);
            }

            let prom = val / num;

            let index = (i - mov) / num;

            if (index < audioSpect.length) {
                let n = parseInt(prom / 10) - 8;

                if (n < 0) {
                    n = 0;
                }

                if (n > audioSpect[0].length) {
                    n = 10;
                }

                for (let j = 0; j < n; j++) {
                    audioSpect[index][j] = true;
                }
            } else {
                break;
            }
        }
        //
        //
        let mov2 = mov + (num * audioSpect.length);

        for (let i = mov2; i < 1000; i += num) {
            let val = 0;

            for (let j = 0; j < num; j++) {
                let valor = Math.abs(spectrum[i + j]);
                val += (valor * 1);
            }

            let prom = val / num;

            let index = (i - mov2) / num;

            if (index < audioSpectDos.length) {
                let n = parseInt(prom / 10);

                if (n < 0) {
                    n = 0;
                }

                if (n > audioSpectDos[0].length) {
                    n = 10;
                }

                for (let j = 0; j < n; j++) {
                    audioSpectDos[index][j] = true;
                }
            } else {
                break;
            }
        }
        //
    };

    p.changePlay = function () {
        if (song != null) {
            if (!song.isPlaying()) {
                song.loop();
            }
        }
    }

    p.changePause = function () {
        if (song != null) {
            if (song.isPlaying()) {
                song.pause();
            }
        }
    }

    p.stop = function () {
        if (song != null) {
            song.stop();
        }
    }

    p.windowResized = function () {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        p.resizeCanvas(width, height);
    };

};

var myp5 = new p5(visualizer, canvas);

//menu


var btnPlay = document.getElementById('play');
btnPlay.addEventListener('click', myp5.changePlay);

var btnStop = document.getElementById('stop');
btnStop.addEventListener('click', myp5.stop);

var btnPause = document.getElementById('pause');
btnPause.addEventListener('click', myp5.changePause);

//canvas