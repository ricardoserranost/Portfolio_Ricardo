// Array of cells
let cells;
let cells_next;
// Starting at generation 0
let generation = 0;
// Cell size
let w = 16;
let edge_size = w*0.05;

//To time it
let last_cycle = 0;
let period = 250; //in ms

//Game states ()
let game_state = 0;

//Control items:
let once = true; //In case setup gets called later
let shape_select;
let rotate;
let play_button;

function setup() {
  // createCanvas(640, 300);
  // Dynamic sizing, with no extra blank space:
  let desired_w = windowWidth*0.95;
  desired_w = desired_w-(desired_w%w);
  let desired_h = windowHeight*0.7; // Scale to desired part of page
  desired_h = desired_h-(desired_h%w);

  let cnv = createCanvas(desired_w, desired_h);
  cnv.parent('sketch-holder');
  background(0);
  strokeWeight(edge_size);  //Edge size
  stroke(0);  //Edge color
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

  if(once){
    createElement('br').parent('sketch-holder');  //Forces next line
    //Control items
    
    //Play button:
    play_button = createButton('<i class="fa fa-play"></i>');
    play_button.parent('sketch-holder'); //Moves it inside that part of the html
    play_button.mousePressed(play_pause);
    play_button.style('font-size', '24px');
    play_button.style('border', 'none');
    play_button.style('background', 'none');
    // play_button.style('color', 'rgba(140, 221, 0, 1)');
    play_button.style('cursor', 'pointer');
    //Position
    play_button.style('position', 'relative'); // move relative to its normal spot
    play_button.style('top', '5px');
    // play_button.style('left', '20px');
    play_button.style('right', '20px');
    updateButtonImage();

    //Shapes:
    shape_select = createSelect();
    shape_select.parent('sketch-holder');
    shape_select.option('CELL');
    shape_select.option('WALKER');
    shape_select.option('SPACESHIFT');
    
    //Rotate:
    rotate = createSelect();
    rotate.parent('sketch-holder');
    rotate.option(0);
    rotate.option(90);
    rotate.option(180);
    rotate.option(270);
  }
  once = false;
}

function play_pause(){
  game_state = !game_state;
  updateButtonImage();
}

function updateButtonImage(){
  // Using a css font:
  play_button.html(game_state ? '<i class="fa fa-pause"></i>' : '<i class="fa fa-play"></i>');
  play_button.style('color', game_state? 'rgba(223, 108, 1, 1)': 'rgba(140, 221, 0, 1)');
}

function draw() {
  let ms = millis();
  
  if(game_state == 1){
    //RUNNING
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
  }else{
    noFill();
    stroke("rgba(250, 129, 0, 1)");
    strokeWeight(w*0.8);
    rect(0, 0, width, height);
    strokeWeight(edge_size); //Return to normal
    stroke(0);
  }
}

//Events
function mouseClicked(){
  //Only in the canvas:
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    // Depends on the shape selected:
    fill(0);
    let x = floor(mouseX/w);
    let y = floor(mouseY/w);
    if(shape_select.value()=='CELL'){
      cells[x][y] = !cells[x][y];
      drawcell(x, y);
    }else{
      paint_shape(x, y);
    }
  }
}

function paint_cell(i, j){
  // set specific cell as live
  i = i%x_size;
  j = j%y_size;
  cells[i][j] = 1;
  drawcell(i, j);
}

//DIFFERENT SHAPES:
function paint_shape(x, y, increments){
  switch(shape_select.value()){
    case 'WALKER': increments = [
      [0, 0], [1, 0], [0, 1], [0, 2], [2, 1]];break;
    case 'SPACESHIFT': increments = [
      [0, 0], [0, 1], [0, 2], [1, 0], [2, 0], [3, 0], [4, 1], [1, 3], [4, 3]];break;
  }


  for(let increment of increments){
    switch(rotate.value()){
      case '0':   paint_cell(x + increment[0], y + increment[1]);break;
      case '90':  paint_cell(x + increment[1], y - increment[0]);break;
      case '180': paint_cell(x - increment[0], y - increment[1]);break;
      case '270': paint_cell(x - increment[1], y + increment[0]);break;
    }
    
  }
}

function keyReleased(){
  switch(keyCode){
      //Codes in https://www.toptal.com/developers/keycode
      //Space
    case 32: game_state = !game_state; updateButtonImage(); break;
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
    if(w<2) w = 2;
  }
  setup();
}