
import * as THREE from 'https://cdn.skypack.dev/three@0.154.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.154.0/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xe0e0e0, 100, 700);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 80);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Subtle grid material
const gridMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.025 });
const gridSize = 2000;
const gridStep = 40;

for (let i = -gridSize; i <= gridSize; i += gridStep) {
  const geometryX = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(i, -gridSize, 0),
    new THREE.Vector3(i, gridSize, 0)
  ]);
  const geometryY = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-gridSize, i, 0),
    new THREE.Vector3(gridSize, i, 0)
  ]);
  scene.add(new THREE.Line(geometryX, gridMaterial));
  scene.add(new THREE.Line(geometryY, gridMaterial));
}

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableRotate = false;
controls.enableZoom = false;
controls.enablePan = true;

// Comet sweep lines
const lineMaterial = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0.0 },
    color: { value: new THREE.Color(0xffffff) }
  },
  vertexShader: \`
    varying float vAlpha;
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vAlpha = 1.0 - abs(position.z) / 300.0;
      gl_Position = projectionMatrix * mvPosition;
    }
  \`,
  fragmentShader: \`
    uniform vec3 color;
    varying float vAlpha;
    void main() {
      gl_FragColor = vec4(color, vAlpha);
    }
  \`,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const lines = [];
function createLine() {
  const geo = new THREE.BufferGeometry();
  const positions = [];
  for (let i = 0; i < 20; i++) positions.push(0, 0, -i * 2);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const line = new THREE.Line(geo, lineMaterial.clone());
  line.position.set(
    (Math.random() - 0.5) * 1000,
    (Math.random() - 0.5) * 1000,
    (Math.random() - 0.5) * 1400
  );
  scene.add(line);
  lines.push(line);
}
for (let i = 0; i < 120; i++) createLine();

// Animation
function animate() {
  requestAnimationFrame(animate);
  const t = performance.now() * 0.001;
  lineMaterial.uniforms.time.value = t;

  for (const line of lines) {
    line.position.z += 1;
    if (line.position.z > 200) {
      line.position.z = -1400;
      line.position.x = (Math.random() - 0.5) * 1000;
      line.position.y = (Math.random() - 0.5) * 1000;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
