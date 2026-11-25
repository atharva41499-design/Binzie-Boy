import * as THREE from 'three';

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

function finalizeColorTexture(
  canvas: HTMLCanvasElement,
  repeatX = 1,
  repeatY = 1,
  anisotropy = 4,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

function finalizeBumpTexture(
  canvas: HTMLCanvasElement,
  repeatX = 1,
  repeatY = 1,
  anisotropy = 4,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

export interface ApartmentTextures {
  porcelainTile: THREE.CanvasTexture;
  porcelainBump: THREE.CanvasTexture;
  balconyTile: THREE.CanvasTexture;
  bathroomTile: THREE.CanvasTexture;
  subwayTile: THREE.CanvasTexture;
  blackMosaicTile: THREE.CanvasTexture;
  tealPlaster: THREE.CanvasTexture;
  walnutWood: THREE.CanvasTexture;
  walnutBump: THREE.CanvasTexture;
  mustardFabric: THREE.CanvasTexture;
  fabricBump: THREE.CanvasTexture;
  burgundyLeather: THREE.CanvasTexture;
  wavyRug: THREE.CanvasTexture;
  brickArt: THREE.CanvasTexture;
  orangeStripedCurtain: THREE.CanvasTexture;
  blackGoldCurtain: THREE.CanvasTexture;
  terracottaPot: THREE.CanvasTexture;
  cardboardBox: THREE.CanvasTexture;
  laptopScreen: THREE.CanvasTexture;
  studyScreen: THREE.CanvasTexture;
  tvScreenMusic: THREE.CanvasTexture;
  tvScreenCatTv: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  tabbyFur: THREE.CanvasTexture;
  brownieFaceFur: THREE.CanvasTexture;
  ruffFur: THREE.CanvasTexture;
  furBump: THREE.CanvasTexture;
  furAlphaTuft: THREE.CanvasTexture;
  brownieEye: THREE.CanvasTexture;
  glowHalo: THREE.CanvasTexture;
  cityWindowGrid: THREE.CanvasTexture;
  corridorTile: THREE.CanvasTexture;
  dispose: () => void;
}

export function createApartmentTextures(maxAnisotropy: number): ApartmentTextures {
  const aniso = Math.min(8, maxAnisotropy || 4);

  // 1. Glossy cream porcelain floor tiles with subtle marble veining
  const [tileC, tileCtx] = makeCanvas(512, 512);
  tileCtx.fillStyle = '#ede7dc';
  tileCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 55; i++) {
    tileCtx.strokeStyle = `rgba(196, 186, 170, ${0.14 + Math.random() * 0.16})`;
    tileCtx.lineWidth = 1 + Math.random() * 2.2;
    tileCtx.beginPath();
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    tileCtx.moveTo(x, y);
    tileCtx.bezierCurveTo(x + 45, y - 22, x + 95, y + 28, x + 145, y + 6);
    tileCtx.stroke();
  }
  tileCtx.strokeStyle = 'rgba(162, 152, 138, 0.58)';
  tileCtx.lineWidth = 3;
  tileCtx.strokeRect(1.5, 1.5, 509, 509);
  const porcelainTile = finalizeColorTexture(tileC, 8, 8, aniso);

  // 2. Balcony dark slate/charcoal stone tile
  const [balC, balCtx] = makeCanvas(256, 256);
  balCtx.fillStyle = '#40362e';
  balCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 240; i++) {
    balCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,245,230,0.045)' : 'rgba(15,10,8,0.08)';
    balCtx.fillRect(Math.random() * 256, Math.random() * 256, 7, 5);
  }
  balCtx.strokeStyle = '#29221d';
  balCtx.lineWidth = 4;
  balCtx.strokeRect(2, 2, 252, 252);
  const balconyTile = finalizeColorTexture(balC, 4, 4, aniso);

  // 3. Bathroom beige marble tile with horizontal bevel grooves
  const [bathC, bathCtx] = makeCanvas(512, 512);
  bathCtx.fillStyle = '#d8cab7';
  bathCtx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) {
    bathCtx.strokeStyle = 'rgba(155, 136, 114, 0.25)';
    bathCtx.lineWidth = 1.6;
    bathCtx.beginPath();
    const y = Math.random() * 512;
    bathCtx.moveTo(0, y);
    bathCtx.bezierCurveTo(170, y + (Math.random() - 0.5) * 40, 340, y + (Math.random() - 0.5) * 40, 512, y);
    bathCtx.stroke();
  }
  bathCtx.strokeStyle = 'rgba(116, 102, 86, 0.5)';
  bathCtx.lineWidth = 3;
  for (let row = 0; row < 4; row++) {
    bathCtx.beginPath();
    bathCtx.moveTo(0, row * 128);
    bathCtx.lineTo(512, row * 128);
    bathCtx.stroke();
  }
  bathCtx.strokeRect(1.5, 1.5, 509, 509);
  const bathroomTile = finalizeColorTexture(bathC, 3, 3, aniso);

  // 4. White horizontal subway/grooved wall tile (kitchen backsplash & hallway vanity wall)
  const [subC, subCtx] = makeCanvas(256, 256);
  subCtx.fillStyle = '#f2eee6';
  subCtx.fillRect(0, 0, 256, 256);
  subCtx.strokeStyle = 'rgba(180, 173, 162, 0.65)';
  subCtx.lineWidth = 2;
  for (let y = 0; y < 256; y += 32) {
    subCtx.beginPath();
    subCtx.moveTo(0, y);
    subCtx.lineTo(256, y);
    subCtx.stroke();
    const offset = ((y / 32) % 2) * 64;
    for (let x = offset; x < 256; x += 128) {
      subCtx.beginPath();
      subCtx.moveTo(x, y);
      subCtx.lineTo(x, y + 32);
      subCtx.stroke();
    }
  }
  const subwayTile = finalizeColorTexture(subC, 3, 3, aniso);

  // 5. Black geometric diamond mosaic accent tile (kitchen corner)
  const [mosC, mosCtx] = makeCanvas(256, 256);
  mosCtx.fillStyle = '#1b1d22';
  mosCtx.fillRect(0, 0, 256, 256);
  mosCtx.strokeStyle = '#3a3f4a';
  mosCtx.lineWidth = 2;
  for (let i = -256; i < 512; i += 32) {
    mosCtx.beginPath();
    mosCtx.moveTo(i, 0);
    mosCtx.lineTo(i + 256, 256);
    mosCtx.stroke();
    mosCtx.beginPath();
    mosCtx.moveTo(i + 256, 0);
    mosCtx.lineTo(i, 256);
    mosCtx.stroke();
  }
  const blackMosaicTile = finalizeColorTexture(mosC, 2, 2, aniso);

  // 6. Deep ocean-teal matte living room feature wall
  const [tealC, tealCtx] = makeCanvas(256, 256);
  tealCtx.fillStyle = '#0c3d4e';
  tealCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    tealCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.035)';
    tealCtx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
  }
  const tealPlaster = finalizeColorTexture(tealC, 2, 2, aniso);

  // 7. Rich dark walnut wood grain
  const [walC, walCtx] = makeCanvas(256, 256);
  walCtx.fillStyle = '#392418';
  walCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 3) {
    walCtx.fillStyle = y % 6 === 0 ? 'rgba(18, 10, 6, 0.38)' : 'rgba(88, 56, 36, 0.24)';
    walCtx.fillRect(0, y, 256, 2);
  }
  for (let i = 0; i < 18; i++) {
    walCtx.strokeStyle = 'rgba(20, 10, 5, 0.22)';
    walCtx.lineWidth = 1.5;
    walCtx.beginPath();
    const y = Math.random() * 256;
    walCtx.moveTo(0, y);
    walCtx.bezierCurveTo(85, y + 8, 170, y - 8, 256, y);
    walCtx.stroke();
  }
  const walnutWood = finalizeColorTexture(walC, 1, 1, aniso);

  // 8. Textured mustard-ochre sofa upholstery
  const [musC, musCtx] = makeCanvas(256, 256);
  musCtx.fillStyle = '#a87624';
  musCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 3) {
    musCtx.fillStyle = i % 6 === 0 ? 'rgba(65, 42, 8, 0.11)' : 'rgba(235, 195, 110, 0.06)';
    musCtx.fillRect(i, 0, 1, 256);
    musCtx.fillRect(0, i, 256, 1);
  }
  const mustardFabric = finalizeColorTexture(musC, 4, 4, aniso);

  // 9. Rich burgundy leather beanbag
  const [burC, burCtx] = makeCanvas(256, 256);
  burCtx.fillStyle = '#531924';
  burCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 550; i++) {
    burCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 220, 225, 0.035)' : 'rgba(20, 4, 8, 0.06)';
    burCtx.fillRect(Math.random() * 256, Math.random() * 256, 5, 3);
  }
  const burgundyLeather = finalizeColorTexture(burC, 2, 2, aniso);

  // 10. High-res wavy brown, taupe & cream shag rug
  const [rugC, rugCtx] = makeCanvas(512, 256);
  rugCtx.fillStyle = '#d4c6b3';
  rugCtx.fillRect(0, 0, 512, 256);
  const rugColors = ['#664836', '#9d836c', '#3d291e', '#c6b39b', '#7b5944'];
  rugColors.forEach((col, idx) => {
    rugCtx.fillStyle = col;
    rugCtx.beginPath();
    rugCtx.moveTo(0, 28 + idx * 46);
    for (let x = 0; x <= 512; x += 24) {
      rugCtx.lineTo(x, 28 + idx * 46 + Math.sin(x * 0.018 + idx * 1.1) * 20);
    }
    rugCtx.lineTo(512, 256);
    rugCtx.lineTo(0, 256);
    rugCtx.closePath();
    rugCtx.fill();
  });
  for (let i = 0; i < 2400; i++) {
    rugCtx.fillStyle = Math.random() > 0.5 ? 'rgba(255,248,235,0.08)' : 'rgba(30,18,10,0.08)';
    rugCtx.fillRect(Math.random() * 512, Math.random() * 256, 2, 2);
  }
  const wavyRug = finalizeColorTexture(rugC, 1, 1, aniso);

  // 11. Rustic brick/stone triptych art with mortar shadow relief
  const [brC, brCtx] = makeCanvas(512, 512);
  brCtx.fillStyle = '#3c2b21';
  brCtx.fillRect(0, 0, 512, 512);
  const brickTones = ['#87614b', '#563c2d', '#9b775d', '#6d4e3c', '#7c5944'];
  for (let row = 0; row < 10; row++) {
    const offset = (row % 2) * 52;
    for (let col = -1; col < 6; col++) {
      const bx = col * 104 + offset + 4;
      const by = row * 51 + 4;
      brCtx.fillStyle = brickTones[(row * 5 + col + 7) % brickTones.length];
      brCtx.fillRect(bx, by, 96, 43);
      brCtx.fillStyle = 'rgba(255,240,220,0.08)';
      brCtx.fillRect(bx, by, 96, 5);
      brCtx.fillStyle = 'rgba(0,0,0,0.22)';
      brCtx.fillRect(bx, by + 37, 96, 6);
    }
  }
  const brickArt = finalizeColorTexture(brC, 1, 1, aniso);

  // 12. Orange-and-maroon striped kitchen curtain
  const [orC, orCtx] = makeCanvas(256, 256);
  for (let x = 0; x < 256; x += 32) {
    orCtx.fillStyle = '#cb5419';
    orCtx.fillRect(x, 0, 20, 256);
    orCtx.fillStyle = '#731e14';
    orCtx.fillRect(x + 20, 0, 12, 256);
  }
  const orangeStripedCurtain = finalizeColorTexture(orC, 3, 1, aniso);

  // 13. Black curtain with gold leaf branches
  const [bkC, bkCtx] = makeCanvas(256, 256);
  bkCtx.fillStyle = '#11141a';
  bkCtx.fillRect(0, 0, 256, 256);
  bkCtx.strokeStyle = 'rgba(205, 166, 88, 0.52)';
  bkCtx.lineWidth = 2.2;
  for (let i = 0; i < 8; i++) {
    const x = 16 + i * 32;
    bkCtx.beginPath();
    bkCtx.moveTo(x, 256);
    bkCtx.bezierCurveTo(x - 14, 180, x + 16, 90, x - 4, 0);
    bkCtx.stroke();
  }
  const blackGoldCurtain = finalizeColorTexture(bkC, 2, 1, aniso);

  // 14. Terracotta matka/handi with painted ethnic band
  const [terC, terCtx] = makeCanvas(256, 256);
  terCtx.fillStyle = '#97452c';
  terCtx.fillRect(0, 0, 256, 256);
  terCtx.fillStyle = '#251410';
  terCtx.fillRect(0, 110, 256, 10);
  terCtx.fillRect(0, 140, 256, 8);
  terCtx.fillStyle = '#e8d7c1';
  for (let x = 8; x < 256; x += 28) {
    terCtx.beginPath();
    terCtx.arc(x, 129, 4, 0, Math.PI * 2);
    terCtx.fill();
  }
  const terracottaPot = finalizeColorTexture(terC, 1, 1, aniso);

  // 15. Brownie's warm golden-ginger & honey-apricot longhair coat
  const [furC, furCtx] = makeCanvas(512, 512);
  const grad = furCtx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#b8641d'); // warm ginger-orange dorsal spine
  grad.addColorStop(0.34, '#d98230'); // classic vibrant orange-ginger upper flanks
  grad.addColorStop(0.70, '#eba454'); // soft golden-apricot lower flanks
  grad.addColorStop(1, '#f7cb88'); // plush honey-apricot underbelly
  furCtx.fillStyle = grad;
  furCtx.fillRect(0, 0, 512, 512);

  // Classic warm marmalade tabby stripes sweeping smoothly across flanks & haunches
  for (let x = 18; x < 512; x += 38) {
    furCtx.strokeStyle = 'rgba(148, 68, 14, 0.24)';
    furCtx.lineWidth = 16;
    furCtx.lineCap = 'round';
    furCtx.beginPath();
    furCtx.moveTo(x, 8);
    furCtx.bezierCurveTo(x - 16, 136, x + 16, 260, x - 5, 395);
    furCtx.stroke();
  }

  // Dense feathery longhair strands in warm ginger, apricot & sunlit honey
  for (let i = 0; i < 8800; i++) {
    const r = Math.random();
    furCtx.strokeStyle =
      r > 0.60
        ? 'rgba(252, 206, 140, 0.38)'
        : r > 0.26
          ? 'rgba(222, 130, 52, 0.30)'
          : 'rgba(156, 76, 18, 0.22)';
    furCtx.lineWidth = 1.5;
    const fx = Math.random() * 512;
    const fy = Math.random() * 512;
    const len = 18 + Math.random() * 20;
    furCtx.beginPath();
    furCtx.moveTo(fx, fy);
    furCtx.quadraticCurveTo(fx + (Math.random() - 0.5) * 9, fy + len * 0.5, fx + (Math.random() - 0.5) * 7, fy + len);
    furCtx.stroke();
  }
  const tabbyFur = finalizeColorTexture(furC, 1, 1, aniso);

  // 16. Brownie's cute golden-ginger Persian face fur with soft forehead 'M' & cheek stripes
  const [faceC, faceCtx] = makeCanvas(256, 256);
  const fGrad = faceCtx.createRadialGradient(128, 144, 16, 128, 128, 134);
  fGrad.addColorStop(0, '#f9d59c'); // soft creamy-apricot snout & whisker pads
  fGrad.addColorStop(0.54, '#e49442'); // warm golden-ginger cheeks & brow
  fGrad.addColorStop(1, '#c26a22'); // warm ginger-orange outer crown
  faceCtx.fillStyle = fGrad;
  faceCtx.fillRect(0, 0, 256, 256);

  // Soft ginger tabby forehead 'M' markings + gentle cheek stripes
  faceCtx.strokeStyle = 'rgba(132, 58, 14, 0.38)';
  faceCtx.lineWidth = 4.4;
  faceCtx.lineCap = 'round';
  for (const offset of [-24, -9, 9, 24]) {
    faceCtx.beginPath();
    faceCtx.moveTo(128 + offset * 0.55, 88);
    faceCtx.quadraticCurveTo(128 + offset * 0.92, 62, 128 + offset * 1.25, 36);
    faceCtx.stroke();
  }
  for (const side of [-1, 1]) {
    faceCtx.beginPath();
    faceCtx.moveTo(128 + side * 34, 128);
    faceCtx.quadraticCurveTo(128 + side * 66, 136, 128 + side * 92, 152);
    faceCtx.stroke();
  }
  for (let i = 0; i < 3400; i++) {
    faceCtx.strokeStyle = Math.random() > 0.45 ? 'rgba(252, 212, 148, 0.32)' : 'rgba(164, 82, 22, 0.22)';
    faceCtx.lineWidth = 1.2;
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    faceCtx.beginPath();
    faceCtx.moveTo(x, y);
    faceCtx.lineTo(x + (x - 128) * 0.08, y + 12);
    faceCtx.stroke();
  }
  const brownieFaceFur = finalizeColorTexture(faceC, 1, 1, aniso);

  // 16b. Soft Fluffy Honey-Apricot Chest Ruff Texture
  const [ruffC, ruffCtx] = makeCanvas(256, 256);
  const ruffG = ruffCtx.createLinearGradient(0, 0, 0, 256);
  ruffG.addColorStop(0, '#fae0b0'); // sunlit honey-cream inner ruff curls
  ruffG.addColorStop(0.52, '#ebb268'); // soft golden-apricot mid-ruff
  ruffG.addColorStop(1, '#d18334'); // warm ginger lower fluff
  ruffCtx.fillStyle = ruffG;
  ruffCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    ruffCtx.strokeStyle =
      Math.random() > 0.42 ? 'rgba(255, 232, 185, 0.48)' : 'rgba(186, 100, 32, 0.26)';
    ruffCtx.lineWidth = 2.0;
    ruffCtx.beginPath();
    ruffCtx.moveTo(x, y);
    ruffCtx.bezierCurveTo(x - 7, y + 8, x + 7, y + 16, x - 2, y + 26);
    ruffCtx.stroke();
  }
  const ruffFur = finalizeColorTexture(ruffC, 1, 1, aniso);

  // 16c. Long-Hair Fur Strand Bump Map (NoColorSpace)
  const [fBumpC, fBumpCtx] = makeCanvas(256, 256);
  fBumpCtx.fillStyle = '#808080';
  fBumpCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    fBumpCtx.strokeStyle = Math.random() > 0.5 ? '#c8c8c8' : '#404040';
    fBumpCtx.lineWidth = 1.6;
    fBumpCtx.beginPath();
    fBumpCtx.moveTo(x, y);
    fBumpCtx.quadraticCurveTo(x + (Math.random() - 0.5) * 6, y + 9, x + (Math.random() - 0.5) * 5, y + 18);
    fBumpCtx.stroke();
  }
  const furBump = finalizeBumpTexture(fBumpC, 1, 1, aniso);

  // 17. Feathered Long-Hair Fur Tuft Alpha Mask (for cheek ruffs, pantaloons & bottle-brush tail)
  const [tuftC, tuftCtx] = makeCanvas(128, 128);
  tuftCtx.clearRect(0, 0, 128, 128);
  // Draw overlapping feathered tapering locks pointing downward (+V)
  const strandCount = 26;
  for (let i = 0; i < strandCount; i++) {
    const u = i / (strandCount - 1);
    const sx = 24 + u * 80;
    const tipY = 82 + Math.sin(u * Math.PI) * 42 + (Math.random() - 0.5) * 14;
    const spread = (u - 0.5) * 34;
    const gradS = tuftCtx.createLinearGradient(sx, 8, sx + spread, tipY);
    gradS.addColorStop(0, 'rgba(255,255,255,0.95)');
    gradS.addColorStop(0.65, 'rgba(255,255,255,0.85)');
    gradS.addColorStop(1, 'rgba(255,255,255,0)');
    tuftCtx.strokeStyle = gradS;
    tuftCtx.lineWidth = 5.5 + Math.random() * 3.5;
    tuftCtx.lineCap = 'round';
    tuftCtx.beginPath();
    tuftCtx.moveTo(sx, 10);
    tuftCtx.quadraticCurveTo(sx + spread * 0.45, tipY * 0.52, sx + spread, tipY);
    tuftCtx.stroke();
  }
  const furAlphaTuft = new THREE.CanvasTexture(tuftC);
  furAlphaTuft.wrapS = THREE.ClampToEdgeWrapping;
  furAlphaTuft.wrapT = THREE.ClampToEdgeWrapping;
  furAlphaTuft.anisotropy = aniso;
  furAlphaTuft.needsUpdate = true;

  // 18. Luminous warm honey-amber Persian cat eye iris texture (centered radial)
  const [eyeC, eyeCtx] = makeCanvas(128, 128);
  eyeCtx.fillStyle = '#18110c';
  eyeCtx.fillRect(0, 0, 128, 128);
  const irisG = eyeCtx.createRadialGradient(64, 64, 14, 64, 64, 58);
  irisG.addColorStop(0, '#f4b53a');
  irisG.addColorStop(0.55, '#c47716');
  irisG.addColorStop(0.88, '#4a2e08');
  irisG.addColorStop(1, '#140b05');
  eyeCtx.fillStyle = irisG;
  eyeCtx.beginPath();
  eyeCtx.arc(64, 64, 58, 0, Math.PI * 2);
  eyeCtx.fill();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    eyeCtx.strokeStyle = 'rgba(255, 224, 140, 0.25)';
    eyeCtx.lineWidth = 1.4;
    eyeCtx.beginPath();
    eyeCtx.moveTo(64 + Math.cos(a) * 20, 64 + Math.sin(a) * 20);
    eyeCtx.lineTo(64 + Math.cos(a) * 52, 64 + Math.sin(a) * 52);
    eyeCtx.stroke();
  }
  const brownieEye = finalizeColorTexture(eyeC, 1, 1, aniso);
  brownieEye.wrapS = THREE.ClampToEdgeWrapping;
  brownieEye.wrapT = THREE.ClampToEdgeWrapping;

  // 19. Soft radial warm glow sprite/floor pool texture
  const [glowC, glowCtx] = makeCanvas(128, 128);
  const glowG = glowCtx.createRadialGradient(64, 64, 4, 64, 64, 64);
  glowG.addColorStop(0, 'rgba(255, 225, 165, 0.85)');
  glowG.addColorStop(0.45, 'rgba(255, 190, 110, 0.32)');
  glowG.addColorStop(1, 'rgba(255, 180, 90, 0)');
  glowCtx.fillStyle = glowG;
  glowCtx.fillRect(0, 0, 128, 128);
  const glowHalo = finalizeColorTexture(glowC, 1, 1, aniso);
  glowHalo.wrapS = THREE.ClampToEdgeWrapping;
  glowHalo.wrapT = THREE.ClampToEdgeWrapping;

  // 20. Nighttime city building lit window grid
  const [cityC, cityCtx] = makeCanvas(256, 512);
  cityCtx.fillStyle = '#0d1322';
  cityCtx.fillRect(0, 0, 256, 512);
  for (let y = 16; y < 496; y += 26) {
    for (let x = 14; x < 240; x += 28) {
      if (Math.random() > 0.45) {
        cityCtx.fillStyle =
          Math.random() > 0.25 ? 'rgba(255, 212, 138, 0.85)' : 'rgba(155, 215, 255, 0.65)';
        cityCtx.fillRect(x, y, 16, 14);
      } else {
        cityCtx.fillStyle = 'rgba(26, 35, 56, 0.9)';
        cityCtx.fillRect(x, y, 16, 14);
      }
    }
  }
  const cityWindowGrid = finalizeColorTexture(cityC, 1, 2, aniso);

  // 21. Porcelain Tile Grout Bump Map (NoColorSpace)
  const [pbC, pbCtx] = makeCanvas(256, 256);
  pbCtx.fillStyle = '#e8e8e8';
  pbCtx.fillRect(0, 0, 256, 256);
  pbCtx.strokeStyle = '#383838';
  pbCtx.lineWidth = 4;
  pbCtx.strokeRect(2, 2, 252, 252);
  const porcelainBump = finalizeBumpTexture(pbC, 8, 8, aniso);

  // 22. Walnut Wood Grain Bump Map
  const [wbC, wbCtx] = makeCanvas(256, 256);
  wbCtx.fillStyle = '#a0a0a0';
  wbCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 3) {
    wbCtx.fillStyle = y % 6 === 0 ? '#555555' : '#d0d0d0';
    wbCtx.fillRect(0, y, 256, 2);
  }
  const walnutBump = finalizeBumpTexture(wbC, 1, 1, aniso);

  // 23. Woven Sofa Fabric Bump Map
  const [fbC, fbCtx] = makeCanvas(128, 128);
  fbCtx.fillStyle = '#888888';
  fbCtx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 128; i += 4) {
    fbCtx.fillStyle = i % 8 === 0 ? '#c8c8c8' : '#585858';
    fbCtx.fillRect(i, 0, 2, 128);
    fbCtx.fillRect(0, i, 128, 2);
  }
  const fabricBump = finalizeBumpTexture(fbC, 6, 6, aniso);

  // 24. Corrugated Cardboard Delivery Box Texture (Brownie's Stealth Tank!)
  const [boxC, boxCtx] = makeCanvas(256, 256);
  boxCtx.fillStyle = '#b48758';
  boxCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 4) {
    boxCtx.fillStyle = y % 8 === 0 ? 'rgba(85,54,28,0.12)' : 'rgba(235,205,165,0.08)';
    boxCtx.fillRect(0, y, 256, 2);
  }
  boxCtx.fillStyle = 'rgba(218,196,158,0.55)';
  boxCtx.fillRect(108, 0, 40, 256); // packing tape strip
  boxCtx.strokeStyle = '#332418';
  boxCtx.lineWidth = 3;
  boxCtx.beginPath();
  boxCtx.moveTo(42, 185);
  boxCtx.quadraticCurveTo(128, 224, 214, 182);
  boxCtx.stroke();
  const cardboardBox = finalizeColorTexture(boxC, 1, 1, aniso);

  // 25. Glowing Sofa Laptop Screen (Code + Chat Window)
  const [lapC, lapCtx] = makeCanvas(256, 160);
  lapCtx.fillStyle = '#111827';
  lapCtx.fillRect(0, 0, 256, 160);
  lapCtx.fillStyle = '#1f2937';
  lapCtx.fillRect(0, 0, 256, 18);
  lapCtx.fillStyle = '#ef4444';
  lapCtx.fillRect(8, 6, 6, 6);
  lapCtx.fillStyle = '#f59e0b';
  lapCtx.fillRect(18, 6, 6, 6);
  lapCtx.fillStyle = '#10b981';
  lapCtx.fillRect(28, 6, 6, 6);
  const codeCols = ['#60a5fa', '#fbbf24', '#34d399', '#c084fc', '#e5e7eb'];
  for (let row = 0; row < 12; row++) {
    lapCtx.fillStyle = codeCols[row % codeCols.length];
    lapCtx.fillRect(18 + ((row * 13) % 24), 28 + row * 10, 48 + ((row * 37) % 130), 5);
  }
  const laptopScreen = finalizeColorTexture(lapC, 1, 1, aniso);

  // 26. Study Dual Monitor Screen
  const [stC, stCtx] = makeCanvas(256, 160);
  stCtx.fillStyle = '#0c1524';
  stCtx.fillRect(0, 0, 256, 160);
  stCtx.fillStyle = '#16243d';
  stCtx.fillRect(10, 12, 70, 136);
  stCtx.fillRect(88, 12, 158, 92);
  stCtx.fillStyle = '#0f1c30';
  stCtx.fillRect(88, 110, 158, 38);
  for (let i = 0; i < 8; i++) {
    stCtx.fillStyle = i % 2 === 0 ? '#38bdf8' : '#a7f3d0';
    stCtx.fillRect(98, 22 + i * 9, 40 + ((i * 29) % 95), 4);
  }
  const studyScreen = finalizeColorTexture(stC, 1, 1, aniso);

  // 27. Living Room TV Idle Screen (Warm Lo-Fi Sunset Album Visual)
  const [tvMC, tvMCtx] = makeCanvas(512, 288);
  const tvG = tvMCtx.createLinearGradient(0, 0, 512, 288);
  tvG.addColorStop(0, '#1e162b');
  tvG.addColorStop(0.55, '#592836');
  tvG.addColorStop(1, '#c96f38');
  tvMCtx.fillStyle = tvG;
  tvMCtx.fillRect(0, 0, 512, 288);
  tvMCtx.fillStyle = '#ffd27d';
  tvMCtx.beginPath();
  tvMCtx.arc(256, 148, 56, 0, Math.PI * 2);
  tvMCtx.fill();
  tvMCtx.fillStyle = 'rgba(255,255,255,0.85)';
  tvMCtx.font = 'bold 22px sans-serif';
  tvMCtx.fillText('EVENING LO-FI · APT 4B', 132, 252);
  const tvScreenMusic = finalizeColorTexture(tvMC, 1, 1, aniso);

  // 28. Living Room Cat TV Channel (Birbs & Fish!)
  const [tvCC, tvCCtx] = makeCanvas(512, 288);
  const skyG = tvCCtx.createLinearGradient(0, 0, 0, 288);
  skyG.addColorStop(0, '#5ec4f2');
  skyG.addColorStop(0.65, '#a8e4ff');
  skyG.addColorStop(0.66, '#488c3a');
  skyG.addColorStop(1, '#2c6122');
  tvCCtx.fillStyle = skyG;
  tvCCtx.fillRect(0, 0, 512, 288);
  // Stylized bright birbs + seed tray for Brownie to ekekek at
  for (const [bx, by, col] of [
    [155, 118, '#f59e0b'],
    [270, 142, '#ef4444'],
    [372, 108, '#3b82f6'],
  ] as Array<[number, number, string]>) {
    tvCCtx.fillStyle = col;
    tvCCtx.beginPath();
    tvCCtx.ellipse(bx, by, 24, 16, -0.2, 0, Math.PI * 2);
    tvCCtx.fill();
    tvCCtx.beginPath();
    tvCCtx.arc(bx + 18, by - 12, 11, 0, Math.PI * 2);
    tvCCtx.fill();
    tvCCtx.fillStyle = '#fde047';
    tvCCtx.beginPath();
    tvCCtx.moveTo(bx + 28, by - 14);
    tvCCtx.lineTo(bx + 38, by - 10);
    tvCCtx.lineTo(bx + 28, by - 6);
    tvCCtx.fill();
  }
  tvCCtx.fillStyle = '#18181b';
  tvCCtx.fillRect(20, 20, 152, 34);
  tvCCtx.fillStyle = '#fde047';
  tvCCtx.font = 'bold 18px sans-serif';
  tvCCtx.fillText('CAT TV · BIRBS', 32, 43);
  const tvScreenCatTv = finalizeColorTexture(tvCC, 1, 1, aniso);

  // 29. Soft Grounding Contact Shadow Disc
  const [shC, shCtx] = makeCanvas(128, 128);
  const shG = shCtx.createRadialGradient(64, 64, 8, 64, 64, 62);
  shG.addColorStop(0, 'rgba(8, 10, 14, 0.56)');
  shG.addColorStop(0.55, 'rgba(8, 10, 14, 0.24)');
  shG.addColorStop(1, 'rgba(8, 10, 14, 0)');
  shCtx.fillStyle = shG;
  shCtx.fillRect(0, 0, 128, 128);
  const contactShadow = finalizeColorTexture(shC, 1, 1, aniso);
  contactShadow.wrapS = THREE.ClampToEdgeWrapping;
  contactShadow.wrapT = THREE.ClampToEdgeWrapping;

  // 30. Luxury Corridor Checkered Granite Tile (warm cream & dark charcoal with brass seam)
  const [corC, corCtx] = makeCanvas(256, 256);
  corCtx.fillStyle = '#d4c9b8';
  corCtx.fillRect(0, 0, 128, 128);
  corCtx.fillRect(128, 128, 128, 128);
  corCtx.fillStyle = '#332f2e';
  corCtx.fillRect(128, 0, 128, 128);
  corCtx.fillRect(0, 128, 128, 128);
  for (let i = 0; i < 60; i++) {
    corCtx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    corCtx.fillRect(Math.random() * 252, Math.random() * 252, 6, 4);
  }
  corCtx.strokeStyle = 'rgba(185, 148, 92, 0.55)';
  corCtx.lineWidth = 3;
  corCtx.strokeRect(1.5, 1.5, 253, 253);
  corCtx.beginPath();
  corCtx.moveTo(128, 0);
  corCtx.lineTo(128, 256);
  corCtx.moveTo(0, 128);
  corCtx.lineTo(256, 128);
  corCtx.stroke();
  const corridorTile = finalizeColorTexture(corC, 5, 5, aniso);

  return {
    porcelainTile,
    porcelainBump,
    balconyTile,
    bathroomTile,
    subwayTile,
    blackMosaicTile,
    tealPlaster,
    walnutWood,
    walnutBump,
    mustardFabric,
    fabricBump,
    burgundyLeather,
    wavyRug,
    brickArt,
    orangeStripedCurtain,
    blackGoldCurtain,
    terracottaPot,
    cardboardBox,
    laptopScreen,
    studyScreen,
    tvScreenMusic,
    tvScreenCatTv,
    contactShadow,
    tabbyFur,
    brownieFaceFur,
    ruffFur,
    furBump,
    furAlphaTuft,
    brownieEye,
    glowHalo,
    cityWindowGrid,
    corridorTile,
    dispose: () => {
      porcelainTile.dispose();
      porcelainBump.dispose();
      balconyTile.dispose();
      bathroomTile.dispose();
      subwayTile.dispose();
      blackMosaicTile.dispose();
      tealPlaster.dispose();
      walnutWood.dispose();
      walnutBump.dispose();
      mustardFabric.dispose();
      fabricBump.dispose();
      burgundyLeather.dispose();
      wavyRug.dispose();
      brickArt.dispose();
      orangeStripedCurtain.dispose();
      blackGoldCurtain.dispose();
      terracottaPot.dispose();
      cardboardBox.dispose();
      laptopScreen.dispose();
      studyScreen.dispose();
      tvScreenMusic.dispose();
      tvScreenCatTv.dispose();
      contactShadow.dispose();
      tabbyFur.dispose();
      brownieFaceFur.dispose();
      ruffFur.dispose();
      furBump.dispose();
      furAlphaTuft.dispose();
      brownieEye.dispose();
      glowHalo.dispose();
      cityWindowGrid.dispose();
      corridorTile.dispose();
    },
  };
}
