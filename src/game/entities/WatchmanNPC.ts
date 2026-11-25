import * as THREE from 'three';

export type WatchmanMode = 'patrol' | 'alert_chase' | 'shaken';

const _wDir = new THREE.Vector3();
const _wStep = new THREE.Vector3();
const _wLook = new THREE.Vector3();

export class WatchmanNPC {
  public readonly id = 'Watchman';
  public readonly root = new THREE.Group();
  public readonly shoulderAnchor = new THREE.Object3D();

  public mode: WatchmanMode = 'patrol';
  public shooCooldown = 0;

  private readonly bodyGroup = new THREE.Group();
  private readonly headGroup = new THREE.Group();
  private readonly armL = new THREE.Group();
  private readonly armR = new THREE.Group();
  private readonly legL = new THREE.Group();
  private readonly legR = new THREE.Group();

  private readonly patrolPoints = [
    new THREE.Vector3(-5.8, -11.5, 2.2),
    new THREE.Vector3(-9.2, -11.5, 1.4),
    new THREE.Vector3(-12.6, -11.5, 0.2),
    new THREE.Vector3(-11.4, -11.5, -2.5),
    new THREE.Vector3(-7.6, -11.5, -1.8),
  ];
  private wpIndex = 0;
  private waitTimer = 2.5;
  private targetYaw = -Math.PI / 2;
  private reactionTimer = 0;
  private walkPhase = 0;
  private readonly investigateTarget = new THREE.Vector3();
  private investigateTimer = 0;
  private investigateUrgent = false;

  constructor(contactShadowTex?: THREE.Texture) {
    this.root.name = 'Watchman_Tiwari';
    this.root.position.copy(this.patrolPoints[0]);
    this.root.rotation.y = -Math.PI / 2;

    if (contactShadowTex) {
      const shMat = new THREE.MeshBasicMaterial({
        map: contactShadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      });
      const shDisc = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), shMat);
      shDisc.rotation.x = -Math.PI / 2;
      shDisc.position.y = 0.009;
      this.root.add(shDisc);
    }

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xb97d58, roughness: 0.72 });
    const khakiMat = new THREE.MeshStandardMaterial({ color: 0x8d7b54, roughness: 0.85 });
    const khakiDarkMat = new THREE.MeshStandardMaterial({ color: 0x5c4f36, roughness: 0.88 });
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x1e1a17, roughness: 0.5 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd9b24a, metalness: 0.82, roughness: 0.24 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x1c1d22, roughness: 0.65 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x262425, roughness: 0.88 });

    this.root.add(this.bodyGroup);

    const legGeo = new THREE.CylinderGeometry(0.07, 0.056, 0.76, 10);
    for (const [lx, grp] of [
      [-0.105, this.legL],
      [0.105, this.legR],
    ] as Array<[number, THREE.Group]>) {
      grp.position.set(lx, 0.8, 0);
      const limb = new THREE.Mesh(legGeo, khakiDarkMat);
      limb.position.y = -0.38;
      limb.castShadow = true;
      grp.add(limb);

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.075, 0.2), bootMat);
      boot.position.set(0, -0.76, 0.035);
      boot.castShadow = true;
      grp.add(boot);
      this.bodyGroup.add(grp);
    }

    // Khaki security shirt + belt + brass badge
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.76, 14), khakiMat);
    torso.scale.set(1.12, 1.0, 0.76);
    torso.position.y = 1.06;
    torso.castShadow = true;
    this.bodyGroup.add(torso);

    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.065, 14), beltMat);
    belt.scale.set(1.12, 1.0, 0.78);
    belt.position.y = 0.84;
    this.bodyGroup.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.055, 0.03), brassMat);
    buckle.position.set(0, 0.84, 0.16);
    this.bodyGroup.add(buckle);

    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.015, 8), brassMat);
    badge.rotation.x = Math.PI / 2;
    badge.position.set(0.09, 1.24, 0.145);
    this.bodyGroup.add(badge);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.062, 0.11, 10), skinMat);
    neck.position.y = 1.47;
    this.bodyGroup.add(neck);

    this.shoulderAnchor.position.set(0, 1.4, -0.17);
    this.bodyGroup.add(this.shoulderAnchor);

    const armGeo = new THREE.CylinderGeometry(0.048, 0.038, 0.44, 10);
    for (const [ax, grp] of [
      [-0.225, this.armL],
      [0.225, this.armR],
    ] as Array<[number, THREE.Group]>) {
      grp.position.set(ax, 1.36, 0);
      const sleeve = new THREE.Mesh(armGeo, khakiMat);
      sleeve.position.y = -0.22;
      sleeve.castShadow = true;
      grp.add(sleeve);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), skinMat);
      hand.position.y = -0.45;
      grp.add(hand);
      this.bodyGroup.add(grp);
    }

    // Security Torch in right hand
    const torchBody = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.18, 8), bootMat);
    torchBody.rotation.x = Math.PI / 2;
    torchBody.position.set(0, -0.45, 0.08);
    this.armR.add(torchBody);
    const torchLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.022, 0.03, 8),
      new THREE.MeshBasicMaterial({ color: 0xffe49c }),
    );
    torchLens.rotation.x = Math.PI / 2;
    torchLens.position.set(0, -0.45, 0.18);
    this.armR.add(torchLens);

    // Head + Handlebar Mustache + Peaked Security Cap
    this.headGroup.position.set(0, 1.61, 0.015);
    this.bodyGroup.add(this.headGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 14), skinMat);
    head.scale.set(0.96, 1.05, 0.96);
    head.castShadow = true;
    this.headGroup.add(head);

    const capCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.128, 0.118, 0.085, 14), khakiDarkMat);
    capCrown.position.set(0, 0.085, 0);
    this.headGroup.add(capCrown);

    const capBand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.026, 14), beltMat);
    capBand.position.set(0, 0.055, 0);
    this.headGroup.add(capBand);

    const capVisor = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.016, 0.11), beltMat);
    capVisor.position.set(0, 0.046, 0.1);
    capVisor.rotation.x = 0.16;
    this.headGroup.add(capVisor);

    const capEmblem = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), brassMat);
    capEmblem.position.set(0, 0.09, 0.118);
    this.headGroup.add(capEmblem);

    const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.024, 0.026), hairMat);
    mustache.position.set(0, -0.028, 0.114);
    this.headGroup.add(mustache);

    for (const sx of [-0.036, 0.036]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), new THREE.MeshBasicMaterial({ color: 0x181310 }));
      eye.position.set(sx, 0.015, 0.112);
      this.headGroup.add(eye);
    }
  }

  public triggerShaken(duration = 2.6) {
    this.mode = 'shaken';
    this.reactionTimer = duration;
    this.shooCooldown = 4.2;
    this.investigateTimer = 0;
  }

  public sendToInvestigate(target: THREE.Vector3, duration = 6.0, urgent = false) {
    this.investigateTarget.copy(target);
    this.investigateTarget.y = -11.5;
    this.investigateTimer = duration;
    this.investigateUrgent = urgent;
    if (this.mode !== 'shaken') {
      this.mode = 'alert_chase';
    }
  }

  public reset() {
    this.mode = 'patrol';
    this.wpIndex = 0;
    this.waitTimer = 2.5;
    this.shooCooldown = 0;
    this.reactionTimer = 0;
    this.investigateTimer = 0;
    this.investigateUrgent = false;
    this.root.position.copy(this.patrolPoints[0]);
    this.root.rotation.y = -Math.PI / 2;
    this.bodyGroup.rotation.set(0, 0, 0);
  }

  public update(
    dt: number,
    browniePos: THREE.Vector3,
    brownieOnGroundFloor: boolean,
    canPassThrough: (from: THREE.Vector3, to: THREE.Vector3) => THREE.Vector3,
  ) {
    const t = performance.now() * 0.001;
    this.shooCooldown = Math.max(0, this.shooCooldown - dt);

    if (this.mode === 'shaken') {
      this.reactionTimer -= dt;
      this.bodyGroup.rotation.z = Math.sin(t * 20) * 0.14;
      this.armL.rotation.x = -2.1 + Math.sin(t * 18) * 0.35;
      this.armR.rotation.x = -2.1 - Math.sin(t * 18) * 0.35;
      if (this.reactionTimer <= 0) {
        this.bodyGroup.rotation.z = 0;
        this.mode = brownieOnGroundFloor ? 'alert_chase' : 'patrol';
      }
      return;
    }
    this.bodyGroup.rotation.z = THREE.MathUtils.damp(this.bodyGroup.rotation.z, 0, 10, dt);

    if (this.investigateTimer > 0) {
      this.investigateTimer = Math.max(0, this.investigateTimer - dt);
    }

    const distToCat = this.root.position.distanceTo(browniePos);
    if (brownieOnGroundFloor && distToCat < 4.8 && browniePos.x < -7.5) {
      this.mode = 'alert_chase';
    } else if (this.investigateTimer > 0) {
      this.mode = 'alert_chase';
    } else if (this.mode === 'alert_chase' && (!brownieOnGroundFloor || distToCat > 6.5)) {
      this.mode = 'patrol';
    }

    const chasingCat = brownieOnGroundFloor && distToCat < 4.8 && browniePos.x < -7.5;
    const goal =
      this.mode === 'alert_chase'
        ? chasingCat
          ? _wLook.set(
              THREE.MathUtils.clamp(browniePos.x, -19.8, -5.2),
              -11.5,
              THREE.MathUtils.clamp(browniePos.z, -6.5, 6.5),
            )
          : this.investigateTarget
        : this.patrolPoints[this.wpIndex];

    let activeSpeed = 0;
    const dist = this.root.position.distanceTo(goal);
    const stopDist = this.mode === 'alert_chase' ? 0.78 : 0.22;

    if (dist > stopDist) {
      _wDir.copy(goal).sub(this.root.position);
      _wDir.y = 0;
      if (_wDir.lengthSq() > 1e-6) _wDir.normalize();
      const spd = this.mode === 'alert_chase' ? (this.investigateUrgent ? 1.8 : 1.52) : 1.08;
      _wStep.copy(this.root.position).addScaledVector(_wDir, spd * dt);
      const next = canPassThrough(this.root.position, _wStep);
      next.y = -11.5;
      this.root.position.copy(next);
      this.targetYaw = Math.atan2(_wDir.x, _wDir.z);
      activeSpeed = spd;
    } else if (this.mode === 'patrol') {
      this.waitTimer -= dt;
      if (this.waitTimer <= 0) {
        this.wpIndex = (this.wpIndex + 1) % this.patrolPoints.length;
        this.waitTimer = 2.8;
      }
    } else {
      _wLook.copy(browniePos).sub(this.root.position);
      if (_wLook.lengthSq() > 0.01) {
        this.targetYaw = Math.atan2(_wLook.x, _wLook.z);
      }
    }

    this.root.rotation.y = lerpAngle(this.root.rotation.y, this.targetYaw, 1 - Math.exp(-7 * dt));

    if (activeSpeed > 0.1) {
      this.walkPhase += dt * 7.2;
      const s = Math.sin(this.walkPhase);
      this.legL.rotation.x = s * 0.42;
      this.legR.rotation.x = -s * 0.42;
      this.armL.rotation.x = -s * 0.32;
      this.armR.rotation.x = this.mode === 'alert_chase' ? -1.35 : -0.75 + s * 0.18;
    } else {
      this.legL.rotation.x = THREE.MathUtils.damp(this.legL.rotation.x, 0, 10, dt);
      this.legR.rotation.x = THREE.MathUtils.damp(this.legR.rotation.x, 0, 10, dt);
      this.armL.rotation.x = THREE.MathUtils.damp(this.armL.rotation.x, -0.15, 10, dt);
      this.armR.rotation.x = THREE.MathUtils.damp(this.armR.rotation.x, -0.85, 10, dt);
    }
  }
}

function lerpAngle(a: number, b: number, t: number): number {
  const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + diff * t;
}
