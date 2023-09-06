const canvasWidthPercentage = 40;
const canvasHeightPercentage = 50;
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const WINDOW_WIDTH = (canvasWidthPercentage / 100) * screenWidth;
const WINDOW_HEIGHT = (canvasHeightPercentage / 100) * screenHeight;
const HEIGHT = 10;
const SPACING_HORIZONTAL = 35;
const SPACING_VERTICAL = 39;
const START_X = WINDOW_WIDTH / 2;
const START_Y = 50;
const PEG_RADIUS = 5;
const BALL_RADIUS = 6;
const TIME = 10;
const INCREMENT = 0.05;
const STEEPNESS = 0.25;
const BORDER = 3;
const STARTING_MONEY = 10000;

import { create_number } from './rng.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HEIGHT;
const treeTextureCanvas = document.createElement("canvas");
treeTextureCanvas.width = WINDOW_WIDTH;
treeTextureCanvas.height = WINDOW_HEIGHT;
const treeTextureCtx = treeTextureCanvas.getContext("2d");

function drawCircle(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
    ctx.fill()
}

function drawBox(ctx, x, y, width, height) {
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, width, height);
}

function createTriangularTree() {
    if (HEIGHT === 0) {
        return null;
    }

    let nodesInLevel = 1;
    let rowX = START_X;
    let rowY = START_Y;
    let finalRow = 1;
    const root = { x: rowX, y: rowY, multiplier: 1.0 };

    treeTextureCtx.strokeStyle = "black";
    treeTextureCtx.fillStyle = "black";
    drawCircle(treeTextureCtx, root.x, root.y, PEG_RADIUS);    
    rowY += SPACING_HORIZONTAL;
    rowX -= SPACING_VERTICAL / 2;

    const nodeQueue = [root];

    for (let i = 1; i < HEIGHT; i++) {
        let currentNode = null;
        let x = rowX;
        let y = rowY;

        for (let j = 0; j < nodesInLevel; ++j) {
            const prevNode = currentNode;
            currentNode = nodeQueue.shift();

            if (prevNode === null) {
                currentNode.left = { x, y, multiplier: 0};
                currentNode.left.multiplier += currentNode.multiplier * 0.5;
                nodeQueue.push(currentNode.left);
                x += SPACING_HORIZONTAL;

                if (i !== HEIGHT - 1) {
                    treeTextureCtx.fillStyle = "black";
                    drawCircle(treeTextureCtx, currentNode.left.x, currentNode.left.y, PEG_RADIUS);  
                } else {
                    drawBox(treeTextureCtx, currentNode.left.x - SPACING_HORIZONTAL / 2 + BORDER, currentNode.left.y, SPACING_HORIZONTAL - BORDER, SPACING_VERTICAL / 2);
                    finalRow++;
                }
            } else {
                currentNode.left = prevNode.right;
                currentNode.left.multiplier += currentNode.multiplier * 0.5;
            }

            currentNode.right = { x, y, multiplier: 0};
            currentNode.right.multiplier += currentNode.multiplier * 0.5;
            nodeQueue.push(currentNode.right);
            x += SPACING_HORIZONTAL;

            if (i !== HEIGHT - 1) {
                treeTextureCtx.fillStyle = "black"; 
                drawCircle(treeTextureCtx, currentNode.right.x, currentNode.right.y, PEG_RADIUS);                        
            } else {
                drawBox(treeTextureCtx, currentNode.right.x - SPACING_HORIZONTAL / 2 + BORDER, currentNode.right.y, SPACING_HORIZONTAL - BORDER, SPACING_VERTICAL / 2);
                finalRow++;
            }
        }

        nodesInLevel++;
        rowY += SPACING_VERTICAL;
        rowX -= SPACING_HORIZONTAL / 2;
    }

    return root;
}

const root = createTriangularTree();

function drawBall(x, y) {
    ctx.strokeStyle = "red";
    ctx.fillStyle = "red";
    drawCircle(ctx, x, y, BALL_RADIUS);
}

function setBallParams(ball, startingPositionX, startingPositionY, endingPositionX, endingPositionY) {
    const horizontalDisplacement = endingPositionX - startingPositionX;
    const verticalDisplacement = endingPositionY - startingPositionY;

    ball.positionX = startingPositionX;
    ball.positionY = startingPositionY;
    ball.velocityX = horizontalDisplacement / TIME;
    ball.velocityY = verticalDisplacement * STEEPNESS * -1;
    ball.accelerationY = (2 * (verticalDisplacement - ball.velocityY * TIME)) / (TIME * TIME);
}

function renderGame(balls, money) {
    ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

    ctx.drawImage(treeTextureCanvas, 0, 0);

    for (const ball of balls) {
        drawBall(ball.positionX, ball.positionY);
    }

    const moneyDisplay = document.getElementById("moneyDisplay");
    moneyDisplay.textContent = `Money: $${money.toFixed(2)}`;
}

let balls = [];
let money = STARTING_MONEY;
const bet = 100;

function gameLoop() {
    renderGame(balls, money);

    const activeBalls = [];

    for (const ball of balls) {
        ball.positionX += INCREMENT * ball.velocityX;
        ball.positionY += INCREMENT * ball.velocityY;
        ball.velocityY += INCREMENT * ball.accelerationY;
        
        if (Math.abs(ball.positionX - ball.dest.x) < 0.001) {
            const direction = create_number(2) - 1;
            if (direction === 0) {
                ball.start = ball.dest;
                ball.dest = ball.dest.left || {}; // Set dest as an empty object if left is undefined
            } else {
                ball.start = ball.dest;
                ball.dest = ball.dest.right || {}; // Set dest as an empty object if right is undefined
            }

            ball.positionX = ball.start.x;
            ball.positionY = ball.start.y - PEG_RADIUS - BALL_RADIUS;

            if (!ball.dest.x) { // Check if dest.x is not defined (empty object)
                money += (bet * (1 / ball.start.multiplier)) * (1.0 / HEIGHT);
                console.log(money);
                continue;
            } else {
                setBallParams(ball, ball.positionX, ball.positionY, ball.dest.x, ball.dest.y - PEG_RADIUS - BALL_RADIUS);
            }
        }
        activeBalls.push(ball);
    }

    // Replace the old balls array with the activeBalls array
    balls = activeBalls;

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", () => {
    money -= bet;
    balls.push({
        start: root,
        dest: root,
        positionX: WINDOW_WIDTH / 2,
        positionY: root.y - PEG_RADIUS - BALL_RADIUS,
        velocityX: 0,
        velocityY: 0,
        accelerationY: 5,
    });
});

gameLoop();