document.addEventListener("DOMContentLoaded", function () {
  const supportsFinePointer =
    window.matchMedia("(pointer: fine)").matches &&
    window.matchMedia("(hover: hover)").matches;
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!supportsFinePointer) {
    return;
  }

  const body = document.body;
  const cursorOuter = document.createElement("div");
  const cursorInner = document.createElement("div");
  const cursorToggle = document.createElement("button");

  cursorOuter.className = "cursor-outer";
  cursorInner.className = "cursor-inner";
  cursorToggle.className = "cursor-toggle";
  cursorToggle.type = "button";
  cursorToggle.innerHTML = '<i class="ph-bold ph-mouse-simple"></i>';
  cursorToggle.setAttribute("aria-label", "Toggle custom cursor");
  cursorToggle.setAttribute("title", "Toggle custom cursor");

  body.appendChild(cursorOuter);
  body.appendChild(cursorInner);
  body.appendChild(cursorToggle);

  let isEnabled = localStorage.getItem("cursorEnabled") !== "false";
  let currentState = "";
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let outerX = targetX;
  let outerY = targetY;
  let rafId = 0;
  let inactivityTimer = 0;
  let hasPointerPosition = false;

  const controlSelector = [
    ".cursor-toggle",
    ".btn",
    ".portfolio-filter",
    "button",
    "input",
    "textarea",
    "select",
    ".header__trigger",
    ".color-switcher",
    ".project-section-nav__link",
    ".pswp__button"
  ].join(", ");

  const cardSelector = [
    ".portfolio-card",
    ".project-related-card",
    ".portfolio-spotlight",
    ".gallery__item",
    ".project-gallery-item"
  ].join(", ");

  function setElementPosition(element, x, y) {
    element.style.left = x + "px";
    element.style.top = y + "px";
  }

  function clearCursorStates() {
    body.classList.remove("cursor-hover", "cursor-hover-control", "cursor-hover-card", "cursor-hover-link");
  }

  function setCursorState(nextState) {
    if (currentState === nextState) {
      return;
    }

    clearCursorStates();
    currentState = nextState;

    if (!nextState) {
      return;
    }

    body.classList.add("cursor-hover", "cursor-hover-" + nextState);
  }

  function getInteractionState(target) {
    if (!(target instanceof Element)) {
      return "";
    }

    if (target.closest(controlSelector)) {
      return "control";
    }

    if (target.closest(cardSelector)) {
      return "card";
    }

    if (target.closest("a, [role='button']")) {
      return "link";
    }

    return "";
  }

  function updateInteractionState(target) {
    if (!isEnabled) {
      setCursorState("");
      return;
    }

    setCursorState(getInteractionState(target));
  }

  function syncToggleState() {
    cursorToggle.classList.toggle("active", isEnabled);
    cursorToggle.setAttribute("aria-pressed", String(isEnabled));
    body.classList.toggle("custom-cursor", isEnabled);
    body.classList.toggle("cursor-trail-enabled", isEnabled && !reducedMotionQuery.matches);
    body.classList.toggle("cursor-reduced-motion", reducedMotionQuery.matches);
    cursorOuter.hidden = !isEnabled;
    cursorInner.hidden = !isEnabled;

    if (!isEnabled) {
      clearCursorStates();
      body.classList.remove("cursor-click", "cursor-inactive", "cursor-hidden");
    }
  }

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    body.classList.remove("cursor-inactive");

    inactivityTimer = window.setTimeout(function () {
      if (isEnabled) {
        body.classList.add("cursor-inactive");
      }
    }, 1800);
  }

  function updatePointerPosition(event) {
    targetX = event.clientX;
    targetY = event.clientY;

    if (!hasPointerPosition) {
      outerX = targetX;
      outerY = targetY;
      hasPointerPosition = true;
    }

    setElementPosition(cursorInner, targetX, targetY);
  }

  function animateOuterCursor() {
    const easing = reducedMotionQuery.matches ? 1 : 0.32;
    outerX += (targetX - outerX) * easing;
    outerY += (targetY - outerY) * easing;
    setElementPosition(cursorOuter, outerX, outerY);
    rafId = window.requestAnimationFrame(animateOuterCursor);
  }

  function setEnabled(nextEnabled) {
    isEnabled = nextEnabled;
    localStorage.setItem("cursorEnabled", String(nextEnabled));
    syncToggleState();
  }

  cursorToggle.addEventListener("click", function () {
    setEnabled(!isEnabled);
  });

  document.addEventListener("mousemove", function (event) {
    if (!isEnabled) {
      return;
    }

    body.classList.remove("cursor-hidden");
    updatePointerPosition(event);
    updateInteractionState(event.target);
    resetInactivityTimer();
  });

  document.addEventListener("mouseover", function (event) {
    updateInteractionState(event.target);
  });

  document.addEventListener("mouseout", function (event) {
    const nextTarget = event.relatedTarget instanceof Element ? event.relatedTarget : null;
    updateInteractionState(nextTarget);
  });

  document.addEventListener("mousedown", function () {
    if (isEnabled) {
      body.classList.add("cursor-click");
    }
  });

  document.addEventListener("mouseup", function () {
    body.classList.remove("cursor-click");
  });

  document.addEventListener("mouseleave", function () {
    body.classList.add("cursor-hidden");
    clearCursorStates();
  });

  window.addEventListener("blur", function () {
    body.classList.add("cursor-hidden");
    clearCursorStates();
    body.classList.remove("cursor-click");
  });

  window.addEventListener("focus", function () {
    if (isEnabled) {
      body.classList.remove("cursor-hidden");
    }
  });

  reducedMotionQuery.addEventListener("change", function () {
    syncToggleState();
  });

  syncToggleState();
  resetInactivityTimer();

  if (!rafId) {
    animateOuterCursor();
  }
});
