/* ============================================
   THREE.JS RUBIK'S CUBE — refined edition
   Beveled cubies, premium materials,
   soft contact shadow, elegant slice rotations
   ============================================ */

(function () {
  'use strict';

  const container = document.getElementById('cube-container');
  if (!container || typeof THREE === 'undefined') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  // Default encoding (no gamma transform). For r128 this gives saturated, expected colors.
  // (outputEncoding left at default = LinearEncoding)
  renderer.toneMapping = THREE.NoToneMapping;
  container.appendChild(renderer.domElement);

  // --- Scene & Camera ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(5.6, 4.4, 6.9);
  camera.lookAt(0, -0.05, 0);

  // --- Lights — sculptural three-point setup ---
  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
  keyLight.position.set(6, 8, 6);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.25);
  rimLight.position.set(-5, 2, -6);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xfff2d8, 0.15);
  fillLight.position.set(-3, -4, 4);
  scene.add(fillLight);

  // Tiny warm bounce from below
  const bounce = new THREE.HemisphereLight(0xffffff, 0x2a2820, 0.18);
  scene.add(bounce);

  // --- Refined Rubik's palette — vibrant but cinematic ---
  const faceColors = {
    right:  0xe53935, // vivid red
    left:   0xff6a1a, // vivid orange
    top:    0xf4f3ee, // paper white (matches theme)
    bottom: 0xffc928, // vivid yellow
    front:  0x18b663, // emerald green
    back:   0x2962ff, // vivid blue
  };
  const faceKeys = ['right', 'left', 'top', 'bottom', 'front', 'back'];
  const innerColor = 0x0a0a0c;

  // --- Beveled cube geometry (rounded box) ---
  function createRoundedBoxGeometry(size, radius, smoothness) {
    const w = size, h = size, d = size;
    const r = Math.min(radius, size * 0.5);

    // Use ExtrudeGeometry to create a rounded box face by face? Too complex.
    // Approach: use a BoxGeometry then displace vertices toward an inscribed sphere
    // Better: build a rounded box via ShapeGeometry + Extrude or use a parametric approach.

    // Simple & effective: use BufferGeometry from a custom "rounded box" via subdivision
    // We'll use the well-known approach: clone a BoxGeometry and round corners.

    const geometry = new THREE.BoxGeometry(w - r * 2, h - r * 2, d - r * 2, 1, 1, 1);

    // Won't actually produce rounded corners with just BoxGeometry above.
    // Use SphereGeometry intersect logic via shader is overkill.
    // Strategy: use a tessellated box and project corner verts onto the inset sphere.

    const fullGeom = new THREE.BoxGeometry(w, h, d, smoothness, smoothness, smoothness);
    const positions = fullGeom.attributes.position;
    const inner = w / 2 - r;
    const tmp = new THREE.Vector3();
    const sign = new THREE.Vector3();
    const ref = new THREE.Vector3();

    for (let i = 0; i < positions.count; i++) {
      tmp.set(positions.getX(i), positions.getY(i), positions.getZ(i));
      sign.set(Math.sign(tmp.x), Math.sign(tmp.y), Math.sign(tmp.z));
      ref.set(
        sign.x * inner,
        sign.y * inner,
        sign.z * inner
      );
      // For each axis, only "push out" when beyond the inner box
      const dx = tmp.x - ref.x;
      const dy = tmp.y - ref.y;
      const dz = tmp.z - ref.z;
      // Project onto sphere of radius r centered at ref
      const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (len > 0.0001) {
        const k = r / len;
        positions.setXYZ(i, ref.x + dx * k, ref.y + dy * k, ref.z + dz * k);
      }
    }

    fullGeom.computeVertexNormals();
    return fullGeom;
  }

  // --- Build 27 sub-cubes with bevels — pieces packed tight ---
  const cubeGroup = new THREE.Group();
  const GAP = 1.0;          // cubies touching (no visible gap, bevel grooves do the work)
  const CUBE_SIZE = 0.985;
  const BEVEL = 0.085;
  const subCubes = [];
  const sharedGeo = createRoundedBoxGeometry(CUBE_SIZE, BEVEL, 6);

  // We use a single rounded geometry but need per-face colors.
  // Strategy: keep box's 6-face material assignment by attaching a colored "sticker" plane
  // slightly above each colored face.
  const stickerGeo = new THREE.PlaneGeometry(CUBE_SIZE * 0.86, CUBE_SIZE * 0.86);

  // Body material — dark, slightly glossy
  function makeBodyMat() {
    return new THREE.MeshStandardMaterial({
      color: innerColor,
      roughness: 0.55,
      metalness: 0.18,
    });
  }

  // Sticker material per face color — unlit for vibrant pure colors
  function makeStickerMat(hex) {
    return new THREE.MeshBasicMaterial({
      color: hex,
    });
  }

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const cubie = new THREE.Group();
        const body = new THREE.Mesh(sharedGeo, makeBodyMat());
        cubie.add(body);

        const faces = [
          { axis: 'x', val:  1, key: 'right',  rot: [0, Math.PI / 2, 0],  pos: [0.5005, 0, 0] },
          { axis: 'x', val: -1, key: 'left',   rot: [0, -Math.PI / 2, 0], pos: [-0.5005, 0, 0] },
          { axis: 'y', val:  1, key: 'top',    rot: [-Math.PI / 2, 0, 0], pos: [0, 0.5005, 0] },
          { axis: 'y', val: -1, key: 'bottom', rot: [Math.PI / 2, 0, 0],  pos: [0, -0.5005, 0] },
          { axis: 'z', val:  1, key: 'front',  rot: [0, 0, 0],            pos: [0, 0, 0.5005] },
          { axis: 'z', val: -1, key: 'back',   rot: [0, Math.PI, 0],      pos: [0, 0, -0.5005] },
        ];

        faces.forEach(f => {
          const coord = f.axis === 'x' ? x : f.axis === 'y' ? y : z;
          if (coord === f.val) {
            const sticker = new THREE.Mesh(stickerGeo, makeStickerMat(faceColors[f.key]));
            sticker.position.set(f.pos[0], f.pos[1], f.pos[2]);
            sticker.rotation.set(f.rot[0], f.rot[1], f.rot[2]);
            cubie.add(sticker);
          }
        });

        cubie.position.set(x * GAP, y * GAP, z * GAP);
        subCubes.push(cubie);
        cubeGroup.add(cubie);
      }
    }
  }

  // Initial orientation
  cubeGroup.rotation.x = 0.42;
  cubeGroup.rotation.y = -0.72;
  scene.add(cubeGroup);

  // --- Slice Rotation System (multi-slice) ---
  // Slices are independent: an active slice owns its meshes and a pivot.
  // Triggering picks 1 slice, or 2 slices on the same axis but different layers
  // (so no cubies are shared between them).
  const activeSlices = [];
  let sliceTimer = 100;
  let queueImmediate = false;  // set by click; triggers next rotation w/o waiting

  // Auto-rotation of layers — enabled, but each slice does a FULL 360° turn so
  // the cube always ends up in its solved state (no scrambling between cycles).
  const AUTO_SLICE_ROTATIONS = true;
  const TURN_ANGLE = Math.PI * 2;  // full revolution → cube stays solved

  function getAxisCoord(pos, axis) {
    if (axis === 'x') return pos.x;
    if (axis === 'y') return pos.y;
    return pos.z;
  }

  function roundToLayer(val) {
    return Math.round(val / GAP);
  }

  // Smooth easing — cubic in-out for fluid feel
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function spawnSliceOnAxis(axis, layer, dir, duration) {
    const selected = subCubes.filter(m =>
      roundToLayer(getAxisCoord(m.position, axis)) === layer
    );
    if (selected.length !== 9) return null;

    const pivot = new THREE.Object3D();
    cubeGroup.add(pivot);

    selected.forEach(m => {
      const localPos = m.position.clone();
      const localQuat = m.quaternion.clone();
      cubeGroup.remove(m);
      pivot.add(m);
      m.position.copy(localPos);
      m.quaternion.copy(localQuat);
    });

    return {
      pivot,
      axis,
      layer,
      target: TURN_ANGLE * dir,
      progress: 0,
      duration,           // frames to complete
      meshes: selected,
    };
  }

  function startRotation() {
    if (activeSlices.length > 0) return;

    const axes = ['x', 'y', 'z'];
    const axis = axes[Math.floor(Math.random() * axes.length)];

    // 45% chance of dual-layer rotation (two slices on same axis, different layers)
    const dual = Math.random() < 0.45;
    const duration = 110 + Math.floor(Math.random() * 30); // ~1.83-2.33s @ 60fps for full revolution

    if (dual) {
      // Pick two distinct layers from {-1, 0, 1}
      const layers = [-1, 0, 1];
      const i = Math.floor(Math.random() * 3);
      let j = Math.floor(Math.random() * 3);
      while (j === i) j = Math.floor(Math.random() * 3);
      const layerA = layers[i];
      const layerB = layers[j];
      // Random directions — 50/50 for same/opposite (looks great either way)
      const dirA = Math.random() > 0.5 ? 1 : -1;
      const dirB = Math.random() > 0.5 ? 1 : -1;

      const sA = spawnSliceOnAxis(axis, layerA, dirA, duration);
      const sB = spawnSliceOnAxis(axis, layerB, dirB, duration);
      if (sA) activeSlices.push(sA);
      if (sB) activeSlices.push(sB);
    } else {
      const layer = Math.floor(Math.random() * 3) - 1;
      const dir = Math.random() > 0.5 ? 1 : -1;
      const s = spawnSliceOnAxis(axis, layer, dir, duration);
      if (s) activeSlices.push(s);
    }
  }

  function finalizeSlice(slice) {
    // Full-revolution turn → pivot ends as identity, so cubies return to their
    // original positions and orientations. Just detach from pivot back to cubeGroup
    // and snap to grid to clean up floating-point drift.
    slice.meshes.forEach(m => {
      const localPos = m.position.clone();   // position relative to pivot, unchanged
      slice.pivot.remove(m);
      cubeGroup.add(m);
      m.position.set(
        Math.round(localPos.x / GAP) * GAP,
        Math.round(localPos.y / GAP) * GAP,
        Math.round(localPos.z / GAP) * GAP
      );
      m.quaternion.identity();
    });

    cubeGroup.remove(slice.pivot);
  }

  function updateSlices() {
    if (activeSlices.length === 0) {
      sliceTimer--;
      if (sliceTimer <= 0 && !reducedMotion && AUTO_SLICE_ROTATIONS) {
        sliceTimer = 100 + Math.floor(Math.random() * 80);
        startRotation();
      }
      return;
    }

    for (let i = activeSlices.length - 1; i >= 0; i--) {
      const s = activeSlices[i];
      s.progress += 1 / s.duration;
      if (s.progress > 1) s.progress = 1;

      const eased = easeInOutCubic(s.progress);
      const current = s.target * eased;

      s.pivot.rotation.set(0, 0, 0);
      if (s.axis === 'x') s.pivot.rotation.x = current;
      else if (s.axis === 'y') s.pivot.rotation.y = current;
      else s.pivot.rotation.z = current;

      if (s.progress >= 1) {
        finalizeSlice(s);
        activeSlices.splice(i, 1);
      }
    }

    if (activeSlices.length === 0) {
      if (queueImmediate) {
        sliceTimer = 0;
        queueImmediate = false;
      } else {
        sliceTimer = 90 + Math.floor(Math.random() * 80);
      }
    }
  }

  // --- Mouse / Touch interaction ---
  let isDragging = false;
  let hasDragged = false;
  let previousMouse = { x: 0, y: 0 };
  let velocity = { x: 0, y: 0 };
  const damping = 0.95;
  const sensitivity = 0.006;

  function onPointerDown(e) {
    if (e.touches) e.preventDefault();
    isDragging = true;
    hasDragged = false;
    const pt = e.touches ? e.touches[0] : e;
    previousMouse.x = pt.clientX;
    previousMouse.y = pt.clientY;
    velocity.x = 0;
    velocity.y = 0;
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    if (e.touches) e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    const dx = pt.clientX - previousMouse.x;
    const dy = pt.clientY - previousMouse.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) hasDragged = true;
    velocity.x = dy * sensitivity;
    velocity.y = dx * sensitivity;
    cubeGroup.rotation.x += velocity.x;
    cubeGroup.rotation.y += velocity.y;
    previousMouse.x = pt.clientX;
    previousMouse.y = pt.clientY;
  }

  function onPointerUp() {
    isDragging = false;
  }

  // Click handler — only triggers slice rotations if AUTO_SLICE_ROTATIONS is on
  renderer.domElement.addEventListener('click', () => {
    if (!hasDragged && !reducedMotion && AUTO_SLICE_ROTATIONS) {
      if (activeSlices.length === 0) sliceTimer = 0;
      else queueImmediate = true;
    }
  });

  renderer.domElement.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);
  renderer.domElement.addEventListener('touchstart', onPointerDown, { passive: false });
  renderer.domElement.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp);
  renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());

  // --- Resize ---
  function resize() {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    renderer.setSize(rect.width, rect.height);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // --- Animate ---
  let clock = 0;
  function animate() {
    requestAnimationFrame(animate);
    clock += 0.016;

    if (!isDragging && !reducedMotion) {
      // Slow autorotate
      cubeGroup.rotation.x += 0.0012;
      cubeGroup.rotation.y += 0.0026;
      // Subtle float
      cubeGroup.position.y = Math.sin(clock * 0.7) * 0.08;
      // shadow removed for clean look
    }

    updateSlices();

    if (!isDragging && (Math.abs(velocity.x) > 0.0001 || Math.abs(velocity.y) > 0.0001)) {
      cubeGroup.rotation.x += velocity.x;
      cubeGroup.rotation.y += velocity.y;
      velocity.x *= damping;
      velocity.y *= damping;
    }

    renderer.render(scene, camera);
  }

  animate();
})();
