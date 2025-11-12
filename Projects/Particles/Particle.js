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
        // viscosity taken from global params for easier comput
    }

    update(){
        // Viscosity:
        if(params.viscosity>0.0 /*&& this.acc.x>0.005*/){
            // Only with a min acc, if not some become static. Gives a cool jitter
            // Add that condition only if the forces can go to inf like gravity.
            // If they have a limit like in the Particle Life sim, it's not necessary
            // const drag = this.vel.copy().mult(-params.viscosity);
            // this.acc.add(drag);

            // Although less accurate, this approximation helps with perf:
            this.vel.mult(1-params.viscosity);
        }

        //Actual update terms:
        this.vel.add(this.acc);
        this.pos.add(this.vel);

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
        // noStroke();
        // fill(this.colorFill);
        ellipse(this.pos.x, this.pos.y, this.radius); //could use point for smaller
    }

    resetAcc(){
        this.acc.set(0, 0);
    }

    attractGravity(attrPos, force_const = 9.8, repulsiveLimit = 5.0, effectLimit = 800) {
        // Compute vector difference
        let dx = attrPos.x - this.pos.x;
        let dy = attrPos.y - this.pos.y;
        let distSq = dx * dx + dy * dy;

        // Ignore if too far
        if (distSq > effectLimit * effectLimit) return;

        // Add small epsilon to avoid division by zero
        let distance = sqrt(distSq) + 0.0001;

        // Compute normalized direction
        let nx = dx / distance;
        let ny = dy / distance;

        // Strength (inverse-square law)
        let strength = (force_const * this.mass) / distSq;

        // Repulsive when too close, limiting its effect
        if (distance < repulsiveLimit) strength *= -0.05;
        if(strength<-5.0) strength = -2.0

        // Apply to acceleration
        this.acc.x += nx * strength;
        this.acc.y += ny * strength;
    }

    attractLinear(attrPos, initForce=-0.01, slope1=0.0005, dist1=20.0, slope2=0.0025, dist2=100.0, peakForce=0.2, slope3=-0.0025, maxDist = 180.0){
        // Inspired in Particle Life
        // (Linear with shape /\_)
        // (compute slopes out of this function to be faster)
        let dx = attrPos.x - this.pos.x;
        let dy = attrPos.y - this.pos.y;
        let distSq = dx*dx + dy*dy; // Use Squares to save computation

        if(distSq > 1e-6 && distSq<maxDist*maxDist){
            let distance = sqrt(distSq);
            let nx = dx / distance;
            let ny = dy / distance;
            let strength;
            if(distance<dist1){
                strength = initForce+distance*slope1;
            }else if(distance<dist2){
                strength = (distance-dist1)*slope2;
            }else{
                strength = peakForce+(distance-dist2)*slope3;
            }
            // Apply to acceleration
            this.acc.x += nx * strength;
            this.acc.y += ny * strength;
        }
    }
}