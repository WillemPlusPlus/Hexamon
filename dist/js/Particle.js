export class Particle {
    // fields
    colour;
    life;
    opacity;
    theta;
    position;
    velocity;
    size;
    text;
    sizeDelta;
    opacityDelta;
    // constructor
    constructor(props) {
        this.position = { x: 0, y: 0 };
        this.velocity = { dx: 0, dy: 0 };
        this.size = { w: 3, h: 3 };
        this.sizeDelta = { dw: 1, dh: 1 };
        this.colour = Particle.randomcolour();
        this.life = 5 + Math.random() * 20;
        this.opacity = 1;
        this.opacityDelta = -0.01;
        this.theta = 0;
        this.text = "rect";
        for (let prop in props) {
            let p = this;
            p[prop] = props[prop];
        }
    }
    static randomcolour() {
        let colours = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"];
        return colours[Math.floor(Math.random() * colours.length)];
    }
    static randomVelocity() {
        return { dx: Math.random() * 4 - 2, dy: Math.random() * 4 - 2 };
    }
    // methods
    draw(ctx, offset = { x: 0, y: 0 }) {
        let position = { x: this.position.x + offset.x, y: this.position.y + offset.y };
        ctx.translate(position.x, position.y);
        ctx.rotate(this.theta);
        ctx.fillStyle = this.colour;
        ctx.globalAlpha = this.opacity;
        if (this.text == "rect") {
            ctx.fillRect(0 - this.size.w / 2, 0, this.size.w, this.size.h);
        }
        else {
            ctx.textAlign = "center";
            ctx.font = 'bold ' + this.size.h.toString() + 'px monospace';
            ctx.lineWidth = this.size.h / 10;
            ctx.fillStyle = this.colour;
            ctx.strokeStyle = "black";
            ctx.strokeText(this.text, 0, 0);
            ctx.fillText(this.text, 0, 0);
        }
        ctx.globalAlpha = 1;
        ctx.rotate(-this.theta);
        ctx.translate(-position.x, -position.y);
    }
    update({ position = this.position, velocity = this.velocity, size = this.size }) {
        this.position = position;
        this.velocity = velocity;
        this.size = size;
        this.position.x += velocity.dx;
        this.position.y += velocity.dy;
        this.size.w *= this.sizeDelta.dw;
        this.size.h *= this.sizeDelta.dh;
        this.life--;
        this.opacity += this.opacityDelta;
        if (this.life <= 0) {
            this.opacity = 0;
        }
    }
    static createBeam(x, y, width, colour) {
        let beam = new Particle({ position: { x, y } });
        beam.colour = colour;
        beam.size = { w: width, h: 10000 };
        beam.life = 100;
        beam.opacity = 1;
        beam.velocity = { dx: 0, dy: 0 };
        return beam;
    }
}
