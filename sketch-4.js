
// Variables
var MOVFRQ = 0.5;    //Movement frequency, see movePerson method    // Real-time
var popdensity = 0.25;                                                 // Initial
var socialdistancingremoval = 0.08;                                   // Initial
var socialdistancing = true;                                             // Real-time
var fastforward = 1; // 1-5
var res;

// Corona specific constants
var INITIALCORONA = 0.98;
var daysRecoveryForCriticalCases = 32;
var daysRecoveryForNormalCases = 14;
var criticalCasePercentage = 0.05;
var TRANSCHANCE = 0.75;     // Chance of transmission if close to infected
var dayIncPerFrame = 1;      // Day increment per frame, added to days infected

var rows = 40;
var col = 40;

var infected;
//var died = 0;
var population;
//var percentagedied;
var percentageinfected;
var time = 0;
var grid;

var startButton;
var start;
var touchTime;
var canvasWidth, canvasHeight;
var touchResponse = 10;

//var chanceOfDeath = 0.5;
// var diedarray = [];

function setup(){
  if (deviceOrientation == 'portrait'){
    if (windowWidth < 600){
      canvasWidth = (windowWidth - 40) - (windowWidth) % 20;
      canvasHeight = ((windowWidth - 40) - (windowWidth) % 20) + 70;
    } else {
      canvasWidth = windowWidth/2;
      canvasHeight = windowWidth/2 + 70;
    }
  } else if (deviceOrientation == 'landscape'){
    if (windowWidth < 1000){
      canvasWidth = (windowWidth/2);
      canvasHeight = (windowWidth/2) + 70;
    } else {
      canvasWidth = windowHeight/2;
      canvasHeight = (windowHeight/2) + 70;
    }
  }
  res = canvasWidth/col;

  var canvas = createCanvas(canvasWidth, canvasHeight);

  background(51);
  frameRate(60);
  adjustFrameSize();
  startButton = new Widget(10, height - 30, width * (28/100), 25, "Start");
  resetButton = new Widget(width * (5/16) + 10, height - 30, width*(3/16), 25, "Reset")
  slowForward = new Widget(width * (1/2) + 20, height - 30, width/8, 25, "Slow");
  fastForward = new Widget(width * (5/8) + 30, height - 30, width/8, 25, "Fast");
  start = false;

  population = 0;

  grid = new Array(col);
  for (var i = 0; i < col; i++){
    grid[i] = new Array(rows);
    for (var j = 0; j < rows; j++){
      if(random(1) < popdensity){
        grid[i][j] = new Cell(new Person(i, j), i, j);
        population++;
      } else {
        grid[i][j] = new Cell(null, i , j);
      }
    }
  }

  var x, y;

  for (var i = 0; i < col; i++){
    for (var j = 0; j < rows; j++){

      x = (i + col + 1) % col;
      var right = grid[x][j];

      x = (i + col - 1) % col;
      var left = grid[x][j];

      y = (j + rows + 1) % rows;
      var down = grid[i][y];

      y = (j + rows - 1) % rows;
      var up = grid[i][y];

      var cells = {up, right, down, left};
      grid[i][j].defineNeighbours(cells);
    }
  }
}


function draw(){
  background(51);
  displayGrid();
  if (start) {
    for (var i = 0; i < fastforward; i++){
      iterate();
    }
    time+=dayIncPerFrame;
  }
  infected = countInfected();
  //died = countDied();

  startButton.touchTime++;
  slowForward.touchTime++;
  fastForward.touchTime++;
  resetButton.touchTime++;

  percentageinfected = ((infected))/(population);
  //percentagedied = ((died))/(infected);
  //percentagedied+=MORTRATE;

  fill(255);
  textSize(17);
  noStroke();

  text("x" + fastforward, width * (89/100), height - 12);
  text("Infected: " + (round((percentageinfected) *10000))/100 + "%", width * (3/10), height - 47);
}

function displayGrid(){
  for (var i = 0; i < col; i++){
    for (var j = 0; j < rows; j++){
      var x = j * res;
      var y = i * res;

      if (grid[i][j].personPresent()){
        if (grid[i][j].getPerson().isInfected()){
          fill(255, 0, 0);
        } else {
          fill(0, 200, 0);
        }
      } else {
        fill(0);
      }

      stroke(51);

      rect(x, y, res, res);
    }
  }

  startButton.display();
  fastForward.display();
  slowForward.display();
  resetButton.display();
}


function iterate(){
  // Declare next
  var next = new Array(col);

  for (var i = 0; i < col; i++){
    next[i] = new Array(rows);
    for (var j = 0; j < rows; j++){
       next[i][j] = new Cell(null, i , j);
    }
  }

  // Initialize next
  for (var i = 0; i < col; i++){
    for (var j = 0; j < rows; j++){

      var x, y;
      x = (i + col + 1) % col;
      var right = next[x][j];

      x = (i + col - 1) % col;
      var left = next[x][j];

      y = (j + rows + 1) % rows;
      var down = next[i][y];

      y = (j + rows - 1) % rows;
      var up = next[i][y];

      var cells = {up, right, down, left};
      next[i][j].defineNeighbours(cells);
    }
  }

  // INFECTION
  for (var i = 0; i < col; i++){
    for (var j = 0; j < rows; j++){
      if(grid[i][j].personPresent()){
      for (var n = 0; n < 4; n++){

        var neighbour;

        if (n == 0){
          neighbour = grid[i][j].getNeighbours().up.getPerson();
        } else if (n == 1){
          neighbour = grid[i][j].getNeighbours().right.getPerson();
        } else if (n == 2){
          neighbour = grid[i][j].getNeighbours().down.getPerson();
        } else if (n == 3){
          neighbour = grid[i][j].getNeighbours().left.getPerson();
        }

        if(neighbour != null && neighbour.isInfected()){
           if(random(1) < TRANSCHANCE){
             grid[i][j].getPerson().infect();
           }
        }
      }

      // Increment days of infection
      if (grid[i][j].getPerson().isInfected()){
        grid[i][j].getPerson().addDay();
      }
      }
    }
  }

  // MOVEMENT
  for (var i = 0; i < col; i++){
    for (var j = 0; j < rows; j++){
      if (grid[i][j].personPresent()){
        grid[i][j].movePerson(grid[i][j].dirMovable(), next[i][j].getNeighbours(), next);
      }
    }
  }


  // RECOVERY
  for (var i = 0; i < col; i++){
    for (var j = 0; j < rows; j++){
      if (grid[i][j].personPresent() && grid[i][j].getPerson().isInfected() && grid[i][j].getPerson().getDaysInfected() >= daysRecoveryForNormalCases * random(3)){
        if (!grid[i][j].getPerson().isCriticalCase()){
          grid[i][j].getPerson().recover();
        } else if (grid[i][j].getPerson().getDaysInfected() >= daysRecoveryForCriticalCases){
          grid[i][j].getPerson().recover();
        }
      }
    }
  }

  grid = next;
}

function countInfected(){
  var counter = 0;
  for (var i = 0; i < col; i++){
    for (var j = 0; j < rows; j++){
      if (grid[i][j].personPresent() && grid[i][j].getPerson().isInfected()){
        counter++;
      }
    }
  }
  return counter;
}
/*
function countDied(){
  var counter = 0;
  for (var i = 0; i < col; i++){
    for (var j = 0; j < rows; j++){
      if (grid[i][j].personPresent()){
        counter++;
      }
    }
  }
  return population - counter;
}
*/
// cell
function Cell (p, x_, y_){
  this.x = x_;
  this.y = y_;
  this.person = p;

  this.neighbours = new Array(4);

  this.personPresent = function(){
    return (this.person != null);
  }

  this.getPerson = function(){
    return this.person;
  }

 this.setPerson = function(p){
    this.person = p;
  }

  this.defineNeighbours = function(cells){
    this.neighbours = new Array(4);
    this.neighbours = cells;
  }
  /*
  this.personDie = function(){
    this.person = null;
  }*/

  // Precondition: Person is present
  this.movePerson = function(movable, newneigh, newgrid){
    if (socialdistancing && !this.getPerson().rulebreaker) {
      if (movable.length != 0){
        var neighbourCount = 4 - movable.length;
        if ((neighbourCount == 1 && this.person.isInfected())|| neighbourCount == 2 || neighbourCount == 3){

          var rand = int(random(movable.length));    // Choose random position to move among dir available (number)
          var dir = movable[rand]; // Extract direction from available

          var neighbour;
          var newneighbour;

          if (dir == 0){
            neighbour = this.neighbours.up;
            newneighbour = newneigh.up;
          } else if (dir == 1){
            neighbour = this.neighbours.right;
            newneighbour = newneigh.right;
          } else if (dir == 2){
            neighbour = this.neighbours.down;
            newneighbour = newneigh.down;
          } else if (dir == 3){
            neighbour = this.neighbours.left;
            newneighbour = newneigh.left;
          }

          if (!newgrid[neighbour.x][neighbour.y].personPresent()){
            newneighbour.setPerson(this.person.changePosition(neighbour.x, neighbour.y));        //add Person to other cell
          } else {
            newgrid[this.x][this.y].setPerson(this.person);
          }

        } else {
          newgrid[this.x][this.y].setPerson(this.person);
        }

      } else {
        newgrid[this.x][this.y].setPerson(this.person);
      }
    } else {
      if (movable.length != 0){                       // If I can move...
        if (random(1) < MOVFRQ){
          var rand = int(random(movable.length));    // Choose random position to move among dir available (number)
          var dir = movable[rand];                   // Extract direction from available

          var neighbour;
          var newneighbour;

          if (dir == 0){
            neighbour = this.neighbours.up;
            newneighbour = newneigh.up;
          } else if (dir == 1){
            neighbour = this.neighbours.right;
            newneighbour = newneigh.right;
          } else if (dir == 2){
            neighbour = this.neighbours.down;
            newneighbour = newneigh.down;
          } else if (dir == 3){
            neighbour = this.neighbours.left;
            newneighbour = newneigh.left;
          }

          if (!newgrid[neighbour.x][neighbour.y].personPresent()){
              newneighbour.setPerson(this.person.changePosition(neighbour.x, neighbour.y));        //add Person to other cell
          } else {
            newgrid[this.x][this.y].setPerson(this.person);
          }
        } else {
          newgrid[this.x][this.y].setPerson(this.person);          // Doesn't move at all
        }
      } else {
          newgrid[this.x][this.y].setPerson(this.person);
      }
    }
  }

  // Precondition: Person is present
  // Returns dirctions can move

  this.dirMovable = function(){
    var dirs = [];
    for (var i = 0; i < 4; i++){
       var neighbour;

       if (i == 0){
         neighbour = this.neighbours.up;
       } else if (i == 1){
         neighbour = this.neighbours.right;
       } else if (i == 2){
         neighbour = this.neighbours.down;
       } else if (i == 3){
         neighbour = this.neighbours.left;
       }

       if (!neighbour.personPresent()){
         dirs.push(i);
       }
    }
    return dirs;
  }

  this.getNeighbours = function(){
    return this.neighbours;
  }
}


// person
function Person(x_, y_){
  this.x = x_;
  this.y = y_;
  this.infected = (random(1) > INITIALCORONA);
  this.criticalCase = (random(1) < criticalCasePercentage);
  this.daysInfected = 0;
  this.rulebreaker = (random(1) < socialdistancingremoval);

  this.isInfected = function(){
    return this.infected;
  }

  this.isCriticalCase = function(){
    return this.criticalCase;
  }

  this.changePosition = function(newx, newy){
    this.x = newx;
    this.y = newy;
    return this;
  }

  this.infect = function(){
    this.infected = true;
    this.criticalCase = (random(1) < criticalCasePercentage);
  }

  this.recover = function(){
    this.infected = false;
    this.daysInfected = 0;
  }

  this.addDay = function(){
    this.daysInfected+=dayIncPerFrame;
  }

  this.getDaysInfected = function(){
    return this.daysInfected;
  }
}

function Widget(x_, y_, xsize_, ysize_, text_) {
  this.text = text_;
  this.x = x_;
  this.y = y_;
  this.xsize = xsize_;
  this.ysize = ysize_;
  this.touchTime = 0;

  this.mousePresent = function(){
    return (this.x < mouseX) && (this.x + this.xsize > mouseX) &&
           (this.y < mouseY) && (this.y + this.ysize > mouseY);
  }

  this.display = function(){
    if (this.mousePresent() && this.touchTime < touchResponse){
      fill(150);
    } else {
      fill(0);
    }

    stroke(255);
    rect(this.x, this.y, this.xsize, this.ysize);
    if (this.text == "Start" || this.text == "Stop" || this.text == "Reset") {
      textSize(16);
      noStroke(0);
      fill(255);
      var increment = 0;
      if (this.text == "Reset"){
        increment = -8;
      }
        text(this.text, this.x + (45/100) * this.xsize - 3600/width + increment, this.y + (7/10) * this.ysize);
    } else {
      fill(255);
      this.drawChangeSpeed();
    }
  }

  this.drawChangeSpeed = function(){
    if (this.text == "Fast") {
      triangle(
        this.x + this.xsize / 4, this.y + this.ysize / 4,
        this.x + this.xsize / 4, this.y + this.ysize * (3/4),
        this.x + this.xsize / 2, this.y + this.ysize * (1/2)
      );
      triangle(
        this.x + this.xsize / 2, this.y + this.ysize / 4,
        this.x + this.xsize / 2, this.y + this.ysize * (3/4),
        this.x + this.xsize * (3/4), this.y + this.ysize * (1/2)
      );
    } else if (this.text == "Slow"){
      triangle(
        this.x + this.xsize / 4, this.y + this.ysize / 2,
        this.x + this.xsize / 2, this.y + this.ysize * (3/4),
        this.x + this.xsize / 2, this.y + this.ysize * (1/4)
      );
      triangle(
        this.x + this.xsize * (3/4), this.y + this.ysize * (3/4),
        this.x + this.xsize * (3/4), this.y + this.ysize * (1/4),
        this.x + this.xsize / 2, this.y + this.ysize * (1/2)
      );
    }
  }
}


function touchStarted(){
    if (startButton.mousePresent() && startButton.touchTime > touchResponse){
      start = !start;

      if (startButton.text == "Start") {
        startButton.text = "Stop";
      } else {
        startButton.text = "Start";
      }

      startButton.touchTime = 0;
    }

    if (slowForward.mousePresent() && slowForward.touchTime > touchResponse){
      if (fastforward > 0) {
        fastforward--;
      }
      slowForward.touchTime = 0
    }

    if (fastForward.mousePresent() && fastForward.touchTime > touchResponse){
      if (fastforward <= 2) {
        fastforward++;
      }
      fastForward.touchTime = 0
    }

    if (resetButton.mousePresent() && resetButton.touchTime > 15){
      population = 0;
      //diedarray = [];
      time =  0;
      for (var i = 0; i < col; i++){
        for (var j = 0; j < rows; j++){
          if(random(1) < popdensity){
            grid[i][j] = new Cell(new Person(i, j), i, j);
            population++;
          } else {
            grid[i][j] = new Cell(null, i , j);
          }
        }
      }
      var x, y;

      for (var i = 0; i < col; i++){
        for (var j = 0; j < rows; j++){

          x = (i + col + 1) % col;
          var right = grid[x][j];

          x = (i + col - 1) % col;
          var left = grid[x][j];

          y = (j + rows + 1) % rows;
          var down = grid[i][y];

          y = (j + rows - 1) % rows;
          var up = grid[i][y];

          var cells = {up, right, down, left};
          grid[i][j].defineNeighbours(cells);
        }
      }
      start = false;
      startButton.text = "Start";
      resetButton.touchTime = 0;
    }
}

function adjustFrameSize() {
  /** @type {HTMLIFrameElement} */
  const frame = frameElement;

  if (frame) {
    frame.height = frame.frameBorder = '0';
    frame.height = getDocHeight() + 200 + 'px';
    frame.width  = getDocWidth()  + 200 +  'px';
  }
}

function getDocWidth() {
  return Math.max(
    document.body.scrollWidth, document.documentElement.scrollWidth,
    document.body.offsetWidth, document.documentElement.offsetWidth,
    document.body.clientWidth, document.documentElement.clientWidth
  );
}

function getDocHeight() {
  return Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
  );
}
