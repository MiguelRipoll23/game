export class Joystick {
    constructor(canvas, context, radius = 120, maxDistance = 240) {
        this.isPressed = false;
        // Adding controlX and controlY properties
        this.controlX = 0;
        this.controlY = 0;
        // drawing
        this.x = 0;
        this.y = 0;
        // control
        this.initialTouch = { x: 0, y: 0 };
        this.touchX = 0;
        this.touchY = 0;
        this.canvas = canvas;
        this.context = context;
        this.radius = radius;
        this.maxDistance = maxDistance;
        this.isPressed = false;
        this.addEventListeners();
    }
    addEventListeners() {
        this.canvas.addEventListener("touchstart", this.handleTouchStart.bind(this));
        this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this));
        this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this));
    }
    handleTouchStart(event) {
        this.isPressed = true;
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.initialTouch = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        };
        this.touchX = this.initialTouch.x;
        this.touchY = this.initialTouch.y;
    }
    handleTouchMove(event) {
        event.preventDefault();
        if (this.isPressed) {
            const touch = event.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.touchX = touch.clientX - rect.left;
            this.touchY = touch.clientY - rect.top;
        }
    }
    handleTouchEnd(event) {
        this.isPressed = false;
        this.touchX = 0;
        this.touchY = 0;
        // Reset controlX and controlY when touch ends
        this.controlX = 0;
        this.controlY = 0;
    }
    update() {
        if (this.isPressed) {
            const distance = Math.sqrt(Math.pow(this.touchX - this.initialTouch.x, 2) +
                Math.pow(this.touchY - this.initialTouch.y, 2));
            if (distance <= this.maxDistance) {
                this.x = this.touchX;
                this.y = this.touchY;
            }
            else {
                const angle = Math.atan2(this.touchY - this.initialTouch.y, this.touchX - this.initialTouch.x);
                const newX = this.initialTouch.x + this.maxDistance * Math.cos(angle);
                const newY = this.initialTouch.y + this.maxDistance * Math.sin(angle);
                this.x = newX;
                this.y = newY;
            }
            // Calculating steering based on position relative to initial touch
            const relativeX = this.x - this.initialTouch.x;
            const relativeY = this.y - this.initialTouch.y;
            // Updating controlX and controlY
            this.controlX = relativeX / this.maxDistance;
            this.controlY = relativeY / this.maxDistance;
        }
        else {
            this.x = 0;
            this.y = 0;
            // Reset controlX and controlY when not pressed
            this.controlX = 0;
            this.controlY = 0;
        }
    }
    render() {
        if (this.isPressed) {
            // Draw joystick only when pressed
            this.context.beginPath();
            this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            // Add gradient for fancier look
            const gradient = this.context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
            gradient.addColorStop(1, "rgba(200, 200, 200, 0.8)");
            this.context.fillStyle = gradient;
            // Add shadow for depth
            this.context.shadowColor = "rgba(0, 0, 0, 0.3)";
            this.context.shadowBlur = 10;
            this.context.fill();
            this.context.closePath();
        }
    }
}
