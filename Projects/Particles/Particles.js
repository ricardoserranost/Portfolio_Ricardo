let cnv;
let particles = [];
let attraction = 0.2;

let viscosity = 0.01;   // (1-coeff_viscosity) for easier computation

let drawingPeriod = 25;    // to not draw that many
let lastDrawingPeriod = 0;

function setup(){
    let desired_w = windowWidth*0.95;
    let desired_h = windowHeight*0.85; // Scale to desired part of page
    
    cnv = createCanvas(desired_w, desired_h);
    cnv.parent('sketch-holder');
    background(0);
}

function draw(){
    let ms = millis();
    background(0);  //Get rid of this to leave trace
    for(let p of particles){
        p.update();
        p.show();
    }

    for(let i=0; i<particles.length; i++){
        particles[i].resetAcc();
        for(let j=0; j<particles.length; j++){
            if(i==j) continue;
            else{
                particles[i].attractGravity(particles[j].pos);
            }
        }
    }

    if(mouseIsPressed){
        if(ms-lastDrawingPeriod > drawingPeriod){
            newParticle = new Particle(mouseX, mouseY, [0, 0], [0, 0], 3);
            newParticle.viscosity = viscosity;
            particles.push(newParticle);
            lastDrawingPeriod = ms;
        }
    }
}

function keyReleased(){
    //Codes in https://www.toptal.com/developers/keycode
    switch(keyCode){
        //R
        case 82: clearParticles();break;
    }
}

function clearParticles(){
    particles = [];
}