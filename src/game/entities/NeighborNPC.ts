import * as THREE from 'three';

export type NeighborMode = 'inside_idle' | 'answering_door' | 'annoyed_chase' | 'shaken' | 'complaining_at_404';

export interface NeighborConfig {
  id: 'Neighbor 402' | 'Neighbor 401';
  homePos: THREE.Vector3;
  thresholdPos: THREE.Vector3;
  corridorWayPos: THREE.Vector3;
  returnDoorPos: THREE.Vector3;
  door404ComplaintPos?: THREE.Vector3;
  chaseBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  doorIsSouthSide: boolean; // true = inside is +Z (402 at z > 4.4); false = inside is -Z (401 at z < -2.6)
  idleYaw: number;
  shirtColor: number;
  sashColor: number;
  pantsColor: number;
  hairColor: number;
  femaleHair?: boolean;
  hasMustache?: boolean;
  hasGlasses?: boolean;
}

const DEFAULT_402_CONFIG: NeighborConfig = {
  id: 'Neighbor 402',
  homePos: new THREE.Vector3(-5.35, 0, 6.2),
  thresholdPos: new THREE.Vector3(-5.4, 0, 5.15),
  corridorWayPos: new THREE.Vector3(-5.4, 0, 3.85),
  returnDoorPos: new THREE.Vector3(-5.4, 0, 4.95),
  door404ComplaintPos: new THREE.Vector3(-3.72, 0, 1.65),
  chaseBounds: { minX: -8.2, maxX: 0.85, minZ: 4.9, maxZ: 11.0 },
  doorIsSouthSide: true,
  idleYaw: Math.PI,
  shirtColor: 0x73262e,
  sashColor: 0x451419,
  pantsColor: 0xd9d2c5,
  hairColor: 0xd4d2cf,
  femaleHair: false,
  hasMustache: true,
  hasGlasses: true,
};

const _nDir = new THREE.Vector3();
const _nPrev = new THREE.Vector3();
const _nStep = new THREE.Vector3();
const _nLook = new THREE.Vector3();

export class NeighborNPC {
  public readonly id: 'Neighbor 402' | 'Neighbor 401';
  public readonly root = new THREE.Group();
  public readonly shoulderAnchor = new THREE.Object3D();

  public mode: NeighborMode = 'inside_idle';
  public doorOpenTimer = 0;
  public shooCooldown = 0;

  private readonly cfg: NeighborConfig;
  private readonly bodyGroup = new THREE.Group();
  private readonly headGroup = new THREE.Group();
  private readonly armL = new THREE.Group();
  private readonly armR = new THREE.Group();
  private readonly legL = new THREE.Group();
  private readonly legR = new THREE.Group();

  private readonly homePos: THREE.Vector3;
  private readonly thresholdPos: THREE.Vector3;
  private readonly corridorWayPos: THREE.Vector3;
  private readonly returnDoorPos: THREE.Vector3;
  private readonly door404ComplaintPos: THREE.Vector3;
  private targetPos = new THREE.Vector3();
  private targetYaw: number;
  private reactionTimer = 0;
  private complaintTimer = 0;
  private walkPhase = 0;
  private returningFromComplaint = false;

  constructor(contactShadowTex?: THREE.Texture, config?: Partial<NeighborConfig>) {
    this.cfg = {
      ...DEFAULT_402_CONFIG,
      ...config,
      chaseBounds: config?.chaseBounds ?? DEFAULT_402_CONFIG.chaseBounds,
    };
    this.id = this.cfg.id;
    this.homePos = this.cfg.homePos.clone();
    this.thresholdPos = this.cfg.thresholdPos.clone();
    this.corridorWayPos = this.cfg.corridorWayPos.clone();
    this.returnDoorPos = this.cfg.returnDoorPos.clone();
    this.door404ComplaintPos = (this.cfg.door404ComplaintPos ?? new THREE.Vector3(-3.72, 0, 1.65)).clone();
    this.targetPos.copy(this.homePos);
    this.targetYaw = this.cfg.idleYaw;

    this.root.name = this.id.replace(/\s+/g, '_');
    this.root.position.copy(this.homePos);
    this.root.rotation.y = this.cfg.idleYaw;

    if (contactShadowTex) {
      const shMat = new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      });
      const shDisc = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.68), shMat);
      shDisc.rotation.x = -Math.PI / 2;
      shDisc.position.y = 0.009;
      this.root.add(shDisc);
    }

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc28a66, roughness: 0.7 });
    const hairMat = new THREE.MeshStandardMaterial({ color: this.cfg.hairColor, roughness: 0.85 });
    const kurtaMat = new THREE.MeshStandardMaterial({ color: this.cfg.shirtColor, roughness: 0.86 });
    const pajamaMat = new THREE.MeshStandardMaterial({ color: this.cfg.pantsColor, roughness: 0.9 });
    const slipperMat = new THREE.MeshStandardMaterial({ color: 0x2c3645, roughness: 0.72 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xc8a452, metalness: 0.75, roughness: 0.25 });

    this.root.add(this.bodyGroup);

    // Legs & cozy house slippers
    const legGeo = new THREE.CylinderGeometry(0.068, 0.056, 0.76, 10);
    for (const [lx, grp] of [
      [-0.105, this.legL],
      [0.105, this.legR],
    ] as Array<[number, THREE.Group]>) {
      grp.position.set(lx, 0.8, 0);
      const limb = new THREE.Mesh(legGeo, pajamaMat);
      limb.position.y = -0.38;
      limb.castShadow = true;
      grp.add(limb);

      const slipper = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.055, 0.19), slipperMat);
      slipper.position.set(0, -0.77, 0.035);
      slipper.castShadow = true;
      grp.add(slipper);
      this.bodyGroup.add(grp);
    }

    // Cozy long-kurta / bathrobe torso
    const torsoScaleX = this.cfg.femaleHair ? 1.02 : 1.12;
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.195, 0.78, 14), kurtaMat);
    torso.scale.set(torsoScaleX, 1.0, 0.76);
    torso.position.y = 1.05;
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    const robeSash = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.184, 0.07, 14),
      new THREE.MeshStandardMaterial({ color: this.cfg.sashColor, roughness: 0.9 }),
    );
    robeSash.scale.set(torsoScaleX, 1.0, 0.78);
    robeSash.position.y = 0.96;
    this.bodyGroup.add(robeSash);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.06, 0.11, 10), skinMat);
    neck.position.y = 1.47;
    this.bodyGroup.add(neck);

    this.shoulderAnchor.position.set(0, 1.4, -0.17);
    this.bodyGroup.add(this.shoulderAnchor);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.046, 0.036, 0.44, 10);
    for (const [ax, grp] of [
      [-0.215, this.armL],
      [0.215, this.armR],
    ] as Array<[number, THREE.Group]>) {
      grp.position.set(ax, 1.35, 0);
      const sleeve = new THREE.Mesh(armGeo, kurtaMat);
      sleeve.position.y = -0.22;
      sleeve.castShadow = true;
      grp.add(sleeve);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 8), skinMat);
      hand.position.y = -0.45;
      grp.add(hand);
      this.bodyGroup.add(grp);
    }

    // Head + hair + optional mustache/spectacles/bun
    this.headGroup.position.set(0, 1.61, 0.015);
    this.bodyGroup.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.118, 16, 14), skinMat);
    head.scale.set(0.95, 1.06, 0.96);
    head.castShadow = true;
    this.headGroup.add(head);

    if (this.cfg.femaleHair) {
      const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.125, 14, 12), hairMat);
      hairCap.scale.set(1.04, 0.92, 1.05);
      hairCap.position.set(0, 0.024, -0.016);
      this.headGroup.add(hairCap);

      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), hairMat);
      bun.position.set(0, 0.06, -0.125);
      this.headGroup.add(bun);

      for (const sx of [-0.086, 0.086]) {
        const sideDrop = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.08), hairMat);
        sideDrop.position.set(sx, -0.04, 0.01);
        this.headGroup.add(sideDrop);
      }
    } else {
      const hairBack = new THREE.Mesh(new THREE.SphereGeometry(0.125, 14, 12), hairMat);
      hairBack.scale.set(1.0, 0.78, 1.02);
      hairBack.position.set(0, 0.036, -0.02);
      this.headGroup.add(hairBack);
    }

    if (this.cfg.hasMustache) {
      const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.02, 0.025), hairMat);
      mustache.position.set(0, -0.03, 0.112);
      this.headGroup.add(mustache);
    }

    for (const sx of [-0.038, 0.038]) {
      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.011, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x1c1410 }),
      );
      eye.position.set(sx, 0.015, 0.11);
      this.headGroup.add(eye);

      if (this.cfg.hasGlasses) {
        const frame = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.0032, 6, 14), rimMat);
        frame.position.set(sx, 0.015, 0.12);
        this.headGroup.add(frame);
      }

      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.009, 0.01), hairMat);
      brow.position.set(sx, 0.038, 0.108);
      brow.rotation.z = sx < 0 ? -0.18 : 0.18;
      this.headGroup.add(brow);
    }
  }

  public onDoorbellRung() {
    if (this.mode === 'complaining_at_404') return;
    this.mode = 'answering_door';
    this.doorOpenTimer = 20;
    this.targetPos.copy(this.thresholdPos);
    this.targetYaw = this.cfg.idleYaw;
  }

  public startComplainAt404(duration = 16) {
    this.mode = 'complaining_at_404';
    this.complaintTimer = duration;
    this.doorOpenTimer = duration + 6;
    this.returningFromComplaint = false;
  }

  public triggerShaken(duration = 2.8) {
    this.mode = 'shaken';
    this.reactionTimer = duration;
    this.shooCooldown = 4.0;
  }

  public reset() {
    this.mode = 'inside_idle';
    this.doorOpenTimer = 0;
    this.shooCooldown = 0;
    this.reactionTimer = 0;
    this.complaintTimer = 0;
    this.returningFromComplaint = false;
    this.root.position.copy(this.homePos);
    this.root.rotation.y = this.cfg.idleYaw;
    this.bodyGroup.rotation.set(0, 0, 0);
  }

  public update(
    dt: number,
    browniePos: THREE.Vector3,
    brownieInsideFlat: boolean,
    canPassThrough: (from: THREE.Vector3, to: THREE.Vector3) => THREE.Vector3,
  ) {
    const t = performance.now() * 0.001;
    this.shooCooldown = Math.max(0, this.shooCooldown - dt);

    if (this.mode === 'shaken') {
      this.reactionTimer -= dt;
      this.bodyGroup.rotation.z = Math.sin(t * 20) * 0.14;
      this.armL.rotation.x = -2.2 + Math.sin(t * 18) * 0.35;
      this.armR.rotation.x = -2.2 - Math.sin(t * 18) * 0.35;
      if (this.reactionTimer <= 0) {
        this.bodyGroup.rotation.z = 0;
        this.mode = brownieInsideFlat ? 'annoyed_chase' : 'answering_door';
      }
      return;
    }
    this.bodyGroup.rotation.z = THREE.MathUtils.damp(this.bodyGroup.rotation.z, 0, 10, dt);

    if (this.mode === 'complaining_at_404') {
      this.doorOpenTimer = 4;
      if (!this.returningFromComplaint) {
        const stillInside = this.cfg.doorIsSouthSide ? this.root.position.z > 4.2 : this.root.position.z < -2.4;
        if (stillInside) {
          this.targetPos.copy(this.corridorWayPos);
        } else {
          this.targetPos.copy(this.door404ComplaintPos);
        }
        const dDoor = this.root.position.distanceTo(this.door404ComplaintPos);
        if (dDoor < 0.28) {
          this.complaintTimer -= dt;
          if (this.complaintTimer <= 0) {
            this.returningFromComplaint = true;
          }
        }
      } else {
        const stillInCorridor = this.cfg.doorIsSouthSide ? this.root.position.z < 4.55 : this.root.position.z > -2.85;
        if (stillInCorridor) {
          this.targetPos.copy(this.returnDoorPos);
        } else {
          this.targetPos.copy(this.homePos);
          if (this.root.position.distanceTo(this.homePos) < 0.28) {
            this.returningFromComplaint = false;
            this.mode = 'inside_idle';
            this.doorOpenTimer = 0;
          }
        }
      }
    } else if (brownieInsideFlat) {
      this.mode = 'annoyed_chase';
      this.doorOpenTimer = Math.max(this.doorOpenTimer, 14);
    } else if (this.mode === 'annoyed_chase') {
      this.mode = 'answering_door';
      this.doorOpenTimer = 10;
    }

    if (this.mode === 'answering_door') {
      this.doorOpenTimer -= dt;
      this.targetPos.copy(this.thresholdPos);
      if (this.doorOpenTimer <= 0) {
        this.mode = 'inside_idle';
      }
    } else if (this.mode === 'annoyed_chase') {
      this.targetPos.set(
        THREE.MathUtils.clamp(browniePos.x, this.cfg.chaseBounds.minX, this.cfg.chaseBounds.maxX),
        0,
        THREE.MathUtils.clamp(browniePos.z, this.cfg.chaseBounds.minZ, this.cfg.chaseBounds.maxZ),
      );
    } else if (this.mode === 'inside_idle') {
      this.targetPos.copy(this.homePos);
    }

    let activeSpeed = 0;
    const dist = this.root.position.distanceTo(this.targetPos);
    const stopDist = this.mode === 'annoyed_chase' ? 0.72 : 0.18;
    if (dist > stopDist) {
      _nDir.copy(this.targetPos).sub(this.root.position);
      _nDir.y = 0;
      if (_nDir.lengthSq() > 1e-6) _nDir.normalize();
      _nPrev.copy(this.root.position);
      const spd = this.mode === 'annoyed_chase' ? 1.55 : this.mode === 'complaining_at_404' ? 1.65 : 1.35;
      _nStep.copy(this.root.position).addScaledVector(_nDir, spd * dt);
      const next = canPassThrough(this.root.position, _nStep);
      if (this.mode !== 'complaining_at_404') {
        if (this.cfg.doorIsSouthSide) {
          next.z = Math.max(4.78, next.z);
        } else {
          next.z = Math.min(-2.98, next.z);
        }
      }
      this.root.position.copy(next);
      this.targetYaw = Math.atan2(_nDir.x, _nDir.z);
      activeSpeed = spd;
    } else if (this.mode === 'complaining_at_404' && !this.returningFromComplaint) {
      // Face East toward 404 Front Door while arguing
      this.targetYaw = Math.PI / 2;
    } else {
      _nLook.copy(browniePos).sub(this.root.position);
      if (this.mode !== 'inside_idle' && _nLook.lengthSq() > 0.01) {
        this.targetYaw = Math.atan2(_nLook.x, _nLook.z);
      } else {
        this.targetYaw = this.cfg.idleYaw;
      }
    }

    this.root.rotation.y = lerpAngle(this.root.rotation.y, this.targetYaw, 1 - Math.exp(-8 * dt));

    if (activeSpeed > 0.1) {
      this.walkPhase += dt * 7.8;
      const s = Math.sin(this.walkPhase);
      this.legL.rotation.x = s * 0.44;
      this.legR.rotation.x = -s * 0.44;
      this.armL.rotation.x = this.mode === 'annoyed_chase' ? -1.45 + s * 0.35 : -s * 0.35;
      this.armR.rotation.x = this.mode === 'annoyed_chase' ? -1.45 - s * 0.35 : s * 0.35;
    } else {
      const wave =
        this.mode === 'complaining_at_404'
          ? -1.8 + Math.sin(t * 11) * 0.55
          : this.mode !== 'inside_idle'
            ? -1.6 + Math.sin(t * 9) * 0.45
            : -0.15;
      this.legL.rotation.x = THREE.MathUtils.damp(this.legL.rotation.x, 0, 10, dt);
      this.legR.rotation.x = THREE.MathUtils.damp(this.legR.rotation.x, 0, 10, dt);
      this.armL.rotation.x = THREE.MathUtils.damp(this.armL.rotation.x, wave, 10, dt);
      this.armR.rotation.x = THREE.MathUtils.damp(
        this.armR.rotation.x,
        this.mode !== 'inside_idle' ? -wave - 1.9 : -0.15,
        10,
        dt,
      );
    }
  }
}

function lerpAngle(a: number, b: number, t: number): number {
  const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + diff * t;
}
