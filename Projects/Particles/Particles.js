let cnv;
let particles = [];
let particles2 = [];
let attraction = 0.1;

let viscosity = 0.05;   // (1-coeff_viscosity) for easier computation

let drawingPeriod = 25;    // to not draw that many
let lastDrawingPeriod = 0;

let stdRadius = 3

//At some point they'll be different for each pair of particle types:
let initForce, slope1, dist1, slope2, dist2, peakForce, slope3, maxDist;

function setup(){
    let desired_w = windowWidth*0.95;
    let desired_h = windowHeight*0.85; // Scale to desired part of page
    
    [initForce, slope1, dist1, slope2, dist2, peakForce, slope3, maxDist] = computeLinearArgs(-0.001, 0.002, 20, 100);

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

    for(let p of particles2){
        p.update();
        p.show();
    }

    for(let i=0; i<particles.length; i++){
        particles[i].resetAcc();
        for(let j=0; j<particles.length; j++){
            if(i==j) continue;
            else{
                // particles[i].attractGravity(particles[j].pos);
                particles[i].attractLinear(particles[j].pos, initForce, slope1, dist1, slope2, dist2, peakForce, slope3, maxDist);
            }
        }

        //INTERACTIONS
        for(let j=0; j<particles2.length; j++){
            particles[i].attractLinear(particles2[j].pos, initForce, slope1, dist1, -slope2, dist2, -peakForce, -slope3, maxDist);
        }
    }

    for(let i=0; i<particles2.length; i++){
        particles2[i].resetAcc();
        for(let j=0; j<particles2.length; j++){
            if(i==j) continue;
            else{
                particles2[i].attractLinear(particles2[j].pos, initForce, slope1, dist1, slope2, dist2, peakForce, slope3, maxDist);
            }
        }

        for(let j=0; j<particles.length; j++){
            particles2[i].attractLinear(particles[j].pos, initForce, slope1, dist1, -slope2, dist2, -peakForce, -slope3, maxDist);
        }
    }


    if(mouseIsPressed){
        if(ms-lastDrawingPeriod > drawingPeriod){
            newParticle = new Particle(mouseX, mouseY, [0, 0], [0, 0], stdRadius);
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
        //F
        case 70: createRandomParticles(50);
    }
}

function clearParticles(){
    particles = [];
    particles2 = [];
}

function createRandomParticles(n){
    for(let i=0; i<n; i++){
        newParticle = new Particle(random()*width, random()*height, [0, 0], [0, 0], stdRadius);
        newParticle.viscosity = viscosity;
        particles.push(newParticle);

        newParticle = new Particle(random()*width, random()*height, [0, 0], [0, 0], stdRadius);
        newParticle.viscosity = viscosity;
        newParticle.colorFill = 'rgba(255, 0, 123, 1)';
        particles2.push(newParticle);
    }
}

function computeLinearArgs(initForce, peakForce, dist1, maxDist){
    // Computes the args that are passed to attractLinear inside Particles
    let slope1 = (-initForce)/dist1;
    let slope2 = 2*peakForce/(maxDist-dist1);   //Symmetrical in the 2nd part
    let slope3 = -slope2;
    let dist2 = dist1 + (maxDist-dist1)/2;
    return [initForce, slope1, dist1, slope2, dist2, peakForce, slope3, maxDist];
}