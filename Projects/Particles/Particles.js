let cnv;


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

    updateForceParams();

    //MENU:
    pane = new Tweakpane.Pane({ title: 'Particle Controls' });
    pane.addButton({title: '🔄 Clear particles (R)'}).on('click', ()=>clearParticles());
    pane.addButton({title: '➕ Add particles (F)'}).on('click', ()=>createRandomParticles(50));

    pane.addInput(params, 'viscosity', { min: 0, max: 0.3, step: 0.001, label:'Viscosity' });
    pane.addInput(params, 'maxRadio', { min: 1, max: 300, step: 1, label:'Maximum Radio' })
        .on('change', ev => {
        // optional: mirror to globals if you want
        maxRadio = ev.value;
        updateForceParams();
    });
    pane.addInput(params, 'firstRadio', { min: 1, max: 300, step: 1, label:'First Radio' })
        .on('change', ev => {
        // optional: mirror to globals if you want
        firstRadio = ev.value;
        updateForceParams();
    });
    pane.addInput(params, 'attraction', { min: -1, max: 1, step: 0.01 , label:'Attraction'})
        .on('change', ev => {
        // optional: mirror to globals if you want
        attraction = ev.value;
        updateForceParams();
    });

    pane.addInput(params, 'initAttraction', { min: -1, max: 1, step: 0.01, label:'Initial Attraction' })
        .on('change', ev => {
        // optional: mirror to globals if you want
        initAttraction = ev.value;
        updateForceParams();
    });

    system1 = new ParticleSystem(500, 'rgba(21, 255, 0, 1)');
    system2 = new ParticleSystem(500, 'rgba(255, 0, 123, 1)');
    system1.addRelatedSystem(system2);
}

function isMouseOverTweakpane() {
    //Checks if it is over the control pane
    // Convert p5's mouseX/mouseY (canvas coords) → screen coords
    const canvas = document.querySelector('canvas');
    const rect = canvas.getBoundingClientRect();

    const screenX = rect.left + mouseX;
    const screenY = rect.top + mouseY;

    // Element under cursor
    const el = document.elementFromPoint(screenX, screenY);

    // Does the element belong to Tweakpane?
    return el && el.closest('.tp-dfwv') !== null;
}

function draw(){
    let ms = millis();
    if((ms-lastDrawPeriod)>drawPeriod){
        background(0);  //Get rid of this to leave trace
        system1.show();
        system2.show();

        if(!isMouseOverTweakpane() && mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height){
            if(mouseIsPressed){
                //Add particles on a random stroke. Change later to be customizable
                system1.addParticle(mouseX + random(-1, 1)*10, mouseY + random(-1, 1)*10);
                system2.addParticle(mouseX + random(-1, 1)*10, mouseY + random(-1, 1)*10);
            }
        }

        lastDrawPeriod = ms;
    }

    if((ms-lastUpdatePeriod)>updatePeriod){
        system1.update();
        system2.update();

        lastUpdatePeriod = ms;
    }

    if((ms-lastForcesPeriod)>forcesPeriod){
        // Separate loop for forces to boost performance
        system1.updateForces();
        system2.updateForces();
        
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
    system1.clearParticles();
    system2.clearParticles();
}

function createRandomParticles(n){
    system1.addParticles(n);
    system2.addParticles(n);
}

function updateForceParams() {
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