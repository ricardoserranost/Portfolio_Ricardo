
// For the menu:
let pane;
let params = {
    iterations: 10
};

let currentN = 0;

let triangleRadio = 200;
let vertices = [];
let points = [];
let origin;

function setup(){
    let desired_w = windowWidth*0.95;
    let desired_h = windowHeight*0.85; // Scale to desired part of page
    
    cnv = createCanvas(desired_w, desired_h);
    cnv.parent('sketch-holder');
    background(0);

    pane = new Tweakpane.Pane({title: 'Settings'});
    pane.addInput(params, 'iterations', { min: 0, max: 5000, step: 1, label:'Iterations' })
        .on('change', ()=>clearAndDraw());
    pane.addButton({title: '>'}).on('click', ()=>addPoints(1));
    pane.addButton({title: '<'}).on('click', ()=>addPoints(-1));
    // Three points:
    computeVertices(triangleRadio);
    fill("rgba(255, 255, 255, 1)");
    stroke("rgba(255, 255, 255, 1)");
    stroke(0);
    // drawVertices();
    drawSides();

    origin = new createVector(0, 0);
    drawOrigin();
    computePoints();
    drawFractal();
    clearAndDraw();
}

function draw(){
}

function addPoints(n){
    params.iterations = params.iterations + n;
    if(params.iterations<0) params.iterations = 0;
    pane.refresh();
    clearAndDraw();
}

function clearAndDraw(){
    computePoints();
    background(0);
    drawOrigin();
    fill("rgba(255, 255, 255, 1)");
    stroke("rgba(255, 255, 255, 1)");
    drawSides();
    drawFractal();
}

function drawFractal(){
    fill("rgba(255, 255, 255, 1)");
    strokeWeight(0.1);
    for(let i=0; i<params.iterations; i++){
        circle(width/2 + points[i].x, height/2 + points[i].y, 1);
    }
}

function computePoints(){
    let p = origin;
    let p2 = origin;
    if(points.length>0) p = points[points.length-1];
    while(currentN<params.iterations){
        p2 = random(vertices);
        p = new createVector((p.x + p2.x)/2, (p.y + p2.y)/2);
        currentN++;
        points.push(p);
    }
}

function mouseClicked(e){
    if (e.target.closest('.tp-dfwv') !== null) {
        return;
    }

    if(mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height){
        origin = new createVector(mouseX-width/2, mouseY-height/2);
        // drawOrigin();

        points = [];
        currentN=0;
        clearAndDraw();
    }
    
}


function drawOrigin(){
    fill("rgba(115, 255, 0, 1)");
    strokeWeight(0.1);
    circle(width/2 + origin.x, height/2 + origin.y, 5);
}

function drawVertices(){
    for(let v of vertices){
        circle(width/2 + v.x, height/2 + v.y, 5);
    }
}

function drawSides(){
    stroke("rgba(255, 255, 255, 1)");
    strokeWeight(2);
    if(vertices.length>0){
        let initVert = vertices[0];
        let lastVert = initVert;
        for(let i=1; i<vertices.length; i++){
            line(width/2 + initVert.x, height/2 + initVert.y, width/2 + vertices[i].x, height/2 + vertices[i].y);
            initVert = vertices[i];
        }
        line(width/2 + initVert.x, height/2 + initVert.y, width/2 + vertices[0].x, height/2 + vertices[0].y);
    }
}

function computeVertices(radio){
    //Vertices of a triangle (In offsets from center)
    vertices = [];
    let v = new createVector(0, -radio);
    vertices.push(v);
    v = new createVector(-(radio * sqrt(3))/2, radio/2);
    vertices.push(v);
    v = new createVector((radio * sqrt(3))/2, radio/2);
    vertices.push(v);
}

function randomPointInsideTriangle(){
    if(vertices.length==3){
        // Do only if triangle

    }
}