import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { STLLoader } from 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';

const modalHtml = `
<div id="viewer-modal" class="viewer-modal hidden">
  <div class="viewer-panel">
    <div class="viewer-toolbar">
      <div class="title">3D Preview</div>
      <div>
        <button id="viewer-download" class="btn">Download</button>
        <button id="viewer-close" class="close">Close</button>
      </div>
    </div>
    <div class="viewer-canvas" id="viewer-canvas"></div>
  </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHtml);

const modal = document.getElementById('viewer-modal');
const canvasParent = document.getElementById('viewer-canvas');
const closeBtn = document.getElementById('viewer-close');
const downloadBtn = document.getElementById('viewer-download');

let renderer, scene, camera, controls, mesh;

function initRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight);
    renderer.setClearColor(0x0f1724, 1);
    canvasParent.innerHTML = '';
    canvasParent.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, canvasParent.clientWidth / canvasParent.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 100);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(0, 50, 50);
    scene.add(dir);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
}

function resize() {
    if (!renderer || !camera) return;
    camera.aspect = canvasParent.clientWidth / canvasParent.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasParent.clientWidth, canvasParent.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}

async function loadSTL(url) {
    if (!scene) initRenderer();

    // clear old
    if (mesh) {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        mesh = null;
    }

    const loader = new STLLoader();
    return new Promise((resolve, reject) => {
        loader.load(url, (geometry) => {
            const material = new THREE.MeshStandardMaterial({ color: 0x7fb3ff, metalness: 0.2, roughness: 0.4 });
            mesh = new THREE.Mesh(geometry, material);
            geometry.computeBoundingBox();

            const bbox = geometry.boundingBox;
            const size = new THREE.Vector3();
            bbox.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);

            // center
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            mesh.position.sub(center);

            scene.add(mesh);

            // fit camera
            const camDist = maxDim * 2.2;
            camera.position.set(camDist, camDist, camDist);
            camera.lookAt(0, 0, 0);
            controls.target.set(0, 0, 0);
            controls.update();

            resolve();
        }, undefined, (err) => reject(err));
    });
}

function showModal(src) {
    if (!modal) return;
    modal.classList.remove('hidden');
    initRenderer();
    window.addEventListener('resize', resize);
    animate();

    // if src is zip or not .stl, set download only
    if (!src.toLowerCase().endsWith('.stl')) {
        downloadBtn.style.display = 'inline-block';
        downloadBtn.onclick = () => window.open(src, '_blank');
        // show placeholder instead of loading
        canvasParent.innerHTML = '<div style="color:#fff;padding:20px">Preview not available for this file type. Use Download.</div>';
        return;
    }

    downloadBtn.style.display = 'inline-block';
    downloadBtn.onclick = () => window.open(src, '_blank');

    loadSTL(src).catch(err => {
        console.error(err);
        canvasParent.innerHTML = '<div style="color:#fff;padding:20px">Неуспешно зареждане на 3D модела.</div>';
    });
}

function hideModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    // cleanup
    window.removeEventListener('resize', resize);
    if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
        renderer = null;
    }
    scene = null;
    camera = null;
    controls = null;
    mesh = null;
    canvasParent.innerHTML = '';
}

closeBtn.addEventListener('click', hideModal);
modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

// attach to preview buttons
document.querySelectorAll('.preview-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const src = btn.dataset.src;
        showModal(src);
    });
});

export { };
