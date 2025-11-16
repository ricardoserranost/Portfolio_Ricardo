class ParticleSystem{
    constructor(n=50, color='rgba(38, 0, 255, 1)'){
        this.particles = [];
        this.color = color;

        this.relatedSystems = [];

        this.addParticles(n);
    }

    addParticles(n){
        for(let i=0; i<n; i++){
            let newParticle = new Particle(random()*width, random()*height, [0, 0], [0, 0], stdRadius);
            newParticle.colorFill = this.color;
            this.particles.push(newParticle);
        }
    }
    
    addParticle(x, y){
        let newParticle = new Particle(x, y, [0, 0], [0, 0], stdRadius);
        newParticle.colorFill = this.color;
        this.particles.push(newParticle);
    }

    addRelatedSystem(otherSystem){
        if (!this.relatedSystems.includes(otherSystem)) {
            this.relatedSystems.push(otherSystem);
        }
    }

    show(){
        noStroke();
        if(this.particles.length > 0){
            fill(this.color);
            for(let p of this.particles){
                p.show();
            }
        }
        
    }

    update(){
        // Updates pos, vel consiering viscosity
        for(let p of this.particles) p.update();
    }

    updateForces(){
        for(let i=0; i<this.particles.length; i++){
            this.particles[i].resetAcc();
            // SELF INTERACTION
            for(let j=0; j<this.particles.length; j++){
                if(i==j) continue;
                else{
                    this.particles[i].attractLinear(this.particles[j].pos, initForce, slope1, dist1, slope2, dist2, peakForce, slope3, maxDist);
                }
            }

            // INTERACTION WITH OTHER SYSTEMS
            for(let s of this.relatedSystems){
                for(let j=0; j<s.particles.length; j++){
                    this.particles[i].attractLinear(s.particles[j].pos, initForce, slope1, dist1, -slope2, dist2, -peakForce, -slope3, maxDist);
                }
            }
            
        }
    }

    clearParticles(){
        this.particles = [];
    }

}