import * as THREE from 'three';

export type HoomanId = 'Atharva' | 'Shruti';

export type HoomanMode =
  | 'sofa_laptop'
  | 'study_desk'
  | 'kitchen_counter'
  | 'washbasin'
  | 'balcony_plants'
  | 'walking'
  | 'reacting'
  | 'shaken'
  | 'answering_neighbor'
  | 'sleeping'
  | 'patrol_flashlight';

export interface HoomanWaypoint {
  mode: HoomanMode;
  pos: THREE.Vector3;
  lookYaw: number;
  duration: number;
}

const _hDir = new THREE.Vector3();
const _hPrev = new THREE.Vector3();
const _hStep = new THREE.Vector3();
const _hLook = new THREE.Vector3();

export class HoomanNPC {
  public readonly id: HoomanId;
  public readonly root = new THREE.Group();
  public readonly shoulderAnchor = new THREE.Object3D();
  public readonly flashlight: THREE.SpotLight;
  public readonly flashlightTarget = new THREE.Object3D();

  public mode: HoomanMode = 'sofa_laptop';
  public currentWaypointIdx = 0;
  public modeTimer = 8;
  public reactionTimer = 0;
  public targetPos = new THREE.Vector3();
  public targetYaw = 0;
  public investigateTarget: THREE.Vector3 | null = null;
  public investigateTimer = 0;

  private readonly bodyGroup = new THREE.Group();
  private readonly headGroup = new THREE.Group();
  private readonly armL = new THREE.Group();
  private readonly armR = new THREE.Group();
  private readonly legL = new THREE.Group();
  private readonly legR = new THREE.Group();
  private readonly shadowDisc: THREE.Mesh | null = null;
  private readonly waypoints: HoomanWaypoint[];
  private readonly sleepSpotPos = new THREE.Vector3(-1.6, 0, -9.04);
  private sleepYaw = 0;
  private walkingToBed = false;
  private distractionTimer = 0;
  private walkPhase = 0;
  private stuckTimer = 0;

  constructor(id: HoomanId, waypoints: HoomanWaypoint[], contactShadowTex?: THREE.Texture) {
    this.id = id;
    this.waypoints = waypoints;
    this.root.name = `Hooman_${id}`;

    if (contactShadowTex) {
      const shMat = new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      });
      this.shadowDisc = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.68), shMat);
      this.shadowDisc.rotation.x = -Math.PI / 2;
      this.shadowDisc.position.y = 0.009;
      this.root.add(this.shadowDisc);
    }

    const isAtharva = id === 'Atharva';
    const skinMat = new THREE.MeshStandardMaterial({ color: isAtharva ? 0xc68e68 : 0xd29c78, roughness: 0.68 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x161416, roughness: 0.82 });
    const topMat = new THREE.MeshStandardMaterial({
      color: isAtharva ? 0x2b3e54 : 0x22252d, // Atharva slate pullover / Shruti sleek black top
      roughness: 0.84,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: isAtharva ? 0x22262e : 0x1c1e24,
      roughness: 0.88,
    });
    const sneakerMat = new THREE.MeshStandardMaterial({ color: 0xebe4d8, roughness: 0.65 });

    this.root.add(this.bodyGroup);

    // Sculpted Tapered Legs & Sneakers (bottom pivot y = 0)
    const legPts = [
      new THREE.Vector2(0.048, 0.0),
      new THREE.Vector2(0.058, 0.34),
      new THREE.Vector2(0.072, 0.68),
      new THREE.Vector2(0.068, 0.76),
    ];
    const legGeo = new THREE.LatheGeometry(legPts, 14);
    const buildLeg = (x: number, group: THREE.Group) => {
      group.position.set(x, 0.82, 0);
      const limb = new THREE.Mesh(legGeo, pantsMat);
      limb.position.y = -0.76;
      limb.castShadow = true;
      group.add(limb);

      const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.11, 6, 10), sneakerMat);
      shoe.rotation.x = Math.PI / 2;
      shoe.scale.set(1.0, 1.0, 0.72);
      shoe.position.set(0, -0.78, 0.04);
      shoe.castShadow = true;
      group.add(shoe);
      this.bodyGroup.add(group);
    };
    buildLeg(-0.105, this.legL);
    buildLeg(0.105, this.legR);

    // Sculpted Torso (Lathe profile for tailored shoulders, chest & waist)
    const torsoPts = isAtharva
      ? [
          new THREE.Vector2(0.145, 0),
          new THREE.Vector2(0.148, 0.24),
          new THREE.Vector2(0.188, 0.46),
          new THREE.Vector2(0.16, 0.56),
          new THREE.Vector2(0.065, 0.6),
        ]
      : [
          new THREE.Vector2(0.132, 0),
          new THREE.Vector2(0.118, 0.24),
          new THREE.Vector2(0.155, 0.45),
          new THREE.Vector2(0.138, 0.54),
          new THREE.Vector2(0.055, 0.58),
        ];
    const torsoGeo = new THREE.LatheGeometry(torsoPts, 18);
    const torso = new THREE.Mesh(torsoGeo, topMat);
    torso.scale.set(1.12, 1.0, 0.72);
    torso.position.y = 0.82;
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.12, 12), skinMat);
    neck.position.y = 1.44;
    this.bodyGroup.add(neck);

    // Back-jump shoulder anchor
    this.shoulderAnchor.position.set(0, 1.38, -0.16);
    this.bodyGroup.add(this.shoulderAnchor);

    // Sculpted Tapered Arms
    const armPts = [
      new THREE.Vector2(0.032, 0),
      new THREE.Vector2(0.044, 0.22),
      new THREE.Vector2(0.054, 0.44),
    ];
    const armGeo = new THREE.LatheGeometry(armPts, 12);
    const buildArm = (x: number, group: THREE.Group) => {
      group.position.set(x, 1.34, 0);
      const shoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.056, 10, 8), topMat);
      group.add(shoulderCap);
      const sleeve = new THREE.Mesh(armGeo, isAtharva ? topMat : skinMat);
      sleeve.position.y = -0.44;
      sleeve.castShadow = true;
      group.add(sleeve);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), skinMat);
      hand.scale.set(0.85, 1.15, 0.75);
      hand.position.y = -0.46;
      group.add(hand);
      this.bodyGroup.add(group);
    };
    buildArm(isAtharva ? -0.23 : -0.195, this.armL);
    buildArm(isAtharva ? 0.23 : 0.195, this.armR);

    // Sculpted Head + Expressive Eyes + Hair
    this.headGroup.position.set(0, isAtharva ? 1.59 : 1.56, 0.015);
    this.bodyGroup.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.118, 18, 16), skinMat);
    head.scale.set(0.92, 1.08, 0.96);
    head.castShadow = true;
    this.headGroup.add(head);

    // Subtle nose & brows
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.032, 6), skinMat);
    nose.rotation.x = Math.PI * 0.35;
    nose.position.set(0, -0.006, 0.114);
    this.headGroup.add(nose);

    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xfbfaf7 });
    const eyeIrisMat = new THREE.MeshBasicMaterial({ color: 0x2a1b12 });
    for (const sx of [-0.038, 0.038]) {
      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), eyeWhiteMat);
      sclera.scale.set(1.15, 0.82, 0.5);
      sclera.position.set(sx, 0.015, 0.105);
      this.headGroup.add(sclera);

      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 8, 8), eyeIrisMat);
      pupil.position.set(sx, 0.015, 0.112);
      this.headGroup.add(pupil);

      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.006, 0.008), hairMat);
      brow.position.set(sx, 0.034, 0.108);
      brow.rotation.z = sx < 0 ? 0.08 : -0.08;
      this.headGroup.add(brow);
    }

    if (isAtharva) {
      // Layered dark hair + sleek rectangular glasses
      const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 14), hairMat);
      hairTop.scale.set(0.96, 0.82, 1.02);
      hairTop.position.set(0, 0.038, -0.012);
      this.headGroup.add(hairTop);

      const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e222b, metalness: 0.55, roughness: 0.25 });
      for (const sx of [-0.038, 0.038]) {
        const lens = new THREE.Mesh(
          new THREE.PlaneGeometry(0.036, 0.02),
          new THREE.MeshBasicMaterial({ color: 0x9fc4e8, transparent: true, opacity: 0.24 }),
        );
        lens.position.set(sx, 0.014, 0.12);
        this.headGroup.add(lens);
        const rimTop = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.005, 0.008), glassMat);
        rimTop.position.set(sx, 0.026, 0.118);
        this.headGroup.add(rimTop);
        const rimBot = rimTop.clone();
        rimBot.position.y = 0.002;
        this.headGroup.add(rimBot);
        const outerSide = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.026, 0.008), glassMat);
        outerSide.position.set(sx + (sx < 0 ? -0.02 : 0.02), 0.014, 0.118);
        this.headGroup.add(outerSide);
        const innerSide = outerSide.clone();
        innerSide.position.x = sx + (sx < 0 ? 0.02 : -0.02);
        this.headGroup.add(innerSide);
        const templeArm = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.004, 0.11), glassMat);
        templeArm.position.set(sx + (sx < 0 ? -0.02 : 0.02), 0.022, 0.064);
        this.headGroup.add(templeArm);
      }
      const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.005, 0.006), glassMat);
      bridge.position.set(0, 0.018, 0.118);
      this.headGroup.add(bridge);
    } else {
      // Shruti: Long flowing dark hair framing shoulders + back cascade!
      const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.124, 16, 14), hairMat);
      hairCrown.scale.set(0.98, 0.92, 1.04);
      hairCrown.position.set(0, 0.025, -0.016);
      this.headGroup.add(hairCrown);

      const hairBack = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, 0.26, 8, 12), hairMat);
      hairBack.scale.set(1.12, 1.0, 0.65);
      hairBack.position.set(0, -0.11, -0.078);
      this.headGroup.add(hairBack);

      for (const sx of [-0.088, 0.088]) {
        const strand = new THREE.Mesh(new THREE.CapsuleGeometry(0.034, 0.2, 6, 10), hairMat);
        strand.position.set(sx, -0.095, 0.018);
        this.headGroup.add(strand);
      }
    }

    // Midnight Phone Flashlight (off during Evening)
    this.flashlight = new THREE.SpotLight(0xfff4dd, 0, 9.5, Math.PI / 5.2, 0.45, 1.5);
    this.flashlight.visible = false;
    this.flashlight.position.set(0.22, 1.15, 0.35);
    this.flashlightTarget.position.set(0, 0.15, 3.2);
    this.bodyGroup.add(this.flashlight);
    this.bodyGroup.add(this.flashlightTarget);
    this.flashlight.target = this.flashlightTarget;

    if (waypoints.length > 0) {
      this.root.position.copy(waypoints[0].pos);
      this.root.rotation.y = waypoints[0].lookYaw;
      this.targetPos.copy(waypoints[0].pos);
      this.targetYaw = waypoints[0].lookYaw;
      this.mode = waypoints[0].mode;
      this.modeTimer = waypoints[0].duration;
    }
  }

  public triggerShaken(duration = 2.6) {
    this.mode = 'shaken';
    this.reactionTimer = duration;
  }

  public sendToInvestigate(pos: THREE.Vector3, duration = 4.5, isMidnightPatrol = false) {
    this.investigateTarget = pos.clone();
    this.investigateTimer = duration;
    this.walkingToBed = false;
    this.mode = isMidnightPatrol ? 'patrol_flashlight' : 'reacting';
  }

  public sendToFrontDoorDistraction(duration = 16) {
    this.investigateTarget = null;
    this.walkingToBed = false;
    this.distractionTimer = duration;
    this.flashlight.intensity = 0;
    this.flashlight.visible = false;
    this.mode = 'answering_neighbor';
  }

  public setSleeping(bedPos: THREE.Vector3, bedYaw: number, instant = false) {
    this.investigateTarget = null;
    this.mode = 'sleeping';
    this.sleepSpotPos.copy(bedPos);
    this.sleepYaw = bedYaw;
    this.targetPos.copy(bedPos);
    this.targetYaw = bedYaw;
    this.flashlight.intensity = 0;
    this.flashlight.visible = false;
    if (instant) {
      this.walkingToBed = false;
      this.root.position.copy(bedPos);
      this.root.rotation.y = bedYaw;
      this.bodyGroup.position.y = 0.62;
      this.bodyGroup.rotation.x = -Math.PI / 2;
    } else {
      // Walk naturally through doorways into Bedroom 1 before climbing onto the mattress
      const inBedroom = this.root.position.x < 1.45 && this.root.position.z < -6.9 && this.root.position.z > -11.0;
      this.walkingToBed = !inBedroom;
    }
  }

  private getNextDoorwayStepToBedroom(): THREE.Vector3 {
    const p = this.root.position;
    if (p.x > 3.25 && p.z > -2.6 && p.z < 1.9) {
      // On balcony -> head inside French door
      return _hStep.set(2.9, 0, -0.82);
    }
    if (p.z > -2.75) {
      // In living room -> head through Living-Kitchen archway
      return _hStep.set(2.5, 0, -2.85);
    }
    if (p.z > -6.1) {
      // In kitchen/dining -> head north to back hallway
      return _hStep.set(2.5, 0, -6.5);
    }
    if (p.z < -8.25 && p.x >= 1.8) {
      // In study/bathroom -> head out study door into back hallway
      return _hStep.set(2.5, 0, -7.45);
    }
    if (p.x >= 1.5) {
      // In hallway -> step through Bedroom 1 door
      return _hStep.set(1.25, 0, -7.45);
    }
    // Inside bedroom -> beside foot of bed
    return _hStep.set(0.05, 0, -8.55);
  }

  private getNextDoorwayStepToFrontDoor(): THREE.Vector3 {
    const p = this.root.position;
    if (p.x < 1.75 && p.z < -6.8) {
      return _hStep.set(2.2, 0, -7.45);
    }
    if (p.z < -8.25 && p.x >= 1.8) {
      return _hStep.set(2.5, 0, -7.55);
    }
    if (p.z < -5.85) {
      return _hStep.set(2.5, 0, -5.2);
    }
    if (p.z < -2.75) {
      return _hStep.set(2.5, 0, -2.1);
    }
    if (p.x > 3.25) {
      return _hStep.set(2.8, 0, -0.82);
    }
    return _hStep.set(-2.65, 0, 1.65);
  }

  public update(
    dt: number,
    browniePos: THREE.Vector3,
    isMidnight: boolean,
    canPassThrough: (from: THREE.Vector3, to: THREE.Vector3) => THREE.Vector3,
  ) {
    const t = performance.now() * 0.001;

    if (this.mode === 'sleeping' && !this.walkingToBed) {
      this.flashlight.intensity = THREE.MathUtils.damp(this.flashlight.intensity, 0, 8, dt);
      this.flashlight.visible = this.flashlight.intensity > 0.01;
      if (this.shadowDisc) this.shadowDisc.visible = false;
      this.root.position.lerp(this.sleepSpotPos, 1 - Math.exp(-4.5 * dt));
      this.root.rotation.y = lerpAngle(this.root.rotation.y, this.sleepYaw, 1 - Math.exp(-5 * dt));
      this.bodyGroup.position.y = THREE.MathUtils.damp(this.bodyGroup.position.y, 0.62, 6, dt);
      this.bodyGroup.rotation.x = THREE.MathUtils.damp(this.bodyGroup.rotation.x, -Math.PI / 2, 6, dt);
      this.bodyGroup.rotation.z = THREE.MathUtils.damp(this.bodyGroup.rotation.z, 0, 8, dt);
      this.headGroup.rotation.set(0, 0, 0);
      this.legL.rotation.x = THREE.MathUtils.damp(this.legL.rotation.x, 0, 8, dt);
      this.legR.rotation.x = THREE.MathUtils.damp(this.legR.rotation.x, 0, 8, dt);
      this.armL.rotation.x = THREE.MathUtils.damp(this.armL.rotation.x, -0.18, 8, dt);
      this.armR.rotation.x = THREE.MathUtils.damp(this.armR.rotation.x, -0.18, 8, dt);
      return;
    }

    if (this.shadowDisc) this.shadowDisc.visible = true;
    this.bodyGroup.rotation.x = THREE.MathUtils.damp(this.bodyGroup.rotation.x, 0, 8, dt);

    if (this.mode === 'shaken') {
      this.reactionTimer -= dt;
      this.bodyGroup.position.y = 0;
      this.bodyGroup.rotation.z = Math.sin(t * 20) * 0.14;
      this.armL.rotation.x = -2.2 + Math.sin(t * 18) * 0.4;
      this.armR.rotation.x = -2.2 - Math.sin(t * 18) * 0.4;
      if (this.reactionTimer <= 0) {
        this.bodyGroup.rotation.z = 0;
        const wp = this.waypoints[this.currentWaypointIdx];
        this.mode = wp.mode;
        this.modeTimer = 4;
      }
      return;
    }
    this.bodyGroup.rotation.z = THREE.MathUtils.damp(this.bodyGroup.rotation.z, 0, 10, dt);

    let activeSpeed = 0;
    if (this.mode === 'answering_neighbor') {
      this.distractionTimer -= dt;
      const distToDoor = Math.hypot(this.root.position.x - -2.65, this.root.position.z - 1.65);
      if (distToDoor > 0.32) {
        const navTarget = this.getNextDoorwayStepToFrontDoor();
        _hDir.copy(navTarget).sub(this.root.position);
        _hDir.y = 0;
        if (_hDir.lengthSq() > 1e-6) _hDir.normalize();
        _hPrev.copy(this.root.position);
        const stepPos = _hPrev.clone().addScaledVector(_hDir, 1.9 * dt);
        const next = canPassThrough(this.root.position, stepPos);
        this.root.position.copy(next);
        this.targetYaw = Math.atan2(_hDir.x, _hDir.z);
        activeSpeed = 1.9;
      } else {
        this.targetYaw = -Math.PI / 2;
      }
      if (this.distractionTimer <= 0) {
        if (isMidnight) {
          this.setSleeping(this.sleepSpotPos, this.sleepYaw, false);
        } else {
          const wp = this.waypoints[this.currentWaypointIdx];
          this.mode = wp.mode;
        }
      }
    } else if (this.mode === 'sleeping' && this.walkingToBed) {
      const inBedroom = this.root.position.x < 1.35 && this.root.position.z < -6.9 && this.root.position.z > -10.9;
      if (inBedroom && Math.hypot(this.root.position.x - 0.05, this.root.position.z - -8.55) < 0.75) {
        this.walkingToBed = false;
      } else {
        const navTarget = this.getNextDoorwayStepToBedroom();
        _hDir.copy(navTarget).sub(this.root.position);
        _hDir.y = 0;
        if (_hDir.lengthSq() > 1e-6) _hDir.normalize();
        _hPrev.copy(this.root.position);
        const stepPos = _hPrev.clone().addScaledVector(_hDir, 1.85 * dt);
        const next = canPassThrough(this.root.position, stepPos);
        this.root.position.copy(next);
        this.targetYaw = Math.atan2(_hDir.x, _hDir.z);
        activeSpeed = 1.85;
        if (next.distanceTo(_hPrev) < 0.12 * dt) {
          this.stuckTimer += dt;
          if (this.stuckTimer > 1.8) {
            this.stuckTimer = 0;
            this.walkingToBed = false;
          }
        } else {
          this.stuckTimer = 0;
        }
      }
    } else if (this.investigateTarget) {
      const dist = this.root.position.distanceTo(this.investigateTarget);
      if (dist > 0.75) {
        _hDir.copy(this.investigateTarget).sub(this.root.position);
        _hDir.y = 0;
        if (_hDir.lengthSq() > 1e-6) _hDir.normalize();
        _hPrev.copy(this.root.position);
        _hStep.copy(this.root.position).addScaledVector(_hDir, (isMidnight ? 1.55 : 1.75) * dt);
        const next = canPassThrough(this.root.position, _hStep);
        this.root.position.copy(next);
        this.targetYaw = Math.atan2(_hDir.x, _hDir.z);
        activeSpeed = 1.6;
        if (next.distanceTo(_hPrev) < 0.15 * dt) {
          this.stuckTimer += dt;
          if (this.stuckTimer > 2.2) {
            this.investigateTarget = null;
            this.stuckTimer = 0;
            if (isMidnight) {
              this.setSleeping(this.sleepSpotPos, this.sleepYaw, false);
            }
          }
        } else {
          this.stuckTimer = 0;
        }
      } else {
        this.stuckTimer = 0;
        this.investigateTimer -= dt;
        _hLook.copy(browniePos).sub(this.root.position);
        const baseYaw = Math.atan2(_hLook.x, _hLook.z);
        this.targetYaw = baseYaw + (isMidnight ? Math.sin(t * 1.9) * 0.65 : 0);
        if (this.investigateTimer <= 0) {
          this.investigateTarget = null;
          if (isMidnight) {
            this.setSleeping(this.sleepSpotPos, this.sleepYaw, false);
          } else {
            const wp = this.waypoints[this.currentWaypointIdx];
            this.mode = wp.mode;
          }
        }
      }
    } else if (!isMidnight && this.waypoints.length > 0) {
      const wp = this.waypoints[this.currentWaypointIdx];
      const dist = this.root.position.distanceTo(wp.pos);
      if (dist > 0.22) {
        _hDir.copy(wp.pos).sub(this.root.position);
        _hDir.y = 0;
        if (_hDir.lengthSq() > 1e-6) _hDir.normalize();
        _hPrev.copy(this.root.position);
        _hStep.copy(this.root.position).addScaledVector(_hDir, 1.35 * dt);
        const next = canPassThrough(this.root.position, _hStep);
        this.root.position.copy(next);
        this.targetYaw = Math.atan2(_hDir.x, _hDir.z);
        activeSpeed = 1.35;
        if (next.distanceTo(_hPrev) < 0.15 * dt) {
          this.stuckTimer += dt;
          if (this.stuckTimer > 2.4) {
            this.stuckTimer = 0;
            this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.waypoints.length;
            this.modeTimer = this.waypoints[this.currentWaypointIdx].duration;
          }
        } else {
          this.stuckTimer = 0;
        }
      } else {
        this.stuckTimer = 0;
        this.mode = wp.mode;
        this.targetYaw = wp.lookYaw;
        this.modeTimer -= dt;
        if (this.modeTimer <= 0) {
          this.currentWaypointIdx = (this.currentWaypointIdx + 1) % this.waypoints.length;
          this.modeTimer = this.waypoints[this.currentWaypointIdx].duration;
        }
      }
    }

    const wantLight = isMidnight && this.mode === 'patrol_flashlight' ? 5.5 : 0;
    this.flashlight.intensity = THREE.MathUtils.damp(this.flashlight.intensity, wantLight, 8, dt);
    this.flashlight.visible = this.flashlight.intensity > 0.01;

    this.root.rotation.y = lerpAngle(this.root.rotation.y, this.targetYaw, 1 - Math.exp(-7 * dt));

    let hipDrop = 0;
    let legSit = 0;
    let armTargetX = 0;

    if (activeSpeed > 0.1) {
      this.walkPhase += dt * 7.2;
      const s = Math.sin(this.walkPhase);
      this.legL.rotation.x = s * 0.45;
      this.legR.rotation.x = -s * 0.45;
      this.armL.rotation.x = -s * 0.35;
      this.armR.rotation.x = isMidnight ? -0.95 : s * 0.35;
    } else {
      if (this.mode === 'sofa_laptop' || this.mode === 'study_desk') {
        hipDrop = -0.34;
        legSit = -1.25;
        armTargetX = -0.85 + Math.sin(t * 7) * 0.05;
      } else if (this.mode === 'kitchen_counter' || this.mode === 'washbasin') {
        armTargetX = -0.7 + Math.sin(t * 3.5) * 0.12;
      } else if (this.mode === 'patrol_flashlight') {
        armTargetX = -1.05;
      } else if (this.mode === 'answering_neighbor') {
        armTargetX = -0.85 + Math.sin(t * 9.5) * 0.35;
      }
      this.legL.rotation.x = THREE.MathUtils.damp(this.legL.rotation.x, legSit, 10, dt);
      this.legR.rotation.x = THREE.MathUtils.damp(this.legR.rotation.x, legSit, 10, dt);
      this.armL.rotation.x = THREE.MathUtils.damp(this.armL.rotation.x, armTargetX, 10, dt);
      this.armR.rotation.x = THREE.MathUtils.damp(
        this.armR.rotation.x,
        this.mode === 'patrol_flashlight' ? -1.15 : armTargetX,
        10,
        dt,
      );
    }

    this.bodyGroup.position.y = THREE.MathUtils.damp(this.bodyGroup.position.y, hipDrop, 10, dt);

    const distToCat = this.root.position.distanceTo(browniePos);
    if (distToCat < 2.6 && activeSpeed < 0.1 && this.mode !== 'sleeping') {
      _hLook.copy(browniePos).sub(this.root.position);
      const localAngle = Math.atan2(_hLook.x, _hLook.z) - this.root.rotation.y;
      const wrapped = Math.atan2(Math.sin(localAngle), Math.cos(localAngle));
      this.headGroup.rotation.y = THREE.MathUtils.damp(
        this.headGroup.rotation.y,
        THREE.MathUtils.clamp(wrapped, -0.65, 0.65),
        8,
        dt,
      );
      this.headGroup.rotation.x = THREE.MathUtils.damp(this.headGroup.rotation.x, 0.32, 8, dt);
    } else {
      this.headGroup.rotation.y = THREE.MathUtils.damp(this.headGroup.rotation.y, 0, 6, dt);
      this.headGroup.rotation.x = THREE.MathUtils.damp(this.headGroup.rotation.x, 0, 6, dt);
    }
  }
}

function lerpAngle(a: number, b: number, t: number): number {
  const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + diff * t;
}
