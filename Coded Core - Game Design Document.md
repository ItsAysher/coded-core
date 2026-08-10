# Coded Core

## Game design document

**Document status:** Pre-production design and combat-math specification  
**Target:** Microsoft MakeCode Arcade, TypeScript  
**Genre:** 2D mission-based mech action / buildcraft game  
**Inspiration:** *Armored Core VI: Fires of Rubicon*  
**Project type:** Non-commercial fan-made spinoff concept

> **Fan-project notice:** *Coded Core* is an unofficial fan work inspired by *Armored Core VI*. Armored Core and related names, designs, characters, and settings belong to their respective rights holders. A public release should use original names, art, audio, factions, dialogue, and part designs, and should avoid implying endorsement by FromSoftware or Bandai Namco.

---

## 1. High concept

*Coded Core* translates the speed, stagger combat, assembly depth, and mission structure of *Armored Core VI* into a readable 2D side-view action game. The player pilots a modular combat mech, accepts short contracts, earns credits and parts, and repeatedly rebuilds the machine to exploit each mission's threats.

The central promise is:

> Build a machine with a purpose, feel every choice in combat, and rebuild when the plan fails.

The game should not attempt to simulate all six degrees of freedom of a 3D Armored Core battle. It should preserve the important decisions instead: range control, boost-energy management, weapon cadence, impact buildup, stagger punishment, armor matching, and meaningful part tradeoffs.

### Design pillars

1. **Assembly is strategy.** Head, core/body, arms, legs, generator, booster, core expansion, and weapons all change how the mech behaves.
2. **Stagger creates rhythm.** Safe pressure builds ACS strain; risky burst damage cashes out a stagger window.
3. **Movement is a resource.** Quick boosts, ascent, and aggressive pursuit compete for a finite EN reserve.
4. **Damage types matter.** Kinetic, energy, and explosive attacks test separate defenses. True/Core damage is rare and bypasses ordinary armor.
5. **2D clarity over literal imitation.** Every retained stat must produce a visible choice on a 160 × 120 screen.

---

## 2. Product scope

### First playable target

- One garage and assembly screen.
- One player mech assembled from interchangeable parts.
- Four weapon channels: right arm, left arm, right shoulder, left shoulder.
- Three short missions and one arena duel.
- Four frame sets with mix-and-match parts.
- Three generators, three boosters, and four core expansions.
- At least twelve weapons covering all damage types and combat roles.
- One boss designed to test defense matching and stagger punishment.

### Full game target

- 12–18 missions, each lasting roughly 3–7 minutes.
- Branching contracts and two endings.
- 8–10 frame families and 40–60 total parts.
- Arena ladder with saved enemy builds.
- Shop, mission rewards, hidden containers, and build presets.
- Local score/time attack rather than online PvP.

### Explicit simplifications

- The internal FCS slot is removed. Lock behavior is standardized, while arm Firearm Specialization governs tracking quality.
- The only internal components are **generator**, **booster**, and **core expansion**, as required by this design.
- Camera control, manual aiming, target-assist modes, repair kits, OS tuning, scan equipment, ammunition cost, and online latency are excluded from the first playable.
- The game uses a side-view arena with limited verticality rather than free 3D flight.

---

## 3. Core play loop

1. Read a contract briefing and inspect forecast damage types.
2. Assemble a mech within weight, arm-load, and EN-output limits.
3. Enter a compact combat mission.
4. Manage range, EN, weapons, heat, and stagger state.
5. Complete optional objectives and earn credits/parts.
6. Review damage received by type and rebuild for the next contract.

The post-mission report should show **kinetic, energy, explosive, and Core damage received**, plus damage prevented by armor, shields, and movement. This turns defense values into understandable feedback instead of invisible arithmetic.

---

## 4. 2D combat model

### Camera and arena

- Fixed side view with a camera that follows the midpoint between the player and current priority target.
- Typical arena: 2–3 screens wide and 1.5–2 screens tall.
- Solid platforms, walls, and limited soft cover.
- Mechs move horizontally, jump, sustain upward thrust, fall, quick-boost, and assault-boost horizontally.
- Enemy arrows at screen edges communicate off-screen threats.

### Proposed controls

MakeCode Arcade has a D-pad, A, B, and Menu, so combat uses contextual chords:

| Input | Action |
|---|---|
| Left / Right | Move; double-tap to face quickly |
| Up / Down | Aim high / low when a target is not centered |
| Tap A + direction | Quick Boost |
| Hold A | Jump, then sustained upward thrust while EN remains |
| B | Right-arm weapon |
| Down + B | Left-arm weapon / melee |
| Up + B | Selected shoulder weapon |
| Tap Menu | Swap the selected shoulder weapon |
| Hold Menu | Core expansion |

The first prototype should test whether tap/hold A is reliable. If it is not, simplify A to jump/thrust and make **Down + A** Quick Boost.

### Lock and aiming

- A soft-lock cone selects the nearest hostile in the mech's facing direction.
- The reticle trails the target. Arm Firearm Specialization determines how quickly it converges.
- Shots fired before convergence use a wider random spread.
- Missiles acquire lock over time; no separate FCS part is required.
- Melee weapons use a short forward lunge and do not require a full lock.

### Combat states

- **Neutral:** normal movement, firing, and EN behavior.
- **Assault Boost:** fast horizontal pursuit; drains EN continuously and increases collision/kick impact.
- **Staggered:** movement and firing disabled briefly; incoming attacks receive their weapon-specific Direct Hit Adjustment.
- **Overheated:** affected weapon/shield cannot be used until cooled.
- **EN depleted:** EN actions are disabled until generator recovery restores a starting amount.
- **Core barrier active:** incoming attacks deplete a temporary pulse barrier before AP.

---

## 5. Assembly system

### Equipment slots

| Category | Slot | Primary influence |
|---|---|---|
| Frame | Head | AP, defenses, attitude stability, system recovery |
| Frame | Core/body | AP, defenses, stability, generator output/supply correction, QB efficiency |
| Frame | Arms | AP, defenses, arm load, recoil control, firearm and melee specialization |
| Frame | Legs | AP, defenses, stability, total load limit, jump behavior, leg archetype |
| Internal | Generator | EN capacity/output/recovery and energy-firearm specialization |
| Internal | Booster | boost thrust, QB thrust/duration/cost/reload, assault thrust |
| Internal | Core expansion | One limited-use active or automatic ability |
| Weapons | 2 arm + 2 shoulder | Damage, impact, range, cadence, weight, EN load |

### Leg archetypes

| Type | 2D identity | Tradeoff |
|---|---|---|
| Biped | Balanced ground and air control | No extreme advantage |
| Reverse joint | High jump and long grounded QB | Lower stability and AP |
| Tetrapod | Can hover and fire heavy weapons without bracing | High EN drain and weight |
| Tank | High AP, load, stability, and ground speed | Weak vertical control; booster is integrated |

### Build validity

A normal build may deploy only if:

```text
TotalWeight <= LegLoadLimit
ArmWeaponWeight <= ArmLoadLimit
TotalENLoad <= FinalENOutput
```

The prototype should block invalid builds rather than reproduce ACVI's optional weight-control exception. The garage must explain which limit failed and preview the smallest part swap that would make the build legal.

---

## 6. ACVI reference model: researched mechanics

This section records the source game's known or community-tested behavior before defining the *Coded Core* implementation. FromSoftware exposes many input statistics but not every internal equation. Therefore:

- **Documented** means described by the game/manual.
- **Tested** means repeatedly measured by community researchers and consistent with observed results.
- **Unknown/hidden** means no reliable complete public formula was found; *Coded Core* uses an explicit replacement.

The reference point used here is ACVI regulation 1.09.1 where the community source identifies it. Balance values may differ from earlier patches, but the relationships below are the relevant design inheritance.

### 6.1 Frame totals

| Derived stat | ACVI relationship | Confidence |
|---|---|---|
| AP | Sum of AP from head + core + arms + legs | Documented |
| Kinetic defense | Sum of kinetic defense from all four frame parts | Documented |
| Energy defense | Sum of energy defense from all four frame parts | Documented |
| Explosive defense | Sum of explosive defense from all four frame parts | Documented |
| Attitude stability | Sum from head + core + legs; arms contribute no stability value | Documented/tested |
| Total weight | Sum of all equipped part and weapon weight | Documented |
| Total EN load | Sum of all equipped part and weapon EN load | Documented |
| Arm weapon load | Combined weight of weapons supported by the arms | Documented |
| Total load | Weight carried against the legs' load limit | Documented |

### 6.2 Armor defense formula

For a non-staggered hit with defense `D` and listed attack power `P`, the tested relationship is:

```text
ArmorFactor(D) = 1 - (D - 1000) / 1000
               = 2 - D / 1000

NormalDamage = P × ArmorFactor(D) × OtherModifiers
```

At the neutral defense value of 1000, the attack deals 100% listed power. Every 10 defense above 1000 reduces the base portion by approximately 1%; 1200 defense yields a factor of 0.80. Defense below 1000 increases damage. The source game has separate `D` values for kinetic, energy, and explosive/burning damage.

Examples before other modifiers:

| Attack power | Matching defense | Armor factor | Damage |
|---:|---:|---:|---:|
| 1000 | 900 | 1.10 | 1100 |
| 1000 | 1000 | 1.00 | 1000 |
| 1000 | 1200 | 0.80 | 800 |
| 1000 | 1400 | 0.60 | 600 |

Coral damage is a special fourth attribute with an effectively fixed defense baseline of 1000 in the tested game state, so ordinary frame defense does not reduce it. Shields can still mitigate it. *Coded Core* renames this **Core damage** to avoid depending on ACVI lore.

### 6.3 Stagger and direct-hit damage

Weapons have **Impact**, **Accumulated Impact**, and **Direct Hit Adjustment** (`DHA`).

- Impact is the immediate ACS load added by a hit.
- After about 1.5 seconds, the transient portion falls away, leaving the weapon's Accumulated Impact.
- Accumulated load begins its main recovery about 5.1 seconds after the last hit; recovery accelerates rather than remaining perfectly linear.
- A target staggers when ACS load reaches its Attitude Stability.
- While staggered, each weapon applies its own Direct Hit Adjustment.

The tested stagger formula can be expressed as:

```text
DirectFactor = DHA / 100 - (D - 1000) / 1000
DirectDamage = P × DirectFactor × OtherModifiers
```

This is algebraically equivalent to the longer community formula in the research source. It means armor still reduces the base portion, but the bonus portion granted by `DHA` is effectively not reduced in the same way. A weapon with `DHA = 220` against defense 1200 uses a factor of `2.20 - 0.20 = 2.00`.

Core damage uses its DHA multiplier but ignores ordinary defense.

### 6.4 Ricochet and range

- Kinetic and energy shots can ricochet when fired beyond a distance supported by their range/penetration versus the target's matching defense.
- A ricochet deals about 5% normal damage and applies no impact or additional status effect.
- Higher defense can move the ricochet boundary closer to the attacker.
- Explosions, melee, Core damage, and selected special attacks do not use ordinary ricochet behavior.
- ACVI publishes Ideal Range and Effective Range, but its complete penetration/range equation is not publicly exposed. This design therefore uses a clear replacement in Section 8.

### 6.5 Damage-source modifiers

Several systems alter weapon power before or after armor:

```text
MeleeMultiplier = (100 + ArmMeleeSpecialization) / 200
EnergyMultiplier = (100 + GeneratorEnergyFirearmSpecialization) / 200
```

At specialization 100, the multiplier is 1.00. At 150, it is 1.25. Arm Firearm Specialization affects tracking, not shot damage. Generator energy specialization applies only to eligible energy firearms, not every weapon that happens to deal energy-like damage.

Generator energy specialization also affects eligible charge/reload time. Community documentation describes the time change as `(100 - specialization)%`, equivalent to this usable factor:

```text
EligibleEnergyTimeFactor = 2 - EnergyFirearmSpecialization / 100
```

At 150 specialization, eligible charge/reload time is 50% of base. This is a strong effect and should be capped more tightly in *Coded Core*.

Other ACVI damage sources/modifiers include:

- normal and charged weapon modes;
- melee attacks and unarmed punches;
- missiles, blast zones, lingering plasma/fire, and multi-hit attacks;
- boost kick, whose power scales with total mech weight and counts as kinetic;
- Assault Armor/core expansion damage;
- forced-discharge status damage;
- mission/NPC and OS-tuning modifiers;
- shields and pulse barriers;
- rare Core/Coral attacks that ignore normal frame armor.

The exact source-game rounding order, all NPC-specific scalars, recoil equation, projectile penetration equation, movement curves, and some weapon exceptions are hidden or incompletely documented. They should not be presented as exact ACVI formulas.

### 6.6 Shields and pulse barriers

- Shields have separate percentage mitigation for AP damage and impact.
- A short Initial Guard window after deployment gives stronger mitigation.
- Shielded impact becomes accumulated impact; this can make blocking a high-transient/low-accumulated attack tactically worse for long-term stagger buildup.
- PA Interference makes certain attacks more effective against shields/pulse defenses.
- Pulse barriers have durability depleted by both time and incoming impact. A useful documented relationship is `durability / duration` as passive durability loss per second; PA Interference increases barrier damage.

### 6.7 Energy system

Known relationships include:

```text
FinalENOutput = GeneratorENOutput × CoreOutputCorrection / 100
ENSurplus = FinalENOutput - TotalENLoad

if ENSurplus <= 1800:
    ENSupplyEfficiency = 1500 + ENSurplus × 25 / 6
else:
    ENSupplyEfficiency = 9000 + (ENSurplus - 1800) × 75 / 17

ENRechargeDelaySeconds =
    1000 / (GeneratorRecharge × CoreSupplyCorrection × 0.01)

ENDepletionRecoveryDelaySeconds =
    1000 / (GeneratorSupplyRecovery × CoreSupplyCorrection × 0.01)

QBENCost = BoosterQBCost × (200 - CoreBoosterEfficiency) / 100
```

Grounded EN recovery per second corresponds to EN Supply Efficiency. Community testing reports much weaker supply while airborne and still weaker recovery during active aerial movement or weapon-bracing actions. Generator EN Capacity alone determines total EN capacity.

### 6.8 Other calculated behavior

- **System recovery:** status buildup is modified by head System Recovery. A useful reading of the tested relation is `StatusBuildupMultiplier = (200 - SystemRecovery) / 100`; 75 means 1.25× buildup and 154 means 0.46×.
- **Stability recovery:** total weight drives recovery; lighter builds recover accumulated impact faster. Community figures place the displayed value at 150 for weight 40,000 or below and 100 near weight 73,330 in regulation 1.09.1. The complete curve is not officially published.
- **Boost/QB speed:** booster thrust and QB thrust are opposed by total weight; grounded QB also benefits from leg jump performance. Complete curves are hidden.
- **QB reload:** the booster's base reload is penalized when total weight exceeds its QB ideal/guaranteed weight.
- **Target tracking:** arms and range-band targeting hardware determine reticle convergence. With FCS removed, *Coded Core* makes this an arm-only calculation.
- **Recoil:** firing builds shared weapon spread; arm Recoil Control resists/reduces it. The exact source equation is not confirmed.
- **Heat:** weapon/shield heat limit is 1000; cooling is approximately heat removed per second. Overheating delays use and may lower cooling performance for some weapon categories.

---

## 7. Coded Core stat specification

### 7.1 Stored part fields

All parts share:

```typescript
interface BasePart {
    id: number
    name: string
    weight: number
    enLoad: number
    price: number
}
```

Frame parts add `ap`, `kineticDefense`, `energyDefense`, and `explosiveDefense`. Head, core, and legs add `stability`. Arms add weapon handling. Internals add only fields relevant to their category.

Use whole-number data in content tables. MakeCode Arcade uses JavaScript numbers internally, but combat outputs should be rounded once at the end of each hit calculation for consistent feedback.

### 7.2 Derived assembly statistics

```text
AP = H.ap + C.ap + A.ap + L.ap

KineticDefense = H.kDef + C.kDef + A.kDef + L.kDef
EnergyDefense   = H.eDef + C.eDef + A.eDef + L.eDef
ExplosiveDefense = H.xDef + C.xDef + A.xDef + L.xDef

AttitudeStability = H.stability + C.stability + L.stability
TotalWeight = sum(weight of every equipped frame, internal, and weapon part)
TotalENLoad = sum(enLoad of every equipped part)
FinalENOutput = floor(Generator.output × Core.outputCorrection / 100)
ENSurplus = FinalENOutput - TotalENLoad
ENCapacity = Generator.capacity
```

Recommended legal defense range is 850–1450. Clamp the runtime armor factor to protect against malformed content, not to erase valid build differences.

### 7.3 Movement replacements for hidden ACVI curves

These are *Coded Core* formulas, not claims about ACVI:

```text
MassRatio = TotalWeight / BoosterIdealWeight

BoostSpeed = clamp(45, 115,
    BoosterThrust / 100 - max(0, MassRatio - 0.70) × 35)

QBSpeed = clamp(90, 190,
    BoosterQBThrust / 100 - max(0, MassRatio - 0.70) × 55
    + LegsGroundQBbonus)

QBReload = BoosterQBReload ×
    (1 + max(0, TotalWeight - BoosterQBIdealWeight)
         / BoosterQBIdealWeight × 1.5)

QBCost = round(BoosterQBCost × (200 - CoreBoosterEfficiency) / 100)
```

Displayed speed is in pixels/second. Content values should be tuned so a light build crosses the 160-pixel screen in roughly 1.5 seconds while boosting, and a heavy build in roughly 2.5–3 seconds.

### 7.4 EN calculations

Use the researched ACVI formulas with a global scale factor for the small screen:

```text
if ENSurplus < 0: build is invalid
else if ENSurplus <= 1800:
    RawSupply = 1500 + ENSurplus × 25 / 6
else:
    RawSupply = 9000 + (ENSurplus - 1800) × 75 / 17

GroundRecoveryPerSecond = round(RawSupply × 0.20)
AirRecoveryPerSecond = round(GroundRecoveryPerSecond × 0.20)

RechargeDelay = 1000 /
    (Generator.recharge × Core.supplyCorrection × 0.01)

DepletionDelay = 1000 /
    (Generator.supplyRecovery × Core.supplyCorrection × 0.01)

DepletionRestore = Generator.postRecoveryEN
```

The air penalty is deliberately 1/5 rather than ACVI's reported 1/10–1/20. A 2D game has less landing space and fewer evasion axes, so a harsher value would over-punish aerial play.

### 7.5 Tracking and recoil replacements

```text
TrackingTimeSeconds = clamp(0.08, 0.60,
    0.50 × 100 / ArmFirearmSpecialization)

RecoilAdded = WeaponRecoil
RecoilRecoveredPerSecond = 4 × ArmRecoilControl
SpreadDegrees = WeaponBaseSpread + CurrentRecoil / 25
CurrentRecoil = clamp(0, 500,
    CurrentRecoil + RecoilAdded - recoveredThisFrame)
```

Both arm weapons add to the same recoil accumulator. Shoulder missiles ignore arm recoil. Heavy direct-fire shoulder weapons contribute to it at 50% so arm choice still matters without making cannon builds unusable.

### 7.6 Specialization

```text
MeleeMultiplier = clamp(0.75, 1.30,
    (100 + ArmMeleeSpecialization) / 200)

EnergyMultiplier = clamp(0.80, 1.25,
    (100 + GeneratorEnergySpecialization) / 200)

EnergyChargeTimeMultiplier = clamp(0.65, 1.25,
    2 - GeneratorEnergySpecialization / 100)
```

The charge-time cap prevents one generator from invalidating weapon timing in a lower-frame-rate game.

### 7.7 System recovery and status

```text
StatusBuildup = round(BaseStatusBuildup ×
    clamp(0.40, 1.40, (200 - HeadSystemRecovery) / 100))
```

Status threshold is 1000. First playable statuses:

- **Shock:** reaching 1000 triggers a burst of Core damage, then resets the gauge.
- **ACS Error:** reaching 1000 reduces Attitude Stability by 25% for 4 seconds.

Camera-jamming is omitted because it is poorly suited to a tiny display.

---

## 8. Damage, defense, and impact pipeline

This is the authoritative *Coded Core* combat order.

### 8.1 Damage types

| Type | Typical sources | Defensive identity |
|---|---|---|
| Kinetic | Rifles, machine guns, shotguns, physical blades, kicks | Accurate pressure; most affected by ricochet |
| Energy | Lasers, plasma, pulse weapons | Strong AP damage; generator specialization; often heat-based |
| Explosive | Missiles, bazookas, grenades, flame zones | Area denial and reliable impact; never ordinary ricochet |
| Core | Prototype weapons, shock discharge, special boss attacks | Ignores frame defenses; rare, telegraphed, low ammo/long cooldown |

### 8.2 Per-hit algorithm

```text
1. Validate collision, allegiance, invulnerability, and shield facing.
2. Resolve ricochet for eligible kinetic/energy projectiles.
3. Resolve source-power modifiers (charge, melee, generator, difficulty).
4. Select matching defense; Core uses 1000.
5. Choose normal or stagger/direct-hit factor.
6. Apply shield damage mitigation if guarding.
7. Round final AP damage once and subtract it.
8. Calculate impact separately.
9. Apply shield impact mitigation / PA Interference.
10. Add status buildup and secondary effects.
11. Test ACS threshold, barrier break, and AP death/Terminal Armor.
```

### 8.3 AP damage formula

```text
SourcePower = BasePower
            × ChargeMultiplier
            × ApplicableSpecialization
            × SourceScalar

DefenseDelta = (MatchingDefense - 1000) / 1000

if DamageType == Core:
    ArmorFactor = 1.0
else if TargetIsStaggered:
    ArmorFactor = DirectHitAdjustment / 100 - DefenseDelta
else:
    ArmorFactor = 1.0 - DefenseDelta

ArmorFactor = clamp(0.05, 3.00, ArmorFactor)

GuardFactor = TargetIsGuarding
    ? 1 - ShieldDamageMitigation / 100
    : 1.0

FinalDamage = max(1,
    round(SourcePower × ArmorFactor × GuardFactor))
```

For Core damage while staggered, use `ArmorFactor = DHA / 100`.

### 8.4 Worked damage examples

**Rifle against balanced armor**

```text
Power 240, kinetic defense 1120, target not staggered
ArmorFactor = 1 - 120 / 1000 = 0.88
Damage = round(240 × 0.88) = 211
```

**Pile weapon as stagger punish**

```text
Power 900, melee specialization 140, DHA 250,
kinetic defense 1250, target staggered

MeleeMultiplier = (100 + 140) / 200 = 1.20
DefenseDelta = 0.25
DirectFactor = 2.50 - 0.25 = 2.25
Damage = round(900 × 1.20 × 2.25) = 2430
```

**Laser into an Initial Guard**

```text
Power 400, energy specialization 120, energy defense 1080,
not staggered, shield IG damage mitigation 80%

EnergyMultiplier = 1.10
ArmorFactor = 0.92
GuardFactor = 0.20
Damage = round(400 × 1.10 × 0.92 × 0.20) = 81
```

### 8.5 Impact/ACS model

Each hit produces a transient layer and a persistent layer:

```text
ImmediateImpactAdded = WeaponImpact
PersistentImpactAdded = WeaponAccumulatedImpact
TransientImpactAdded = max(0, WeaponImpact - WeaponAccumulatedImpact)

DisplayedACS = PersistentACS + TransientACS
```

- Each transient contribution expires 1.5 seconds after its own hit.
- Persistent ACS begins recovery 4.0 seconds after the latest hostile hit. This is shortened from the researched 5.1 seconds for a faster 2D match.
- Recovery rate starts at `StabilityRecovery × 0.5` per second and ramps to `StabilityRecovery × 2.0` over the next 2 seconds.
- A new hit stops the ramp and resets the 4-second recovery delay.
- Stagger occurs when `DisplayedACS >= AttitudeStability`.
- On stagger, transient ACS is cleared, persistent ACS is pinned at the threshold, and the mech is disabled for a base 0.75 seconds plus a 0.65-second vulnerability tail.
- After the tail, ACS resets to 35% of Attitude Stability to prevent immediate restagger loops.

### 8.6 Stability recovery

Use a transparent weight formula:

```text
StabilityRecovery = round(clamp(60, 150,
    210 - TotalWeight / 667))
```

This approximates the known ACVI reference points: 150 around 40,000 weight and 100 around 73,000. The value is not claimed to reproduce the source game's full curve.

### 8.7 Impact while guarding

```text
EffectiveImpact = WeaponImpact

if ShieldActive:
    EffectiveImpact *= PAInterference / 100
    EffectiveImpact *= 1 - ShieldImpactMitigation / 100
    PersistentImpactAdded = EffectiveImpact
    TransientImpactAdded = 0
```

This preserves the original's meaningful shield tradeoff: blocking sharply lowers a hit, but all impact that gets through remains persistent.

### 8.8 Ricochet replacement

Eligible kinetic and energy projectiles have `idealRange`, `effectiveRange`, and `penetration`.

```text
RangePressure = max(0, Distance - IdealRange)
DefensePressure = max(0, MatchingDefense - 1000) × 0.35
PenetrationBudget = WeaponPenetration + max(0, EffectiveRange - Distance)

Ricochet if:
    Distance > IdealRange
    and RangePressure + DefensePressure > PenetrationBudget
```

On ricochet:

```text
FinalDamage = max(1, round(NormalDamage × 0.05))
Impact = 0
StatusBuildup = 0
```

The HUD flashes **RICOCHET** and uses a distinct spark/sound. Explosive, melee, Core, and explicitly piercing weapons bypass this check.

### 8.9 Blast and damage-over-time sources

- Explosions use circular overlap tests and never ricochet.
- At 0–50% blast radius, apply 100% damage/impact.
- At 50–100%, linearly fall to 50% damage and 35% impact.
- Lingering zones tick no faster than 4 times/second to control sprite/event load.
- A target cannot take multiple ticks from the same source in the same 250 ms interval.
- Multi-projectile volleys resolve per projectile, but floating damage numbers combine hits received within 100 ms.

### 8.10 Boost kick

The kick is kinetic and derives power from weight and assault speed:

```text
KickPower = clamp(180, 420,
    120 + TotalWeight / 500 + AssaultSpeed × 0.6)

KickImpact = round(KickPower × 1.25)
KickAccumulatedImpact = round(KickImpact × 0.70)
KickDHA = 220
```

Reverse-joint legs receive `×1.15` kick power and impact. A kick may occur only during Assault Boost and has a brief whiff-recovery window.

---

## 9. Defensive layers

Defense is not one number. The player survives through six interacting layers:

1. **Avoidance:** movement speed, QB speed, QB cost/reload, jump, cover.
2. **Range defense:** ricochet caused by distance plus matching armor.
3. **Typed armor:** kinetic, energy, and explosive defense reduce AP damage.
4. **ACS defense:** attitude stability and weight-based recovery prevent stagger.
5. **Active guard:** shields reduce damage and impact, especially during Initial Guard.
6. **Core expansion:** temporary barrier, projectile clear, zone protection, or lethal-damage insurance.

### Effective durability display

The garage may preview effective AP against each ordinary type:

```text
EffectiveAP(type) = AP / clamp(0.05, 3.0,
    1 - (Defense(type) - 1000) / 1000)
```

This is a comparison tool, not a separate combat stat. Do not combine the three defenses into one misleading "Defense" rating.

### Defense archetypes

- **Light evasive:** low AP/defense, high recovery, cheap fast QB.
- **Kinetic duelist:** high kinetic defense and recoil control; vulnerable to blasts.
- **Energy bulwark:** high energy defense and generator output; heavy core.
- **Explosive siege:** high explosive defense/stability; slow aerial movement.
- **All-rounder:** no pronounced weakness but no exceptional effective AP.

Every frame family should have at least one clear weakness. A fully optimized heavy build may be durable, but it must pay in speed, EN recovery, QB cadence, or target handling.

---

## 10. Core expansions

Only one may be equipped.

| Expansion | 2D effect | Role |
|---|---|---|
| Assault Burst | 60 px close blast + 120 px weak wave; clears normal projectiles; heavy impact; 1 use | Counterattack and stagger punish |
| Pulse Armor | Follows player; 2500 durability; 7 s max; clears ACS when activated before stagger; 1 use | Reset pressure |
| Pulse Shelter | Stationary 48 px barrier; blocks hostile projectiles; 4000 durability; 12 s; 2 uses | Area control / defense mission |
| Terminal Armor | Automatic at lethal AP; hold at 1 AP and gain a 3 s barrier; 1 use | Beginner safety / final gamble |

Barrier durability loss:

```text
PassiveLossPerSecond = BarrierDurability / BarrierDuration
HitLoss = IncomingImpact × PAInterference / 100
```

Assault Burst should interrupt the user's stagger only after its startup completes, leaving counterplay.

---

## 11. Weapon roster principles

Each weapon needs the following combat fields:

```text
damageType, attackPower, impact, accumulatedImpact,
directHitAdjustment, idealRange, effectiveRange, penetration,
recoil, fireInterval, magazine, reloadTime,
heatPerShot, cooling, blastRadius, statusType, statusBuildup,
weight, enLoad, paInterference
```

Unused fields remain zero. Data should live in part-definition tables, not long conditionals.

### First-playable weapons

| Weapon | Type | Combat job |
|---|---|---|
| Compact rifle | Kinetic | Reliable mid-range pressure |
| Machine gun | Kinetic | High accumulated impact; recoil test |
| Shotgun | Kinetic | Close burst, high immediate impact |
| Pile driver | Kinetic melee | Extreme DHA stagger punish |
| Laser pistol | Energy | Efficient AP damage, low impact |
| Charged laser rifle | Energy | Charge timing and line punish |
| Pulse blade | Energy melee | Barrier breaker; high PA Interference |
| Plasma launcher | Energy/explosive behavior | Lingering area denial |
| Micro missiles | Explosive | Tracking pressure |
| Bazooka | Explosive | Slow heavy hit and blast |
| Napalm projector | Explosive | Persistent ground hazard |
| Prototype arc cannon | Core | Rare armor bypass; long cooldown |

### Balance metrics

For internal tuning only:

```text
SustainedDPS = magazineDamage /
    (magazineFireTime + reloadTime)

SustainedImpactPerSecond = magazineAccumulatedImpact /
    (magazineFireTime + reloadTime)

StaggerBurst = impact deliverable within 1.5 seconds
PunishDamage = damage against 1100 defense during one stagger window
```

Do not balance only on theoretical DPS. Projectile speed, range, recoil, blast size, stance lock, heat, EN load, and opportunity to fire all change realized damage.

---

## 12. Garage and player-facing statistics

### Summary panel

Always show:

- AP
- kinetic / energy / explosive defense
- attitude stability and stability recovery
- boost speed, QB speed, QB cost, QB reload
- EN capacity, output, load, surplus, ground recovery, recharge delay
- total weight / load limit
- arm weapon weight / arm load limit

### Comparison behavior

- Green/red deltas compare the highlighted part with the equipped part.
- Changing a part recomputes every derived value immediately.
- The defense panel previews `Effective AP` for each damage type.
- The weapon panel separately labels **AP damage**, **Impact**, **Accumulated Impact**, and **Direct Hit %**.
- A help overlay defines every statistic in one sentence and includes the main formula where useful.
- Mission briefings forecast threats with icons, for example: `High explosive / moderate kinetic / rare Core`.

### Combat HUD

- Player AP bar and number.
- EN bar beneath AP; flashes red during depletion delay.
- ACS bar that changes from yellow to red near stagger.
- Four compact weapon readiness/heat/ammo indicators.
- Enemy AP and ACS only for the current priority target.
- Typed hit flashes: white kinetic, cyan energy, orange explosive, magenta Core.
- Text callouts only for important events: **RICOCHET**, **STAGGER**, **DIRECT HIT**, **OVERHEAT**, **EN EMPTY**.

---

## 13. Missions and encounter design

### Mission pattern

Each contract should test one assembly question:

- Can the build cross exposed space without exhausting EN?
- Can it defeat many low-stability targets efficiently?
- Can it break a pulse barrier?
- Can it survive explosive area denial in a confined arena?
- Can it punish a boss stagger before the window closes?

### Example opening missions

1. **Scrapline Entry** — mixed weak MTs teach lock, boost, and kinetic fire.
2. **Burning Transit** — missile turrets and napalm make explosive defense visible.
3. **Cold Reactor** — energy snipers reward QB timing and energy defense.
4. **Arena: Test Frame 01** — a balanced rival teaches ACS and Direct Hits.
5. **Core Breach** — boss alternates a kinetic pressure phase with telegraphed Core attacks.

### Boss defense design

Bosses may have typed defenses but should not invalidate a whole loadout. A resistant type should normally reduce damage by 25–40%, while a vulnerability increases it by 10–20%. Mechanics such as exposed radiators, shield breaks, or stagger windows should create alternate paths to damage.

Avoid unexplained phase-based damage reduction. If a boss becomes armored, show the plates closing, change hit effects, and update the lock-on icon.

---

## 14. MakeCode Arcade implementation plan

### Architecture

Suggested modules/files:

```text
main.ts                 boot and state transitions
dataParts.ts            immutable part/weapon definitions
assembly.ts             loadout validation and stat derivation
combatDamage.ts         damage, defense, ricochet, impact
combatWeapons.ts        fire/reload/heat state machines
movement.ts             ground, air, QB, AB, EN
enemies.ts              reusable enemy controllers
missions.ts             mission definitions and objectives
garage.ts               assembly UI
hud.ts                  combat and garage displays
save.ts                 unlocks, credits, presets, settings
```

### Runtime representation

- Use numeric IDs instead of object references in save data.
- Keep immutable part definitions in arrays.
- Create one derived `MechStats` object when a build changes; do not recalculate totals every frame.
- Represent damage with a `HitPacket` containing source ID, damage type, power, impact, accumulated impact, DHA, PA interference, status, and flags.
- Pool projectiles and effects where possible.
- Limit simultaneous hostile projectiles and use warning indicators for off-screen attacks.
- Update expensive homing logic on alternating frames.

### Deterministic damage function sketch

```typescript
function resolveDamage(hit: HitPacket, target: MechState): number {
    if (shouldRicochet(hit, target)) {
        return Math.max(1, Math.round(hit.power * 0.05))
    }

    let power = hit.power * sourceMultiplier(hit)
    let defenseDelta = hit.type == DamageType.Core
        ? 0
        : (defenseFor(hit.type, target.stats) - 1000) / 1000

    let factor = target.isStaggered
        ? hit.directHitAdjustment / 100 - defenseDelta
        : 1 - defenseDelta

    factor = Math.max(0.05, Math.min(3, factor))
    let guard = guardDamageFactor(hit, target)
    return Math.max(1, Math.round(power * factor * guard))
}
```

Impact must be resolved separately so a ricochet can correctly return zero impact and a shield can convert surviving impact to persistent ACS.

### Performance targets

- Stable 30 FPS on supported hardware.
- No more than roughly 30 active combat projectiles before pooling/culling.
- No allocation-heavy arrays inside per-frame update handlers.
- Avoid per-pixel collision except for rare boss mechanics; use sprite overlaps and tile collisions.
- Precompute defense and specialization multipliers when assembly changes.

---

## 15. Testing and balancing

### Unit-style formula tests

Create a hidden developer scene that asserts:

- 1000 defense produces 1.00× normal damage.
- 1200 defense produces 0.80× normal damage.
- Core ignores the three frame defenses.
- DHA 220 versus defense 1200 produces a 2.00× factor.
- Ricochet produces 5% damage, zero impact, and zero status.
- A shield applies different AP and impact mitigation.
- Arm melee specialization 100 produces 1.00× and 140 produces 1.20×.
- Energy specialization affects only eligible weapons.
- Pulse barrier loss includes time, impact, and PA Interference.
- Terminal Armor triggers once and leaves exactly 1 AP.

### Combat test room

Provide developer toggles for:

- dummy defense values;
- infinite AP/EN/ammo;
- forced stagger;
- frame-step or slow motion;
- damage/impact event log;
- range markers;
- projectile count and frame time.

### Balance guardrails

- No ordinary defense should reduce a same-tier weapon below 50% without a large mobility cost.
- No legal light build should be deleted from full AP by one uncharged neutral hit.
- A dedicated punish weapon may remove 25–40% AP during stagger but must be hard to land outside it.
- Core damage should remain below 10% of normal sustained player DPS over a full mission.
- Every generator must support at least one coherent build archetype.
- Every leg type must offer a movement or load behavior unavailable to the others.

---

## 16. Research limits and design decisions

This document deliberately separates faithful relationships from invented precision. The ordinary defense and direct-hit formulas, frame summation, energy supply equations, core corrections, specialization relationships, shield behavior, and impact timers have strong community documentation. Exact ACVI movement curves, recoil math, penetration/ricochet thresholds, every modifier's rounding order, and NPC-specific scalars are not fully public.

Accordingly, *Coded Core* should preserve the **shape of the decision** rather than copy opaque constants:

- weight opposes thrust;
- armor is typed and approximately linear around a 1000 baseline;
- stagger rewards high-DHA weapons;
- impact has immediate and persistent components;
- EN output margin controls recovery;
- shield mitigation is separate from frame defense;
- Core damage bypasses normal armor but remains rare;
- hidden ACVI curves are replaced by visible, testable formulas.

---

## 17. Sources

Research was checked on 9 August 2026. Japanese community pages are cited because they contain the clearest formula-level documentation; their formulae and relationships are summarized in English above.

- [FromSoftware — Armored Core VI online manual](https://www.fromsoftware.jp/manual/armoredcore6/ps5/operation.html) — official controls and core actions.
- [Future Press — Armored Core VI Official Pilot's Manual updates](https://www.future-press.com/acvi/updates/) — official-style part fields and post-publication balance updates.
- [Armored Core @ Wiki — ACVI part parameter explanations](https://w.atwiki.jp/armoredcoreforever/pages/751.html) — defense, direct-hit, impact, energy, specialization, shield, and derived-stat formulas; community tested.
- [Armored Core @ Wiki — generators](https://w.atwiki.jp/armoredcoreforever/pages/718.html) — generator roles and special cases; community maintained.
- [Armored Core @ Wiki — shields](https://w.atwiki.jp/armoredcoreforever/pages/734.html) — guard, Initial Guard, impact persistence, PA Interference, and Core/Coral interaction; community maintained.
- [Armored Core @ Wiki — core expansions](https://w.atwiki.jp/armoredcoreforever/pages/753.html) — Assault Armor, Pulse Armor, Pulse Protection, and Terminal Armor behavior; community maintained.
- [Community test — ACVI damage calculations](https://www.reddit.com/r/armoredcore/comments/164xyhl/armored_core_6_damage_calculations/) — independent damage and direct-hit testing; provisional/community source.
- [Azusa Hutahari — ACVI kick damage calculation](https://note.com/azusa_hutahari/n/n0b42a623c3f8?hl=en) — detailed community test of kick scaling and defense/direct-hit behavior.

---

## 18. Definition of a successful prototype

The prototype succeeds when a player can fight the same arena encounter with three visibly different legal builds—a light kinetic skirmisher, an energy duelist, and a heavy explosive platform—and can explain afterward:

- why each build moves differently;
- why the same attack dealt different damage;
- how impact became stagger;
- why the stagger punish was stronger;
- what caused a ricochet;
- how the generator and core changed EN recovery; and
- which part they want to change before retrying.

If those answers are readable from play and the garage, *Coded Core* has retained the essential Armored Core experience despite the move to 2D.
