let cnv;
let particles = [];
let particles2 = [];


//PERIODS
const updatePeriod = 20;
let lastUpdatePeriod = 0;
/*
Different rate for the force computation cause it's the most intense operation
Should give a boost in performance but make it less "realistic".
Check if it is worth it and smooth enough
*/
const forcesPeriod = 100;
let lastForcesPeriod = 0;
const drawPeriod = 30;
let lastDrawPeriod = 0;

let stdRadius = 3

//At some point they'll be different for each pair of particle types:
let initForce, slope1, dist1, slope2, dist2, peakForce, slope3, maxDist;

const maxForce = 0.01; // Then the forces can be relative to this one

// For a MENU:
function updateForces() {
  [initForce, slope1, dist1, slope2, dist2, peakForce, slope3, maxDist] =
      computeLinearArgs(maxForce * params.initAttraction, maxForce * params.attraction, 20, 100);
}
let pane;
let params = {
    attraction: 0.3,
    initAttraction: -0.3,
    viscosity: 0.008,   // (1-coeff_viscosity) for easier computation
    maxRadio: 100,
    firstRadio: 20
};

function setup(){
    let desired_w = windowWidth*0.95;
    let desired_h = windowHeight*0.85; // Scale to desired part of page
    
    cnv = createCanvas(desired_w, desired_h);
    cnv.parent('sketch-holder');
    background(0);

    updateForces();

    //MENU:
    pane = new Tweakpane.Pane({ title: 'Particle Controls' });
    pane.addButton({title: '🔄 Clear particles'}).on('click', ()=>clearParticles());
    pane.addButton({title: '➕ Add particles'}).on('click', ()=>createRandomParticles(50));

    pane.addInput(params, 'viscosity', { min: 0, max: 0.3, step: 0.001, label:'Viscosity' });
    pane.addInput(params, 'maxRadio', { min: 1, max: 300, step: 1, label:'Maximum Radio' })
        .on('change', ev => {
        // optional: mirror to globals if you want
        maxRadio = ev.value;
        updateForces();
    });
    pane.addInput(params, 'firstRadio', { min: 1, max: 300, step: 1, label:'First Radio' })
        .on('change', ev => {
        // optional: mirror to globals if you want
        firstRadio = ev.value;
        updateForces();
    });
    pane.addInput(params, 'attraction', { min: -1, max: 1, step: 0.01 , label:'Attraction'})
        .on('change', ev => {
        // optional: mirror to globals if you want
        attraction = ev.value;
        updateForces();
    });

    pane.addInput(params, 'initAttraction', { min: -1, max: 1, step: 0.01, label:'Initial Attraction' })
        .on('change', ev => {
        // optional: mirror to globals if you want
        initAttraction = ev.value;
        updateForces();
    });
}

function draw(){
    let ms = millis();
    if((ms-lastDrawPeriod)>drawPeriod){
        background(0);  //Get rid of this to leave trace

        //Color
        noStroke();
        if(particles.length>0){
            fill(particles[0].colorFill);
            for(let p of particles){
                p.show();
            } 
        }
        
        if(particles2.length>0){
            fill(particles2[0].colorFill);
            for(let p of particles2){
                p.show();
            } 
        }

        if(mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height){
            if(mouseIsPressed){
                newParticle = new Particle(mouseX, mouseY, [0, 0], [0, 0], stdRadius);
                particles.push(newParticle);
            }
        }

        lastDrawPeriod = ms;
    }

    if((ms-lastUpdatePeriod)>updatePeriod){
        for(let p of particles){
            p.update();
        }
        for(let p of particles2){
            p.update();
        }
        lastUpdatePeriod = ms;
    }

    if((ms-lastForcesPeriod)>forcesPeriod){
        // Separate loop for forces to boost performance

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

        lastForcesPeriod = ms;
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
        particles.push(newParticle);

        newParticle = new Particle(random()*width, random()*height, [0, 0], [0, 0], stdRadius);
        newParticle.colorFill = 'rgba(255, 0, 123, 1)';
        particles2.push(newParticle);
    }
}

function updateForces() {
    // Computes linear params for the new parameters
    [initForce, slope1, dist1, slope2, dist2, peakForce, slope3, maxDist] = computeLinearArgs(maxForce * params.initAttraction, maxForce * params.attraction, params.firstRadio, params.maxRadio);
}

function computeLinearArgs(initForce, peakForce, dist1, maxDist){
    // Computes the args that are passed to attractLinear inside Particles
    let slope1 = (-initForce)/dist1;
    let slope2 = 2*peakForce/(maxDist-dist1);   //Symmetrical in the 2nd part
    let slope3 = -slope2;
    if(dist1>=maxDist) maxDist=dist1;
    let dist2 = dist1 + (maxDist-dist1)/2;
    return [initForce, slope1, dist1, slope2, dist2, peakForce, slope3, maxDist];
}