// Array of cells
let cells;
let cells_next;
// Starting at generation 0
let generation = 0;
// Cell size
let w = 10;

//To time it
let last_cycle = 0;
let period = 300; //in ms

//Game states ()
let game_state = 0;

function setup() {
  // createCanvas(640, 300);
  // Dynamic sizing, with no extra blank space:
  let desired_w = windowWidth-(windowWidth%w);
  let desired_h = windowHeight*0.75; // Scale to desired part of page
  desired_h = desired_h-(desired_h%w);

  createCanvas(desired_w, desired_h);
  background(0);
  x_size = floor(width / w);
  y_size = floor(height/w);
  cells = new Array(x_size);
  cells_next = new Array(x_size);
  for (let i = 0; i < x_size; i++) {
    cells[i] = new Array(y_size);
    cells_next[i] = new Array(y_size);
    for(let j = 0; j < y_size; j++){
      cells[i][j] = 0;
      cells[i][j] = 0;
      drawcell(i, j);
    }
  }
}

function draw() {
  let ms = millis();
  
  if(game_state == 1){
    if(ms-last_cycle > period){
      nextstep();
      for (let i = 0; i < x_size; i++) {
        for(let j = 0; j < y_size; j++){
          cells[i][j] = cells_next[i][j];
          drawcell(i, j);
        }
      }
      last_cycle = ms;
    }
  }
}

//Events
function mouseClicked(){
  fill(0);
  let x = floor(mouseX/w);
  let y = floor(mouseY/w);
  cells[x][y] = !cells[x][y];
  drawcell(x, y);
}

function keyReleased(){
  switch(keyCode){
      //Codes in https://www.toptal.com/developers/keycode
      //Space
    case 32: game_state = !game_state; break;
      //RightArrow
    case 39: period -= 20; break;
      //LeftArrow
    case 37: period += 20; break;
      //F
    case 70: random_fill();break;
      //R
    case 82: clear_cells();break;
      //UpArrow
    case 38: change_cell_size(true);break;
      //DownArrow
    case 40: change_cell_size(false);break
  }
}

function drawcell(i, j){
  if(cells[i][j]){
    fill("rgb(128,255,0)");
  }else{
    fill("rgb(110,119,101)");
  }
  square(i * w, j * w, w);
}

function nextstep(){
  let score = 0;
  //Decide next generation with Conway's rules
  for(i = 0; i < x_size; i++){
    for(j = 0; j < y_size; j++){
      score = 0;
      for(m = -1; m < 2; m++){
        for(n = -1; n < 2; n++){          
          if(!(m==0 && n==0)){
            score += cells[(x_size+i+m)%x_size][(y_size+j+n)%y_size];
            // Añado eso en la suma para que no sea negativo
          }
        }
      }
      
      //RULES CAMBIAR PARA USAR LA ANTERIOR
      if(score==3) cells_next[i][j] = 1;
      else if(cells[i][j]==1 && score==2) cells_next[i][j] = 1;
      else cells_next[i][j] = 0;
    }
  }
}

function random_fill(){
  for (let i = 0; i < x_size; i++) {
    for(let j = 0; j < y_size; j++){
      if(random()<0.025) cells[i][j] = 1;
      drawcell(i, j);
    }
  }
}

function clear_cells(){
  for (let i = 0; i < x_size; i++) {
    for(let j = 0; j < y_size; j++){
      cells[i][j] = 0;
      drawcell(i, j);
    }
  }
}

function change_cell_size(increase){
  if(increase==true){
    w+=1;
  }else{
    w-=1;
    if(w<1) w = 1;
  }
  setup();
}