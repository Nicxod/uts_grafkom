/**
 * ============================================================================
 * BALL VS BALL: RANDOM ARENA — 2D ARCADE FIGHTING GAME
 * 100% Vanilla JavaScript & HTML5 Canvas 2D
 * Self-Contained, Zero External Dependencies, Offline-Ready
 * ============================================================================
 */

(function () {
    'use strict';

    /* ==========================================================================
       1. KONFIGURASI BOLA & SKILL (SESUAI PRD)
       ========================================================================== */
    const BALL_TYPES = {
        fire: {
            id: 'fire',
            name: 'Fire Ball',
            skillName: 'Fire Blast',
            skillDesc: 'Menembakkan proyektil api berdaya ledak (25 DMG)',
            icon: '🔥',
            color: '#ff4500',
            accent: '#ffa500',
            glow: 'rgba(255, 69, 0, 0.6)',
            skill: {
                damage: 25,
                cooldown: 4.0, // detik
                type: 'projectile',
                speed: 550,
                radius: 12,
                color: '#ff5500',
                explosionRadius: 45
            }
        },
        ice: {
            id: 'ice',
            name: 'Ice Ball',
            skillName: 'Ice Freeze',
            skillDesc: 'Menembakkan pecahan es, memperlambat lawan 55% selama 2s (10 DMG)',
            icon: '❄️',
            color: '#00d2ff',
            accent: '#e0f7fa',
            glow: 'rgba(0, 210, 255, 0.6)',
            skill: {
                damage: 10,
                cooldown: 6.0,
                type: 'projectile',
                speed: 500,
                radius: 10,
                color: '#80d8ff',
                slowDuration: 2.0,
                slowMultiplier: 0.45 // memperlambat 55%
            }
        },
        thunder: {
            id: 'thunder',
            name: 'Thunder Ball',
            skillName: 'Lightning Strike',
            skillDesc: 'Sambaran petir cepat seketika ke posisi lawan (20 DMG)',
            icon: '⚡',
            color: '#ffd600',
            accent: '#ffffff',
            glow: 'rgba(255, 214, 0, 0.7)',
            skill: {
                damage: 20,
                cooldown: 3.0,
                type: 'instant_strike',
                color: '#ffea00'
            }
        },
        shield: {
            id: 'shield',
            name: 'Shield Ball',
            skillName: 'Energy Shield',
            skillDesc: 'Mengurangi damage masuk sebesar 50% selama 2 detik',
            icon: '🛡️',
            color: '#00e676',
            accent: '#b9f6ca',
            glow: 'rgba(0, 230, 118, 0.6)',
            skill: {
                damage: 0,
                cooldown: 6.0,
                type: 'buff',
                duration: 2.0,
                reduction: 0.50
            }
        },
        poison: {
            id: 'poison',
            name: 'Poison Ball',
            skillName: 'Toxic Burst',
            skillDesc: 'Menembakkan racun beracun (total 20 DMG selama 3s)',
            icon: '☠️',
            color: '#b388ff',
            accent: '#e040fb',
            glow: 'rgba(179, 136, 255, 0.6)',
            skill: {
                damage: 20, // 4 ticks x 5 damage
                cooldown: 5.0,
                type: 'dot',
                ticks: 4,
                interval: 0.75,
                tickDamage: 5
            }
        },
        dash: {
            id: 'dash',
            name: 'Dash Ball',
            skillName: 'Power Dash',
            skillDesc: 'Menerjang kencang ke depan; memberikan 15 DMG jika mengenai lawan',
            icon: '💨',
            color: '#ff9100',
            accent: '#ffe57f',
            glow: 'rgba(255, 145, 0, 0.7)',
            skill: {
                damage: 15,
                cooldown: 3.0,
                type: 'dash',
                duration: 0.35,
                speedMultiplier: 3.6
            }
        },
        heal: {
            id: 'heal',
            name: 'Heal Ball',
            skillName: 'Healing Pulse',
            skillDesc: 'Memulihkan 15 HP sendiri (maksimal 100 HP)',
            icon: '💚',
            color: '#00c853',
            accent: '#69f0ae',
            glow: 'rgba(0, 200, 83, 0.6)',
            skill: {
                damage: 0,
                heal: 15,
                cooldown: 7.0,
                type: 'heal'
            }
        },
        shadow: {
            id: 'shadow',
            name: 'Shadow Ball',
            skillName: 'Shadow Strike',
            skillDesc: 'Tebasan bayangan cepat berjarak pendek (18 DMG)',
            icon: '🌑',
            color: '#7c4dff',
            accent: '#b388ff',
            glow: 'rgba(124, 77, 255, 0.7)',
            skill: {
                damage: 18,
                cooldown: 4.0,
                type: 'slash',
                range: 160
            }
        }
    };

    const BALL_KEYS = Object.keys(BALL_TYPES);

    /* ==========================================================================
       2. PROCEDURAL SOUND SYNTHESIZER (WEB AUDIO API — 100% OFFLINE)
       ========================================================================== */
    class SoundManager {
        constructor() {
            this.ctx = null;
            this.muted = false;
        }

        init() {
            if (!this.ctx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.ctx = new AudioContextClass();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
            if (this.muted || !this.ctx) return;
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {
                // AudioContext safely ignored if unsupported
            }
        }

        btnClick() {
            this.init();
            this.playTone(600, 'sine', 0.08, 0.1);
        }

        cardRoll() {
            this.init();
            this.playTone(300 + Math.random() * 400, 'triangle', 0.04, 0.08);
        }

        matchStart() {
            this.init();
            if (this.muted || !this.ctx) return;
            [440, 554, 659, 880].forEach((freq, i) => {
                setTimeout(() => this.playTone(freq, 'square', 0.12, 0.12), i * 120);
            });
        }

        ballBounce() {
            this.playTone(180, 'sine', 0.07, 0.12);
        }

        skillFire() {
            if (this.muted || !this.ctx) return;
            this.playTone(220, 'sawtooth', 0.25, 0.18);
        }

        skillIce() {
            if (this.muted || !this.ctx) return;
            this.playTone(900, 'sine', 0.3, 0.15);
        }

        skillThunder() {
            if (this.muted || !this.ctx) return;
            this.playTone(700, 'sawtooth', 0.15, 0.25);
            setTimeout(() => this.playTone(200, 'square', 0.2, 0.2), 80);
        }

        skillShield() {
            this.playTone(400, 'sine', 0.4, 0.16);
        }

        skillPoison() {
            this.playTone(280, 'triangle', 0.3, 0.15);
        }

        skillDash() {
            this.playTone(320, 'sawtooth', 0.2, 0.18);
        }

        skillHeal() {
            if (this.muted || !this.ctx) return;
            [523, 659, 784, 1046].forEach((f, i) => {
                setTimeout(() => this.playTone(f, 'sine', 0.18, 0.12), i * 90);
            });
        }

        skillShadow() {
            this.playTone(180, 'sawtooth', 0.22, 0.2);
        }

        hitImpact() {
            this.playTone(120, 'square', 0.12, 0.2);
        }

        ballKO() {
            if (this.muted || !this.ctx) return;
            this.playTone(90, 'sawtooth', 0.5, 0.35);
            setTimeout(() => this.playTone(60, 'square', 0.4, 0.3), 120);
        }

        victory() {
            if (this.muted || !this.ctx) return;
            const melody = [523, 659, 784, 1046];
            melody.forEach((f, i) => {
                setTimeout(() => this.playTone(f, 'triangle', 0.25, 0.2), i * 140);
            });
        }
    }

    const sfx = new SoundManager();

    /* ==========================================================================
       3. PARTIKEL & VISUAL EFFECTS ENGINE
       ========================================================================== */
    class Particle {
        constructor(x, y, vx, vy, color, radius, life, shape = 'circle', alphaDecay = true) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.color = color;
            this.radius = radius;
            this.maxLife = life;
            this.life = life;
            this.shape = shape;
            this.alphaDecay = alphaDecay;
        }

        update(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.life -= dt;
            this.vx *= 0.96;
            this.vy *= 0.96;
            return this.life > 0;
        }

        draw(ctx) {
            const alpha = Math.max(0, this.alphaDecay ? this.life / this.maxLife : 1);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            if (this.shape === 'circle') {
                ctx.arc(this.x, this.y, Math.max(1, this.radius * (this.life / this.maxLife)), 0, Math.PI * 2);
                ctx.fill();
            } else if (this.shape === 'ring') {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2.5;
                ctx.arc(this.x, this.y, this.radius * (1 + (1 - this.life / this.maxLife) * 1.8), 0, Math.PI * 2);
                ctx.stroke();
            } else if (this.shape === 'spark') {
                ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
            }
            ctx.restore();
        }
    }

    class FloatingText {
        constructor(text, x, y, color = '#ffffff', fontSize = 18, vy = -45) {
            this.text = text;
            this.x = x;
            this.y = y;
            this.color = color;
            this.fontSize = fontSize;
            this.vy = vy;
            this.life = 0.9;
            this.maxLife = 0.9;
        }

        update(dt) {
            this.y += this.vy * dt;
            this.life -= dt;
            return this.life > 0;
        }

        draw(ctx) {
            const alpha = Math.max(0, this.life / this.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = `900 ${this.fontSize}px system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = this.color;
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 6;
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }
    }

    /* ==========================================================================
       4. LOGIKA ENTITAS BOLA (BALL FIGHTER)
       ========================================================================== */
    class BallFighter {
        constructor(playerNum, x, y, config) {
            this.playerNum = playerNum; // 1 or 2
            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
            this.radius = 26;
            this.baseSpeed = 260; // pixel/detik
            this.friction = 0.88;

            // Stats
            this.hp = 100;
            this.maxHp = 100;
            this.config = config; // ball type config

            // Cooldown & Status
            this.cooldownTimer = 0;
            this.isAlive = true;

            // Status Effects
            this.shieldTimer = 0;
            this.slowTimer = 0;
            this.poisonTimer = 0;
            this.poisonTicksLeft = 0;
            this.poisonTickInterval = 0;
            this.dashTimer = 0;
            this.dashDir = { x: playerNum === 1 ? 1 : -1, y: 0 };
            this.facing = { x: playerNum === 1 ? 1 : -1, y: 0 };

            // Damage stats
            this.totalDamageDealt = 0;
            this.skillsUsed = 0;

            // Hit Flash
            this.hitFlashTimer = 0;

            // Visual afterimage trail for dash
            this.trail = [];
        }

        resetForRound(newConfig, x, y) {
            this.config = newConfig;
            this.x = x;
            this.y = y;
            this.vx = 0;
            this.vy = 0;
            this.hp = 100;
            this.isAlive = true;
            this.cooldownTimer = 0;
            this.shieldTimer = 0;
            this.slowTimer = 0;
            this.poisonTimer = 0;
            this.poisonTicksLeft = 0;
            this.dashTimer = 0;
            this.facing = { x: this.playerNum === 1 ? 1 : -1, y: 0 };
            this.trail = [];
        }

        applyDamage(rawDamage, opponent, game) {
            if (!this.isAlive) return 0;

            let actualDamage = rawDamage;
            if (this.shieldTimer > 0) {
                actualDamage = Math.round(rawDamage * (1 - this.config.skill.reduction));
                game.addFloatingText('BLOCKED!', this.x, this.y - 35, '#00e676', 16);
            }

            this.hp = Math.max(0, this.hp - actualDamage);
            this.hitFlashTimer = 0.12;
            game.triggerCameraShake(6);
            sfx.hitImpact();

            // Partikel Hit Spark
            game.createHitSparks(this.x, this.y, opponent.config.color, 12);

            // Floating text
            game.addFloatingText(`-${actualDamage}`, this.x, this.y - 20, '#ff3366', 22);

            if (opponent) {
                opponent.totalDamageDealt += actualDamage;
            }

            return actualDamage;
        }

        applyHeal(amount, game) {
            if (!this.isAlive) return;
            const oldHp = this.hp;
            this.hp = Math.min(this.maxHp, this.hp + amount);
            const healed = this.hp - oldHp;
            if (healed > 0) {
                game.addFloatingText(`+${healed}`, this.x, this.y - 25, '#00f59b', 20);
                sfx.skillHeal();
            }
        }

        update(dt, inputDir, arena, opponent, game) {
            if (!this.isAlive) return;

            // 1. Cooldown update
            if (this.cooldownTimer > 0) {
                this.cooldownTimer = Math.max(0, this.cooldownTimer - dt);
            }

            // 2. Timers status effect
            if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;
            if (this.shieldTimer > 0) this.shieldTimer -= dt;

            // Slow Timer
            let currentSpeed = this.baseSpeed;
            if (this.slowTimer > 0) {
                this.slowTimer -= dt;
                currentSpeed *= 0.45; // 55% slow
                if (Math.random() < 0.25) {
                    game.particles.push(new Particle(this.x + (Math.random() - 0.5) * 20, this.y + (Math.random() - 0.5) * 20, 0, -15, '#80d8ff', 3, 0.4));
                }
            }

            // Poison Damage Over Time
            if (this.poisonTicksLeft > 0) {
                this.poisonTickInterval -= dt;
                if (this.poisonTickInterval <= 0) {
                    this.poisonTicksLeft--;
                    this.poisonTickInterval = 0.75;
                    this.hp = Math.max(0, this.hp - 5);
                    this.hitFlashTimer = 0.08;
                    game.addFloatingText('-5 POISON', this.x, this.y - 25, '#d500f9', 15);
                    game.createHitSparks(this.x, this.y, '#b388ff', 6);
                    if (opponent) opponent.totalDamageDealt += 5;
                }
            }

            // 3. Movement Physics
            if (this.dashTimer > 0) {
                // Sedang Power Dash
                this.dashTimer -= dt;
                this.vx = this.dashDir.x * this.baseSpeed * this.config.skill.speedMultiplier;
                this.vy = this.dashDir.y * this.baseSpeed * this.config.skill.speedMultiplier;

                // Trail
                this.trail.push({ x: this.x, y: this.y, color: this.config.color, life: 0.15 });

                // Dash hit check dengan lawan
                const dist = Math.hypot(opponent.x - this.x, opponent.y - this.y);
                if (dist <= this.radius + opponent.radius && !this.dashHasHit) {
                    this.dashHasHit = true;
                    opponent.applyDamage(this.config.skill.damage, this, game);
                    // Knockback opponent
                    const nx = (opponent.x - this.x) / (dist || 1);
                    const ny = (opponent.y - this.y) / (dist || 1);
                    opponent.vx += nx * 450;
                    opponent.vy += ny * 450;
                    game.addFloatingText('DASH IMPACT!', (this.x + opponent.x) / 2, (this.y + opponent.y) / 2 - 25, '#ff9100', 18);
                    sfx.skillDash();
                }
            } else {
                // Gerakan Normal
                if (inputDir.x !== 0 || inputDir.y !== 0) {
                    // Normalisasi vektor diagonal
                    const len = Math.hypot(inputDir.x, inputDir.y);
                    const nx = inputDir.x / len;
                    const ny = inputDir.y / len;

                    this.vx += nx * currentSpeed * 6 * dt;
                    this.vy += ny * currentSpeed * 6 * dt;

                    // Batasi max speed
                    const currentVel = Math.hypot(this.vx, this.vy);
                    if (currentVel > currentSpeed) {
                        this.vx = (this.vx / currentVel) * currentSpeed;
                        this.vy = (this.vy / currentVel) * currentSpeed;
                    }

                    this.facing = { x: nx, y: ny };
                } else {
                    this.vx *= Math.pow(this.friction, dt * 60);
                    this.vy *= Math.pow(this.friction, dt * 60);
                }
            }

            // Update posisi
            this.x += this.vx * dt;
            this.y += this.vy * dt;

            // Batas Arena (Wall Collision Clamping & Bounce)
            const minX = arena.left + this.radius;
            const maxX = arena.right - this.radius;
            const minY = arena.top + this.radius;
            const maxY = arena.bottom - this.radius;

            if (this.x < minX) {
                this.x = minX;
                this.vx = Math.abs(this.vx) * 0.5;
            } else if (this.x > maxX) {
                this.x = maxX;
                this.vx = -Math.abs(this.vx) * 0.5;
            }

            if (this.y < minY) {
                this.y = minY;
                this.vy = Math.abs(this.vy) * 0.5;
            } else if (this.y > maxY) {
                this.y = maxY;
                this.vy = -Math.abs(this.vy) * 0.5;
            }

            // Trail update
            for (let i = this.trail.length - 1; i >= 0; i--) {
                this.trail[i].life -= dt;
                if (this.trail[i].life <= 0) {
                    this.trail.splice(i, 1);
                }
            }
        }

        castSkill(opponent, game) {
            if (!this.isAlive || this.cooldownTimer > 0) return false;

            const skill = this.config.skill;
            this.cooldownTimer = skill.cooldown;
            this.skillsUsed++;

            switch (this.config.id) {
                case 'fire':
                    sfx.skillFire();
                    game.spawnProjectile(this, opponent, {
                        damage: skill.damage,
                        speed: skill.speed,
                        radius: skill.radius,
                        color: skill.color,
                        type: 'fire',
                        explosionRadius: skill.explosionRadius
                    });
                    game.createRingShockwave(this.x, this.y, '#ff5500', 35);
                    break;

                case 'ice':
                    sfx.skillIce();
                    game.spawnProjectile(this, opponent, {
                        damage: skill.damage,
                        speed: skill.speed,
                        radius: skill.radius,
                        color: skill.color,
                        type: 'ice',
                        slowDuration: skill.slowDuration
                    });
                    game.createRingShockwave(this.x, this.y, '#00d2ff', 35);
                    break;

                case 'thunder':
                    sfx.skillThunder();
                    opponent.applyDamage(skill.damage, this, game);
                    game.createLightningEffect(this.x, this.y, opponent.x, opponent.y);
                    game.createRingShockwave(opponent.x, opponent.y, '#ffd600', 40);
                    break;

                case 'shield':
                    sfx.skillShield();
                    this.shieldTimer = skill.duration;
                    game.addFloatingText('SHIELD AKTIF!', this.x, this.y - 30, '#00e676', 16);
                    game.createRingShockwave(this.x, this.y, '#00e676', 45);
                    break;

                case 'poison':
                    sfx.skillPoison();
                    game.spawnProjectile(this, opponent, {
                        damage: 0,
                        speed: 460,
                        radius: 14,
                        color: '#d500f9',
                        type: 'poison'
                    });
                    game.createRingShockwave(this.x, this.y, '#b388ff', 35);
                    break;

                case 'dash':
                    sfx.skillDash();
                    this.dashTimer = skill.duration;
                    this.dashHasHit = false;
                    this.dashDir = { ...this.facing };
                    game.createRingShockwave(this.x, this.y, '#ff9100', 40);
                    break;

                case 'heal':
                    this.applyHeal(skill.heal, game);
                    game.createRingShockwave(this.x, this.y, '#00c853', 50);
                    for (let i = 0; i < 16; i++) {
                        const ang = (Math.PI * 2 * i) / 16;
                        game.particles.push(new Particle(
                            this.x, this.y,
                            Math.cos(ang) * 45, Math.sin(ang) * 45,
                            '#69f0ae', 4, 0.6
                        ));
                    }
                    break;

                case 'shadow':
                    sfx.skillShadow();
                    opponent.applyDamage(skill.damage, this, game);
                    game.createShadowSlash(this.x, this.y, opponent.x, opponent.y);
                    game.createRingShockwave(opponent.x, opponent.y, '#7c4dff', 40);
                    break;
            }

            return true;
        }

        draw(ctx) {
            if (!this.isAlive) return;

            // 1. Dash Afterimages Trail
            for (const t of this.trail) {
                ctx.save();
                ctx.globalAlpha = (t.life / 0.15) * 0.45;
                ctx.fillStyle = t.color;
                ctx.beginPath();
                ctx.arc(t.x, t.y, this.radius * 0.9, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            ctx.save();

            // 2. Ground Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.beginPath();
            ctx.ellipse(this.x, this.y + this.radius * 0.85, this.radius * 0.9, this.radius * 0.35, 0, 0, Math.PI * 2);
            ctx.fill();

            // 3. Aura / Glow Efek
            const glowGrad = ctx.createRadialGradient(this.x, this.y, this.radius * 0.6, this.x, this.y, this.radius * 1.5);
            glowGrad.addColorStop(0, this.config.glow);
            glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // 4. Badan Bola Utama (Gradient)
            const bodyGrad = ctx.createRadialGradient(
                this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.1,
                this.x, this.y, this.radius
            );

            if (this.hitFlashTimer > 0) {
                bodyGrad.addColorStop(0, '#ffffff');
                bodyGrad.addColorStop(1, '#ff8080');
            } else {
                bodyGrad.addColorStop(0, this.config.accent);
                bodyGrad.addColorStop(0.7, this.config.color);
                bodyGrad.addColorStop(1, '#05070c');
            }

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();

            // 5. Outline / Ring
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.playerNum === 1 ? '#00e5ff' : '#ff3366';
            ctx.stroke();

            // 6. Indikator Arah Hadap (Eye / Core)
            const eyeX = this.x + this.facing.x * (this.radius * 0.45);
            const eyeY = this.y + this.facing.y * (this.radius * 0.45);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, 5, 0, Math.PI * 2);
            ctx.fill();

            // 7. Energy Shield Active Visual
            if (this.shieldTimer > 0) {
                ctx.lineWidth = 3.5;
                ctx.strokeStyle = '#00e676';
                ctx.shadowColor = '#00e676';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
                ctx.stroke();
            }

            // 8. Ice Slowed Frost Aura
            if (this.slowTimer > 0) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#80d8ff';
                ctx.setLineDash([4, 4]);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }

            // 9. Floating Overhead Mini HP Bar
            const barW = 46;
            const barH = 5;
            const barX = this.x - barW / 2;
            const barY = this.y - this.radius - 14;

            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

            const hpPercent = this.hp / this.maxHp;
            let barColor = '#00f59b';
            if (hpPercent < 0.25) barColor = '#ff477e';
            else if (hpPercent < 0.5) barColor = '#ffd166';

            ctx.fillStyle = barColor;
            ctx.fillRect(barX, barY, barW * hpPercent, barH);

            // Overhead Player Tag
            ctx.font = '800 10px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = this.playerNum === 1 ? '#00e5ff' : '#ff3366';
            ctx.fillText(`P${this.playerNum}`, this.x, barY - 4);

            ctx.restore();
        }
    }

    /* ==========================================================================
       5. SISTEM PROYEKTIL SKILL
       ========================================================================== */
    class Projectile {
        constructor(shooter, target, options) {
            this.shooter = shooter;
            this.target = target;
            this.x = shooter.x;
            this.y = shooter.y;
            this.radius = options.radius || 10;
            this.color = options.color || '#ff5500';
            this.damage = options.damage || 0;
            this.type = options.type;
            this.speed = options.speed || 500;
            this.explosionRadius = options.explosionRadius || 35;
            this.slowDuration = options.slowDuration || 2.0;

            // Hitung arah menuju target
            const dx = target.x - shooter.x;
            const dy = target.y - shooter.y;
            const dist = Math.hypot(dx, dy) || 1;
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;

            this.alive = true;
            this.life = 2.5; // timeout jika meleset
        }

        update(dt, arena, game) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.life -= dt;

            // Spawn partikel trail
            if (Math.random() < 0.6) {
                game.particles.push(new Particle(
                    this.x + (Math.random() - 0.5) * 6,
                    this.y + (Math.random() - 0.5) * 6,
                    -this.vx * 0.15, -this.vy * 0.15,
                    this.color, this.radius * 0.5, 0.25
                ));
            }

            // Tabrakan dengan Target
            const dist = Math.hypot(this.target.x - this.x, this.target.y - this.y);
            if (dist <= this.radius + this.target.radius) {
                this.onHit(game);
                this.alive = false;
                return false;
            }

            // Batas arena
            if (this.x < arena.left || this.x > arena.right || this.y < arena.top || this.y > arena.bottom || this.life <= 0) {
                this.alive = false;
                game.createRingShockwave(this.x, this.y, this.color, 20);
                return false;
            }

            return true;
        }

        onHit(game) {
            if (this.type === 'fire') {
                this.target.applyDamage(this.damage, this.shooter, game);
                game.createHitSparks(this.x, this.y, '#ff8800', 25);
                game.createRingShockwave(this.x, this.y, '#ff4500', this.explosionRadius);
            } else if (this.type === 'ice') {
                this.target.applyDamage(this.damage, this.shooter, game);
                this.target.slowTimer = this.slowDuration;
                game.createHitSparks(this.x, this.y, '#00d2ff', 20);
                game.createRingShockwave(this.x, this.y, '#00d2ff', 30);
                game.addFloatingText('FROZEN!', this.target.x, this.target.y - 30, '#80d8ff', 16);
            } else if (this.type === 'poison') {
                this.target.poisonTicksLeft = 4;
                this.target.poisonTickInterval = 0.75;
                game.createHitSparks(this.x, this.y, '#d500f9', 20);
                game.createRingShockwave(this.x, this.y, '#d500f9', 35);
                game.addFloatingText('POISONED!', this.target.x, this.target.y - 30, '#d500f9', 16);
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    /* ==========================================================================
       6. CORE GAME CONTROLLER & GAME LOOP
       ========================================================================== */
    class GameEngine {
        constructor() {
            // DOM Elements
            this.screens = {
                menu: document.getElementById('screenMenu'),
                selection: document.getElementById('screenSelection'),
                battle: document.getElementById('screenBattle'),
                result: document.getElementById('screenResult')
            };

            this.canvas = document.getElementById('battleCanvas');
            this.ctx = this.canvas.getContext('2d');

            // Overlay & Modals
            this.battleOverlay = document.getElementById('battleOverlay');
            this.announcementText = document.getElementById('announcementText');
            this.announcementSub = document.getElementById('announcementSub');
            this.modalHowTo = document.getElementById('modalHowTo');

            // HUD Elements
            this.hudP1BallName = document.getElementById('hudP1BallName');
            this.hudP2BallName = document.getElementById('hudP2BallName');
            this.hudP1HpFill = document.getElementById('hudP1HpFill');
            this.hudP2HpFill = document.getElementById('hudP2HpFill');
            this.hudP1HpGhost = document.getElementById('hudP1HpGhost');
            this.hudP2HpGhost = document.getElementById('hudP2HpGhost');
            this.hudP1HpText = document.getElementById('hudP1HpText');
            this.hudP2HpText = document.getElementById('hudP2HpText');
            this.hudP1Lives = document.getElementById('hudP1Lives');
            this.hudP2Lives = document.getElementById('hudP2Lives');
            this.hudP1SkillIcon = document.getElementById('hudP1SkillIcon');
            this.hudP2SkillIcon = document.getElementById('hudP2SkillIcon');
            this.hudP1SkillName = document.getElementById('hudP1SkillName');
            this.hudP2SkillName = document.getElementById('hudP2SkillName');
            this.hudP1SkillCd = document.getElementById('hudP1SkillCd');
            this.hudP2SkillCd = document.getElementById('hudP2SkillCd');
            this.hudP1SkillStatus = document.getElementById('hudP1SkillStatus');
            this.hudP2SkillStatus = document.getElementById('hudP2SkillStatus');
            this.hudMatchTimer = document.getElementById('hudMatchTimer');
            this.hudRoundLabel = document.getElementById('hudRoundLabel');

            // Result Elements
            this.resultTitle = document.getElementById('resultTitle');
            this.resultSubtitle = document.getElementById('resultSubtitle');
            this.statDuration = document.getElementById('statDuration');
            this.statDefeatedBalls = document.getElementById('statDefeatedBalls');
            this.statP1Damage = document.getElementById('statP1Damage');
            this.statP2Damage = document.getElementById('statP2Damage');

            // Arena Bounds (di dalam Canvas 960x540)
            this.arena = {
                left: 60,
                top: 40,
                right: 900,
                bottom: 500,
                width: 840,
                height: 460
            };

            // Game State
            this.state = 'MENU'; // MENU, SELECTION, COUNTDOWN, PLAYING, ROUND_TRANSITION, GAME_OVER
            this.p1Team = []; // 3 configs
            this.p2Team = []; // 3 configs
            this.p1CurrentIndex = 0;
            this.p2CurrentIndex = 0;

            this.player1 = null;
            this.player2 = null;

            this.projectiles = [];
            this.particles = [];
            this.floatingTexts = [];
            this.visualEffects = [];

            // Match Clock
            this.matchDuration = 0;
            this.roundCount = 1;

            // Camera Shake
            this.cameraShake = 0;

            // Keyboard Keys Map
            this.keysPressed = new Set();

            // Bind Event Listeners
            this.setupEventListeners();

            // Start Main Animation Loop (MDN Standard requestAnimationFrame)
            this.lastTime = performance.now();
            requestAnimationFrame(this.gameLoop.bind(this));
        }

        switchScreen(targetScreen) {
            Object.values(this.screens).forEach(screen => {
                screen.classList.remove('active');
            });
            this.screens[targetScreen].classList.add('active');
            this.state = targetScreen.toUpperCase();
        }

        setupEventListeners() {
            // Keyboard Input (Simultaneous Two-Player Handling)
            window.addEventListener('keydown', (e) => {
                const gameKeys = [
                    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyF',
                    'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Enter', 'Space'
                ];
                if (gameKeys.includes(e.code)) {
                    e.preventDefault();
                }
                this.keysPressed.add(e.code);

                // Skill Trigger (Single-tap)
                if (this.state === 'PLAYING') {
                    if (e.code === 'KeyF' && this.player1) {
                        this.player1.castSkill(this.player2, this);
                    }
                    if (e.code === 'Enter' && this.player2) {
                        this.player2.castSkill(this.player1, this);
                    }
                }
            });

            window.addEventListener('keyup', (e) => {
                this.keysPressed.delete(e.code);
            });

            // Button Bindings
            document.getElementById('btnMenuPlay').addEventListener('click', () => {
                sfx.btnClick();
                this.initRandomSelection();
            });

            document.getElementById('btnMenuHowTo').addEventListener('click', () => {
                sfx.btnClick();
                this.modalHowTo.classList.remove('hidden');
            });

            document.getElementById('btnCloseModal').addEventListener('click', () => {
                sfx.btnClick();
                this.modalHowTo.classList.add('hidden');
            });

            document.getElementById('btnModalUnderstood').addEventListener('click', () => {
                sfx.btnClick();
                this.modalHowTo.classList.add('hidden');
            });

            document.getElementById('btnReroll').addEventListener('click', () => {
                sfx.btnClick();
                this.rollTeamsAnimation();
            });

            document.getElementById('btnStartBattle').addEventListener('click', () => {
                sfx.btnClick();
                this.startBattle();
            });

            document.getElementById('btnRematch').addEventListener('click', () => {
                sfx.btnClick();
                this.initRandomSelection();
            });

            document.getElementById('btnReturnMenu').addEventListener('click', () => {
                sfx.btnClick();
                this.switchScreen('menu');
            });

            // Audio Toggle
            const btnSound = document.getElementById('btnSoundToggle');
            const soundIcon = document.getElementById('soundIcon');
            const soundLabel = document.getElementById('soundLabel');
            btnSound.addEventListener('click', () => {
                sfx.muted = !sfx.muted;
                if (sfx.muted) {
                    soundIcon.textContent = '🔇';
                    soundLabel.textContent = 'SUARA MUTED';
                } else {
                    soundIcon.textContent = '🔊';
                    soundLabel.textContent = 'SUARA ON';
                    sfx.playTone(500, 'sine', 0.1);
                }
            });
        }

        /* ======================================================================
           RANDOM TEAM SELECTION ALGORITHM
           ====================================================================== */
        getRandomThreeBalls() {
            // Acak 3 bola berbeda tanpa duplikasi dalam satu tim
            const shuffled = [...BALL_KEYS].sort(() => Math.random() - 0.5);
            return [
                BALL_TYPES[shuffled[0]],
                BALL_TYPES[shuffled[1]],
                BALL_TYPES[shuffled[2]]
            ];
        }

        initRandomSelection() {
            this.switchScreen('selection');
            this.rollTeamsAnimation();
        }

        rollTeamsAnimation() {
            const btnStart = document.getElementById('btnStartBattle');
            const btnReroll = document.getElementById('btnReroll');
            btnStart.disabled = true;
            btnReroll.disabled = true;
            btnStart.style.opacity = '0.5';

            const p1Container = document.getElementById('p1BallCards');
            const p2Container = document.getElementById('p2BallCards');

            // Render rolling placeholder cards
            let rollTicks = 0;
            const maxTicks = 14;
            const rollInterval = setInterval(() => {
                sfx.cardRoll();
                this.p1Team = this.getRandomThreeBalls();
                this.p2Team = this.getRandomThreeBalls();

                this.renderCards(p1Container, this.p1Team, 1, true);
                this.renderCards(p2Container, this.p2Team, 2, true);

                rollTicks++;
                if (rollTicks >= maxTicks) {
                    clearInterval(rollInterval);
                    // Final reveal
                    this.renderCards(p1Container, this.p1Team, 1, false);
                    this.renderCards(p2Container, this.p2Team, 2, false);
                    btnStart.disabled = false;
                    btnReroll.disabled = false;
                    btnStart.style.opacity = '1';
                }
            }, 85);
        }

        renderCards(container, team, playerNum, isRolling) {
            container.innerHTML = team.map((ball, i) => `
                <div class="ball-card ${isRolling ? 'rolling' : ''}">
                    <span class="ball-card-order">SLOT ${i + 1}</span>
                    <div class="ball-avatar-wrap">
                        <div class="ball-avatar-circle" style="color: ${ball.color}; background: radial-gradient(circle, ${ball.accent}, ${ball.color});">
                            ${ball.icon}
                        </div>
                    </div>
                    <div class="ball-card-name" style="color: ${playerNum === 1 ? '#00e5ff' : '#ff3366'}">${ball.name}</div>
                    <div class="ball-card-hp">HP: 100</div>
                    <div class="ball-card-skill">
                        <span class="card-skill-name">${ball.skillName}</span>
                        <span class="card-skill-desc">${ball.skillDesc}</span>
                    </div>
                </div>
            `).join('');
        }

        /* ======================================================================
           BATTLE LIFECYCLE
           ====================================================================== */
        startBattle() {
            this.switchScreen('battle');
            this.p1CurrentIndex = 0;
            this.p2CurrentIndex = 0;
            this.matchDuration = 0;
            this.roundCount = 1;

            // Inisialisasi Fighter
            this.player1 = new BallFighter(1, 220, 270, this.p1Team[0]);
            this.player2 = new BallFighter(2, 740, 270, this.p2Team[0]);

            this.projectiles = [];
            this.particles = [];
            this.floatingTexts = [];
            this.visualEffects = [];

            this.updateLivesHUD();
            this.updatePlayerHUD();

            // Countdown banner
            this.triggerRoundCountdown();
        }

        triggerRoundCountdown() {
            this.state = 'COUNTDOWN';
            this.battleOverlay.classList.remove('hidden');
            this.announcementText.textContent = `ROUND ${this.roundCount}`;
            this.announcementSub.textContent = 'READY... FIGHT!';
            sfx.matchStart();

            setTimeout(() => {
                this.battleOverlay.classList.add('hidden');
                this.state = 'PLAYING';
            }, 1400);
        }

        handleBallDefeat(defeatedPlayerNum) {
            this.state = 'ROUND_TRANSITION';
            const defeatedFighter = defeatedPlayerNum === 1 ? this.player1 : this.player2;
            defeatedFighter.isAlive = false;

            // Efek Ledakan KO
            this.triggerCameraShake(14);
            sfx.ballKO();
            this.createExplosionDebris(defeatedFighter.x, defeatedFighter.y, defeatedFighter.config.color, 45);
            this.addFloatingText('BOLA K.O.!', defeatedFighter.x, defeatedFighter.y - 40, '#ff3366', 28);

            // Cek sisa nyawa
            if (defeatedPlayerNum === 1) {
                this.p1CurrentIndex++;
            } else {
                this.p2CurrentIndex++;
            }

            this.updateLivesHUD();

            // Cek apakah game over (kehabisan seluruh 3 bola)
            if (this.p1CurrentIndex >= 3 || this.p2CurrentIndex >= 3) {
                setTimeout(() => {
                    this.endGame(this.p1CurrentIndex >= 3 ? 2 : 1);
                }, 1200);
                return;
            }

            // Jika masih ada bola tersisa, tampilkan transisi masuk bola berikutnya
            this.battleOverlay.classList.remove('hidden');
            const nextBall = defeatedPlayerNum === 1 ? this.p1Team[this.p1CurrentIndex] : this.p2Team[this.p2CurrentIndex];
            this.announcementText.textContent = 'BOLA KO!';
            this.announcementSub.textContent = `P${defeatedPlayerNum} MENGELUARKAN ${nextBall.name.toUpperCase()}!`;

            setTimeout(() => {
                this.roundCount++;
                this.hudRoundLabel.textContent = `ROUND ${this.roundCount}`;

                // Respawn bola baru dengan 100 HP
                if (defeatedPlayerNum === 1) {
                    this.player1.resetForRound(this.p1Team[this.p1CurrentIndex], 220, 270);
                } else {
                    this.player2.resetForRound(this.p2Team[this.p2CurrentIndex], 740, 270);
                }

                this.updatePlayerHUD();
                this.triggerRoundCountdown();
            }, 1800);
        }

        endGame(winnerNum) {
            this.state = 'GAME_OVER';
            sfx.victory();
            this.switchScreen('result');

            const isP1Won = winnerNum === 1;
            this.resultTitle.textContent = isP1Won ? 'PEMAIN 1 MENANG!' : 'PEMAIN 2 MENANG!';
            this.resultTitle.className = `result-title ${isP1Won ? 'p1-won' : 'p2-won'}`;
            this.resultSubtitle.textContent = `Pemain ${winnerNum} berhasil mengalahkan seluruh 3 bola lawan di arena!`;

            // Format Duration
            const mins = Math.floor(this.matchDuration / 60);
            const secs = Math.floor(this.matchDuration % 60);
            this.statDuration.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
            this.statDefeatedBalls.textContent = `${this.p1CurrentIndex} / ${this.p2CurrentIndex}`;
            this.statP1Damage.textContent = this.player1 ? Math.round(this.player1.totalDamageDealt) : 0;
            this.statP2Damage.textContent = this.player2 ? Math.round(this.player2.totalDamageDealt) : 0;
        }

        /* ======================================================================
           UPDATE HUD (HEALTH BARS, LIVES, SKILL COOLDOWN)
           ====================================================================== */
        updateLivesHUD() {
            // Player 1 Lives
            const p1Slots = this.hudP1Lives.querySelectorAll('.life-slot');
            p1Slots.forEach((slot, i) => {
                if (i < this.p1CurrentIndex) {
                    slot.className = 'life-slot defeated';
                } else {
                    slot.className = 'life-slot active';
                }
            });

            // Player 2 Lives
            const p2Slots = this.hudP2Lives.querySelectorAll('.life-slot');
            p2Slots.forEach((slot, i) => {
                if (i < this.p2CurrentIndex) {
                    slot.className = 'life-slot defeated';
                } else {
                    slot.className = 'life-slot active';
                }
            });
        }

        updatePlayerHUD() {
            if (!this.player1 || !this.player2) return;

            // Player 1 Info
            this.hudP1BallName.textContent = this.player1.config.name;
            const p1Percent = Math.max(0, this.player1.hp / this.player1.maxHp) * 100;
            this.hudP1HpFill.style.width = `${p1Percent}%`;
            this.hudP1HpText.textContent = `${Math.round(this.player1.hp)} / 100`;

            this.hudP1SkillIcon.textContent = this.player1.config.icon;
            this.hudP1SkillName.textContent = this.player1.config.skillName;

            const p1CdRatio = this.player1.cooldownTimer / this.player1.config.skill.cooldown;
            this.hudP1SkillCd.style.height = `${p1CdRatio * 100}%`;
            if (this.player1.cooldownTimer > 0) {
                this.hudP1SkillStatus.textContent = `${this.player1.cooldownTimer.toFixed(1)}s`;
                this.hudP1SkillStatus.classList.add('cooling');
            } else {
                this.hudP1SkillStatus.textContent = 'SIAP';
                this.hudP1SkillStatus.classList.remove('cooling');
            }

            // Player 2 Info
            this.hudP2BallName.textContent = this.player2.config.name;
            const p2Percent = Math.max(0, this.player2.hp / this.player2.maxHp) * 100;
            this.hudP2HpFill.style.width = `${p2Percent}%`;
            this.hudP2HpText.textContent = `${Math.round(this.player2.hp)} / 100`;

            this.hudP2SkillIcon.textContent = this.player2.config.icon;
            this.hudP2SkillName.textContent = this.player2.config.skillName;

            const p2CdRatio = this.player2.cooldownTimer / this.player2.config.skill.cooldown;
            this.hudP2SkillCd.style.height = `${p2CdRatio * 100}%`;
            if (this.player2.cooldownTimer > 0) {
                this.hudP2SkillStatus.textContent = `${this.player2.cooldownTimer.toFixed(1)}s`;
                this.hudP2SkillStatus.classList.add('cooling');
            } else {
                this.hudP2SkillStatus.textContent = 'SIAP';
                this.hudP2SkillStatus.classList.remove('cooling');
            }

            // Smooth Ghost HP Bar Sync
            this.hudP1HpGhost.style.width = `${p1Percent}%`;
            this.hudP2HpGhost.style.width = `${p2Percent}%`;
        }

        /* ======================================================================
           SPECIAL EFFECTS SPAWNERS (PARTIKEL, PETIR, SHADOW, PROYEKTIL)
           ====================================================================== */
        spawnProjectile(shooter, target, options) {
            this.projectiles.push(new Projectile(shooter, target, options));
        }

        createHitSparks(x, y, color, count = 12) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 60 + Math.random() * 160;
                this.particles.push(new Particle(
                    x, y,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    color, 2 + Math.random() * 3, 0.35 + Math.random() * 0.2, 'spark'
                ));
            }
        }

        createRingShockwave(x, y, color, maxRadius = 40) {
            this.particles.push(new Particle(x, y, 0, 0, color, maxRadius, 0.35, 'ring', false));
        }

        createExplosionDebris(x, y, color, count = 35) {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 80 + Math.random() * 320;
                this.particles.push(new Particle(
                    x, y,
                    Math.cos(angle) * speed, Math.sin(angle) * speed,
                    color, 4 + Math.random() * 5, 0.7 + Math.random() * 0.4
                ));
            }
        }

        createLightningEffect(x1, y1, x2, y2) {
            this.visualEffects.push({
                type: 'lightning',
                x1, y1, x2, y2,
                life: 0.18,
                maxLife: 0.18,
                color: '#ffd600'
            });
        }

        createShadowSlash(x1, y1, x2, y2) {
            this.visualEffects.push({
                type: 'slash',
                x1, y1, x2, y2,
                life: 0.22,
                maxLife: 0.22,
                color: '#7c4dff'
            });
        }

        addFloatingText(text, x, y, color, size) {
            this.floatingTexts.push(new FloatingText(text, x, y, color, size));
        }

        triggerCameraShake(magnitude = 6) {
            this.cameraShake = Math.max(this.cameraShake, magnitude);
        }

        /* ======================================================================
           BALL-TO-BALL 2D ELASTIC COLLISION PHYSICS
           (Ref: Halliday & Resnick - Elastic Collision in 2D)
           ====================================================================== */
        handleBallCollision(b1, b2) {
            if (!b1.isAlive || !b2.isAlive) return;

            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.hypot(dx, dy);
            const minDist = b1.radius + b2.radius;

            if (dist < minDist && dist > 0) {
                // Normal vektor tumbukan
                const nx = dx / dist;
                const ny = dy / dist;

                // 1. Positional Separation (mencegah kedua bola bertumpuk)
                const overlap = (minDist - dist) * 0.5;
                b1.x -= nx * overlap;
                b1.y -= ny * overlap;
                b2.x += nx * overlap;
                b2.y += ny * overlap;

                // 2. Pertukaran Impuls Elastis
                const kx = b1.vx - b2.vx;
                const ky = b1.vy - b2.vy;
                const p = 2 * (nx * kx + ny * ky) / 2;

                b1.vx -= p * nx * 0.85;
                b1.vy -= p * ny * 0.85;
                b2.vx += p * nx * 0.85;
                b2.vy += p * ny * 0.85;

                // Suara pantulan bola & partikel kontak
                sfx.ballBounce();
                this.createHitSparks((b1.x + b2.x) / 2, (b1.y + b2.y) / 2, '#ffffff', 5);
            }
        }

        /* ======================================================================
           MAIN GAME LOOP (PHYSICS & RENDERING)
           ====================================================================== */
        gameLoop(currentTime) {
            const dt = Math.min(0.05, (currentTime - this.lastTime) / 1000);
            this.lastTime = currentTime;

            if (this.state === 'PLAYING') {
                this.updatePhysics(dt);
            }

            this.updateVFX(dt);
            this.render();

            requestAnimationFrame(this.gameLoop.bind(this));
        }

        updatePhysics(dt) {
            this.matchDuration += dt;
            const mins = Math.floor(this.matchDuration / 60);
            const secs = Math.floor(this.matchDuration % 60);
            this.hudMatchTimer.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

            // Input Player 1 (WASD)
            const p1Input = { x: 0, y: 0 };
            if (this.keysPressed.has('KeyW')) p1Input.y -= 1;
            if (this.keysPressed.has('KeyS')) p1Input.y += 1;
            if (this.keysPressed.has('KeyA')) p1Input.x -= 1;
            if (this.keysPressed.has('KeyD')) p1Input.x += 1;

            // Input Player 2 (Panah)
            const p2Input = { x: 0, y: 0 };
            if (this.keysPressed.has('ArrowUp')) p2Input.y -= 1;
            if (this.keysPressed.has('ArrowDown')) p2Input.y += 1;
            if (this.keysPressed.has('ArrowLeft')) p2Input.x -= 1;
            if (this.keysPressed.has('ArrowRight')) p2Input.x += 1;

            // Update Fighters
            this.player1.update(dt, p1Input, this.arena, this.player2, this);
            this.player2.update(dt, p2Input, this.arena, this.player1, this);

            // Tabrakan Fisika 2 Bola
            this.handleBallCollision(this.player1, this.player2);

            // Update Proyektil
            for (let i = this.projectiles.length - 1; i >= 0; i--) {
                const alive = this.projectiles[i].update(dt, this.arena, this);
                if (!alive) {
                    this.projectiles.splice(i, 1);
                }
            }

            // Update HUD
            this.updatePlayerHUD();

            // Cek kondisi kalah (HP <= 0)
            if (this.player1.hp <= 0) {
                this.handleBallDefeat(1);
            } else if (this.player2.hp <= 0) {
                this.handleBallDefeat(2);
            }
        }

        updateVFX(dt) {
            // Camera Shake Decay
            if (this.cameraShake > 0) {
                this.cameraShake = Math.max(0, this.cameraShake - dt * 25);
            }

            // Particles Update
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const alive = this.particles[i].update(dt);
                if (!alive) {
                    this.particles.splice(i, 1);
                }
            }

            // Floating Texts Update
            for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
                const alive = this.floatingTexts[i].update(dt);
                if (!alive) {
                    this.floatingTexts.splice(i, 1);
                }
            }

            // Visual Effects (Lightning / Slash) Update
            for (let i = this.visualEffects.length - 1; i >= 0; i--) {
                this.visualEffects[i].life -= dt;
                if (this.visualEffects[i].life <= 0) {
                    this.visualEffects.splice(i, 1);
                }
            }
        }

        /* ======================================================================
           2D CANVAS DRAWING (ARENA, GRID, LIGHTS, COMBATANTS)
           ====================================================================== */
        render() {
            const ctx = this.ctx;
            const w = this.canvas.width;
            const h = this.canvas.height;

            ctx.save();

            // Camera Shake Translation
            if (this.cameraShake > 0) {
                const sx = (Math.random() - 0.5) * this.cameraShake * 2;
                const sy = (Math.random() - 0.5) * this.cameraShake * 2;
                ctx.translate(sx, sy);
            }

            // 1. Arena Background
            ctx.fillStyle = '#0a0d16';
            ctx.fillRect(0, 0, w, h);

            // 2. Arena Floor Interior
            const arena = this.arena;
            const floorGrad = ctx.createLinearGradient(arena.left, arena.top, arena.right, arena.bottom);
            floorGrad.addColorStop(0, '#0d1322');
            floorGrad.addColorStop(1, '#111827');
            ctx.fillStyle = floorGrad;
            ctx.fillRect(arena.left, arena.top, arena.width, arena.height);

            // 3. Grid Lines di Dalam Arena
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.lineWidth = 1;
            const gridSize = 40;
            for (let x = arena.left; x <= arena.right; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, arena.top);
                ctx.lineTo(x, arena.bottom);
                ctx.stroke();
            }
            for (let y = arena.top; y <= arena.bottom; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(arena.left, y);
                ctx.lineTo(arena.right, y);
                ctx.stroke();
            }

            // 4. Center Line & Circle
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 2;
            const centerX = (arena.left + arena.right) / 2;
            const centerY = (arena.top + arena.bottom) / 2;

            ctx.beginPath();
            ctx.moveTo(centerX, arena.top);
            ctx.lineTo(centerX, arena.bottom);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
            ctx.stroke();

            // 5. Player Spawn Zones Markers
            ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
            ctx.beginPath();
            ctx.arc(220, 270, 50, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 51, 102, 0.15)';
            ctx.beginPath();
            ctx.arc(740, 270, 50, 0, Math.PI * 2);
            ctx.stroke();

            // 6. Arena Neon Boundary Border
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.strokeRect(arena.left, arena.top, arena.width, arena.height);

            // Top-left neon accent
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(arena.left, arena.top + 60);
            ctx.lineTo(arena.left, arena.top);
            ctx.lineTo(arena.left + 60, arena.top);
            ctx.stroke();

            // Bottom-right neon accent
            ctx.strokeStyle = '#ff3366';
            ctx.beginPath();
            ctx.moveTo(arena.right, arena.bottom - 60);
            ctx.lineTo(arena.right, arena.bottom);
            ctx.lineTo(arena.right - 60, arena.bottom);
            ctx.stroke();

            // 7. Render Proyektil
            for (const proj of this.projectiles) {
                proj.draw(ctx);
            }

            // 8. Render Balls (Fighters)
            if (this.player1) this.player1.draw(ctx);
            if (this.player2) this.player2.draw(ctx);

            // 9. Render Lightning & Slash VFX
            for (const vfx of this.visualEffects) {
                if (vfx.type === 'lightning') {
                    ctx.save();
                    ctx.strokeStyle = vfx.color;
                    ctx.lineWidth = 4;
                    ctx.shadowColor = vfx.color;
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.moveTo(vfx.x1, vfx.y1);
                    // Jagged lightning segment
                    const midX = (vfx.x1 + vfx.x2) / 2 + (Math.random() - 0.5) * 35;
                    const midY = (vfx.y1 + vfx.y2) / 2 + (Math.random() - 0.5) * 35;
                    ctx.lineTo(midX, midY);
                    ctx.lineTo(vfx.x2, vfx.y2);
                    ctx.stroke();
                    ctx.restore();
                } else if (vfx.type === 'slash') {
                    ctx.save();
                    ctx.strokeStyle = vfx.color;
                    ctx.lineWidth = 5;
                    ctx.shadowColor = vfx.color;
                    ctx.shadowBlur = 18;
                    ctx.beginPath();
                    ctx.moveTo(vfx.x1, vfx.y1);
                    ctx.lineTo(vfx.x2, vfx.y2);
                    ctx.stroke();
                    ctx.restore();
                }
            }

            // 10. Render Particles
            for (const p of this.particles) {
                p.draw(ctx);
            }

            // 11. Render Floating Texts
            for (const ft of this.floatingTexts) {
                ft.draw(ctx);
            }

            ctx.restore();
        }
    }

    // Jalankan Game saat window siap
    window.addEventListener('DOMContentLoaded', () => {
        window.gameInstance = new GameEngine();
    });

})();
