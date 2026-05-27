document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => nav.classList.toggle('open'));
  }

  const currentPath = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    if (a.getAttribute('href') === currentPath) a.classList.add('active');
  });

  // 鳥アニメーション
  const heroIllust = document.querySelector('.hero-illust');
  if (heroIllust) {
    const bird = document.createElement('img');
    bird.src = 'images/bird.png';
    bird.className = 'bird';
    bird.alt = '';
    heroIllust.style.position = 'relative';
    heroIllust.appendChild(bird);

    const birdW = 140;
    const birdH = 140;
    let facingRight = true;
    let x = 100;
    let y = 80;
    let targetX = x;
    let targetY = y;
    let cursorIdleTimer = null;
    let isFollowingCursor = false;
    let randomTimer = null;

    bird.style.left = x + 'px';
    bird.style.top  = y + 'px';

    function clamp(val, min, max) {
      return Math.min(Math.max(val, min), max);
    }

    function setBirdPos(newX, newY) {
      const w = heroIllust.offsetWidth;
      const h = heroIllust.offsetHeight;
      const margin = 20;
      newX = clamp(newX, margin, w - birdW - margin);
      newY = clamp(newY, margin, h - birdH - margin);

      const goingRight = newX > x;
      if (Math.abs(newX - x) > 10 && goingRight !== facingRight) {
        facingRight = goingRight;
        bird.classList.toggle('flipped', !facingRight);
      }
      x = newX;
      y = newY;
      bird.style.left = x + 'px';
      bird.style.top  = y + 'px';
    }

    // ふわっと遅れてついてくる（lerp）
    function lerpToBird() {
      const ease = 0.04;
      const nx = x + (targetX - x) * ease;
      const ny = y + (targetY - y) * ease;
      setBirdPos(nx, ny);
      requestAnimationFrame(lerpToBird);
    }
    lerpToBird();

    // カーソル・タッチ追従（共通処理）
    function followPointer(clientX, clientY) {
      const rect = heroIllust.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right &&
          clientY >= rect.top  && clientY <= rect.bottom) {
        isFollowingCursor = true;
        targetX = (clientX - rect.left) - birdW / 2 + 30;
        targetY = (clientY - rect.top)  - birdH + 10;
      }
      clearTimeout(cursorIdleTimer);
      clearTimeout(randomTimer);
      cursorIdleTimer = setTimeout(() => {
        isFollowingCursor = false;
        scheduleRandom();
      }, 3000);
    }

    document.addEventListener('mousemove', (e) => {
      followPointer(e.clientX, e.clientY);
    });

    document.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      followPointer(touch.clientX, touch.clientY);
    }, { passive: true });

    // ランダム移動
    function moveRandom() {
      if (isFollowingCursor) return;
      const w = heroIllust.offsetWidth;
      const h = heroIllust.offsetHeight;
      const margin = 40;
      targetX = margin + Math.random() * (w - birdW - margin * 2);
      targetY = margin + Math.random() * (h - birdH - margin * 2);
    }

    function scheduleRandom() {
      moveRandom();
      randomTimer = setTimeout(() => {
        if (!isFollowingCursor) scheduleRandom();
      }, 4000 + Math.random() * 3000);
    }

    // 初期ランダム移動開始
    setTimeout(scheduleRandom, 800);
  }
});
