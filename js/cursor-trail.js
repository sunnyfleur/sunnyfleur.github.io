document.addEventListener("DOMContentLoaded", function () {
  const supportsFinePointer =
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(hover: hover)").matches;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!supportsFinePointer) {
    return;
  }

  const trailContainer = document.createElement("div");
  const trail = [];
  const maxTrail = 6;
  const trailLifetime = 420;
  let lastX = 0;
  let lastY = 0;
  let lastSpawnAt = 0;

  trailContainer.className = "cursor-trail-container";
  document.body.appendChild(trailContainer);

  function isTrailEnabled() {
    return (
      document.body.classList.contains("custom-cursor") &&
      document.body.classList.contains("cursor-trail-enabled") &&
      !reducedMotionQuery.matches
    );
  }

  function clearTrail() {
    while (trail.length > 0) {
      const trailPoint = trail.pop();
      trailPoint.element.remove();
    }
  }

  function createTrailPoint(x, y) {
    const point = document.createElement("div");
    point.className = "cursor-trail-point";
    point.style.left = x + "px";
    point.style.top = y + "px";
    trailContainer.appendChild(point);

    trail.push({
      element: point,
      createdAt: performance.now()
    });

    while (trail.length > maxTrail) {
      const oldestPoint = trail.shift();
      oldestPoint.element.remove();
    }
  }

  function updateTrail() {
    const now = performance.now();

    if (!isTrailEnabled()) {
      clearTrail();
      window.requestAnimationFrame(updateTrail);
      return;
    }

    for (let index = trail.length - 1; index >= 0; index -= 1) {
      const point = trail[index];
      const age = now - point.createdAt;
      const progress = age / trailLifetime;

      if (progress >= 1) {
        point.element.remove();
        trail.splice(index, 1);
        continue;
      }

      point.element.style.opacity = String(0.16 * (1 - progress));
      point.element.style.transform = "translate(-50%, -50%) scale(" + (1 - progress * 0.18) + ")";
    }

    window.requestAnimationFrame(updateTrail);
  }

  document.addEventListener("mousemove", function (event) {
    if (!isTrailEnabled()) {
      return;
    }

    const now = performance.now();
    const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);

    if (now - lastSpawnAt > 85 && distance > 18) {
      createTrailPoint(event.clientX, event.clientY);
      lastX = event.clientX;
      lastY = event.clientY;
      lastSpawnAt = now;
    }
  });

  reducedMotionQuery.addEventListener("change", function () {
    if (reducedMotionQuery.matches) {
      clearTrail();
    }
  });

  updateTrail();
});
