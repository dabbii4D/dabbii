'use strict';

/*
   SHARED STATE
   */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none)').matches;

/*
   CURSOR GLOW (desktop only, disabled on reduced motion)
   */
(function cursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || reducedMotion || isTouch) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let raf = null;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  function tick() {
    // smooth follow via lerp
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

    if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  }
})();

/*
   NAV: scroll state + mobile toggle
   */
(function nav() {
  const navEl = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  const onScroll = () => {
    navEl.classList.toggle('scrolled', window.scrollY > 24);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/*
   SCROLL-TRIGGERED REVEAL for section heads / cards
   */
(function scrollReveal() {
  const targets = document.querySelectorAll('.section-head, .meta-card, .skill-card, .contact-link, .creative-tags span');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('in-view'));
    return;
  }
  targets.forEach((t) => { t.style.opacity = '0'; t.style.transform = 'translateY(14px)'; });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '';
        entry.target.style.transform = '';
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach((t) => io.observe(t));
})();

/*
   SKILLS: hover / focus reveals description
   */
(function skills() {
  const cards = document.querySelectorAll('.skill-card');
  const hint = document.getElementById('skillHint');
  if (!cards.length || !hint) return;

  const defaultHint = hint.textContent;

  cards.forEach((card) => {
    const desc = card.dataset.desc;
    const show = () => { hint.textContent = desc; };
    const hide = () => { hint.textContent = defaultHint; };

    card.addEventListener('mouseenter', show);
    card.addEventListener('mouseleave', hide);
    card.addEventListener('focus', show);
    card.addEventListener('blur', hide);
    card.addEventListener('click', (e) => {
      e.preventDefault();
      show();
    });
  });
})();

/*
   CREATIVE STAGE: shapes drift toward cursor, word cycles
   */
(function creative() {
  const stage = document.getElementById('creativeStage');
  const word = document.getElementById('creativeWord');
  if (!stage || !word) return;

  const words = ['design', 'layout', 'color', 'type', 'motion', 'idea'];
  let wi = 0;

  const cycle = () => {
    wi = (wi + 1) % words.length;
    word.style.opacity = '0';
    setTimeout(() => {
      word.textContent = words[wi];
      word.style.opacity = '1';
    }, 250);
  };
  if (!reducedMotion) setInterval(cycle, 2600);

  if (!isTouch && !reducedMotion) {
    const shapes = stage.querySelectorAll('.shape');
    let raf = null;
    let mx = 0, my = 0;

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      mx = (e.clientX - rect.left) / rect.width - 0.5;
      my = (e.clientY - rect.top) / rect.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    });

    stage.addEventListener('mouseleave', () => {
      mx = 0; my = 0;
      if (!raf) raf = requestAnimationFrame(apply);
    });

    function apply() {
      shapes.forEach((s, i) => {
        const strength = 14 + i * 6;
        s.style.transform = `translate3d(${mx * strength}px, ${my * strength}px, 0)`;
      });
      raf = null;
    }
  }
})();

/*
   FOOTER YEAR
   */
document.getElementById('year').textContent = new Date().getFullYear();

(function easterEgg() {
  const modal = document.getElementById('gameModal');
  const closeBtn = document.getElementById('gameClose');
  const secretCursor = document.getElementById('secretCursor');
  const coffeeBtn = document.getElementById('coffeeBtn');

  let clickCount = 0;
  let clickTimer = null;

  function registerSecretClick() {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 1500);
    if (clickCount >= 5) {
      clickCount = 0;
      openGame();
    }
  }

  if (secretCursor) secretCursor.addEventListener('click', registerSecretClick);
  if (coffeeBtn) coffeeBtn.addEventListener('click', registerSecretClick);

  // tiny konami-lite: Up Up Down Down opens it too
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'];
  let pos = 0;
  window.addEventListener('keydown', (e) => {
    if (e.key === seq[pos]) {
      pos++;
      if (pos === seq.length) { pos = 0; openGame(); }
    } else {
      pos = (e.key === seq[0]) ? 1 : 0;
    }
  });

  function openGame() {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    Game.start();
  }
  function closeGame() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    Game.stop();
  }

  closeBtn.addEventListener('click', closeGame);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeGame(); });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeGame();
  });

  /* Byte Runner: minimal canvas runner */
  const Game = (function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('gameScore');
    const bestEl = document.getElementById('gameBest');
    const instructions = document.getElementById('gameInstructions');

    const W = canvas.width, H = canvas.height;
    const GROUND_Y = H - 30;
    const PLAYER_SIZE = 18;
    const PURPLE = '#C98B3A';
    const PURPLE_DIM = '#7C3A1E';
    const BLUE = '#2A6362';

    let best = 0;
    try { best = parseInt(localStorage.getItem('byteRunnerBest') || '0', 10) || 0; } catch (err) { best = 0; }
    bestEl.textContent = best;

    let running = false;
    let rafId = null;
    let player, obstacles, speed, score, gravity, tick, gameOver;

    function reset() {
      player = { x: 46, y: GROUND_Y - PLAYER_SIZE, vy: 0, jumping: false };
      obstacles = [];
      speed = 3.2;
      score = 0;
      gravity = 0.55;
      tick = 0;
      gameOver = false;
      scoreEl.textContent = '0';
      instructions.textContent = 'tap / click / space to jump';
    }

    function jump() {
      if (gameOver) { reset(); loop(); return; }
      if (!player.jumping) {
        player.vy = -9.2;
        player.jumping = true;
      }
    }

    function spawnObstacle() {
      const h = 14 + Math.random() * 20;
      obstacles.push({ x: W + 10, y: GROUND_Y - h, w: 12, h });
    }

    function update() {
      tick++;
      speed += 0.0022;

      // player physics
      player.vy += gravity;
      player.y += player.vy;
      if (player.y >= GROUND_Y - PLAYER_SIZE) {
        player.y = GROUND_Y - PLAYER_SIZE;
        player.vy = 0;
        player.jumping = false;
      }

      // obstacles
      if (tick % Math.max(38, Math.floor(70 - speed * 6)) === 0) spawnObstacle();
      obstacles.forEach((o) => { o.x -= speed; });
      obstacles = obstacles.filter((o) => o.x + o.w > -5);

      // collision (small forgiving hitbox)
      const pBox = { x: player.x + 3, y: player.y + 3, w: PLAYER_SIZE - 6, h: PLAYER_SIZE - 6 };
      for (const o of obstacles) {
        if (pBox.x < o.x + o.w && pBox.x + pBox.w > o.x && pBox.y < o.y + o.h && pBox.y + pBox.h > o.y) {
          endGame();
          break;
        }
      }

      if (!gameOver) {
        score += 1;
        scoreEl.textContent = Math.floor(score / 6);
      }
    }

    function endGame() {
      gameOver = true;
      const finalScore = Math.floor(score / 6);
      if (finalScore > best) {
        best = finalScore;
        bestEl.textContent = best;
        try { localStorage.setItem('byteRunnerBest', String(best)); } catch (err) { /* ignore */ }
      }
      instructions.textContent = 'nice run — tap / click / space to retry';
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // background grid, very subtle
      ctx.fillStyle = '#123434';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(201,139,58,0.10)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 24) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }

      // ground
      ctx.fillStyle = BLUE;
      ctx.fillRect(0, GROUND_Y, W, 2);

      // player (pixel square, purple)
      ctx.fillStyle = PURPLE;
      ctx.fillRect(Math.round(player.x), Math.round(player.y), PLAYER_SIZE, PLAYER_SIZE);
      ctx.fillStyle = PURPLE_DIM;
      ctx.fillRect(Math.round(player.x), Math.round(player.y) + PLAYER_SIZE - 5, PLAYER_SIZE, 5);

      // obstacles
      ctx.fillStyle = PURPLE;
      obstacles.forEach((o) => {
        ctx.fillRect(Math.round(o.x), Math.round(o.y), o.w, o.h);
      });

      if (gameOver) {
        ctx.fillStyle = 'rgba(18,52,52,0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#EDE5D4';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('game over', W / 2, H / 2 - 6);
        ctx.font = '11px monospace';
        ctx.fillStyle = '#C98B3A';
        ctx.fillText('tap to retry', W / 2, H / 2 + 14);
        ctx.textAlign = 'left';
      }
    }

    function loop() {
      if (!running) return;
      if (!gameOver) update();
      draw();
      rafId = requestAnimationFrame(loop);
    }

    function onPointer(e) {
      e.preventDefault();
      jump();
    }
    function onKey(e) {
      if (e.code === 'Space') { e.preventDefault(); jump(); }
    }

    canvas.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onKey);

    return {
      start() {
        if (running) return;
        running = true;
        reset();
        loop();
      },
      stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      }
    };
  })();
})();