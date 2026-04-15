import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import { HandTracker } from './hand/HandTracker';
import './style.css';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfff4fb);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let grabbedObject = null;
let isGrabbing = false;

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const cursor = document.createElement('div');
cursor.style.position = 'fixed';
cursor.style.width = '16px';
cursor.style.height = '16px';
cursor.style.borderRadius = '50%';
cursor.style.background = '#ff4da6';
cursor.style.pointerEvents = 'none';
cursor.style.zIndex = '100';
cursor.style.transform = 'translate(-50%, -50%)';
document.body.appendChild(cursor);

const handTracker = new HandTracker();

await handTracker.init();

const controls = new PointerLockControls(camera, document.body);

document.body.addEventListener('click', () => {
  controls.lock();
});

const keys = {
  KeyW: false,
  KeyA: false,
  KeyS: false,
  KeyD: false,
};

const moveSpeed = 0.08;

window.addEventListener('keydown', (event) => {
  if (event.code in keys) {
    keys[event.code] = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code in keys) {
    keys[event.code] = false;
  }
});

// 바닥
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xf8d9e8 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// 테스트용 큐브
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xff9ecf });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 0.5, 0);
box.castShadow = true;
scene.add(box);
const defaultColor = 0xff9ecf;
const highlightColor = 0xff4da6;
// 러그
const rugGeometry = new THREE.CylinderGeometry(1.8, 1.8, 0.05, 32);
const rugMaterial = new THREE.MeshStandardMaterial({ color: 0xff8fc7 });
const rug = new THREE.Mesh(rugGeometry, rugMaterial);
rug.position.set(0, 0.03, 1.2);
rug.receiveShadow = true;
scene.add(rug);
//테이블
const tableGroup = new THREE.Group();

const tableTop = new THREE.Mesh(
  new THREE.BoxGeometry(2, 0.15, 1.2),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
tableTop.position.y = 0.8;
tableTop.castShadow = true;
tableGroup.add(tableTop);

const legPositions = [
  [-0.85, 0.4, -0.45],
  [0.85, 0.4, -0.45],
  [-0.85, 0.4, 0.45],
  [0.85, 0.4, 0.45],
];

legPositions.forEach(([x, y, z]) => {
  const leg = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.8, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xffd6ea })
  );
  leg.position.set(x, y, z);
  leg.castShadow = true;
  tableGroup.add(leg);
});

tableGroup.position.set(0, 0, 1.2);
scene.add(tableGroup);
// 침대
const bedGroup = new THREE.Group();

const bedBase = new THREE.Mesh(
  new THREE.BoxGeometry(2.4, 0.5, 1.6),
  new THREE.MeshStandardMaterial({ color: 0xffb6d9 })
);
bedBase.position.y = 0.25;
bedBase.castShadow = true;
bedGroup.add(bedBase);

const mattress = new THREE.Mesh(
  new THREE.BoxGeometry(2.3, 0.25, 1.5),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
mattress.position.y = 0.63;
mattress.castShadow = true;
bedGroup.add(mattress);

const pillow = new THREE.Mesh(
  new THREE.BoxGeometry(0.6, 0.15, 0.4),
  new THREE.MeshStandardMaterial({ color: 0xfff0f6 })
);
pillow.position.set(-0.6, 0.8, 0);
pillow.castShadow = true;
bedGroup.add(pillow);

bedGroup.position.set(-2.8, 0, -2.8);
scene.add(bedGroup);
// 책상
const deskGroup = new THREE.Group();

const deskTop = new THREE.Mesh(
  new THREE.BoxGeometry(1.8, 0.12, 0.8),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
deskTop.position.y = 0.9;
deskTop.castShadow = true;
deskGroup.add(deskTop);

[
  [-0.75, 0.45, -0.3],
  [0.75, 0.45, -0.3],
  [-0.75, 0.45, 0.3],
  [0.75, 0.45, 0.3],
].forEach(([x, y, z]) => {
  const leg = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.9, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xffd6ea })
  );
  leg.position.set(x, y, z);
  leg.castShadow = true;
  deskGroup.add(leg);
});

deskGroup.position.set(2.7, 0, -2.6);
scene.add(deskGroup);
//장난감 박스
const toyBox = new THREE.Mesh(
  new THREE.BoxGeometry(1, 0.7, 0.8),
  new THREE.MeshStandardMaterial({ color: 0xffc94d })
);
toyBox.position.set(3.2, 0.35, 2.8);
toyBox.castShadow = true;
scene.add(toyBox);

// 벽 재질
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffe4f0 });

// 뒤쪽 벽
const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 5),
  wallMaterial
);
backWall.position.set(0, 2.5, -5);
scene.add(backWall);

// 앞쪽 벽
const frontWall = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 5),
  wallMaterial
);
frontWall.position.set(0, 2.5, 5);
frontWall.rotation.y = Math.PI;
scene.add(frontWall);

// 왼쪽 벽
const leftWall = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 5),
  wallMaterial
);
leftWall.position.set(-5, 2.5, 0);
leftWall.rotation.y = Math.PI / 2;
scene.add(leftWall);

// 오른쪽 벽
const rightWall = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 5),
  wallMaterial
);
rightWall.position.set(5, 2.5, 0);
rightWall.rotation.y = -Math.PI / 2;
scene.add(rightWall);

// 조명
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(3, 5, 3);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 반응형 처리
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function distance(a, b) {
  return Math.sqrt(
    (a.x - b.x) ** 2 +
    (a.y - b.y) ** 2
  );
}

// 애니메이션
function animate() {
  requestAnimationFrame(animate);

  box.rotation.y += 0.01;

  const halfRoomSize = 4.4;

  if (controls.isLocked) {
    if (keys.KeyW) controls.moveForward(moveSpeed);
    if (keys.KeyS) controls.moveForward(-moveSpeed);
    if (keys.KeyA) controls.moveRight(-moveSpeed);
    if (keys.KeyD) controls.moveRight(moveSpeed);

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -halfRoomSize, halfRoomSize);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -halfRoomSize, halfRoomSize);
    camera.position.y = 1.6;
  }

  handTracker.detect();

  const fingerTip = handTracker.getIndexFingerTip();
  const results = handTracker.results;

  let thumbTip = null;

  if (results && results.landmarks && results.landmarks.length > 0) {
    thumbTip = results.landmarks[0][4];
  }

  if (fingerTip && thumbTip) {
    const d = distance(fingerTip, thumbTip);

    if (!isGrabbing && d < 0.045) {
      isGrabbing = true;
    } else if (isGrabbing && d > 0.065) {
      isGrabbing = false;
    }
  } else {
    isGrabbing = false;
  }

  if (fingerTip) {
    const x = (1 - fingerTip.x) * window.innerWidth;
    const y = fingerTip.y * window.innerHeight;

    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([box]);

    if (intersects.length > 0) {
      box.material.color.set(highlightColor);

      if (isGrabbing && !grabbedObject) {
        grabbedObject = box;
      }
    } else {
      if (!grabbedObject) {
        box.material.color.set(defaultColor);
      }
    }
  } else {
    if (!grabbedObject) {
      box.material.color.set(defaultColor);
    }
  }

  if (grabbedObject) {
    const distance = 2;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const targetPosition = camera.position.clone().add(direction.multiplyScalar(distance));

    grabbedObject.position.lerp(targetPosition, 0.2);
  }

  if (!isGrabbing) {
    grabbedObject = null;
    box.material.color.set(defaultColor);
  }

  renderer.render(scene, camera);
}


animate();