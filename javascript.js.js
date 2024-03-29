/** 
snake game
**/
let replay = document.querySelector("#rep");
let score = document.querySelector("#score");
let canvas = document.createElement("canvas");
document.querySelector("#canvas").appendChild(canvas);
let ctx = canvas ? canvas.getContext("2d") : null;

function cnvRes(width = 400, height = 400) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
}
let _vars = {
    snake: undefined,
    snakeLength: undefined,
    food: undefined,
    currentHue: undefined,
    segments: undefined,
    historyPath: [],
    gameOver: false,
    tails: [],
    update: undefined,
    maxScore: window.localStorage.getItem("maxScore") || undefined,
    particles: [],
    particleCount: 50
};

// Helper functions
let _helpers = {
    collision(isSelfCol, snakeHead) {
        if (isSelfCol) {
            if (snakeHead.x == _vars.food.x && snakeHead.y == _vars.food.y) {
                particleSplash();
                _vars.food.respawn();
                _vars.tails.push(new Snake(_vars.snakeLength - 1, "tail"));
                _vars.snakeLength++;
                _vars.snake.delay - 0.5;
            }
        } else {
            for (let i = 1; i < _vars.historyPath.length; i++) {
                if (
                    snakeHead.x == _vars.historyPath[i].x &&
                    snakeHead.y == _vars.historyPath[i].y
                ) {
                    _vars.gameOver = true;
                }
            }
        }
    },
    randHue() {
        return Math.floor(Math.random() * 360);
    },
    locationLog(limit, loc) {
        _vars.historyPath.push(loc);
        if (_vars.historyPath.length > limit) {
            _vars.historyPath.shift();
        }
    },
    hsl2rgb(hue, saturation, lightness) {
        if (hue == undefined) {
            return [0, 0, 0];
        }

        var chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
        var huePrime = hue / 60;
        var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

        huePrime = Math.floor(huePrime);
        var red;
        var green;
        var blue;

        if (huePrime === 0) {
            red = chroma;
            green = secondComponent;
            blue = 0;
        } else if (huePrime === 1) {
            red = secondComponent;
            green = chroma;
            blue = 0;
        } else if (huePrime === 2) {
            red = 0;
            green = chroma;
            blue = secondComponent;
        } else if (huePrime === 3) {
            red = 0;
            green = secondComponent;
            blue = chroma;
        } else if (huePrime === 4) {
            red = secondComponent;
            green = 0;
            blue = chroma;
        } else if (huePrime === 5) {
            red = chroma;
            green = 0;
            blue = secondComponent;
        }

        var lightnessAdjustment = lightness - chroma / 2;
        red += lightnessAdjustment;
        green += lightnessAdjustment;
        blue += lightnessAdjustment;

        return [
            Math.round(red * 255),
            Math.round(green * 255),
            Math.round(blue * 255)
        ];
    },
    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }
};
// Controls
let _input = {
    left: false,
    down: false,
    right: true,
    up: false,
    listen() {
        addEventListener(
            "keydown",
            (e) => {
                switch (e.key) {
                    case "ArrowLeft":
                        if (!this.right) {
                            this.left = true;
                            this.down = false;
                            this.right = false;
                            this.up = false;
                        }
                        break;
                    case "ArrowRight":
                        if (!this.left) {
                            this.left = false;
                            this.down = false;
                            this.right = true;
                            this.up = false;
                        }
                        break;
                    case "ArrowUp":
                        if (!this.down) {
                            this.left = false;
                            this.down = false;
                            this.right = false;
                            this.up = true;
                        }
                        break;
                    case "ArrowDown":
                        if (!this.up) {
                            this.left = false;
                            this.down = true;
                            this.right = false;
                            this.up = false;
                        }
                        break;
                    default:
                        break;
                }
            },
            false
        );
    }
};

// Snake class
class Snake {
    constructor(i, type) {
        this.x = type === "tail" ? _vars.historyPath[i].x : 0;
        this.y = type === "tail" ? _vars.historyPath[i].y : 0;
        this.type = type;
        this.index = i;
        this.delay = 10;
        this.localDelay = 10;
        this.size = ctx.canvas.width / _vars.segments;
        this.color = type == "tail" ? "black" : "black";
    }
    draw() {
        ctx.shadowBlur = 0;
        if (this.type !== "tail") {
            ctx.shadowBlur = 15;
            ctx.shadowColor = "rgba(255,255,255,.3 )";
            ctx.strokeStyle = "rgba(255,255,255,.3 )";
        }
        ctx.strokeStyle = "rgba(255,255,255,.8 )";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
    update() {
        this.draw();
        if (this.localDelay < 0) {
            if (this.type == "tail") {
                this.x = _vars.historyPath[this.index].x;
                this.y = _vars.historyPath[this.index].y;
            } else {
                this.localDelay = this.delay;
                if (_input.left) {
                    this.x -= ctx.canvas.width / _vars.segments;
                }
                if (_input.right) {
                    this.x += ctx.canvas.width / _vars.segments;
                }
                if (_input.up) {
                    this.y -= ctx.canvas.width / _vars.segments;
                }
                if (_input.down) {
                    this.y += ctx.canvas.width / _vars.segments;
                }
                if (this.x + ctx.canvas.width / _vars.segments > ctx.canvas.width) {
                    this.x = 0;
                }
                if (this.y + ctx.canvas.height / _vars.segments > ctx.canvas.width) {
                    this.y = 0;
                }
                if (this.y < 0) {
                    this.y = ctx.canvas.height - ctx.canvas.height / _vars.segments;
                }
                if (this.x < 0) {
                    this.x = ctx.canvas.width - ctx.canvas.width / _vars.segments;
                }
                _helpers.collision(true, {...this });
                _helpers.collision(false, {...this });
                _helpers.locationLog(_vars.snakeLength, { x: this.x, y: this.y });
            }
        } else {
            this.localDelay--;
        }
    }
}
// Food class
class Food extends Snake {
    constructor() {
        super();
        this.x =
            (Math.floor(Math.random() * _vars.segments) * ctx.canvas.width) /
            _vars.segments;
        this.y =
            (Math.floor(Math.random() * _vars.segments) * ctx.canvas.height) /
            _vars.segments;
        this.color = _vars.currentHue = `hsl(${_helpers.randHue()}, 100%, 55%)`;
    }
    draw() {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 30;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
    respawn() {
        let nX =
            (Math.floor(Math.random() * _vars.segments) * ctx.canvas.width) /
            _vars.segments;
        let nY =
            (Math.floor(Math.random() * _vars.segments) * ctx.canvas.height) /
            _vars.segments;
        this.color = _vars.currentHue = `hsl(${_helpers.randHue()}, 100%, 50%)`;
        if (this.x == nX && this.y == nY) return this.respawn();
        for (let i = 0; i < _vars.historyPath.length; i++) {
            if (nX == _vars.historyPath[i].x && nY == _vars.historyPath[i].y) {
                return this.respawn();
            } else {
                this.x = nX;
                this.y = nY;
            }
        }
    }
}

// Updates score
function scoreManager() {
    let currentScore = _vars.snakeLength - 1;
    score.innerText = currentScore.toString();
}

/* Instantiate particles, the amount can be set in particleCount variable. */
function particleSplash() {
    for (let i = 0; i < _vars.particleCount; i++) {
        _vars.particles.push(
            new Particle(
                _vars.food.x,
                _vars.food.y,
                _vars.currentHue,
                _vars.food.size
            )
        );
    }
}
/* This is the grid you see in game, I thought about using it as an image instead of generating it every update, but it runs just fine. */
function grid() {
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = "white";
    ctx.shadowBlur = 0;
    for (let i = 1; i < _vars.segments; i++) {
        let f = (ctx.canvas.width / _vars.segments) * i;
        ctx.beginPath();
        ctx.moveTo(f, 0);
        ctx.lineTo(f, ctx.canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, f);
        ctx.lineTo(ctx.canvas.width, f);
        ctx.stroke();
    }
}
// Initializing the game.
function setup() {
    cnvRes();
    _input.listen();
    _vars.segments = 20;
    _vars.snakeLength = 1;
    _vars.snake = new Snake("head");
    _vars.food = new Food();
    loop();
}
// Loop.
function loop() {
    _vars.update = setInterval(() => {
        if (!_vars.gameOver) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            grid();
            _vars.snake.update();
            if (_vars.tails.length) {
                for (let i = 0; i < _vars.tails.length; i++) {
                    _vars.tails[i].update();
                }
            }
            _vars.food.draw();
            scoreManager();
            for (let i = 0; i < _vars.particles.length; i++) {
                _vars.particles[i].update();
            }
            cleanMem();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            gameOver();
        }
    }, 1000 / 60);
}
setup();

replay.addEventListener("click", () => {
    reset();
});

// This function takes care of displaying score and max score, and then updates the localStorage Object.
function gameOver() {
    _vars.maxScore ? null : (_vars.maxScore = _vars.snakeLength - 1);
    _vars.snakeLength - 1 > _vars.maxScore ?
        (_vars.maxScore = _vars.snakeLength - 1) :
        null;
    window.localStorage.setItem("maxScore", _vars.maxScore);
    ctx.fillStyle = "#4cffd7";
    ctx.textAlign = "center";
    ctx.font = "bold 30px Poppins, sans-serif";
    ctx.fillText("GAME OVER", ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.font = "15px Poppins, sans-serif";
    ctx.fillText(
        `SCORE   ${_vars.snakeLength - 1}`,
        ctx.canvas.width / 2,
        ctx.canvas.height / 2 + 60
    );
    ctx.fillText(
        `MAXSCORE   ${_vars.maxScore}`,
        ctx.canvas.width / 2,
        ctx.canvas.height / 2 + 80
    );
}
// This function is triggered when snake dies, it resets variables.
function reset() {
    clearInterval(_vars.update);
    _vars.snake = undefined;
    _vars.snakeLength = undefined;
    _vars.food = undefined;
    _vars.currentHue = undefined;
    _vars.segments = undefined;
    _vars.historyPath = [];
    _vars.gameOver = false;
    _vars.tails = [];
    _vars.update = undefined;
    _input.left = false;
    _input.down = false;
    _input.right = true;
    _input.up = false;
    setup();
}