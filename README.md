# Duality - 视觉风格迁移

基于 Canvas 2D 的实时视觉风格迁移工具，支持图片和视频的风格化处理、多视窗对比、主体抠图等。

## 功能

### 风格化样式
- **ASCII 艺术** — 可调字符集、亮度反转、彩色字符模式
- **边缘检测** — Sobel 算子边缘提取，可调阈值
- **像素风** — 马赛克风格
- **有序抖动** — Bayer 矩阵有序抖动
- **半色调** — 网点效果，支持彩色模式
- **原始画面** — 显示原图

### 多视窗系统
- 创建多个独立视窗，每个可设置不同样式和参数
- 拖拽移动位置，边缘拖拽调整大小
- 可单独删除任意视窗
- 可切换边框显示/隐藏

### 主体抠图
- 基于 MediaPipe Selfie Segmentation 自动识别人物主体
- **手动精修** — 按住 `Shift` 拖动添加至主体，按住 `Ctrl`（Mac: `Cmd`）拖动擦除
- 扩展/收缩蒙版边缘
- 可重置为自动分割结果
- 支持全局主体抠图与逐视窗独立抠图

### 视频支持
- 上传 MP4 视频，实时风格化处理
- 播放/暂停（空格键）
- 进度条拖拽
- 播放速度控制（0.25x - 2x）
- 逐帧步进（← → 方向键）
- 整段视频导出（MediaRecorder → WebM）

### 图片导出
- 导出当前帧为 PNG

## 使用

### 本地运行

```bash
npm install
npm run dev
```

### 构建

```bash
npm run build
npm run preview
```

### 操作指南

1. 点击 **上传媒体** 选择图片或视频
2. 在 **样式设置** 中选择全局风格
3. 调整 **渲染参数**（密度、阈值、颜色等）
4. 在 **多视窗管理** 中添加视窗，配置独立样式
5. 勾选 **主体抠图** 启用自动分割，按住 Shift/Ctrl 精修蒙版
6. 视频模式下使用 **视频控制** 面板播放/导出

## 技术栈

- [Vite](https://vitejs.dev/) — 构建工具
- [lil-gui](https://lil-gui.georgealways.com/) — 控制面板
- [MediaPipe Selfie Segmentation](https://developers.google.com/mediapipe/solutions/vision/selfie_segmentation) — 主体分割
- Canvas 2D API — 所有风格化渲染与合成
- MediaRecorder API — 视频导出
