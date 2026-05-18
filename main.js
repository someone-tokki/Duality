import GUI from 'lil-gui';

// ─── DOM ─────────────────────────────────────────────────────────────────

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('file-input');
const uploadBtn = document.getElementById('upload-btn');
const exportBtn = document.getElementById('export-btn');
const hintEl = document.getElementById('hint');
const fpsEl = document.getElementById('info-fps');
const infoEl = document.getElementById('info-char-count');

// ─── 离屏画布 ────────────────────────────────────────────────────────────

const offscreen = document.createElement('canvas');
const offCtx = offscreen.getContext('2d');

// ─── 合成画布（主体抠图层） ──────────────────────────────────────────────

const compositeCanvas = document.createElement('canvas');
const compositeCtx = compositeCanvas.getContext('2d');

// ─── 视窗临时画布（视窗主体抠图） ────────────────────────────────────────

const vpTempCanvas = document.createElement('canvas');
const vpTempCtx = vpTempCanvas.getContext('2d');

// ─── 蒙版叠加层画布 ──────────────────────────────────────────────────────

const overlayCanvas = document.createElement('canvas');
const overlayCtx = overlayCanvas.getContext('2d');

// ─── MediaPipe 主体抠图 ─────────────────────────────────────────────────

let segMaskCanvas = null;
let selfieSeg = null;
let segProcessing = false;
let segFrameIdx = 0;

// ─── 蒙版画笔状态 ───────────────────────────────────────────────────────

let maskDrawing = false;
let maskBrushAdd = true;
let maskLastX = 0, maskLastY = 0;
let shiftDown = false, ctrlDown = false;

// ─── 多风格预渲染画布缓存 ───────────────────────────────────────────────

const styleRenderers = {}; // styleName -> { canvas, ctx }

// ─── ASCII 字符集 ────────────────────────────────────────────────────────

const CHARSETS = {
  '完整': '@%#*+=-:. ',
  '密集': '@%#*',
  '稀疏': '*+=-:. ',
  '方块': '█▓▒░ ',
  '点阵': '●◐◗▪ ',
};

// ─── Bayer 4×4 有序抖动矩阵 ─────────────────────────────────────────────

const BAYER = [
  [ 0, 8,  2, 10],
  [12, 4, 14, 6 ],
  [ 3, 11, 1, 9 ],
  [15, 7, 13, 5 ],
];

// ─── 视窗颜色 ────────────────────────────────────────────────────────────

const VP_COLORS = ['#ff4444', '#44cc44', '#4488ff', '#ffaa00', '#cc44ff', '#44dddd'];

// ─── 全部可用样式（含原始画面） ──────────────────────────────────────────

const STYLE_OPTIONS = {
  '原始画面': 'original',
  'ASCII 艺术': 'ascii',
  '边缘检测': 'edge',
  '像素风': 'pixelate',
  '有序抖动': 'dither',
  '半色调': 'halftone',
};

// ─── 状态 ────────────────────────────────────────────────────────────────

const state = {
  media: null,
  isVideo: false,
  style: 'ascii',
  density: 6,
  edgeThreshold: 0.10,
  bgColor: '#000000',
  textColor: '#ffffff',
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2,

  // ASCII 风格化控制
  asciiCharset: '完整',
  asciiInvert: false,
  asciiColor: false,

  // 半色调选项
  halftoneColor: false,

  // 多视窗
  showBorders: false,
  activeViewport: 0,
  viewports: [
    { x: window.innerWidth / 2, y: window.innerHeight / 2, size: 160, style: 'original',
      styleParams: { asciiCharset: '完整', asciiInvert: false, asciiColor: false, halftoneColor: false },
      subjectMatting: false },
  ],

  // 视频播放控制
  playbackPlaying: false,
  playbackTime: 0,
  playbackSpeed: 1,
  isRecording: false,

  // 主体抠图
  subjectMatting: false,

  // 蒙版编辑
  maskBrushSize: 20,
};

// ─── lil-gui 视窗控制引用 ───────────────────────────────────────────────

const vpGUI = [];
let activeVpCtrl;

// ─── 拖拽交互状态 ───────────────────────────────────────────────────────

const HANDLE = { TOL: 7 };
let drag = {
  active: false,
  mode: null,
  vpIndex: -1,
  edge: null,
  startX: 0, startY: 0,
  startVpX: 0, startVpY: 0,
  startSize: 0,
};

// ─── 工具函数 ────────────────────────────────────────────────────────────

function mediaSize(media) {
  return {
    w: media.videoWidth || media.naturalWidth || media.width || 0,
    h: media.videoHeight || media.naturalHeight || media.height || 0,
  };
}

function computeDrawRect(cw, ch, mw, mh) {
  const scale = Math.max(cw / mw, ch / mh);
  const dw = mw * scale;
  const dh = mh * scale;
  return { x: (cw - dw) / 2, y: (ch - dh) / 2, w: dw, h: dh };
}

function getVpRect(vp) {
  const half = vp.size / 2;
  return { x: vp.x - half, y: vp.y - half, w: vp.size, h: vp.size };
}

function getDrawRect() {
  const { media } = state;
  if (!media) return null;
  const { w, h } = mediaSize(media);
  if (!w || !h) return null;
  return computeDrawRect(canvas.width, canvas.height, w, h);
}

// ─── 命中检测（所有视窗） ────────────────────────────────────────────────

function hitTestViewports(px, py) {
  const vps = state.viewports;
  const t = HANDLE.TOL * 2;
  for (let i = vps.length - 1; i >= 0; i--) {
    const r = getVpRect(vps[i]);
    const nearL = Math.abs(px - r.x) < t;
    const nearR = Math.abs(px - (r.x + r.w)) < t;
    const nearT = Math.abs(py - r.y) < t;
    const nearB = Math.abs(py - (r.y + r.h)) < t;
    const inV = py >= r.y - t && py <= r.y + r.h + t;
    const inH = px >= r.x - t && px <= r.x + r.w + t;

    if (nearL && nearT) return { i, edge: 'nw' };
    if (nearR && nearT) return { i, edge: 'ne' };
    if (nearL && nearB) return { i, edge: 'sw' };
    if (nearR && nearB) return { i, edge: 'se' };
    if (inV && nearL) return { i, edge: 'w' };
    if (inV && nearR) return { i, edge: 'e' };
    if (inH && nearT) return { i, edge: 'n' };
    if (inH && nearB) return { i, edge: 's' };

    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
      return { i, edge: 'inside' };
    }
  }
  return null;
}

function cursorForEdge(edge) {
  if (!edge) return 'crosshair';
  if (edge === 'inside') return 'grab';
  const map = { n:'n-resize', s:'s-resize', w:'w-resize', e:'e-resize',
    nw:'nw-resize', ne:'ne-resize', sw:'sw-resize', se:'se-resize' };
  return map[edge] || 'crosshair';
}

// ─── 更新样式相关面板的可见性 ───────────────────────────────────────────

function updateStyleFolders() {
  fAscii[state.style === 'ascii' ? 'show' : 'hide']();
  fHalftone[state.style === 'halftone' ? 'show' : 'hide']();
}

// ─── lil-gui 控制面板 ────────────────────────────────────────────────────

const gui = new GUI({ title: '控制面板' });

// — 样式设置（含原始画面） —
const f1 = gui.addFolder('样式设置');
f1.add(state, 'style', STYLE_OPTIONS)
  .name('全局样式')
  .onChange(() => {
    updateStyleFolders();
    if (!state.isVideo) needsRender = true;
  });
f1.add(state, 'subjectMatting').name('主体抠图')
  .onChange(() => {
    if (state.subjectMatting) { initSelfieSeg(); if (!segMaskCanvas) runSeg(); }
    if (!state.isVideo) needsRender = true;
  });
f1.open();

// — 蒙版编辑 —
const fMask = gui.addFolder('蒙版编辑');
fMask.add(state, 'maskBrushSize', 5, 100, 1).name('画笔大小');
const maskActions = {
  expand: () => smoothMask(1, 'expand'),
  shrink: () => smoothMask(1, 'shrink'),
  reset: () => { segMaskCanvas = null; initSelfieSeg(); runSeg(); needsRender = true; },
};
fMask.add(maskActions, 'expand').name('➕ 扩展蒙版');
fMask.add(maskActions, 'shrink').name('➖ 收缩蒙版');
fMask.add(maskActions, 'reset').name('↺ 重置蒙版');
fMask.hide();

// — ASCII 选项 —
const fAscii = gui.addFolder('ASCII 选项');
fAscii.add(state, 'asciiCharset', Object.keys(CHARSETS))
  .name('字符集').onChange(() => { if (!state.isVideo) needsRender = true; });
fAscii.add(state, 'asciiInvert')
  .name('反转亮度').onChange(() => { if (!state.isVideo) needsRender = true; });
fAscii.add(state, 'asciiColor')
  .name('彩色字符').onChange(() => { if (!state.isVideo) needsRender = true; });
fAscii.open();

// — 半色调选项 —
const fHalftone = gui.addFolder('半色调选项');
fHalftone.add(state, 'halftoneColor')
  .name('彩色模式').onChange(() => { if (!state.isVideo) needsRender = true; });
fHalftone.open();

// — 视频控制 —
const fVideo = gui.addFolder('视频控制');
let playbackTimeCtrl;
let playBtnCtrl, pauseBtnCtrl;
const FRAME_STEP = 1 / 30;

playbackTimeCtrl = fVideo.add(state, 'playbackTime', 0, 1, 0.001)
  .name('进度').onChange(v => {
    const m = state.media;
    if (m && state.isVideo && m.duration) m.currentTime = v * m.duration;
  });

fVideo.add(state, 'playbackSpeed', [0.25, 0.5, 1, 1.5, 2])
  .name('速度').onChange(v => {
    if (state.media && state.isVideo) state.media.playbackRate = v;
  });

const ppActs = {
  play:  () => { const m = state.media; if (m && state.isVideo) m.play(); },
  pause: () => { const m = state.media; if (m && state.isVideo) m.pause(); },
};
playBtnCtrl = fVideo.add(ppActs, 'play').name('▶ 播放');
pauseBtnCtrl = fVideo.add(ppActs, 'pause').name('⏸ 暂停');
pauseBtnCtrl.hide();

const stepActs = {
  prevFrame: () => stepFrame(-1),
  nextFrame: () => stepFrame(1),
};
fVideo.add(stepActs, 'prevFrame').name('⏮ 上一帧');
fVideo.add(stepActs, 'nextFrame').name('⏭ 下一帧');

function stepFrame(dir) {
  const m = state.media;
  if (!m || !state.isVideo) return;
  m.pause();
  m.currentTime = Math.max(0, Math.min(m.duration || 0, m.currentTime + dir * FRAME_STEP));
}

const recActs = { start: () => startRecording(), stop: () => stopRecording() };
fVideo.add(recActs, 'start').name('⏺ 录制');
fVideo.add(recActs, 'stop').name('⏹ 停止');
fVideo.hide();

// — 多视窗管理 —
const fMulti = gui.addFolder('多视窗管理');

const actions = {
  addViewport: () => {
    const idx = state.viewports.length;
    const base = state.viewports[0];
    state.viewports.push({
      x: base.x + (idx % 3 - 1) * 180,
      y: base.y + Math.floor(idx / 3) * 180 + 60,
      size: 120,
      style: 'original',
      styleParams: { asciiCharset: '完整', asciiInvert: false, asciiColor: false, halftoneColor: false },
      subjectMatting: false,
    });
    createVpGUI(idx);
    if (!state.isVideo) needsRender = true;
  },
};

activeVpCtrl = fMulti.add(state, 'activeViewport', 0, 0, 1)
  .name('当前编辑')
  .onChange(() => { if (!state.isVideo) needsRender = true; });
fMulti.add(actions, 'addViewport').name('＋ 添加视窗');
fMulti.add(state, 'showBorders').name('显示边框');

// — 渲染参数 —
const f3 = gui.addFolder('渲染参数');
f3.add(state, 'density', 2, 20, 1)
  .name('采样密度').onChange(() => { if (!state.isVideo) needsRender = true; });
f3.add(state, 'edgeThreshold', 0.02, 0.5, 0.01)
  .name('边缘阈值').onChange(() => { if (!state.isVideo) needsRender = true; });
f3.addColor(state, 'bgColor')
  .name('背景颜色').onChange(() => { if (!state.isVideo) needsRender = true; });
f3.addColor(state, 'textColor')
  .name('前景颜色').onChange(() => { if (!state.isVideo) needsRender = true; });
f3.open();

// ─── 更新视窗风格参数控制可见性 ─────────────────────────────────────────

function updateVpStyleCtrls(idx) {
  const gui = vpGUI[idx];
  if (!gui) return;
  const { ctrls } = gui;
  const style = state.viewports[idx]?.style;
  if (!style) return;

  ctrls.asciiCharset[style === 'ascii' ? 'show' : 'hide']();
  ctrls.asciiInvert[style === 'ascii' ? 'show' : 'hide']();
  ctrls.asciiColor[style === 'ascii' ? 'show' : 'hide']();
  ctrls.halftoneColor[style === 'halftone' ? 'show' : 'hide']();
}

// ─── 创建/删除视窗 GUI ──────────────────────────────────────────────────

function createVpGUI(idx) {
  const vp = state.viewports[idx];
  const folder = fMulti.addFolder(`视窗 ${idx + 1}`);

  const ctrls = {
    style: folder.add(vp, 'style', STYLE_OPTIONS).name('视窗样式')
      .onChange(() => {
        updateVpStyleCtrls(idx);
        if (!state.isVideo) needsRender = true;
      }),
    x: folder.add(vp, 'x', 0, 9999, 1).name('X')
      .onChange(() => { if (!state.isVideo) needsRender = true; }),
    y: folder.add(vp, 'y', 0, 9999, 1).name('Y')
      .onChange(() => { if (!state.isVideo) needsRender = true; }),
    size: folder.add(vp, 'size', 20, 800, 1).name('大小')
      .onChange(() => { if (!state.isVideo) needsRender = true; }),
    subjectMatting: folder.add(vp, 'subjectMatting').name('主体抠图')
      .onChange(() => { if (!state.isVideo) needsRender = true; }),
  };

  // 视窗内风格参数控制
  const sp = vp.styleParams;
  ctrls.asciiCharset = folder.add(sp, 'asciiCharset', Object.keys(CHARSETS))
    .name('字符集').onChange(() => { if (!state.isVideo) needsRender = true; });
  ctrls.asciiInvert = folder.add(sp, 'asciiInvert')
    .name('反转亮度').onChange(() => { if (!state.isVideo) needsRender = true; });
  ctrls.asciiColor = folder.add(sp, 'asciiColor')
    .name('彩色字符').onChange(() => { if (!state.isVideo) needsRender = true; });
  ctrls.halftoneColor = folder.add(sp, 'halftoneColor')
    .name('彩色模式').onChange(() => { if (!state.isVideo) needsRender = true; });

  const rem = { fn: () => removeVp(idx) };
  ctrls.remove = folder.add(rem, 'fn').name('✕ 删除视窗');

  vpGUI.push({ folder, ctrls });

  // 初始隐藏非当前风格的参数
  updateVpStyleCtrls(idx);

  if (activeVpCtrl) {
    activeVpCtrl.max(state.viewports.length - 1);
    activeVpCtrl.updateDisplay();
  }

  folder.open();
}

function removeVp(idx) {
  if (state.viewports.length <= 1) {
    // 最后一个视窗 → 重置到中央默认位置
    const vp = state.viewports[0];
    vp.x = window.innerWidth / 2;
    vp.y = window.innerHeight / 2;
    vp.size = 160;
    vp.style = 'original';
    vp.subjectMatting = false;
    Object.assign(vp.styleParams, { asciiCharset: '完整', asciiInvert: false, asciiColor: false, halftoneColor: false });
    const gui = vpGUI[0];
    if (gui) {
      gui.ctrls.x.updateDisplay();
      gui.ctrls.y.updateDisplay();
      gui.ctrls.size.updateDisplay();
      gui.ctrls.style.updateDisplay();
      if (gui.ctrls.subjectMatting) gui.ctrls.subjectMatting.updateDisplay();
      updateVpStyleCtrls(0);
    }
    if (!state.isVideo) needsRender = true;
    return;
  }
  state.viewports.splice(idx, 1);
  vpGUI[idx].folder.domElement.remove();
  vpGUI.splice(idx, 1);

  if (state.activeViewport >= state.viewports.length) {
    state.activeViewport = state.viewports.length - 1;
  }
  if (activeVpCtrl) {
    activeVpCtrl.max(state.viewports.length - 1);
    activeVpCtrl.updateDisplay();
  }
  if (!state.isVideo) needsRender = true;
}

createVpGUI(0);
updateStyleFolders();

// ─── 画布尺寸 ────────────────────────────────────────────────────────────

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  compositeCanvas.width = canvas.width;
  compositeCanvas.height = canvas.height;
  vpTempCanvas.width = canvas.width;
  vpTempCanvas.height = canvas.height;
  overlayCanvas.width = canvas.width;
  overlayCanvas.height = canvas.height;
  if (state.media && !state.isVideo) needsRender = true;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ─── 媒体上传 ────────────────────────────────────────────────────────────

uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const onError = () => {
    hintEl.innerHTML = '<p>加载失败，请重试</p>';
    hintEl.className = 'hint-visible';
  };

  if (file.type.startsWith('video/')) {
    if (state.isRecording) stopRecording();
    segMaskCanvas = null;
    fMask.hide();
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.addEventListener('error', onError);
    video.addEventListener('loadedmetadata', () => {
      state.media = video;
      state.isVideo = true;
      state.playbackTime = 0;
      state.playbackSpeed = 1;
      hintEl.className = 'hint-hidden';
      fVideo.show();
      video.play().catch(onError);
    });
    video.addEventListener('play', () => {
      state.playbackPlaying = true;
      if (playBtnCtrl) playBtnCtrl.hide();
      if (pauseBtnCtrl) pauseBtnCtrl.show();
    });
    video.addEventListener('pause', () => {
      state.playbackPlaying = false;
      if (playBtnCtrl) playBtnCtrl.show();
      if (pauseBtnCtrl) pauseBtnCtrl.hide();
    });
    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        state.playbackTime = video.currentTime / video.duration;
        if (playbackTimeCtrl) playbackTimeCtrl.updateDisplay();
      }
    });
    video.addEventListener('ended', () => {
      state.playbackPlaying = false;
      if (playBtnCtrl) playBtnCtrl.show();
      if (pauseBtnCtrl) pauseBtnCtrl.hide();
      if (state.isRecording) stopRecording();
    });
  } else {
    segMaskCanvas = null;
    fMask.hide();
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.addEventListener('error', onError);
    img.addEventListener('load', () => {
      state.media = img;
      state.isVideo = false;
      fVideo.hide();
      hintEl.className = 'hint-hidden';
      needsRender = true;
    });
  }
});

// ─── 鼠标 / 指针 / 触摸追踪 ─────────────────────────────────────────────

function onPointerDown(e) {
  const px = e.clientX, py = e.clientY;
  state.mouseX = px;
  state.mouseY = py;

  if (segMaskCanvas && (e.shiftKey || e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    maskDrawing = true;
    maskBrushAdd = e.shiftKey;
    maskLastX = px; maskLastY = py;
    paintMaskAt(px, py, e.shiftKey);
    needsRender = true;
    return;
  }

  if (!state.media) return;

  const hit = hitTestViewports(px, py);
  if (!hit) { state.activeViewport = -1; return; }

  state.activeViewport = hit.i;
  if (activeVpCtrl) activeVpCtrl.updateDisplay();

  const vp = state.viewports[hit.i];
  if (hit.edge === 'inside') {
    drag.active = true;
    drag.mode = 'move';
    drag.vpIndex = hit.i;
    drag.startX = px;
    drag.startY = py;
    drag.startVpX = vp.x;
    drag.startVpY = vp.y;
  } else {
    drag.active = true;
    drag.mode = 'resize';
    drag.vpIndex = hit.i;
    drag.edge = hit.edge;
    drag.startX = px;
    drag.startY = py;
    drag.startVpX = vp.x;
    drag.startVpY = vp.y;
    drag.startSize = vp.size;
  }
}

function onPointerMove(e) {
  const px = e.clientX, py = e.clientY;
  state.mouseX = px;
  state.mouseY = py;

  if (maskDrawing && segMaskCanvas) {
    const dist = Math.hypot(px - maskLastX, py - maskLastY);
    const steps = Math.max(1, Math.ceil(dist / (state.maskBrushSize * 0.5)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      paintMaskAt(maskLastX + (px - maskLastX) * t, maskLastY + (py - maskLastY) * t, maskBrushAdd);
    }
    maskLastX = px; maskLastY = py;
    needsRender = true;
    return;
  }

  if (drag.active && drag.mode) {
    const vp = state.viewports[drag.vpIndex];
    if (!vp) { drag.active = false; return; }
    if (!state.isVideo) needsRender = true;

    if (drag.mode === 'move') {
      vp.x = Math.round(Math.max(0, drag.startVpX + px - drag.startX));
      vp.y = Math.round(Math.max(0, drag.startVpY + py - drag.startY));
    } else {
      const dx = px - drag.startX, dy = py - drag.startY;
      let sizeDelta = 0;
      const e = drag.edge;
      if (e.includes('e')) sizeDelta = dx;
      if (e.includes('w')) sizeDelta = Math.max(sizeDelta, -dx);
      if (e.includes('s')) sizeDelta = Math.max(sizeDelta, dy);
      if (e.includes('n')) sizeDelta = Math.max(sizeDelta, -dy);

      const newSize = Math.max(20, Math.round(drag.startSize + sizeDelta));
      const delta = newSize - drag.startSize;
      vp.size = newSize;
      if (e.includes('e') || e.includes('w')) vp.x = Math.round(drag.startVpX + delta / 2);
      if (e.includes('s') || e.includes('n')) vp.y = Math.round(drag.startVpY + delta / 2);
    }

    const gui = vpGUI[drag.vpIndex];
    if (gui) {
      if (gui.ctrls.x) gui.ctrls.x.updateDisplay();
      if (gui.ctrls.y) gui.ctrls.y.updateDisplay();
      if (gui.ctrls.size) gui.ctrls.size.updateDisplay();
    }
    return;
  }

  state.mouseX = px;
  state.mouseY = py;

  if (state.media) {
    const hit = hitTestViewports(px, py);
    if (hit && hit.edge === 'inside' && state.activeViewport >= 0) {
      canvas.style.cursor = state.viewports.length ? 'grab' : 'crosshair';
    } else {
      canvas.style.cursor = hit ? cursorForEdge(hit.edge) : 'crosshair';
    }
  } else {
    canvas.style.cursor = 'crosshair';
  }
}

function onPointerUp() {
  if (maskDrawing) { maskDrawing = false; canvas.style.cursor = 'crosshair'; needsRender = true; return; }
  if (drag.active && drag.mode) needsRender = true;
  drag.active = false;
  drag.mode = null;
  drag.vpIndex = -1;
  drag.edge = null;
  canvas.style.cursor = 'crosshair';
}

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
window.addEventListener('pointerup', onPointerUp);

// ─── 键盘快捷操作 ──────────────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  if (e.key === 'Shift') shiftDown = true;
  if (e.key === 'Control' || e.key === 'Meta') ctrlDown = true;

  const m = state.media;
  if (!m || !state.isVideo) return;
  if (e.key === ' ' || e.key === 'Space') {
    e.preventDefault();
    if (m.paused) m.play(); else m.pause();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    stepFrame(-1);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    stepFrame(1);
  }
});
document.addEventListener('keyup', (e) => {
  if (e.key === 'Shift') shiftDown = false;
  if (e.key === 'Control' || e.key === 'Meta') ctrlDown = false;
});

// ─── 将媒体绘制到离屏画布 ───────────────────────────────────────────────

function drawMediaToOffscreen() {
  const { media } = state;
  if (!media) return;
  const cw = canvas.width, ch = canvas.height;
  if (offscreen.width !== cw || offscreen.height !== ch) {
    offscreen.width = cw;
    offscreen.height = ch;
  }
  offCtx.clearRect(0, 0, cw, ch);
  const { w, h } = mediaSize(media);
  if (!w || !h) return;
  const r = computeDrawRect(cw, ch, w, h);
  offCtx.drawImage(media, r.x, r.y, r.w, r.h);
}

function getSourceImageData() {
  return offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
}

// ─── 风格化渲染函数（接受目标上下文） ────────────────────────────────────

function renderASCII(imageData, target, opts = {}) {
  const { width, height, data } = imageData;
  const d = state.density;
  const charset = CHARSETS[opts.asciiCharset || state.asciiCharset];
  const numChars = charset.length;
  const invert = opts.asciiInvert !== undefined ? opts.asciiInvert : state.asciiInvert;
  const useColor = opts.asciiColor !== undefined ? opts.asciiColor : state.asciiColor;

  target.fillStyle = state.bgColor;
  target.fillRect(0, 0, canvas.width, canvas.height);
  target.font = `${d * 1.15}px "Courier New", "Noto Sans Mono", monospace`;
  target.textAlign = 'center';
  target.textBaseline = 'middle';

  infoEl.textContent = `字符: ${Math.ceil(width / d) * Math.ceil(height / d)}`;

  if (useColor) {
    for (let y = 0; y < height; y += d) {
      for (let x = 0; x < width; x += d) {
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i+1], b = data[i+2];
        let ci = Math.floor(((r * 0.299 + g * 0.587 + b * 0.114) / 255) * (numChars - 1));
        if (invert) ci = numChars - 1 - ci;
        ci = Math.max(0, Math.min(numChars - 1, ci));
        target.fillStyle = `rgb(${r},${g},${b})`;
        target.fillText(charset[ci], x + d / 2, y + d / 2);
      }
    }
  } else {
    target.fillStyle = state.textColor;
    for (let y = 0; y < height; y += d) {
      for (let x = 0; x < width; x += d) {
        const i = (y * width + x) * 4;
        let ci = Math.floor(((data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114) / 255) * (numChars - 1));
        if (invert) ci = numChars - 1 - ci;
        ci = Math.max(0, Math.min(numChars - 1, ci));
        target.fillText(charset[ci], x + d / 2, y + d / 2);
      }
    }
  }
}

function renderEdge(imageData, target) {
  const { width, height, data } = imageData;
  const d = state.density;
  target.fillStyle = state.bgColor;
  target.fillRect(0, 0, canvas.width, canvas.height);

  const gw = Math.ceil(width / d), gh = Math.ceil(height / d);
  const gray = new Float32Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) {
    const py = Math.min(gy * d + (d >> 1), height - 1), ro = gy * gw;
    for (let gx = 0; gx < gw; gx++) {
      const px = Math.min(gx * d + (d >> 1), width - 1), i = (py * width + px) * 4;
      gray[ro + gx] = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
    }
  }
  const sx = [-1,0,1,-2,0,2,-1,0,1], sy = [-1,-2,-1,0,0,0,1,2,1];
  target.fillStyle = state.textColor;
  let edgeCount = 0;
  for (let gy = 1; gy < gh - 1; gy++) {
    const ro = gy * gw;
    for (let gx = 1; gx < gw - 1; gx++) {
      let gxA = 0, gyA = 0, idx = 0;
      for (let ky = -1; ky <= 1; ky++) {
        const kr = (gy + ky) * gw;
        for (let kx = -1; kx <= 1; kx++) { const p = gray[kr + (gx + kx)]; gxA += p * sx[idx]; gyA += p * sy[idx]; idx++; }
      }
      if (Math.sqrt(gxA*gxA + gyA*gyA) / 255 > state.edgeThreshold) { target.fillRect(gx * d, gy * d, d, d); edgeCount++; }
    }
  }
  infoEl.textContent = `边缘区块: ${edgeCount}`;
}

function renderPixelate(imageData, target) {
  const { width, height, data } = imageData;
  const d = state.density;
  target.fillStyle = state.bgColor;
  target.fillRect(0, 0, canvas.width, canvas.height);
  let cnt = 0;
  for (let y = 0; y < height; y += d) {
    for (let x = 0; x < width; x += d) {
      const i = (y * width + x) * 4;
      target.fillStyle = `rgb(${data[i]},${data[i+1]},${data[i+2]})`;
      target.fillRect(x, y, d, d);
      cnt++;
    }
  }
  infoEl.textContent = `像素块: ${cnt}`;
}

function renderDither(imageData, target) {
  const { width, height, data } = imageData;
  const d = state.density;
  target.fillStyle = state.bgColor;
  target.fillRect(0, 0, canvas.width, canvas.height);
  const gw = Math.ceil(width / d), gh = Math.ceil(height / d);
  target.fillStyle = state.textColor;
  let cnt = 0;
  for (let gy = 0; gy < gh; gy++) {
    const py = Math.min(gy * d + (d >> 1), height - 1);
    for (let gx = 0; gx < gw; gx++) {
      const px = Math.min(gx * d + (d >> 1), width - 1), i = (py * width + px) * 4;
      if ((data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114) / 255 > (BAYER[gy & 3][gx & 3] + 0.5) / 16) {
        target.fillRect(gx * d, gy * d, d, d); cnt++;
      }
    }
  }
  infoEl.textContent = `抖动像素: ${cnt}`;
}

function renderHalftone(imageData, target, opts = {}) {
  const { width, height, data } = imageData;
  const d = state.density;
  target.fillStyle = state.bgColor;
  target.fillRect(0, 0, canvas.width, canvas.height);
  const gw = Math.ceil(width / d), gh = Math.ceil(height / d), hd = d / 2;
  for (let gy = 0; gy < gh; gy++) {
    const py = Math.min(gy * d + (d >> 1), height - 1);
    for (let gx = 0; gx < gw; gx++) {
      const px = Math.min(gx * d + (d >> 1), width - 1), i = (py * width + px) * 4;
      const r = data[i], g = data[i+1], b = data[i+2];
      const radius = ((1 - (r * 0.299 + g * 0.587 + b * 0.114) / 255) * hd);
      if (radius > 0.5) {
        const hfColor = opts.halftoneColor !== undefined ? opts.halftoneColor : state.halftoneColor;
        target.fillStyle = hfColor ? `rgb(${r},${g},${b})` : state.textColor;
        target.beginPath();
        target.arc(gx * d + hd, gy * d + hd, radius, 0, Math.PI * 2);
        target.fill();
      }
    }
  }
  infoEl.textContent = `半色调点: ${gw * gh}`;
}

function renderStyle(style, imageData, target, opts = {}) {
  switch (style) {
    case 'ascii':     renderASCII(imageData, target, opts);    break;
    case 'edge':      renderEdge(imageData, target);           break;
    case 'pixelate':  renderPixelate(imageData, target);       break;
    case 'dither':    renderDither(imageData, target);         break;
    case 'halftone':  renderHalftone(imageData, target, opts); break;
  }
}

// ─── 获取/缓存指定风格的预渲染画布 ─────────────────────────────────────

function getStyleCanvas(style, imageData, opts = {}) {
  if (style === 'original') return null;

  let entry = styleRenderers[style];
  if (!entry) {
    const c = document.createElement('canvas');
    entry = { canvas: c, ctx: c.getContext('2d') };
    styleRenderers[style] = entry;
  }
  if (entry.canvas.width !== canvas.width || entry.canvas.height !== canvas.height) {
    entry.canvas.width = canvas.width;
    entry.canvas.height = canvas.height;
  }
  renderStyle(style, imageData, entry.ctx, opts);
  return entry.canvas;
}

// ─── 绘制原始画面（满画布） ──────────────────────────────────────────────

function drawOriginalFull() {
  drawOriginalOn(ctx);
}

function drawOriginalOn(target) {
  const dr = getDrawRect();
  if (dr) target.drawImage(state.media, dr.x, dr.y, dr.w, dr.h);
}

// ─── 视窗边框 ────────────────────────────────────────────────────────────

function drawVpBorder(vp, isActive) {
  const r = getVpRect(vp);
  const vpIdx = state.viewports.indexOf(vp);
  const color = VP_COLORS[Math.max(0, vpIdx) % VP_COLORS.length];

  ctx.save();

  if (isActive) {
    ctx.fillStyle = color + '15';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
  } else {
    ctx.strokeStyle = color + '99';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
  }
  ctx.strokeRect(r.x, r.y, r.w, r.h);
  ctx.setLineDash([]);

  if (isActive) {
    const hs = HANDLE.TOL;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    for (const [hx, hy] of [[r.x, r.y], [r.x+r.w, r.y], [r.x, r.y+r.h], [r.x+r.w, r.y+r.h]]) {
      ctx.fillRect(hx - hs, hy - hs, hs * 2, hs * 2);
      ctx.strokeRect(hx - hs, hy - hs, hs * 2, hs * 2);
    }
  } else {
    const cLen = 10;
    ctx.strokeStyle = color + 'cc';
    ctx.lineWidth = 1.5;
    for (const [cx, cy, dx1, dy1, dx2, dy2] of [
      [r.x, r.y, 1, 0, 0, 1],
      [r.x+r.w, r.y, -1, 0, 0, 1],
      [r.x, r.y+r.h, 1, 0, 0, -1],
      [r.x+r.w, r.y+r.h, -1, 0, 0, -1],
    ]) {
      ctx.beginPath();
      ctx.moveTo(cx + dx1 * cLen, cy); ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy2 * cLen);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ─── MediaPipe 主体抠图 ─────────────────────────────────────────────────

function initSelfieSeg() {
  if (selfieSeg || typeof SelfieSegmentation === 'undefined') return;
  try {
    selfieSeg = new SelfieSegmentation({
      locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${f}`
    });
    selfieSeg.setOptions({ modelSelection: 1 });
    selfieSeg.onResults((results) => {
      const src = results.segmentationMask;
      if (!src) { segProcessing = false; return; }
      const c = document.createElement('canvas');
      c.width = offscreen.width;
      c.height = offscreen.height;
      const cx = c.getContext('2d');
      cx.drawImage(src, 0, 0, c.width, c.height);
      const d = cx.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < d.data.length; i += 4) {
        const a = d.data[i];
        d.data[i] = 255; d.data[i+1] = 255; d.data[i+2] = 255;
        d.data[i+3] = a;
      }
      cx.putImageData(d, 0, 0);
      segMaskCanvas = c;
      segProcessing = false;
      fMask.show();
      needsRender = true;
    });
  } catch (e) { console.warn('主体抠图初始化失败:', e); segProcessing = false; }
}

function runSeg() {
  if (!selfieSeg || segProcessing || !state.media) return;
  segProcessing = true;
  selfieSeg.send({ image: state.media });
}

// ─── 蒙版编辑工具 ───────────────────────────────────────────────────────

function paintMaskAt(x, y, add) {
  if (!segMaskCanvas) return;
  const mCtx = segMaskCanvas.getContext('2d');
  const r = state.maskBrushSize;
  const cx = Math.round(x), cy = Math.round(y);
  const minX = Math.max(0, cx - r);
  const minY = Math.max(0, cy - r);
  const maxX = Math.min(segMaskCanvas.width, cx + r);
  const maxY = Math.min(segMaskCanvas.height, cy + r);
  const w = maxX - minX, h = maxY - minY;
  if (w <= 0 || h <= 0) return;

  const id = mCtx.getImageData(minX, minY, w, h);
  const d = id.data;
  const r2 = r * r;

  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const dx = (minX + px) - cx;
      const dy = (minY + py) - cy;
      if (dx * dx + dy * dy <= r2) {
        const ai = (py * w + px) * 4 + 3;
        d[ai] = add ? 255 : 0;
      }
    }
  }
  mCtx.putImageData(id, minX, minY);
}

function smoothMask(radius, mode) {
  if (!segMaskCanvas) return;
  const w = segMaskCanvas.width, h = segMaskCanvas.height;
  const temp = document.createElement('canvas');
  temp.width = w; temp.height = h;
  const tc = temp.getContext('2d');
  tc.filter = `blur(${radius}px)`;
  tc.drawImage(segMaskCanvas, 0, 0);
  tc.filter = 'none';
  const d = tc.getImageData(0, 0, w, h);
  for (let i = 0; i < d.data.length; i += 4) {
    const a = d.data[i + 3];
    d.data[i] = 255; d.data[i+1] = 255; d.data[i+2] = 255;
    d.data[i+3] = mode === 'expand' ? (a > 80 ? 255 : 0) : (a > 200 ? 255 : 0);
  }
  tc.putImageData(d, 0, 0);
  segMaskCanvas.getContext('2d').drawImage(temp, 0, 0);
  needsRender = true;
}

// ─── 渲染风格化场景到指定上下文 ─────────────────────────────────────────

function renderStyledOn(target, imageData) {
  if (!imageData) imageData = getSourceImageData();
  target.clearRect(0, 0, canvas.width, canvas.height);

  if (state.style !== 'original') {
    getStyleCanvas(state.style, imageData);
  }

  if (state.style === 'original') {
    drawOriginalOn(target);
  } else {
    target.drawImage(styleRenderers[state.style].canvas, 0, 0);
  }

  for (let i = 0; i < state.viewports.length; i++) {
    const vp = state.viewports[i];
    const vs = vp.style || 'original';
    if (vs !== state.style) {
      const r = getVpRect(vp);
      target.save();
      target.beginPath();
      target.rect(r.x, r.y, r.w, r.h);
      target.clip();

      if (vp.subjectMatting && segMaskCanvas) {
        // 视窗内主体抠图：背景色 + 仅主体显示视窗风格
        target.fillStyle = state.bgColor;
        target.fillRect(0, 0, canvas.width, canvas.height);

        vpTempCtx.clearRect(0, 0, canvas.width, canvas.height);
        if (vs === 'original') {
          drawOriginalOn(vpTempCtx);
        } else {
          renderStyle(vs, imageData, vpTempCtx, vp.styleParams || {});
        }
        vpTempCtx.save();
        vpTempCtx.globalCompositeOperation = 'destination-in';
        vpTempCtx.drawImage(segMaskCanvas, 0, 0);
        vpTempCtx.restore();
        target.drawImage(vpTempCanvas, 0, 0);
      } else {
        if (vs === 'original') {
          drawOriginalOn(target);
        } else {
          renderStyle(vs, imageData, target, vp.styleParams || {});
        }
      }

      target.restore();
    }
  }
}

// ─── 主渲染循环 ──────────────────────────────────────────────────────────

let needsRender = true;
let fpsAccum = 0;
let lastFpsTime = performance.now();

function render(now) {
  const hasMedia = !!state.media;
  const isStatic = hasMedia && !state.isVideo;

  if (isStatic && !needsRender && !drag.active) {
    requestAnimationFrame(render);
    return;
  }

  if (!hasMedia) {
    fpsAccum++;
    if (now - lastFpsTime >= 1000) {
      fpsEl.textContent = `FPS: ${fpsAccum}`;
      fpsAccum = 0; lastFpsTime = now;
    }
    needsRender = false;
    requestAnimationFrame(render);
    return;
  }

  drawMediaToOffscreen();
  const imageData = getSourceImageData();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.subjectMatting) {
    // 主体抠图管线：背景填充为背景色，风格仅作用于主体区域
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (state.isVideo) {
      segFrameIdx++;
      if (segFrameIdx % 10 === 0 || !segMaskCanvas) runSeg();
    } else if (!segMaskCanvas) {
      runSeg();
    }

    if (segMaskCanvas) {
      renderStyledOn(compositeCtx, imageData);
      compositeCtx.save();
      compositeCtx.globalCompositeOperation = 'destination-in';
      compositeCtx.drawImage(segMaskCanvas, 0, 0);
      compositeCtx.restore();
      ctx.drawImage(compositeCanvas, 0, 0);
    } else {
      renderStyledOn(ctx, imageData);
    }
  } else {
    renderStyledOn(ctx, imageData);
  }

  // 蒙版叠加层（按住 Shift/Ctrl 时显示）
  if (segMaskCanvas && (maskDrawing || shiftDown || ctrlDown)) {
    const isAdd = maskDrawing ? maskBrushAdd : shiftDown;
    overlayCtx.clearRect(0, 0, canvas.width, canvas.height);
    overlayCtx.fillStyle = 'rgba(255, 80, 80, 0.30)';
    overlayCtx.fillRect(0, 0, canvas.width, canvas.height);
    overlayCtx.globalCompositeOperation = 'destination-out';
    overlayCtx.drawImage(segMaskCanvas, 0, 0);
    overlayCtx.globalCompositeOperation = 'source-over';
    ctx.drawImage(overlayCanvas, 0, 0);

    // 画笔光标
    ctx.save();
    ctx.beginPath();
    ctx.arc(state.mouseX, state.mouseY, state.maskBrushSize, 0, Math.PI * 2);
    ctx.strokeStyle = isAdd ? 'rgba(100, 255, 100, 0.7)' : 'rgba(255, 100, 100, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = isAdd ? 'rgba(100, 255, 100, 0.12)' : 'rgba(255, 100, 100, 0.12)';
    ctx.fill();
    ctx.restore();
  }

  // 边框（独立于内容渲染之上）
  for (let i = 0; i < state.viewports.length; i++) {
    if (state.showBorders) {
      drawVpBorder(state.viewports[i], i === state.activeViewport);
    }
  }

  fpsAccum++;
  if (now - lastFpsTime >= 1000) {
    fpsEl.textContent = `FPS: ${fpsAccum}`;
    fpsAccum = 0; lastFpsTime = now;
  }

  needsRender = false;
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

// ─── 导出当前帧为 PNG ───────────────────────────────────────────────────

exportBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'duality-export.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// ─── MediaRecorder 视频导出 ────────────────────────────────────────────

let mediaRecorder = null;
let recordChunks = [];

function startRecording() {
  const v = state.media;
  if (!v || !state.isVideo || state.isRecording) return;

  try {
    const stream = canvas.captureStream(30);
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
  } catch {
    const stream = canvas.captureStream(30);
    mediaRecorder = new MediaRecorder(stream);
  }

  recordChunks = [];

  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    if (recordChunks.length) {
      const blob = new Blob(recordChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'duality-export.webm';
      a.click();
      URL.revokeObjectURL(url);
    }
    recordChunks = [];
    if (state.media) state.media.loop = true;
  };

  mediaRecorder.start();
  state.isRecording = true;
  v.loop = false;
  v.currentTime = 0;
  v.play();
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  state.isRecording = false;
  if (state.media) state.media.loop = true;
}
