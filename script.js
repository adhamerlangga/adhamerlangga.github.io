const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const progress = document.querySelector(".scroll-progress");
const backToTop = document.querySelector("[data-back-to-top]");
const sections = document.querySelectorAll("main section[id]");
const yearsSinceNodes = document.querySelectorAll("[data-years-since]");

yearsSinceNodes.forEach((node) => {
  const startDate = new Date(node.dataset.yearsSince);
  const today = new Date();

  if (Number.isNaN(startDate.getTime())) return;

  let years = today.getFullYear() - startDate.getFullYear();
  const hasNotReachedAnniversary =
    today.getMonth() < startDate.getMonth()
    || (today.getMonth() === startDate.getMonth() && today.getDate() < startDate.getDate());

  if (hasNotReachedAnniversary) {
    years -= 1;
  }

  node.textContent = `${Math.max(0, years)}+`;
});

const setActiveNav = () => {
  const offset = window.scrollY + 120;
  let current = "home";

  sections.forEach((section) => {
    if (offset >= section.offsetTop) {
      current = section.id;
    }
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${current}`);
  });
};

const setScrollProgress = () => {
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progressValue = documentHeight > 0 ? (window.scrollY / documentHeight) * 100 : 0;
  progress.style.width = `${progressValue}%`;
  backToTop.classList.toggle("is-visible", window.scrollY > 560);
};

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  nav.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  });
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", () => {
  setActiveNav();
  setScrollProgress();
}, { passive: true });

window.addEventListener("resize", setActiveNav);
setActiveNav();
setScrollProgress();

const canvas = document.querySelector("#data-canvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (canvas) {
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let points = [];
  let animationFrame = 0;

  const createPoints = () => {
    const count = Math.min(90, Math.max(42, Math.floor((width * height) / 26000)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.26,
      vy: (Math.random() - 0.5) * 0.26,
      size: Math.random() > 0.82 ? 3 : 2,
      hue: Math.random() > 0.5 ? "mint" : "amber",
    }));
  };

  const resizeCanvas = () => {
    const ratio = window.devicePixelRatio || 1;
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    createPoints();
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(5, 7, 10, 0.22)";
    context.fillRect(0, 0, width, height);

    points.forEach((point, index) => {
      if (!reducedMotion.matches) {
        point.x += point.vx;
        point.y += point.vy;
      }

      if (point.x < 0 || point.x > width) point.vx *= -1;
      if (point.y < 0 || point.y > height) point.vy *= -1;

      for (let otherIndex = index + 1; otherIndex < points.length; otherIndex += 1) {
        const other = points[otherIndex];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);

        if (distance < 145) {
          const alpha = 1 - distance / 145;
          context.strokeStyle = `rgba(79, 195, 180, ${alpha * 0.18})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    });

    points.forEach((point) => {
      context.fillStyle = point.hue === "mint"
        ? "rgba(79, 195, 180, 0.72)"
        : "rgba(240, 180, 93, 0.62)";
      context.fillRect(point.x, point.y, point.size, point.size);
    });

    if (!reducedMotion.matches) {
      animationFrame = requestAnimationFrame(draw);
    }
  };

  resizeCanvas();
  draw();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    draw();
  });
}
