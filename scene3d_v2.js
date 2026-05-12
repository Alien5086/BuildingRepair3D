let scene, camera, renderer, controls, composer, labelDiv, groundMesh, gui, f3_floorController, isMobile;
let isCameraMoving = false; // ⚡ 監測鏡頭是否正在運鏡
let buildings = {};
let floorPlanes = {};
let floorLabels = {};
let selectedBuildingId = null, collapsingBuildingId = null; // ⚡ 紀錄正在收合的建築
let isExploded = false;
let explosionFactor = 0;
let isFocusMode = false;
let focusedFloor = null;
let lastCameraState = { pos: null, target: null };

const texLoader = new THREE.TextureLoader();
const PLANE_BASE_SIZE = 100;

const buildingConfigs = {
  "main_hall": {
    "name": "主殿 (A棟)",
    "glb": "skynoe01.glb",
    "pos": [0, 50, -165],
    "scale": 65,
    "sx": 1, "sy": 1, "sz": 1,
    "rot": [0, 0, 0],
    "cut1": 29, "cut2": 48.5, "cut3": 400, "gap": 36,
    "zoomOffset": [450, 180, 380],
    "floors": [
      {
        "name": "大殿",
        "offX": 0, "offY": 33, "offZ": -165,
        "floorW": 0.75, "floorL": 0.75,
        "texScale": 1, "texRot": 0, "texOffX": 0, "texOffY": 0,
        "innerR": 35, "outerR": 145
      },
      {
        "name": "母堂",
        "offX": 0, "offY": 53, "offZ": -165,
        "floorW": 0.78, "floorL": 0.78,
        "texScale": 1, "texRot": 0, "texOffX": 0, "texOffY": 0,
        "innerR": 35, "outerR": 145
      },
      {
        "name": "穹頂",
        "offX": 0, "offY": 53, "offZ": -163,
        "floorW": 0.78, "floorL": 0.78,
        "texScale": 1, "texRot": 0, "texOffX": 0, "texOffY": 0,
        "innerR": 35, "outerR": 145
      }
    ],
    "textures": ["floor_plan_ref08.png", "floor_plan_ref09.png", "floor_plan_ref10.png"]
  },
  "east": {
    "name": "東側殿 (B棟)",
    "glb": "skynoe02.glb",
    "pos": [52, 30, -20],
    "scale": 120,
    "sx": 1.1, "sy": 1.2, "sz": 1,
    "rot": [0, -1.58, 0],
    "cut1": 24, "cut2": 33, "cut3": 100, "gap": 30,
    "zoomOffset": [200, 150, 200],
    "floors": [
      {
        "name": "1F",
        "offX": 53, "offY": 30, "offZ": -36,
        "floorW": 0.52, "floorL": 1,
        "texScale": 1, "texRot": 0, "texOffX": 0.026, "texOffY": 0
      },
      {
        "name": "2F",
        "offX": 53, "offY": 39, "offZ": -36,
        "floorW": 0.52, "floorL": 1,
        "texScale": 1, "texRot": 0, "texOffX": 0, "texOffY": 0
      },
      {
        "name": "屋頂",
        "offX": 60, "offY": 84, "offZ": -25,
        "floorW": 0.2, "floorL": 0.3,
        "hidePlane": true
      }
    ],
    "textures": ["floor_plan_ref03.png", "floor_plan_ref05.png", "floor_plan_ref05.png"]
  },
  "west": {
    "name": "西側殿 (C棟)",
    "glb": "skynoe02.glb",
    "pos": [-52, 30, -20],
    "scale": 120,
    "sx": 1.1, "sy": 1.2, "sz": 1,
    "rot": [0, 1.58, 0],
    "mirrorX": true,
    "cut1": 24, "cut2": 33, "cut3": 100, "gap": 30,
    "zoomOffset": [-200, 150, 200],
    "floors": [
      {
        "name": "1F",
        "offX": -53, "offY": 30, "offZ": -36,
        "floorW": 0.52, "floorL": 1,
        "texScale": 1, "texRot": 0, "texOffX": 0, "texOffY": 0
      },
      {
        "name": "2F",
        "offX": -53, "offY": 39, "offZ": -36,
        "floorW": 0.51, "floorL": 0.95,
        "texScale": 1, "texRot": 0, "texOffX": 0, "texOffY": 0
      },
      {
        "name": "屋頂",
        "offX": -60, "offY": 84, "offZ": -25,
        "floorW": 0.2, "floorL": 0.3,
        "hidePlane": true
      }
    ],
    "textures": ["floor_plan_ref04.png", "floor_plan_ref06.png", "floor_plan_ref06.png"]
  },
  "round": {
    "name": "圓樓 (D棟)",
    "glb": "skynoe04.glb",
    "pos": [-3, 5, 178],
    "scale": 302,
    "sx": 1, "sy": 1, "sz": 1,
    "rot": [0, 4.7, 0],
    "cut1": 56, "cut2": 70.5, "gap": 45.9,
    "zoomOffset": [0, 300, 550],
    "floors": [
      {
        "name": "1F",
        "offX": 0, "offY": 21, "offZ": 180,
        "floorW": 1, "floorL": 1,
        "innerR": 105, "outerR": 150,
        "texScale": 0.7, "texRot": 0, "texOffX": 1, "texOffY": 0
      },
      {
        "name": "2F",
        "offX": 0, "offY": 35, "offZ": 180,
        "floorW": 1.1, "floorL": 1,
        "innerR": 105, "outerR": 150,
        "texScale": 0.75, "texRot": 0, "texOffX": 0, "texOffY": 0
      },
      {
        "name": "屋頂",
        "offX": 0, "offY": 82, "offZ": 180,
        "floorW": 1, "floorL": 1,
        "hidePlane": true
      }
    ],
    "textures": ["floor_plan_ref.png", "floor_plan_ref02.png", "floor_plan_ref02.png"]
  },
  "basement": {
    "name": "地宮結構",
    "glb": "skynoe01-2.glb",
    "pos": [0, -47.930700046315536, -53.82922391527484],
    "scale": 380.79307663432695,
    "sx": 0.7770933703633989, "sy": 1.6857968092367268, "sz": 0.8309913500938185,
    "rot": [0, 1.6, 0],
    "floors": [
      {
        "name": "宴會廳",
        "offX": 0, "offY": -15, "offZ": -165,
        "floorW": 2.2, "floorL": 2.2,
        "hidePlane": true
      }
    ],
    "textures": ["floor_plan_ref07.png"]
  },
  "floor": {
    "name": "平地 (0F)",
    "glb": "skynoe00.glb",
    "pos": [-5, -7, 53.96592991170007],
    "scale": 580,
    "sx": 1, "sy": 1, "sz": 0.95,
    "rot": [-0.006484301201581388, -1.58, 1.55],
    "floors": [], "textures": []
  }
};

const PARAMS = {
  targetBuilding: '',
  targetFloor: '',
  autoCamera: true,
  pos_x: 0, pos_y: 0, pos_z: 0,
  rot_x: 0, rot_y: 0, rot_z: 0,
  scale: 1, sx: 1, sy: 1, sz: 1,
  cut1: 0, cut2: 0, cut3: 0, gap: 20,
  floorIdx: 0,
  f_offX: 0, f_offY: 0, f_offZ: 0,
  f_w: 1, f_l: 1,
  f_innerR: 35, f_outerR: 145,
  f_texScale: 1, f_texRot: 0, f_texOffX: 0, f_texOffY: 0,
  save: () => {
    console.log("=== 調整後的建築參數 (請複製以下內容傳給 AI) ===");
    console.log(JSON.stringify(buildingConfigs, null, 2));
    console.log("================================================");
    alert("數值已輸出至控制台！請按 F12 切換到 Console 頁籤，複製輸出的內容貼給我。");
  }
};

const INIT_CAM_POS = { x: 0, y: 550, z: 750 };
const INIT_CAM_TARGET = { x: 0, y: 0, z: 80 };

let outlinePass;
let lastInteractionTime = Date.now();
const IDLE_TIMEOUT = 12000;


function init() {
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  scene = new THREE.Scene();

  const canvas = document.createElement('canvas');
  canvas.width = 2; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  // ☀️ 黃金比例漸層：頂部深天藍 -> 中間粉藍 -> 底部純白
  gradient.addColorStop(0, '#38bdf8'); gradient.addColorStop(0.5, '#bae6fd'); gradient.addColorStop(1, '#ffffff');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 2, 512);
  const skyTex = new THREE.CanvasTexture(canvas);
  skyTex.encoding = THREE.sRGBEncoding;
  scene.background = skyTex;

  // 🌫️ 經典藍白色薄霧 (還原 0xbfdbfe)：讓地平線更有層次感
  scene.fog = new THREE.Fog(0xbfdbfe, 600, 2500);

  // ☁️ 只有電腦版載入 sky.png，手機版使用漸層背景以節省內存
  if (!isMobile) {
    new THREE.TextureLoader().load('assets/sky.png', (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.encoding = THREE.sRGBEncoding;
      scene.background = tex;
      if (!isMobile) scene.environment = tex; // ⚡ 手機版不使用環境貼圖計算反射
    });
  }


  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(INIT_CAM_POS.x, INIT_CAM_POS.y, INIT_CAM_POS.z);

  renderer = new THREE.WebGLRenderer({ 
    antialias: !isMobile, 
    alpha: true,
    powerPreference: "high-performance",
    precision: isMobile ? "mediump" : "highp" // 手機端使用中等精度，大幅減少 GPU 壓力
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // 手機鎖定 2.0 像素比，防止 3x 螢幕效能崩潰
  renderer.setPixelRatio(isMobile ? Math.min(2, window.devicePixelRatio) : window.devicePixelRatio);

  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;

  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  document.getElementById('scene-container').appendChild(renderer.domElement);

  // 📱 手機端跳過重型後期特效，確保能順利載入
  if (!isMobile) {
    composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePass.edgeStrength = 5.0; outlinePass.edgeGlow = 1.5; outlinePass.edgeThickness = 2.0;
    outlinePass.pulsePeriod = 0; outlinePass.visibleEdgeColor.set('#ffffff'); outlinePass.hiddenEdgeColor.set('#ffcc00');
    composer.addPass(outlinePass);
  }

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(INIT_CAM_TARGET.x, INIT_CAM_TARGET.y, INIT_CAM_TARGET.z);
  controls.enableDamping = true;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 0.7));
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  const sun = new THREE.DirectionalLight(0xffffff, 0.7);
  sun.position.set(150, 400, 200);
  sun.castShadow = true;

  // ⚡ 關鍵修復：手機陰影貼圖降階，防止內存溢出崩潰
  const shadowSize = isMobile ? 1024 : 4096;
  sun.shadow.mapSize.width = shadowSize;
  sun.shadow.mapSize.height = shadowSize;

  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 1500;
  const d = 500;
  sun.shadow.camera.left = -d;
  sun.shadow.camera.right = d;
  sun.shadow.camera.top = d;
  sun.shadow.camera.bottom = -d;
  scene.add(sun);

  labelDiv = document.getElementById('building-label');

  const manager = new THREE.LoadingManager();
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  let lastProgress = 0;
  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = Math.floor((itemsLoaded / itemsTotal) * 100);
    if (progress > lastProgress) {
      lastProgress = progress;
      if (progressFill) progressFill.style.width = lastProgress + '%';
      if (progressText) progressText.innerText = lastProgress + '%';
    }
  };

  manager.onLoad = () => {
    const loaderOverlay = document.getElementById('loading-overlay');
    if (loaderOverlay) {
      loaderOverlay.style.opacity = '0';
      setTimeout(() => {
        loaderOverlay.style.display = 'none';
        const guideModal = document.getElementById('guide-modal');
        if (guideModal) guideModal.style.display = 'flex';
      }, 500);
    }
    // ⚡ 載入完畢後釋放解碼器，節省手機內存
    // @ts-ignore
    if (window.dracoLoader) window.dracoLoader.dispose();
  };

  window.closeGuide = () => {
    const guideModal = document.getElementById('guide-modal');
    if (guideModal) {
      guideModal.style.opacity = '0';
      setTimeout(() => guideModal.style.display = 'none', 400);
    }
    lastInteractionTime = Date.now();
  };

  window.addEventListener('resize', () => { onResize(); lastInteractionTime = Date.now(); });
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('wheel', () => { lastInteractionTime = Date.now(); }, { passive: true });

  initEnvironment(manager);
  loadModels(manager);
  initGUI();
}

function onPointerDown(e) {
  lastInteractionTime = Date.now();
  if (isCameraMoving) return; // ⚡ 運鏡中禁止點擊
  const page2D = document.getElementById('page-2d');
  if (page2D && page2D.style.display !== 'none') return;
  if (e.target.closest('.dg') || e.target.closest('.app-header') || e.target.closest('.modal-content')) return;
  const hit = getHit(e);
  if (hit) {
    const data = hit.userData;
    if (data && (data.type === 'label' || data.type === 'floor')) { enterFloorView(data.bid, data.idx); return; }
    let bid = getBuildingIdFromObject(hit);
    if (bid) {
      selectedBuildingId = bid; isExploded = (bid !== 'floor');
      if (outlinePass) outlinePass.selectedObjects = [];
      PARAMS.floorIdx = 0; syncParamsFromConfig(bid);
      if (PARAMS.autoCamera) zoomToBuilding(bid);
      updateVisibility();
    }
  } else {
    collapsingBuildingId = selectedBuildingId; // ⚡ 點擊空處時，記住誰要收合
    selectedBuildingId = null; 
    isExploded = false;
    if (outlinePass) outlinePass.selectedObjects = [];
    if (PARAMS.autoCamera) resetCamera(); 
    updateVisibility();
  }
}

function enterFloorView(bid, idx) {
  const cfg = buildingConfigs[bid]; const fCfg = cfg.floors[idx]; const planes = floorPlanes[bid];
  if (!planes || !planes[idx]) return;
  const plane = planes[idx];

  controls.enabled = false;
  controls.enableDamping = false;

  lastCameraState.pos = camera.position.clone();
  lastCameraState.target = controls.target.clone();

  const targetX = plane.position.x;
  const targetY = plane.position.y;
  const targetZ = plane.position.z;

  TWEEN.removeAll();

  new TWEEN.Tween(controls.target)
    .to({ x: targetX, y: targetY, z: targetZ }, 1200)
    .easing(TWEEN.Easing.Quartic.Out)
    .start();

  new TWEEN.Tween(camera.position)
    .to({ x: targetX, y: targetY + 65, z: targetZ + 0.1 }, 1200)
    .easing(TWEEN.Easing.Quartic.Out)
    .onComplete(() => {
      let texUrl = fCfg.plan2D || cfg.textures[idx] || cfg.textures[0];
      if (window.show2DPlan) window.show2DPlan(texUrl, fCfg.name, cfg.name, bid, idx);
    })
    .start();
}

window.resetCameraFrom2D = function () {
  if (!lastCameraState.pos) { controls.enabled = true; controls.enableDamping = true; return; }

  TWEEN.removeAll();
  new TWEEN.Tween(camera.position)
    .to({ x: lastCameraState.pos.x, y: lastCameraState.pos.y, z: lastCameraState.pos.z }, 1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .start();

  new TWEEN.Tween(controls.target)
    .to({ x: lastCameraState.target.x, y: lastCameraState.target.y, z: lastCameraState.target.z }, 1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(() => {
      controls.enabled = true;
      controls.enableDamping = true;
    })
    .start();
};

function zoomToBuilding(bid) {
  const cfg = buildingConfigs[bid]; if (!cfg) return;
  let offset = cfg.zoomOffset || [120, 150, 220]; 
  let tx = cfg.pos[0], ty = cfg.pos[1], tz = cfg.pos[2];
  
  isCameraMoving = true;
  resetHoverEffects();
  controls.enabled = false;
  controls.autoRotate = false;
  controls.enableDamping = false; 
  lastInteractionTime = Date.now();

  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const endTarget = new THREE.Vector3(tx, ty + 50, tz);
  const endPos = new THREE.Vector3(tx + offset[0], ty + offset[1], tz + offset[2]);

  TWEEN.removeAll();
  // ⚡ 核心優化：使用單一 TWEEN 同步帶動「相機」與「目標點」
  new TWEEN.Tween({ t: 0 })
    .to({ t: 1 }, 1500)
    .easing(TWEEN.Easing.Cubic.Out)
    .onUpdate((obj) => {
      camera.position.lerpVectors(startPos, endPos, obj.t);
      controls.target.lerpVectors(startTarget, endTarget, obj.t);
      controls.update(); 
    })
    .onComplete(() => {
      controls.enabled = true; 
      controls.enableDamping = true;
      isCameraMoving = false;
    })
    .start();
}

function resetCamera() {
  isCameraMoving = true; 
  resetHoverEffects();
  controls.enabled = false;
  controls.enableDamping = false;

  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const endTarget = new THREE.Vector3(INIT_CAM_TARGET.x, INIT_CAM_TARGET.y, INIT_CAM_TARGET.z);
  const endPos = new THREE.Vector3(INIT_CAM_POS.x, INIT_CAM_POS.y, INIT_CAM_POS.z);

  new TWEEN.Tween({ t: 0 }).to({ t: 1 }, 1000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate((obj) => {
      camera.position.lerpVectors(startPos, endPos, obj.t);
      controls.target.lerpVectors(startTarget, endTarget, obj.t);
      controls.update();
    })
    .onComplete(() => {
      controls.enabled = true;
      controls.enableDamping = true;
      isCameraMoving = false;
    })
    .start();
}

function loadModels(manager) {
  const loader = new THREE.GLTFLoader(manager); 
  const draco = new THREE.DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/'); 
  loader.setDRACOLoader(draco);
  window.dracoLoader = draco; 

  const buildingIds = Object.keys(buildingConfigs);
  let currentIndex = 0;

  function loadNext() {
    if (currentIndex >= buildingIds.length) return;
    
    const id = buildingIds[currentIndex];
    const cfg = buildingConfigs[id];
    
    loader.load('assets/' + cfg.glb, (gltf) => {
      const model = gltf.scene;
      model.traverse(n => { 
        if (n.isMesh) { 
          n.visible = true; 
          if (!isMobile) { n.castShadow = true; n.receiveShadow = true; }
          if (n.material) { 
            n.material.depthWrite = true; n.material.transparent = false; 
            // ⚡ 手機貼圖優化：關閉非等向性過濾，使用線性過濾
            if (isMobile && n.material.map) {
              n.material.map.anisotropy = 1;
              n.material.map.minFilter = THREE.LinearFilter;
              n.material.map.magFilter = THREE.LinearFilter;
            }
          } 
        } 
      });
      
      updateModelTransform(model, cfg);
      model.updateMatrixWorld(true);
      
      const box = new THREE.Box3().setFromObject(model);
      model.userData.minY = box.min.y;
      model.userData.id = id;
      buildings[id] = model;
      scene.add(model);

      if (cfg.cut1 !== undefined) {
        model.userData.slices = createSlices(model, cfg);
        model.userData.slices.userData.id = id;
        scene.add(model.userData.slices);
        model.userData.slices.visible = false;
      }
      
      if (cfg.floors) attachFloorPlanes(id, model.userData.slices, cfg, manager);
      
      updateVisibility();

      // ⚡ 載入完畢，遞迴進入下一個
      currentIndex++;
      loadNext();
    }, undefined, (err) => {
      console.error(`載入 ${id} 失敗:`, err);
      currentIndex++;
      loadNext();
    });
  }

  loadNext();
}

function updateModelTransform(model, cfg) {
  if (Array.isArray(cfg.rot)) model.rotation.set(...cfg.rot); else model.rotation.y = cfg.rot || 0;
  let finalSX = cfg.scale * (cfg.sx || 1); if (cfg.mirrorX) finalSX *= -1;
  model.scale.set(finalSX, cfg.scale * (cfg.sy || 1), cfg.scale * (cfg.sz || 1)); model.position.set(...cfg.pos);
}

function createSlices(model, cfg) {
  const group = new THREE.Group(); const cuts = [cfg.cut1, cfg.cut2, cfg.cut3].filter(c => c !== undefined && c > 0).sort((a, b) => a - b);
  for (let i = 0; i <= cuts.length; i++) { const sliceGroup = new THREE.Group(); const slice = model.clone(); slice.traverse(n => { if (n.isMesh) { n.material = n.material.clone(); n.material.side = THREE.FrontSide; n.material.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 10000), new THREE.Plane(new THREE.Vector3(0, -1, 0), 10000)]; } }); sliceGroup.add(slice); group.add(sliceGroup); }
  return group;
}

function attachFloorPlanes(bid, slices, cfg, manager) {
  if (!cfg.floors) return;
  const floorTexLoader = new THREE.TextureLoader(manager);
  floorPlanes[bid] = []; floorLabels[bid] = [];
  cfg.floors.forEach((fCfg, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, side: THREE.DoubleSide });
    if (cfg.textures && cfg.textures[i]) {
      floorTexLoader.load('assets/' + cfg.textures[i], tex => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.center.set(0.5, 0.5); tex.rotation = fCfg.texRot || 0; tex.repeat.set(fCfg.texScale || 1, fCfg.texScale || 1); tex.offset.set(fCfg.texOffX || 0, fCfg.texOffY || 0); mat.map = tex; mat.needsUpdate = true;
      });
    }
    const planeGeom = (bid === 'round' && !fCfg.hidePlane) ? new THREE.RingGeometry(fCfg.innerR || 35, fCfg.outerR || 145, 64) : new THREE.PlaneGeometry(PLANE_BASE_SIZE * (fCfg.floorW || 1), PLANE_BASE_SIZE * (fCfg.floorL || 1));
    const plane = new THREE.Mesh(planeGeom, mat); plane.rotation.x = -Math.PI / 2; plane.visible = false; plane.userData = { bid: bid, idx: i, type: 'floor' };
    scene.add(plane); floorPlanes[bid].push(plane); plane.position.set(fCfg.offX || 0, fCfg.offY || 0, fCfg.offZ || 0);

    const hitHeight = 10;
    const hitGeom = new THREE.BoxGeometry(PLANE_BASE_SIZE * (fCfg.floorW || 1), hitHeight, PLANE_BASE_SIZE * (fCfg.floorL || 1));
    const hitBox = new THREE.Mesh(hitGeom, new THREE.MeshBasicMaterial({ visible: false }));
    hitBox.userData = { bid: bid, idx: i, type: 'floor' }; scene.add(hitBox); plane.userData.hitBox = hitBox;

    const label = createTextSprite(fCfg.name); label.visible = false; label.userData = { bid: bid, idx: i, type: 'label' };
    scene.add(label); floorLabels[bid].push(label);
  });
}

function createTextSprite(text) {
  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); canvas.width = 512; canvas.height = 256;
  ctx.font = 'bold 100px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 12; ctx.strokeStyle = 'white'; ctx.strokeText(text, 256, 128); ctx.fillStyle = '#111827'; ctx.fillText(text, 256, 128);
  const tex = new THREE.CanvasTexture(canvas); const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }); const sprite = new THREE.Sprite(mat); sprite.scale.set(80, 40, 1); return sprite;
}

function updateVisibility() {
  Object.keys(buildings).forEach(id => {
    const isTarget = (id === selectedBuildingId);
    if (buildings[id]) { if (id === 'basement') buildings[id].visible = (isExploded && selectedBuildingId === 'main_hall'); else buildings[id].visible = !isExploded || !isTarget; }
    if (buildings[id] && buildings[id].userData.slices) buildings[id].userData.slices.visible = isExploded && isTarget;
  });
  updateFocusEffect();
}

let dimSessionCounter = 0;
function updateFocusEffect() {
  const bid = selectedBuildingId; dimSessionCounter++; const currentSession = dimSessionCounter;
  let sourcePos = new THREE.Vector3(0, 0, 0); if (bid && buildings[bid]) sourcePos.copy(buildings[bid].position);
  Object.keys(buildings).forEach(id => {
    let isDim = (isExploded && bid !== null && id !== bid);
    if (bid === 'main_hall' && id === 'basement') isDim = false;
    applyDimEffect(buildings[id], isDim, sourcePos, currentSession);
  });
  if (groundMesh) applyDimEffect(groundMesh, (isExploded && bid === 'main_hall'), sourcePos, currentSession);
}

function applyDimEffect(obj, isDim, sourcePos, session) {
  obj.traverse(n => {
    if (n.isMesh && n.material) {
      if (n.userData.origColor === undefined) { n.userData.origOpacity = n.material.opacity || 1; n.userData.origTransparent = n.material.transparent; n.userData.origColor = n.material.color ? n.material.color.clone() : new THREE.Color(0xffffff); n.userData.origEmissive = n.material.emissive ? n.material.emissive.clone() : new THREE.Color(0x000000); n.userData.origEmissiveInt = n.material.emissiveIntensity || 0; n.userData.origMap = n.material.map; n.userData.origSide = n.material.side; }
      n.userData.dimSession = session;
      if (!isDim) { n.material.transparent = n.userData.origTransparent; n.material.opacity = n.userData.origOpacity; if (n.material.color) n.material.color.copy(n.userData.origColor); if (n.material.emissive) n.material.emissive.copy(n.userData.origEmissive); if (n.material.emissiveIntensity !== undefined) n.material.emissiveIntensity = n.userData.origEmissiveInt; n.material.map = n.userData.origMap; n.material.side = n.userData.origSide; n.material.needsUpdate = true; }
      else {
        let delay = 0; if (sourcePos) { if (!n.geometry.boundingBox) n.geometry.computeBoundingBox(); const center = new THREE.Vector3(); if (n.geometry.boundingBox) { n.geometry.boundingBox.getCenter(center); n.localToWorld(center); } delay = center.distanceTo(sourcePos) * 1.2; }
        setTimeout(() => { if (n.userData.dimSession !== session) return; n.material.transparent = true; n.material.opacity = 0.15; if (n.material.color) n.material.color.set(0xffffff); if (n.material.emissive) { n.material.emissive.set(0xffffff); n.material.emissiveIntensity = 0.8; } n.material.needsUpdate = true; }, delay);
      }
    }
  });
}

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();

  if (Date.now() - lastInteractionTime > IDLE_TIMEOUT && !isExploded) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
  } else {
    controls.autoRotate = false;
  }
  controls.update();

  const targetFactor = isExploded ? 1 : 0; explosionFactor += (targetFactor - explosionFactor) * 0.1;
  Object.keys(buildings).forEach(id => {
    const slices = buildings[id].userData.slices; const model = buildings[id]; const cfg = buildingConfigs[id]; const planes = floorPlanes[id]; const labels = floorLabels[id];
    if (isExploded && (id === selectedBuildingId || (selectedBuildingId === 'main_hall' && id === 'basement'))) {
      if (slices) updateSliceAnimation(id, model, slices, explosionFactor);
      if (planes) {
        let gap = (id === 'main_hall' ? PARAMS.gap : cfg.gap || 20);
        planes.forEach((p, i) => {
          if (cfg.floors[i]) {
            const fCfg = cfg.floors[i]; const yOffset = gap * i * explosionFactor;
            p.visible = !fCfg.hidePlane; p.position.set(fCfg.offX || 0, (fCfg.offY || 0) + yOffset, fCfg.offZ || 0);
            if (p.userData.hitBox) { p.userData.hitBox.position.copy(p.position); p.userData.hitBox.visible = true; }
            if (labels && labels[i]) {
              let labelX = (fCfg.offX || 0);
              if (id === 'east') labelX += 55;
              else if (id === 'west') labelX -= 55;
              else if (id === 'round') labelX += 160;
              else labelX += 50;

              labels[i].position.set(labelX, p.position.y + 10, fCfg.offZ || 0);
              labels[i].visible = (fCfg.name !== '屋頂');
            }
          }
        });
      }
    } else if (planes) { planes.forEach((p, i) => { p.visible = false; if (labels && labels[i]) labels[i].visible = false; if (p.userData.hitBox) p.userData.hitBox.visible = false; }); }
  });
  controls.update(); if (composer) composer.render(); else renderer.render(scene, camera);
}

function updateSliceAnimation(id, model, slices, factor) {
  const cfg = buildingConfigs[id]; const minY = model.userData.minY; const cuts = [cfg.cut1, cfg.cut2, cfg.cut3].filter(c => c !== undefined);
  slices.children.forEach((group, i) => {
    let gap = (id === 'main_hall' ? PARAMS.gap : cfg.gap || 20);
    const yOffset = gap * i * factor; group.position.y = yOffset;
    const b = (i === 0) ? -10000 : minY + (cuts[i - 1] || 0); const t = (i === cuts.length) ? 10000 : minY + (cuts[i] || 0);
    group.traverse(n => { if (n.isMesh && n.material.clippingPlanes) { n.material.clippingPlanes[0].constant = -b - yOffset; n.material.clippingPlanes[1].constant = t + yOffset; } });
  });
}

function syncParamsFromConfig(bid) {
  const cfg = buildingConfigs[bid]; if (!cfg) return; PARAMS.targetBuilding = cfg.name || bid;
  if (gui && f3_floorController) {
    let floorOptions = {};
    if (bid === 'main_hall') floorOptions['B1 (地宮)'] = -1;
    if (cfg.floors) cfg.floors.forEach((f, i) => { if (!f.hidePlane) floorOptions[f.name] = i; });
    else floorOptions['無樓層'] = 0;

    let innerHTML = ''; Object.keys(floorOptions).forEach(name => { innerHTML += `<option value="${floorOptions[name]}">${name}</option>`; });
    f3_floorController.domElement.querySelector('select').innerHTML = innerHTML;
  }
  PARAMS.pos_x = cfg.pos[0]; PARAMS.pos_y = cfg.pos[1]; PARAMS.pos_z = cfg.pos[2];
  if (Array.isArray(cfg.rot)) { PARAMS.rot_x = cfg.rot[0]; PARAMS.rot_y = cfg.rot[1]; PARAMS.rot_z = cfg.rot[2]; } else { PARAMS.rot_x = 0; PARAMS.rot_y = cfg.rot || 0; PARAMS.rot_z = 0; }
  PARAMS.scale = cfg.scale; PARAMS.sx = cfg.sx || 1; PARAMS.sy = cfg.sy || 1; PARAMS.sz = cfg.sz || 1;
  PARAMS.cut1 = cfg.cut1 || 0; PARAMS.cut2 = cfg.cut2 || 0; PARAMS.cut3 = cfg.cut3 || 0; PARAMS.gap = cfg.gap || 20;
  if (cfg.floors && cfg.floors[PARAMS.floorIdx]) {
    const f = cfg.floors[PARAMS.floorIdx]; PARAMS.targetFloor = f.name; PARAMS.f_offX = f.offX || 0; PARAMS.f_offY = f.offY || 0; PARAMS.f_offZ = f.offZ || 0;
    PARAMS.f_w = f.floorW || 1; PARAMS.f_l = f.floorL || 1; PARAMS.f_innerR = f.innerR || 35; PARAMS.f_outerR = f.outerR || 145;
    PARAMS.f_texScale = f.texScale || 1; PARAMS.f_texRot = f.texRot || 0; PARAMS.f_texOffX = f.texOffX || 0; PARAMS.f_texOffY = f.texOffY || 0;
  }
  gui.updateDisplay();
}

function update3DFromGUI() {
  const bid = selectedBuildingId; if (!bid) return;
  let targetBid = bid;
  let targetIdx = PARAMS.floorIdx;
  if (bid === 'main_hall' && PARAMS.floorIdx === -1) {
    targetBid = 'basement';
    targetIdx = 0;
  }

  const cfg = buildingConfigs[targetBid]; const model = buildings[targetBid];
  if (targetIdx === -1) return;

  cfg.pos = [PARAMS.pos_x, PARAMS.pos_y, PARAMS.pos_z]; cfg.rot = [PARAMS.rot_x, PARAMS.rot_y, PARAMS.rot_z];
  cfg.scale = PARAMS.scale; cfg.sx = PARAMS.sx; cfg.sy = PARAMS.sy; cfg.sz = PARAMS.sz;
  cfg.cut1 = PARAMS.cut1; cfg.cut2 = PARAMS.cut2; cfg.cut3 = PARAMS.cut3; cfg.gap = PARAMS.gap;
  updateModelTransform(model, cfg); if (model.userData.slices) model.userData.slices.children.forEach(g => updateModelTransform(g.children[0], cfg));

  if (cfg.floors && cfg.floors[targetIdx]) {
    const f = cfg.floors[targetIdx]; f.offX = PARAMS.f_offX; f.offY = PARAMS.f_offY; f.offZ = PARAMS.f_offZ; f.floorW = PARAMS.f_w; f.floorL = PARAMS.f_l; f.innerR = PARAMS.f_innerR; f.outerR = PARAMS.f_outerR; f.texScale = PARAMS.f_texScale; f.texRot = PARAMS.f_texRot; f.texOffX = PARAMS.f_texOffX; f.texOffY = PARAMS.f_texOffY;
    const p = floorPlanes[targetBid][targetIdx];
    if (p) { if (targetBid === 'round') p.geometry = new THREE.RingGeometry(f.innerR, f.outerR, 64); else p.geometry = new THREE.PlaneGeometry(PLANE_BASE_SIZE * f.floorW, PLANE_BASE_SIZE * f.floorL); p.position.set(f.offX, f.offY, f.offZ); if (p.material.map) { const tex = p.material.map; tex.rotation = f.texRot; tex.repeat.set(f.texScale, f.texScale); tex.offset.set(f.texOffX, f.texOffY); } }
  }
}

function initGUI() {
  gui = new dat.GUI(); gui.domElement.style.marginTop = '80px';
  const toolGroup = gui.addFolder('工具與視角');
  toolGroup.add(PARAMS, 'save').name('💾 輸出目前參數 (JSON)');
  toolGroup.add(PARAMS, 'targetBuilding').name('👉 當前目標').listen(); toolGroup.add(PARAMS, 'autoCamera').name('自動鏡頭運鏡');
  toolGroup.add({ reset: () => { selectedBuildingId = null; isExploded = false; resetCamera(); updateVisibility(); } }, 'reset').name('重設原始視角');
  const f1 = gui.addFolder('模型本體調整');
  f1.add(PARAMS, 'pos_x', -500, 500).onChange(update3DFromGUI); f1.add(PARAMS, 'pos_y', -200, 200).onChange(update3DFromGUI); f1.add(PARAMS, 'pos_z', -500, 500).onChange(update3DFromGUI);
  f1.add(PARAMS, 'rot_x', -Math.PI, Math.PI).onChange(update3DFromGUI); f1.add(PARAMS, 'rot_y', -Math.PI, Math.PI).onChange(update3DFromGUI); f1.add(PARAMS, 'rot_z', -Math.PI, Math.PI).onChange(update3DFromGUI);
  f1.add(PARAMS, 'scale', 1, 1000).onChange(update3DFromGUI); f1.add(PARAMS, 'sx', 0.1, 5).onChange(update3DFromGUI); f1.add(PARAMS, 'sy', 0.1, 5).onChange(update3DFromGUI); f1.add(PARAMS, 'sz', 0.1, 5).onChange(update3DFromGUI);
  const f2 = gui.addFolder('切分與爆炸間距');
  f2.add(PARAMS, 'cut1', -100, 200).onChange(update3DFromGUI); f2.add(PARAMS, 'cut2', -100, 300).onChange(update3DFromGUI); f2.add(PARAMS, 'cut3', -100, 400).onChange(update3DFromGUI); f2.add(PARAMS, 'gap', 0, 100).onChange(update3DFromGUI);
  const f3 = gui.addFolder('樓層貼圖調整');
  f3_floorController = f3.add(PARAMS, 'floorIdx', { '點選建築': 0 }).name('選擇樓層').onChange((val) => { PARAMS.floorIdx = parseInt(val); syncParamsFromConfig(selectedBuildingId); });
  f3.add(PARAMS, 'f_offX', -300, 300).onChange(update3DFromGUI); f3.add(PARAMS, 'f_offY', -200, 200).onChange(update3DFromGUI); f3.add(PARAMS, 'f_offZ', -300, 300).onChange(update3DFromGUI);
  f3.add(PARAMS, 'f_w', 0.1, 5).onChange(update3DFromGUI); f3.add(PARAMS, 'f_l', 0.1, 5).onChange(update3DFromGUI);
  f3.add(PARAMS, 'f_innerR', 1, 300).name('圓環-內半徑').onChange(update3DFromGUI); f3.add(PARAMS, 'f_outerR', 1, 500).name('圓環-外半徑').onChange(update3DFromGUI);
  f3.add(PARAMS, 'f_texScale', 0.1, 5).onChange(update3DFromGUI); f3.add(PARAMS, 'f_texRot', -Math.PI, Math.PI).onChange(update3DFromGUI); f3.add(PARAMS, 'f_texOffX', -1, 1).onChange(update3DFromGUI); f3.add(PARAMS, 'f_texOffY', -1, 1).onChange(update3DFromGUI);
  gui.hide();
}

window.toggleGUI = function () { if (gui.domElement.style.display === 'none') gui.show(); else gui.hide(); };

function getHit(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  const ray = new THREE.Raycaster();
  ray.setFromCamera(mouse, camera);

  let targets = [];
  Object.keys(buildings).forEach(id => {
    const b = buildings[id];
    if (!b) return;

    // ⚡ 終極過濾：地宮如果隱藏了，直接連子物件都不要檢查，徹底從點擊清單中抹除
    if (id === 'basement' && !b.visible) return;

    let isDimmed = (isExploded && selectedBuildingId !== null && id !== selectedBuildingId);
    if (isExploded && selectedBuildingId === 'main_hall' && id === 'basement') isDimmed = false;

    if (!isDimmed) {
      // ⚡ 核心修正：即便本體 (b) 隱藏了，只要切片或樓層標籤是可見的，就應該加入 targets
      if (b.visible && id !== 'floor') {
        if (!(isExploded && id === selectedBuildingId)) {
          targets.push(b);
        }
      }
      
      // 爆炸狀態下的組件
      if (b.userData.slices && b.userData.slices.visible) targets.push(b.userData.slices);
      
      if (floorPlanes[id]) {
        floorPlanes[id].forEach(p => {
          if (p.visible) targets.push(p);
          if (p.userData.hitBox && p.userData.hitBox.visible) targets.push(p.userData.hitBox);
        });
      }
      
      if (floorLabels[id]) {
        floorLabels[id].forEach(l => {
          if (l.visible) targets.push(l);
        });
      }
    }
  });

  const hits = ray.intersectObjects(targets, true);
  if (hits.length === 0) return null;
  const priorityHit = hits.find(h => h.object.userData && (h.object.userData.type === 'floor' || h.object.userData.type === 'label'));
  return priorityHit ? priorityHit.object : hits[0].object;
}

function getBuildingIdFromObject(obj) { let cur = obj; while (cur && !cur.userData.id) cur = cur.parent; return cur ? cur.userData.id : null; }
let currentHoveredBuilding = null, currentHoveredSlice = null, currentHoveredFloorLabel = null;
function resetHoverEffects() { if (outlinePass) outlinePass.selectedObjects = []; if (currentHoveredBuilding) { const bid = currentHoveredBuilding.userData.id, cfg = buildingConfigs[bid]; if (cfg) { let finalSX = cfg.scale * (cfg.sx || 1); if (cfg.mirrorX) finalSX *= -1; currentHoveredBuilding.scale.set(finalSX, cfg.scale * (cfg.sy || 1), cfg.scale * (cfg.sz || 1)); } currentHoveredBuilding = null; } if (currentHoveredSlice) { const bid = currentHoveredSlice.userData.bid, cfg = buildingConfigs[bid]; if (cfg) { let finalSX = cfg.scale * (cfg.sx || 1); if (cfg.mirrorX) finalSX *= -1; currentHoveredSlice.scale.set(finalSX, cfg.scale * (cfg.sy || 1), cfg.scale * (cfg.sz || 1)); } currentHoveredSlice.traverse(n => { if (n.isMesh && n.material && n.material.emissive) n.material.emissive.setHex(0x000000); }); Object.keys(floorPlanes).forEach(bid => { floorPlanes[bid].forEach(p => { if (p) p.scale.set(1, 1, 1); }); }); currentHoveredSlice = null; } if (currentHoveredFloorLabel) { currentHoveredFloorLabel.scale.set(80, 40, 1); currentHoveredFloorLabel = null; } }
function applyBuildingHover(bid) { const model = buildings[bid]; if (!model) return; if (outlinePass) outlinePass.selectedObjects = [model]; const cfg = buildingConfigs[bid]; if (cfg) { let finalSX = cfg.scale * (cfg.sx || 1); if (cfg.mirrorX) finalSX *= -1; model.scale.set(finalSX * 1.02, cfg.scale * (cfg.sy || 1) * 1.02, cfg.scale * (cfg.sz || 1) * 1.02); } currentHoveredBuilding = model; }
function applyFloorHover(bid, idx) { const model = buildings[bid]; if (model) { let sliceToGlow = null; if (model.userData.slices && model.userData.slices.children[idx]) sliceToGlow = model.userData.slices.children[idx].children[0]; else if (bid === 'basement' || (bid === 'main_hall' && idx < 0)) sliceToGlow = buildings['basement']; if (sliceToGlow) { const cfg = buildingConfigs[bid], scaleFactor = 1.05; if (cfg) { let finalSX = cfg.scale * (cfg.sx || 1); if (cfg.mirrorX) finalSX *= -1; sliceToGlow.scale.set(finalSX * scaleFactor, cfg.scale * (cfg.sy || 1) * scaleFactor, cfg.scale * (cfg.sz || 1) * scaleFactor); } sliceToGlow.traverse(n => { if (n.isMesh && n.material && n.material.emissive) n.material.emissive.setHex(0x444444); }); sliceToGlow.userData.bid = bid; currentHoveredSlice = sliceToGlow; const plane = floorPlanes[bid] ? floorPlanes[bid][idx] : null; if (plane) plane.scale.set(scaleFactor, scaleFactor, 1); const label = floorLabels[bid] ? floorLabels[bid][idx] : null; if (label) { label.scale.set(96, 48, 1); currentHoveredFloorLabel = label; } } } }
function onMouseMove(e) {
  lastInteractionTime = Date.now();
  if (isCameraMoving) { resetHoverEffects(); labelDiv.style.display = 'none'; return; } // ⚡ 運鏡中禁止懸停偵測
  const hit = getHit(e); resetHoverEffects(); if (hit) { const data = hit.userData; let bid = data.bid || getBuildingIdFromObject(hit); if (bid && buildingConfigs[bid]) { labelDiv.style.display = 'block'; let displayText = `<b>${buildingConfigs[bid].name}</b>`; if (data.type === 'floor' || data.type === 'label') { const fCfg = buildingConfigs[bid].floors[data.idx]; if (fCfg) displayText += ` - <span style="color:#3b82f6">${fCfg.name}</span>`; applyFloorHover(bid, data.idx); } else if (!isExploded) applyBuildingHover(bid); labelDiv.innerHTML = displayText; labelDiv.style.left = e.clientX + 15 + 'px'; labelDiv.style.top = e.clientY + 15 + 'px'; document.body.style.cursor = 'pointer'; return; } } labelDiv.style.display = 'none'; document.body.style.cursor = 'default';
}
function onResize() { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); if (composer) composer.setSize(window.innerWidth, window.innerHeight); }

function initEnvironment(manager) {
  const circleGeom = new THREE.CircleGeometry(1000, 64);

  // 🎨 使用莫蘭迪綠色調，避免螢光感
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  // 🎨 升級備援底色：使用更明亮、具有生命力的粉綠色 (#a8d5ba)
  ctx.fillStyle = '#a8d5ba'; ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 15000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#94c2a6' : '#7fb393';
    ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, Math.random() * 4 + 1);
  }
  const fallbackTex = new THREE.CanvasTexture(canvas);
  fallbackTex.wrapS = THREE.RepeatWrapping; fallbackTex.wrapT = THREE.RepeatWrapping;
  fallbackTex.repeat.set(150, 150);

  const circleMat = new THREE.MeshLambertMaterial({ map: fallbackTex });

  // 🌿 優先加載真實草地貼圖
  const grassLoader = new THREE.TextureLoader(manager);
  grassLoader.load('assets/grass.jpg', (tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(50, 50);
    // ⚡ 手機優化：降低過濾品質與非等向性
    if (isMobile) {
      tex.anisotropy = 1;
      tex.minFilter = THREE.LinearFilter;
    } else {
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }
    circleMat.map = tex;
    circleMat.needsUpdate = true;
    console.log("草地貼圖載入成功");
  }, undefined, (err) => {
    console.warn("草地貼圖載入失敗，使用備用底色");
  });

  const ground = new THREE.Mesh(circleGeom, circleMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -11.5; // 稍微拉高一點，防止與背景重疊
  ground.receiveShadow = true;
  scene.add(ground);
  groundMesh = ground;
  createTrees(scene);
}

function createTrees(scene) {
  // 🌲 行動端「極限生存模式」：只保留 10 棵樹
  const treeCount = isMobile ? 10 : 180; 
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
  const leavesMat = new THREE.MeshLambertMaterial({ 
    color: 0x1a4d2e, 
    emissive: 0x0a2012, 
    emissiveIntensity: 0.2 
  });
  const leavesMat2 = new THREE.MeshLambertMaterial({ 
    color: 0x2d6a4f, 
    emissive: 0x10281a, 
    emissiveIntensity: 0.2 
  });
  // 🌲 行動端：減少幾何體邊數以節省頂點
  const trunkGeo = new THREE.CylinderGeometry(2, 3, 12, isMobile ? 4 : 6);
  const leavesGeo = new THREE.ConeGeometry(10, 28, isMobile ? 4 : 6);
  
  for(let i = 0; i < treeCount; i++) {
    const r = 240 + Math.random() * 260; 
    const theta = Math.random() * Math.PI * 2;
    const x = Math.cos(theta) * r;
    const z = 80 + Math.sin(theta) * r;
    
    if (Math.hypot(x - 0, z - 180) < 200) continue; 
    if (Math.abs(x) < 160 && z > -180 && z < 120) continue; 
    
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 6;
    if (!isMobile) { trunk.castShadow = true; trunk.receiveShadow = true; }

    const leaves = new THREE.Mesh(leavesGeo, Math.random() > 0.5 ? leavesMat : leavesMat2);
    leaves.position.y = 20 + Math.random() * 5;
    if (!isMobile) { leaves.castShadow = true; leaves.receiveShadow = true; }
    
    tree.add(trunk); tree.add(leaves);
    const scale = 0.7 + Math.random() * 1.2; 
    tree.scale.set(scale, scale, scale);
    tree.rotation.y = Math.random() * Math.PI;
    tree.position.set(x, -12, z);
    scene.add(tree);
  }
}

window.toggleView = function() { 
  const page = document.getElementById('page-2d');
  if (page.style.display === 'none' || page.style.opacity === '0') {
    const img = document.getElementById('plan-img-2d');
    const currentSrc = img.getAttribute('src');
    if (!currentSrc || currentSrc === "") {
        if(window.show2DPlan) window.show2DPlan('plan.png', '圓樓 1F', '圓樓', 'round', 0, true);
    } else {
        page.style.display = 'flex'; page.style.opacity = '1';
        const tabsWrapper = document.getElementById('floor-tabs-wrapper');
        if (tabsWrapper) tabsWrapper.style.display = 'flex';
    }
  } else {
    if(window.exitFloorView) window.exitFloorView();
  }
};

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  
  if (Date.now() - lastInteractionTime > IDLE_TIMEOUT && !isExploded) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6; 
  } else {
    controls.autoRotate = false;
  }
  
  const targetFactor = isExploded ? 1 : 0; 
  explosionFactor += (targetFactor - explosionFactor) * 0.1; 

  // ⚡ 核心修正：每幀開始前，先假設地宮是隱藏的
  if (buildings['basement']) buildings['basement'].visible = false;

  Object.keys(buildings).forEach(id => {
    const b = buildings[id];
    const slices = b.userData.slices;
    const model = b;
    const cfg = buildingConfigs[id];
    const planes = floorPlanes[id];
    const labels = floorLabels[id];

    // 判斷這棟建築是否該顯示爆炸動畫
    const isTarget = (id === selectedBuildingId || (selectedBuildingId === 'main_hall' && id === 'basement'));
    const isCollapsing = (id === collapsingBuildingId || (collapsingBuildingId === 'main_hall' && id === 'basement'));

    if (isExploded && isTarget) {
      if (slices) { slices.visible = true; updateSliceAnimation(id, model, slices, explosionFactor); }
      // 只有在主殿爆炸時，地宮才顯示為底層
      if (id === 'basement') b.visible = true; else b.visible = false;
      
      if (planes) {
        let gap = (id === 'main_hall' ? PARAMS.gap : cfg.gap || 20);
        planes.forEach((p, i) => {
          if(cfg.floors[i]) {
            const fCfg = cfg.floors[i];
            const yOffset = gap * i * explosionFactor;
            p.visible = !fCfg.hidePlane;
            p.position.set(fCfg.offX || 0, (fCfg.offY || 0) + yOffset, fCfg.offZ || 0);
            if (labels && labels[i]) {
              let labelX = (fCfg.offX || 0); 
              if (id === 'east') labelX += 55; else if (id === 'west') labelX -= 55; else if (id === 'round') labelX += 160; else labelX += 50; 
              labels[i].position.set(labelX, p.position.y + 10, fCfg.offZ || 0); 
              labels[i].visible = (fCfg.name !== '屋頂');
            }
          }
        });
      }
    } else if (!isExploded && explosionFactor > 0.01 && isCollapsing) {
      // ⚡ 收合動畫中
      if (slices) { slices.visible = true; updateSliceAnimation(id, model, slices, explosionFactor); }
      if (id === 'basement') b.visible = true; else b.visible = false;
      if (planes) {
        let gap = (id === 'main_hall' ? PARAMS.gap : cfg.gap || 20);
        planes.forEach((p, i) => {
          if(cfg.floors[i]) {
            const yOffset = gap * i * explosionFactor;
            p.position.y = (cfg.floors[i].offY || 0) + yOffset;
            if (labels && labels[i]) labels[i].position.y = p.position.y + 10;
          }
        });
      }
    } else {
      if (id === 'basement') b.visible = false; else b.visible = true;
      if (slices) slices.visible = false;
      if (planes) {
        planes.forEach((p, i) => {
          p.visible = false;
          if(labels && labels[i]) labels[i].visible = false;
        });
      }
    }
  });

  // ⚡ 關鍵修正：收合完成後才清除標記，且要放在迴圈外面
  if (!isExploded && explosionFactor <= 0.01) collapsingBuildingId = null;

  if (composer && !isMobile) composer.render();
  else renderer.render(scene, camera);
  if (controls) controls.update();
}

init();
animate();