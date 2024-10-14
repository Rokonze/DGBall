const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restart');
const modal = document.getElementById('modal');
const gameContainer = document.getElementById('game-container');
const playButton = document.getElementById('play');
const countDown = document.getElementById('countdown');
const menu = document.getElementById('menu-container');
const player1Score = document.getElementById('player1Score');
const player2Score = document.getElementById('player2Score');
const timer = document.getElementById('timer');
const goalAnnouncement = document.getElementById('goalAnnouncement');
const returnButton = document.getElementsByClassName('return');
const controlsContainer = document.getElementById('controls-container');
const controlsButton = document.getElementById('controls');


playButton.addEventListener("click", handlePlay);
returnButton[0].addEventListener("click", handleXPlay);
returnButton[1].addEventListener("click", handleXControls);
controlsButton.addEventListener("click", handleControls);

function handlePlay () {
    gameContainer.classList.add('show-game');
    menu.classList.remove('show-menu');
    let leftWall = new Wall(0, 0, 0, canvas.clientHeight, WALLS);
    let bottomWall = new Wall(0, canvas.clientHeight, canvas.clientWidth, canvas.clientHeight, WALLS);
    let rightWall = new Wall(canvas.clientWidth, canvas.clientHeight, canvas.clientWidth, 0, WALLS);
    let topWall = new Wall (canvas.clientWidth, 0 , 0, 0, WALLS);
    initEvents();
    Player1.acceleration = 0;
    Player2.acceleration = 0;
    timer.textContent = 90;
    timerPaused = true;
    startCounter();
    startTimer();
    
}

let startInterval;
let timeInterval;
let endTimeout;
let goalTimeout;

function startCounter () {
    let counter = 3;
    countDown.textContent = counter;
     startInterval = setInterval(() => {
        counter--;
        countDown.textContent = counter;
        if(counter === 0) {
            clearInterval(startInterval);
            timerPaused = false;
            Player1.acceleration = 0.03;
            Player2.acceleration = 0.03;
            countDown.textContent = "GO!";
            setTimeout(() => {
                countDown.textContent = "";
            }, 500);
        }
    }, 1000);
}

function startTimer () {
    
     timeInterval = setInterval(() => {
        if(!timerPaused) {
            timer.textContent = parseInt(timer.textContent) - 1;
        }
        if(parseInt(timer.textContent) === 0) {
            clearInterval(timeInterval);
            modal.classList.add('show-modal');
            if(parseInt(player1Score.textContent) > parseInt(player2Score.textContent)) {
                goalAnnouncement.textContent = "Player 1 wins!";
                goalAnnouncement.style.color = "#088F8F";
            } else if(parseInt(player1Score.textContent) < parseInt(player2Score.textContent)) {
                goalAnnouncement.textContent = "Player 2 wins!";
                goalAnnouncement.style.color = "#FF5733";
            } else {
                goalAnnouncement.textContent = "It's a draw!";
                goalAnnouncement.style.color = "#5F7161";
            }
            endTimeout = setTimeout(() => {
                modal.classList.remove('show-modal');
                gameContainer.classList.remove('show-game');
                menu.classList.add('show-menu');
                player1Score.textContent = 0;
                player2Score.textContent = 0;
                timer.textContent = 90;
                resetGoal();
            }, 5000);
        }
    }, 1000);
}

function resetGoal (ball_x = 500, ball_y = 300) {
    Player1.acceleration = 0;
    Player2.acceleration = 0;

    //reset player1
    Player1.pos.x = 150;
    Player1.pos.y = 300;
    Player1.acc.x = 0;    
    Player1.acc.y = 0;
    Player1.vel.x = 0;
    Player1.vel.y = 0;

    //reset player2
    Player2.pos.x = 850;
    Player2.pos.y = 300;
    Player2.acc.x = 0;    
    Player2.acc.y = 0;
    Player2.vel.x = 0;
    Player2.vel.y = 0;

    //reset Ball

    Ball1.pos.x = ball_x;
    Ball1.pos.y = ball_y;
    Ball1.acc.x = 0;    
    Ball1.acc.y = 0;
    Ball1.vel.x = 0;
    Ball1.vel.y = 0;
    Ball1.isInGoal = false;
}

function handleXPlay () {
    gameContainer.classList.remove('show-game');
    menu.classList.add('show-menu');
    clearInterval(startInterval);
    clearInterval(timeInterval);
    clearTimeout(endTimeout);
    clearTimeout(goalTimeout);
    resetGoal();
    player1Score.textContent = 0;
    player2Score.textContent = 0;
    timer.textContent = 90;
    goalAnnouncement.textContent = "";
    
}

function handleControls () {
    menu.classList.remove('show-menu');
    controlsContainer.classList.add('show-controls');
}

function handleXControls () {
    controlsContainer.classList.remove('show-controls');
    menu.classList.add('show-menu');
}

const BALLS = [];
const WALLS = [];
const FIELD_WALLS = [];
let LEFT1, RIGHT1, UP1, DOWN1, SPACE1;
let LEFT2, RIGHT2, UP2, DOWN2, SPACE2;

  // New cooldown flag
let cooldownDuration = 10;

let friction = 0.01;

let timerPaused = false;

class Vector {
    constructor (x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector(this.x+v.x, this.y+v.y);
    }
    substract(v) {
        return new Vector(this.x-v.x, this.y-v.y);
    }    
    magnitude() {
        return Math.sqrt(this.x**2 + this.y**2);
    }
    multiply(n) {
        return new Vector(this.x*n, this.y*n);
    }
    compare (v) {
        if(this.x > v.x && this.y > v.y) {
            return true;
        } else {
            return false;
        }
    }
    cmp_abs (v) {
        let x,y;
        if(Math.abs(this.x) < v.x) {
            x = this.x;
        } else {
            x = this.x > 0 ? v.x : -v.x;
        }
        if(Math.abs(this.y) < v.y) {
            y = this.y;
        } else {
            y = this.y > 0? v.y : -v.y;
        }
        return new Vector(x, y);

    }

    normal() {
        return new Vector ( -this.y, this.x).unit();
    }

    unit() {
        if(this.magnitude() === 0) {
            return new Vector (0,0);
        } else {
            return new Vector(this.x / this.magnitude(), this.y / this.magnitude());
        }
    }

    static dot(v1, v2) {
        return v1.x*v2.x + v1.y*v2.y;
    }
}

class Ball{
    constructor(x, y, r, m, e){
        this.pos = new Vector (x, y);
        this.r = r;
        this.m = m;
        if(this.m === 0) {
            this.inv_m = 0;
        } else {
            this.inv_m = 1/ this.m;
        }
        this.shootCooldown = false;
        this.elasticity = e;
        this.vel = new Vector(0,0);
        this.acc = new Vector(0,0);
        this.acceleration = 0.03;
        this.player = false;
        BALLS.push(this);
    }

    drawBall(lW = 1, sS ='#000', color = 'white') {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI *2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = sS;
        ctx.lineWidth = lW;
        ctx.stroke();
        ctx.closePath();
    }

    

    reposition () {
        this.acc = this.acc.unit().multiply(this.acceleration);
        this.vel = (this.vel.add(this.acc))    ;
        
            this.vel = (this.vel.multiply(1-friction));
            
        
        
        this.pos = this.pos.add(this.vel);
        
    }
}

class Wall {
    constructor(x1, y1, x2, y2, array) {
         this.start = new Vector(x1, y1);
         this.end = new Vector(x2, y2);
         array.push(this);
    }

    drawWall(color, width){
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y)
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "square";  
        ctx.stroke();
        ctx.closePath();
    }

    wallUnit() {
        return this.end.substract(this.start).unit();
    }
}

class Goal {
    constructor (x1, y1, x2, y2){
        this.topCorner = new Vector(x1, y1);
        this.bottomCorner = new Vector(x2, y2);
    }
}

function drawGameElements() {

    ctx.beginPath();
    ctx.fillStyle = "#A9A9A9";
    ctx.fillRect(0,200, 100, 200);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = "#A9A9A9";
    ctx.fillRect(900,200, 100, 200);
    ctx.closePath();

    // draw middle line
    ctx.beginPath();
    ctx.moveTo(500, 50);
    ctx.lineTo(500, 550);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.closePath();

    // draw middle circle
    ctx.beginPath();
    ctx.arc(canvas.clientWidth/2, canvas.clientHeight/2, 70, 0, Math.PI * 2);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.closePath();

    //draw goals
    ctx.beginPath();
    ctx.moveTo(100, 200);
    ctx.lineTo(100, 400);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(900, 200);
    ctx.lineTo(900, 400);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.closePath();

    

}


function keyControlPlayer1 (b) {
    document.addEventListener('keydown', handleKeyDownPlayer1);
    document.addEventListener('keyup', handleKeyUpPlayer1);
    function handleKeyDownPlayer1(e) {
        const {key} = e;
        const {code} = e;
        if(key === 'd'){
            RIGHT1 = true;
        }
        if(key === 'a') {
            LEFT1 = true;
        }
        if(key === 'w'){
            UP1 = true;
        }
        if(key === 's'){
            DOWN1 = true;
        }        
        if(code === 'Space' && !SPACE1 && !e.repeat){
            SPACE1 = true;
            
            setTimeout ( () => {
                SPACE1 = false;
            }, 150);
            
        }
        
    }
    
    function handleKeyUpPlayer1(e) {
        const {key} = e;
        const {code} = e;
        if(key === 'd'){
            RIGHT1 = false;
        }
        if(key === 'a') {
            LEFT1 = false;
        }
        if(key === 'w'){
            UP1 = false;
        }
        if(key === 's'){
            DOWN1 = false;
        }     
        
    }
    
}

function shoot(player, ball) {
    // Calculate the direction vector from the player to the ball
    const direction = ball.pos.substract(player.pos);

    // Normalize the direction vector to get the unit vector
    const normalizedDirection = direction.unit();

    // Apply a force to the ball in the direction of the shot
    const force = 5; // Adjust the force as needed
    const shotVelocity = normalizedDirection.multiply(force);

    // Set the ball's velocity
    ball.vel = ball.vel.add(shotVelocity);
    

    player.shootCooldown = true;
    setTimeout(() => {
        player.shootCooldown = false;
    }, cooldownDuration);
}

function player1Movement (b) {
    
    if(LEFT1) {
        b.acc.x = -b.acceleration;
    }
    if(RIGHT1) {
        b.acc.x = b.acceleration;
    }
    if(UP1) {
        b.acc.y = -b.acceleration;
    }
    if(DOWN1) {
        b.acc.y = b.acceleration;
    }

    if(SPACE1 && !b.shootCooldown && collision_detection(b, Ball1)){
        
       // Calculate shooting direction
       shoot(b, Ball1);
       
    } 

    if(SPACE1) {
        b.drawBall(2, '#fff', '#088F8F');
    }

    if(!UP1 && !DOWN1) {
        b.acc.y = 0;
    }
    if(!LEFT1 && !RIGHT1) {
        b.acc.x = 0;
    }
}

function keyControlPlayer2 (b) {
    document.addEventListener('keydown', handleKeyDownPlayer2);
    document.addEventListener('keyup', handleKeyUpPlayer2);
    function handleKeyDownPlayer2(e) {
        const {key} = e;
        
        if(key === 'ArrowRight'){
            RIGHT2 = true;
        }
        if(key === 'ArrowLeft') {
            LEFT2 = true;
        }
        if(key === 'ArrowUp'){
            UP2 = true;
        }
        if(key === 'ArrowDown'){
            DOWN2 = true;
        }    
        if(key === 'Enter' && !SPACE2 && !e.repeat){
            SPACE2 = true;
            setTimeout ( () => {
                SPACE2 = false;
            }, 150)
        }    
    }
    
    function handleKeyUpPlayer2(e) {
        const {key} = e;
        
        if(key === 'ArrowRight'){
            RIGHT2 = false;
        }
        if(key === 'ArrowLeft') {
            LEFT2 = false;
        }
        if(key === 'ArrowUp'){
            UP2 = false;
        }
        if(key === 'ArrowDown'){
            DOWN2 = false;
        }     
           
    }
}

function player2Movement (b) {
    if(LEFT2) {
        b.acc.x = -b.acceleration;
    }
    if(RIGHT2) {
        b.acc.x = b.acceleration;
    }
    if(UP2) {
        b.acc.y = -b.acceleration;
    }
    if(DOWN2) {
        b.acc.y = b.acceleration;
    }
    if(SPACE2 && !b.shootCooldown && collision_detection(b, Ball1)){
        
       // here is also ball shot from player 2 
       shoot(b, Ball1); 
    } 
    if(SPACE2) {
        b.drawBall(2, '#fff', '#FF5733');
    }

    if(!UP2 && !DOWN2) {
        b.acc.y = 0;
    }
    if(!LEFT2 && !RIGHT2) {
        b.acc.x = 0;
    }

}



function closestPointBW(b1, w1){
    let ballToWallStart = w1.start.substract(b1.pos);
    if(Vector.dot(w1.wallUnit(), ballToWallStart) > 0){
        return w1.start;
    }

    let wallEndToBall = b1.pos.substract(w1.end);
    if(Vector.dot(w1.wallUnit(), wallEndToBall) > 0){
        return w1.end;
    }

    let closestDist = Vector.dot(w1.wallUnit(), ballToWallStart);
    let closestVect = w1.wallUnit().multiply(closestDist);
    return w1.start.substract(closestVect);
}

function collision_detection (b1, b2) {
    if (b1.r + b2.r >= b2.pos.substract(b1.pos).magnitude() ){
        return true;
    } else {
        return false;
    }
}

function collision_detection_BW (b1, w1) {
    let ballToClosest = closestPointBW(b1, w1).substract(b1.pos);
    if(ballToClosest.magnitude() <= b1.r){
        return true;
    }
}

function penetration_resolution (b1, b2) {
    let dist = b1.pos.substract(b2.pos);
    let pen_depth = b1.r + b2.r - dist.magnitude();
    let pen_res = dist.unit().multiply(pen_depth/ (b1.inv_m + b2.inv_m));
    b1.pos = b1.pos.add(pen_res.multiply(b1.inv_m));
    b2.pos = b2.pos.add(pen_res.multiply(-b2.inv_m));
    
}

function penetration_resolution_BW(b1, w1){
    let penVect = b1.pos.substract(closestPointBW(b1, w1));
    b1.pos = b1.pos.add(penVect.unit().multiply(b1.r-penVect.magnitude()));
}

function collision_resolution (b1, b2) {
    if (b1.shootCooldown && (b1 === Player1 || b1 === Player2))  {
        // Avoid collision resolution if the player just shot the ball
        return;
    }
    let normal = b1.pos.substract(b2.pos).unit();
    let relVel = b1.vel.substract(b2.vel);
    let sepVel = Vector.dot(relVel, normal);
    let new_sepVel = -sepVel * Math.min(b1.elasticity, b2.elasticity);
    
    let vsep_diff = new_sepVel - sepVel;
    let impulse = vsep_diff / (b1.inv_m + b2.inv_m);
    let impulseVec = normal.multiply(impulse);

    b1.vel = b1.vel.add(impulseVec.multiply(b1.inv_m));
    b2.vel = b2.vel.add(impulseVec.multiply(-b2.inv_m));
    b2.vel = b2.vel.cmp_abs(maxSpeed);  
     
   
    
}

function collision_resolution_BW (b1, w1){
    let normal = b1.pos.substract(closestPointBW(b1, w1)).unit();
    let sepVel = Vector.dot(b1.vel, normal);
    let new_sepVel = -sepVel * b1.elasticity;
    let vsep_diff = sepVel - new_sepVel;
    b1.vel = b1.vel.add(normal.multiply(-vsep_diff));   
}

function checkGoal() {
    // if((Ball1.pos.compare(leftGoal.topCorner)) && (leftGoal.bottomCorner.compare(Ball1.pos)) ||
    //     (Ball1.pos.compare(rightGoal.topCorner)) && (rightGoal.bottomCorner.compare(Ball1.pos))) {
    //     Ball1.isInGoal = true;
    //     modal.classList.add('show-modal');
       
        
    // } 
    if(!Ball1.isInGoal) {
    if((Ball1.pos.compare(leftGoal.topCorner)) && (leftGoal.bottomCorner.compare(Ball1.pos))) {
        Ball1.isInGoal = true;
        player2Score.textContent = parseInt(player2Score.textContent) + 1;
        goalRes(Player2);
    } else if((Ball1.pos.compare(rightGoal.topCorner)) && (rightGoal.bottomCorner.compare(Ball1.pos))) {
        Ball1.isInGoal = true;
        player1Score.textContent = parseInt(player1Score.textContent) + 1;
        goalRes(Player1);
    }
}
}

function goalRes (player) {
    modal.classList.add('show-modal');
    if(player === Player2) {
        goalAnnouncement.textContent = "Player 2 scores!";
        goalAnnouncement.style.color = "#FF5733";
    } else if( player === Player1) {
        goalAnnouncement.textContent = "Player 1 scores!";
        goalAnnouncement.style.color = "#088F8F";
    }
    timerPaused = true;
    goalTimeout = setTimeout(() => {
        if(player === Player2) {
            resetGoal(250, 300);
        } else if(player === Player1) {
            resetGoal(750, 300);
        }
        modal.classList.remove('show-modal');
        startCounter();
            
    }, 3000);
}

function initEvents () {
    BALLS.forEach((b) => {
        if(b.player1) {
            keyControlPlayer1(b);
            
        }
        if(b.player2) {
            keyControlPlayer2(b);
        }
    })
}


function draw () {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    drawGameElements();
    
    WALLS.forEach((w) => {
        w.drawWall("#5F7161", 1);
    })
    FIELD_WALLS.forEach((w) => {
        w.drawWall("white", 8);
    })
   
    BALLS.forEach((b, index) => {
        

        if(b.player1){
            b.drawBall(1, '#5F7161', '#088F8F');
        }
        else if(b.player2){
            b.drawBall(1, '#5F7161', '#FF5733');
        } else {
            b.drawBall(1, '#5F7161', 'white');
        }
        
        if(b.player1){
            player1Movement(b);
        }
        if(b.player2){
            player2Movement(b);
        }
        
        
        

        WALLS.forEach((w)=> {
            if(collision_detection_BW(BALLS[index], w)){
                penetration_resolution_BW(BALLS[index], w);
                collision_resolution_BW(BALLS[index], w);
            }
        })
        FIELD_WALLS.forEach((w)=> {
            if(collision_detection_BW(BALLS[index], w)){
                penetration_resolution_BW(BALLS[index], w);
                collision_resolution_BW(BALLS[index], w);
            }
        })
        
        for ( let i = index+1; i< BALLS.length; i++){
            if(collision_detection(BALLS[index], BALLS[i])) {
                penetration_resolution(BALLS[index], BALLS[i]);
                collision_resolution(BALLS[index], BALLS[i]);
               }
        }

        
        b.reposition();
        
    })
    
    
    checkGoal();
    
    
    
    window.requestAnimationFrame(draw);
}

let Player1 = new Ball(150, 300, 20, 10, 0.2);
let Player2 = new Ball (850, 300, 20, 10, 0.2);
let Ball1 = new Ball ( 500, 300, 16, 3, 1);


let maxSpeed = new Vector ( 7, 7);


//create game field;
let topFieldWall = new Wall ( 100, 50, 900, 50, FIELD_WALLS);
let bottomFieldWall = new Wall (100, 550, 900, 550, FIELD_WALLS);
let leftFieldWall1 = new Wall(100, 50, 100, 200, FIELD_WALLS);
let leftFieldWall2 = new Wall (100, 400, 100, 550, FIELD_WALLS);
let leftTopGoalWall = new Wall (100, 200, 0, 200, FIELD_WALLS);
let leftBottomGoalWall = new Wall (100, 400, 0, 400, FIELD_WALLS);

let rightFieldWall1 = new Wall(900, 50, 900, 200, FIELD_WALLS);
let rightFieldWall2 = new Wall(900, 400, 900, 550, FIELD_WALLS);
let rightTopGoalWall = new Wall (900, 200, 1000, 200, FIELD_WALLS);
let rightBottomGoalWall = new Wall (900, 400, 1000, 400, FIELD_WALLS);

let leftGoalTopPost = new Ball (100, 200, 12, 0, 1);
let leftGoalBottomPost = new Ball (100, 400, 12, 0, 1);
let rightGoalTopPost = new Ball (900, 200, 12, 0, 1);
let rightGoalBottomPost = new Ball (900, 400, 12, 0, 1);

//create goals
let leftGoal = new Goal (0, 200, 100-Ball1.r, 400);
let rightGoal = new Goal (900+Ball1.r, 200, 1000, 400);





Player1.player1 = true;
Player2.player2 = true;



window.requestAnimationFrame(draw);
