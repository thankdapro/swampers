// THE SWAMPERS — Interactivity

// Smooth-scroll handled by CSS; add scroll-spy + nav effects
document.addEventListener('DOMContentLoaded', () => {

  const navbar = document.querySelector('.navbar');

  // Add navbar shadow when scrolled
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.borderBottomColor = 'var(--swamp-light)';
      navbar.style.boxShadow = '0 4px 30px rgba(168, 192, 96, 0.2)';
    } else {
      navbar.style.borderBottomColor = '';
      navbar.style.boxShadow = '';
    }
  });

  // Fade-in on scroll for sections
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    observer.observe(section);
  });

  // Random small wobble for newspaper cards on hover entry
  document.querySelectorAll('.newspaper').forEach(paper => {
    const baseRotation = parseFloat(getComputedStyle(paper).transform);
    paper.addEventListener('mouseenter', () => {
      paper.style.zIndex = '10';
    });
    paper.addEventListener('mouseleave', () => {
      setTimeout(() => { paper.style.zIndex = ''; }, 250);
    });
  });

  // Click ripple on buttons (just for fun)
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Only prevent default for placeholder links
      if (btn.getAttribute('href') === '#') {
        e.preventDefault();
        const original = btn.textContent;
        btn.textContent = 'PLACEHOLDER — ADD LINK';
        setTimeout(() => { btn.textContent = original; }, 1500);
      }
    });
  });

  // Easter egg: random frog ribbit on logo click
  const ribbits = ['*ribbit*', '*croak*', '*splash*', '*gloop*', '*BLORP*'];
  document.querySelector('.logo').addEventListener('click', (e) => {
    const msg = document.createElement('div');
    msg.textContent = ribbits[Math.floor(Math.random() * ribbits.length)];
    msg.style.cssText = `
      position: fixed;
      top: ${e.clientY}px;
      left: ${e.clientX}px;
      color: var(--swamp-glow);
      font-family: 'Press Start 2P', monospace;
      font-size: 1rem;
      pointer-events: none;
      z-index: 9999;
      text-shadow: 0 0 10px var(--swamp-glow);
      animation: floatUp 1.5s ease-out forwards;
    `;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 1500);
  });

  // Inject the floatUp keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatUp {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(-60px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

});
