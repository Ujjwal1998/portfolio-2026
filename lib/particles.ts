export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  alphaDirection: number;
}

interface Laser {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  progress: number;
  color: string;
  width: number;
}

export class ParticleSystem {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private colors: string[] = [];
  private animationId: number | null = null;
  private lasers: Laser[] = [];
  private laserInterval: ReturnType<typeof setInterval> | null = null;
  private scrollInfluence: number = 0;

  init(canvas: HTMLCanvasElement, colors: string[]) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.colors = colors;
    this.resize();
    this.spawn(40);
  }

  spawn(count: number) {
    if (!this.canvas) return;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 2,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        alpha: Math.random() * 0.5 + 0.1,
        alphaDirection: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }

  setScrollInfluence(deltaY: number) {
    this.scrollInfluence = Math.max(-3, Math.min(3, -deltaY * 0.05));
  }

  update() {
    if (!this.canvas) return;

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy + this.scrollInfluence;

      if (p.x < -p.radius) p.x = this.canvas.width + p.radius;
      if (p.x > this.canvas.width + p.radius) p.x = -p.radius;
      if (p.y < -p.radius) p.y = this.canvas.height + p.radius;
      if (p.y > this.canvas.height + p.radius) p.y = -p.radius;

      p.alpha += p.alphaDirection * 0.002;
      if (p.alpha >= 0.6) {
        p.alpha = 0.6;
        p.alphaDirection = -1;
      } else if (p.alpha <= 0.1) {
        p.alpha = 0.1;
        p.alphaDirection = 1;
      }
    }

    this.scrollInfluence *= 0.95;
    this.updateLasers();
  }

  draw() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = this.hexToRgba(p.color, p.alpha);
      this.ctx.fill();
    }

    this.drawLasers();
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    const loop = () => {
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
  }

  setColors(colors: string[]) {
    this.colors = colors;
    for (const p of this.particles) {
      p.color = colors[Math.floor(Math.random() * colors.length)];
    }
  }

  spawnBurst(count: number) {
    if (!this.canvas) return;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 2,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        alphaDirection: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }

  removeParticles(count: number) {
    this.particles.splice(-count, count);
  }

  setDiscoMode(active: boolean) {
    for (const p of this.particles) {
      if (active) {
        p.radius = Math.random() * 7 + 1;
        p.vx = (Math.random() - 0.5) * 1.2;
        p.vy = (Math.random() - 0.5) * 1.2;
        p.alpha = Math.random() * 0.5 + 0.4;
      } else {
        p.radius = Math.random() * 2 + 2;
        p.vx = (Math.random() - 0.5) * 0.3;
        p.vy = (Math.random() - 0.5) * 0.3;
      }
    }
  }

  startLasers(colors: string[]) {
    this.laserInterval = setInterval(() => {
      this.spawnLaser(colors);
    }, 200);
  }

  stopLasers() {
    if (this.laserInterval) {
      clearInterval(this.laserInterval);
      this.laserInterval = null;
    }
    this.lasers = [];
  }

  private spawnLaser(colors: string[]) {
    if (!this.canvas) return;

    const edge = Math.floor(Math.random() * 4);
    let x1: number, y1: number, x2: number, y2: number;

    switch (edge) {
      case 0:
        x1 = Math.random() * this.canvas.width;
        y1 = 0;
        x2 = Math.random() * this.canvas.width;
        y2 = this.canvas.height;
        break;
      case 1:
        x1 = this.canvas.width;
        y1 = Math.random() * this.canvas.height;
        x2 = 0;
        y2 = Math.random() * this.canvas.height;
        break;
      case 2:
        x1 = Math.random() * this.canvas.width;
        y1 = this.canvas.height;
        x2 = Math.random() * this.canvas.width;
        y2 = 0;
        break;
      default:
        x1 = 0;
        y1 = Math.random() * this.canvas.height;
        x2 = this.canvas.width;
        y2 = Math.random() * this.canvas.height;
        break;
    }

    this.lasers.push({
      x1, y1, x2, y2,
      progress: 0,
      color: colors[Math.floor(Math.random() * colors.length)],
      width: Math.random() * 3 + 2,
    });
  }

  private updateLasers() {
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      this.lasers[i].progress += 0.03;
      if (this.lasers[i].progress >= 1) {
        this.lasers.splice(i, 1);
      }
    }
  }

  private drawLasers() {
    if (!this.ctx) return;

    for (const laser of this.lasers) {
      const currentX = laser.x1 + (laser.x2 - laser.x1) * laser.progress;
      const currentY = laser.y1 + (laser.y2 - laser.y1) * laser.progress;

      const trailLength = 0.3;
      const trailProgress = Math.max(0, laser.progress - trailLength);
      const trailX = laser.x1 + (laser.x2 - laser.x1) * trailProgress;
      const trailY = laser.y1 + (laser.y2 - laser.y1) * trailProgress;

      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = laser.color;

      this.ctx.beginPath();
      this.ctx.moveTo(trailX, trailY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.strokeStyle = laser.color;
      this.ctx.lineWidth = laser.width;
      this.ctx.lineCap = "round";
      this.ctx.stroke();

      this.ctx.shadowBlur = 0;
    }
  }
}
