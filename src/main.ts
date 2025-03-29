import './style.css';

const canvas: HTMLCanvasElement = document.querySelector('#app-canvas')!;
const ctx = canvas.getContext('2d')!;

const LOGICAL_WIDTH = 800;
const LOGICAL_HEIGHT = 600;
const scalingFactor = .9;
const perimeterSize = scalingFactor * (3 * Math.sqrt(3) * (Math.min(LOGICAL_HEIGHT, LOGICAL_WIDTH) / 2));

let animationTimer: number | null = null;
const nmin = 6;
const nmax = 100;

function resizeCanvas() {
  const { innerWidth, innerHeight } = window;

  // Maintain aspect ratio
  const scaleX = innerWidth / LOGICAL_WIDTH;
  const scaleY = innerHeight / LOGICAL_HEIGHT;
  const scale = Math.min(scaleX, scaleY); // Keep proportions

  // Set the actual canvas size
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  // Reset transformations
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Apply scaling so logical units remain the same
  ctx.scale(scale, scale);
  handleAnimation();
}

function handleAnimation(): void {
  if (animationTimer !== null) {
    clearTimeout(animationTimer);
  }

  animationState(nmin, 1);
}

function animationState(n: number, direction: 1 | -1): void {
  const intN = Math.floor(n);
  draw(intN);
  n = n + (direction * change3(n));

  if (n <= nmin) {
    n = nmin;
    direction = 1;
  }

  if (n >= nmax) {
    n = nmax;
    direction = -1;
  }

  let time = n === nmin ? 1000 : 50;

  animationTimer = setTimeout(() => animationState(n, direction), time);
}

function draw(n: number) {
  ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  const circleRadius = perimeterSize / (2 * Math.PI);
  const circlePositition = normalizeToScreen({ x: 0, y: 0 });
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(214, 206, 210, 0.7)';
  ctx.lineWidth = 3;
  ctx.arc(circlePositition.x, circlePositition.y, circleRadius, 0, 2 * Math.PI);
  ctx.stroke();

  const points = Array(n)
    .fill(null)
    .map((_, i) => normalizeToScreen(calcPoint(n, i)));

  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 0; i < points.length + 2; i++) {
    // this needs to overflow to make the line look whole, so the sequence is:
    // 0, 1, 2 ... n, 0, 1
    const point = points[i % points.length];
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
}

function change1(n: number): number {
  const p = .5;
  const k = .2;
  return k * (n ** p);
}

function change2(n: number): number {
  const k = .1;
  return k * Math.log(n);
}

function change3(n: number): number {
  return -.35 + (.5 * Math.sqrt(n));
}

function normalizeToScreen({ x, y }: { x: number, y: number }): { x: number, y: number } {
  return {
    x: LOGICAL_WIDTH / 2 + x,
    y: LOGICAL_HEIGHT / 2 + y
  };
}

function calcPoint(n: number, k: number): { x: number, y: number } {
  const R = getPerimeter(n);
  const x = R * Math.sin((2 * Math.PI * k) / n);
  const y = R * -Math.cos((2 * Math.PI * k) / n);

  return { x, y };
}

function getPerimeter(n: number): number {
  return perimeterSize / (2 * n * Math.sin(Math.PI / n));
}

// Resize & redraw when window resizes
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
