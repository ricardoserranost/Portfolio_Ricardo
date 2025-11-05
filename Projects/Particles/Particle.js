class Particle{
    constructor(x, y, vel=[0, 0], acc=[0, 0], radius = 5, bouncy=true){
        this.pos = createVector(x, y);
        this.vel = createVector(vel[0], vel[1]);
        this.acc = createVector(acc[0], acc[1]);
        this.bouncy = bouncy;
        this.bouceCoefficient = 1.0 // Percentage of v kept in bounce
        this.radius = radius;
        this.colorFill = 'rgba(21, 255, 0, 1)';

        this.attractRadius = 100;
        this.mass = 1.0;
        this.viscosity = 0.0;   // (1-coeff_viscosity) for easier comput
    }

    update(){
        // Viscosity:
        if(this.viscosity>0.0){
            let drag = this.vel.copy().mult(-this.viscosity);
            this.acc.add(drag);
        };

        //Actual update terms:
        this.pos.add(this.vel);
        this.vel.add(this.acc);

        // Edge bounce:
        if(this.bouncy){
            if(this.pos.x >= width || this.pos.x <= 0){
                if(this.pos.x <= 0){
                    this.pos.x = 0;
                }else this.pos.x = width;
                this.vel.x = -this.vel.x*this.bouceCoefficient;
            }
            if(this.pos.y >= height || this.pos.y <= 0){
                if(this.pos.y <= 0){
                    this.pos.y = 0;
                }else this.pos.y = height;
                this.vel.y = -this.vel.y*this.bouceCoefficient;
            }
        }
    }

    show(){
        noStroke();
        fill(this.colorFill);
        circle(this.pos.x, this.pos.y, this.radius);
    }

    resetAcc(){
        this.acc.set(0, 0);
    }

    attractGravity(attrPos, force_const = 9.8, repulsiveLimit=5.0, effectLimit=100){
        // If it's close, it will reppel;
        let dir = p5.Vector.sub(attrPos, this.pos);
        let distance = dir.mag();
        if(distance<effectLimit){
            let strength = force_const*this.mass / (distance*distance);
            let force = dir.normalize().mult(strength);
            if(distance<repulsiveLimit) force = -force;
            this.acc.add(force);
        }
    }

    attractLinear(attrPos, initForce=-0.5, slope1=0.0675, dist1=16.0, slope2=0.125, peakForce=4.0, dist2=48.0, slope3=-0.125, maxDist = 80.0){
        // Inspired in Particle Life
        // (Linear with shape /\_)
        // (compute slopes out of this function to be faster)
        let dir = p5.Vector.sub(attrPos, this.pos);
        let distance = dir.mag();
        let strength;
        if(distance<maxDist){
            if(distance<dist1){
                strength = initForce+distance*slope1;
            }else if(distance<dist2){
                strength = (distance-dist1)*slope2;
            }else{
                strength = peakForce+(distance-dist2)*slope3;
            }
            let force = dir.normalize().mult(strength);
            this.acc.add(force);
        }
        
    }
}