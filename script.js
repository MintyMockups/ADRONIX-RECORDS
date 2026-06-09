// Global Configuration
const SITE_CONFIG = {
  logoImageURL: "", 
  discordServerLink: "https://discord.gg/your-invite-link", 
  
  aboutStats: [
    { number: "3", label: "Signed Artists" },
    { number: "12", label: "Releases" },
    { number: "450K", label: "Total Streams" },
    { number: "1.2K", label: "Discord Members" } 
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  setupBranding();
  setupNavigationHighlights();
  renderStats();
  initCanvas();
});

// Branding & Config Binding
function setupBranding() {
  const logoImg = document.getElementById('dynamic-logo');
  const logoText = document.getElementById('dynamic-logo-text');
  
  if (logoImg && logoText) {
    if (SITE_CONFIG.logoImageURL && SITE_CONFIG.logoImageURL.trim() !== "") {
      logoImg.src = SITE_CONFIG.logoImageURL;
      logoImg.style.display = 'block';
      logoText.style.display = 'none';
    } else {
      logoImg.style.display = 'none';
      logoText.style.display = 'block';
    }
  }

  const discordJoinBtn = document.getElementById('discord-join-btn');
  if (discordJoinBtn) {
    discordJoinBtn.href = SITE_CONFIG.discordServerLink;
  }
}

// Highlight Active Nav links based on actual filename
function setupNavigationHighlights() {
  const currentFilename = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentFilename) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Dynamic rendering of Stats block (used in about.html)
function renderStats() {
  const container = document.getElementById('dynamic-stats');
  if (!container) return;
  container.innerHTML = SITE_CONFIG.aboutStats.map(stat => `
    <div class="stat-card">
      <div class="stat-num">${stat.number}</div>
      <div class="stat-label">${stat.label}</div>
    </div>
  `).join('');
}

// Global Nav toggling (Mobile)
function toggleNav() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.toggle('open');
  }
}

// Scroll detection class addition
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }
});

// Toast Notifications helper
function showNotification(msg) {
  const n = document.getElementById('notification');
  if (!n) return;
  n.textContent = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 4000);
}

// Nebula Fluid Background Engine
function initCanvas() {
  const canvas = document.getElementById('nebula-bg');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let stars = [], nebulaClouds = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initCanvasElements() {
    stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5,
        speed: Math.random() * 0.005 + 0.001,
        phase: Math.random() * Math.PI * 2
      });
    }
    
    nebulaClouds = [
      { x: canvas.width * 0.2, y: canvas.height * 0.3, r: 400, c1: 'rgba(107,33,212,', c2: 'rgba(192,38,211,', a: 0.1, phase: 0, speed: 0.0005 },
      { x: canvas.width * 0.8, y: canvas.height * 0.7, r: 350, c1: 'rgba(34,211,238,', c2: 'rgba(59,130,246,', a: 0.08, phase: 2, speed: 0.0004 }
    ];
  }

  let time = 0;
  function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep space dark gradient
    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, '#050510');
    bg.addColorStop(0.5, '#080820');
    bg.addColorStop(1, '#050510');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Nebula Dust
    nebulaClouds.forEach(cloud => {
      const pulse = Math.sin(time * cloud.speed * 1000 + cloud.phase) * 0.05;
      const grad = ctx.createRadialGradient(
        cloud.x + Math.sin(time * cloud.speed * 500) * 50,
        cloud.y + Math.cos(time * cloud.speed * 700) * 30,
        0,
        cloud.x, cloud.y, cloud.r * (1 + pulse)
      );
      grad.addColorStop(0, cloud.c1 + (cloud.a * 1.5) + ')');
      grad.addColorStop(0.5, cloud.c2 + cloud.a + ')');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.r * 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Twinkling Stars
    stars.forEach(star => {
      const twinkle = (Math.sin(time * star.speed * 1000 + star.phase) + 1) / 2;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.8 + 0.1})`;
      ctx.fill();
    });

    time += 0.016;
    requestAnimationFrame(drawCanvas);
  }

  window.addEventListener('resize', () => { resizeCanvas(); initCanvasElements(); });
  resizeCanvas();
  initCanvasElements();
  drawCanvas();
}