document.addEventListener("DOMContentLoaded", () => {
  const galleryData = {
    "Book Catalogs": 12,
    "Social Media Posts": 13,
    "Illustrations": 8,
    "3D": 11,
    "AI Creatives & Mockups": 10,
  };

  let isAutoScrolling = false;
  let scrollDirection = 0;
  let scrollTimer;

  // Lightbox modal HTML
  const lightbox = document.createElement("div");
  lightbox.id = "lightbox-modal";
  lightbox.innerHTML = `
    <div class="lightbox-content">
      <img src="" alt="Enlarged image" />
      <span class="lightbox-close">&times;</span>
    </div>
  `;
  document.body.appendChild(lightbox);

  // Load gallery images, bookmarks, and dots
  Object.entries(galleryData).forEach(([category, count]) => {
    const gallery = document.querySelector(`.gallery[data-category="${category}"]`);
    if (!gallery) return;

    // Create bookmark title
    const title = document.createElement("div");
    title.classList.add("gallery-bookmark");
    title.textContent = category;
    gallery.parentNode.insertBefore(title, gallery);

    for (let i = 1; i <= count; i++) {
      const img = document.createElement("img");
      img.src = `images/${category}/img${i}.jpg`;
      img.alt = `${category} Image ${i}`;
      gallery.appendChild(img);

      // Lightbox click event
      img.addEventListener("click", () => {
        const modalImg = lightbox.querySelector("img");
        modalImg.src = '';
        setTimeout(() => {
          modalImg.src = img.src;
          lightbox.style.display = "flex";
        }, 0);
      });
    }

    const dotContainer = document.createElement("div");
    dotContainer.classList.add("dot-container");
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("span");
      dot.classList.add("dot");
      dot.dataset.index = i;
      dot.addEventListener("click", () => {
        const imageWidth = gallery.querySelector("img")?.clientWidth || gallery.scrollWidth / count;
        gallery.scrollTo({ left: imageWidth * i, behavior: "smooth" });
      });
      dotContainer.appendChild(dot);
    }
    gallery.parentNode.insertBefore(dotContainer, gallery.nextSibling);
  });

  const style = document.createElement("style");
  style.textContent = `
    .dot-container {
      display: none;
      justify-content: center;
      margin-top: 10px;
      gap: 6px;
      pointer-events: auto;
    }
    .gallery:hover + .dot-container,
    .gallery:focus + .dot-container,
    .gallery:active + .dot-container {
      display: flex;
    }
    .dot {
      width: 5px;
      height: 5px;
      background-color: #ccc;
      border-radius: 50%;
      transition: background-color 0.3s, transform 0.3s;
      cursor: pointer;
    }
    .dot.active {
      background-color: #20b2ab;
      transform: scale(1.3);
    }
    .gallery img {
      transition: transform 0.3s;
      cursor: pointer;
    }

    /* Lightbox */
    #lightbox-modal {
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 100vh;
      display: none;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.85);
      z-index: 10000;
      overflow: auto;
    }
    .lightbox-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-sizing: border-box;
    }
    #lightbox-modal img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(255,255,255,0.3);
    }
    .lightbox-close {
      position: absolute;
      top: -20px;
      right: -20px;
      font-size: 40px;
      color: white;
      cursor: pointer;
    }

    /* Bookmark title */
    .gallery-bookmark {
      position: relative;
      left: -150px;
      opacity: 0;
      font-size: 1.2rem;
      background-color: #20b2ab;
      color: white;
      padding: 6px 14px;
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
      margin-bottom: 6px;
      width: fit-content;
      transition: all 0.6s ease-out;
      z-index: 1;
    }
    .gallery-bookmark.visible {
      left: 0;
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  // Lightbox closing
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target.classList.contains("lightbox-close")) {
      lightbox.style.display = "none";
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lightbox.style.display = "none";
  });

  // Bookmark animation
  const galleries = document.querySelectorAll(".gallery");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bookmark = entry.target.previousElementSibling;
        if (bookmark?.classList.contains("gallery-bookmark")) {
          bookmark.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }
    });
  }, { threshold: 0.5 });

  galleries.forEach((gallery) => {
    observer.observe(gallery);

    gallery.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        gallery.scrollBy({ left: e.deltaY, behavior: "smooth" });
        isAutoScrolling = true;
        setTimeout(() => { isAutoScrolling = false; }, 1000);
      }
    });

    gallery.addEventListener("touchstart", (e) => {
      gallery._startX = e.touches[0].clientX;
    });

    gallery.addEventListener("touchmove", (e) => {
      const deltaX = e.touches[0].clientX - gallery._startX;
      gallery.scrollLeft -= deltaX;
      gallery._startX = e.touches[0].clientX;
      e.preventDefault();
    }, { passive: false });

    gallery.addEventListener("scroll", () => {
      const dotContainer = gallery.nextElementSibling;
      const dots = dotContainer?.querySelectorAll(".dot");
      if (!dots) return;

      const scrollLeft = gallery.scrollLeft;
      const imageWidth = gallery.querySelector("img")?.clientWidth || gallery.scrollWidth / dots.length;
      const activeIndex = Math.round(scrollLeft / imageWidth);

      dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === activeIndex);
      });
    });
  });

  // Cursor scroll
  const cursor = document.createElement("div");
  cursor.classList.add("custom-cursor");
  document.body.appendChild(cursor);

  document.addEventListener("mousemove", (e) => {
    cursor.style.top = `${e.clientY}px`;
    cursor.style.left = `${e.clientX}px`;

    const screenCenterY = window.innerHeight / 2;
    scrollDirection = 0;
    if (e.clientY < screenCenterY - 50) scrollDirection = -1;
    else if (e.clientY > screenCenterY + 50) scrollDirection = 1;

    if (!scrollTimer && scrollDirection !== 0) {
      scrollTimer = setInterval(() => {
        window.scrollBy({ top: scrollDirection * 4 });
      }, 16);
    }

    if (scrollDirection === 0 && scrollTimer) {
      clearInterval(scrollTimer);
      scrollTimer = null;
    }
  });

  document.addEventListener("mouseleave", () => {
    if (scrollTimer) {
      clearInterval(scrollTimer);
      scrollTimer = null;
    }
  });

  // FOG EFFECT
  const fogCanvas = document.createElement("canvas");
  fogCanvas.style.position = "fixed";
  fogCanvas.style.top = "0";
  fogCanvas.style.left = "0";
  fogCanvas.style.width = "100%";
  fogCanvas.style.height = "100%";
  fogCanvas.style.pointerEvents = "none";
  fogCanvas.style.zIndex = "9996";
  document.body.appendChild(fogCanvas);
  const fogCtx = fogCanvas.getContext("2d");
  let fogWidth = window.innerWidth;
  let fogHeight = window.innerHeight;
  fogCanvas.width = fogWidth;
  fogCanvas.height = fogHeight;

  class Fog {
    constructor() { this.reset(true); }
    reset(initial = false) {
      const buffer = 300;
      const side = Math.random() < 0.5 ? -buffer : fogWidth + buffer;
      this.x = side;
      this.y = Math.random() < 0.5 ? -buffer : fogHeight + buffer;
      this.scale = 2 + Math.random() * 2;
      this.opacity = 0;
      this.targetOpacity = 0.004 + Math.random() * 0.007;
      this.speedX = (Math.random() - 0.5) * 0.1;
      this.speedY = (Math.random() - 0.5) * 0.1;
      this.life = 0;
      this.fadeInDuration = 100 + Math.random() * 100;
      this.maxLife = 600 + Math.random() * 300;
      this.shape = new Path2D();
      const points = 6 + Math.floor(Math.random() * 4);
      for (let i = 0; i < points; i++) {
        const angle = (Math.PI * 2 * i) / points;
        const r = 150 + Math.random() * 200;
        const px = Math.cos(angle) * r + (Math.random() - 0.5) * 50;
        const py = Math.sin(angle) * r + (Math.random() - 0.5) * 50;
        if (i === 0) this.shape.moveTo(px, py);
        else this.shape.lineTo(px, py);
      }
      this.shape.closePath();
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.life < this.fadeInDuration) {
        this.opacity = 4 * this.targetOpacity * (this.life / this.fadeInDuration);
      } else {
        const fadeOutStart = this.maxLife - this.fadeInDuration;
        if (this.life > fadeOutStart) {
          const progress = (this.life - fadeOutStart) / this.fadeInDuration;
          this.opacity = this.targetOpacity * (1 - progress);
        }
      }
      if (this.life > this.maxLife || this.x < -400 || this.x > fogWidth + 400 || this.y < -400 || this.y > fogHeight + 400) {
        this.reset();
      }
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale, this.scale);
      ctx.fillStyle = `rgba(175, 255, 255, ${this.opacity})`;
      ctx.fill(this.shape);
      ctx.restore();
    }
  }

  const fogElements = Array.from({ length: 15 }, () => new Fog());
  function animateFog() {
    fogCtx.clearRect(0, 0, fogWidth, fogHeight);
    fogElements.forEach(fog => { fog.update(); fog.draw(fogCtx); });
    requestAnimationFrame(animateFog);
  }
  animateFog();

  // PARTICLE EFFECT
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let particles = [];
  const maxParticles = 20;
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = height + Math.random() * (initial ? height : 50);
      this.radius = Math.random() * 2 + 1;
      this.baseOpacity = Math.random() * 0.3 + 0.2;
      this.opacity = this.baseOpacity;
      this.speedY = Math.random() * 0.3 + 0.3;
      this.reachTop = Math.random() < 0.1;
      this.life = 0;
      this.fadeDuration = 100 + Math.random() * 100;
      this.maxLife = 300 + Math.random() * 150;
    }
    update() {
      this.y -= this.speedY;
      this.life++;
      if (this.life > this.maxLife - this.fadeDuration) {
        const fadeProgress = (this.life - (this.maxLife - this.fadeDuration)) / this.fadeDuration;
        this.opacity = this.baseOpacity * (1 - fadeProgress);
      }
      if (this.life > this.maxLife || this.opacity <= 0) {
        this.reset();
      }
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.fill();
    }
  }

  function createParticles() {
    while (particles.length < maxParticles) {
      particles.push(new Particle());
    }
  }
  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(ctx); });
    requestAnimationFrame(animateParticles);
  }
  createParticles();
  animateParticles();

  window.addEventListener("resize", () => {
    fogWidth = window.innerWidth;
    fogHeight = window.innerHeight;
    fogCanvas.width = fogWidth;
    fogCanvas.height = fogHeight;

    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });
});
