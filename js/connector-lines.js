
(function () {
  const OVERLAP_PX = 6;      // bigger overlap to ensure it meets the circle edge
  const LINE_Z = 1;          // line layer
  const ICON_Z = 3;          // icon layer (we'll enforce if needed)

  function isVisible(el) {
    if (!el) return false;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  // Pick the "real" icon wrapper: choose the biggest visible candidate, avoid <svg> unless it's the only thing.
  function pickIconWrapper(item) {
    const candidates = Array.from(
      item.querySelectorAll(".icon-mobile, .icon-desktop, .process-icon, .icon-box__icon, .brxe-icon, svg, img")
    ).filter(isVisible);

    if (!candidates.length) return null;

    // Prefer non-SVG wrappers by default
    const nonSvg = candidates.filter(el => el.tagName.toLowerCase() !== "svg");
    const pool = nonSvg.length ? nonSvg : candidates;

    // Choose largest box (usually the circle container)
    let best = pool[0];
    let bestArea = 0;

    for (const el of pool) {
      const r = el.getBoundingClientRect();
      const area = r.width * r.height;
      if (area > bestArea) {
        bestArea = area;
        best = el;
      }
    }

    return best;
  }

  function ensureIconsAboveLines(container) {
    // Make sure icon wrappers render above connector lines
    const icons = container.querySelectorAll(".process-icon, .icon-mobile, .icon-desktop, .icon-box__icon, .brxe-icon");
    icons.forEach(el => {
      // Only set if not already positioned; z-index needs positioning
      const cs = getComputedStyle(el);
      if (cs.position === "static") el.style.position = "relative";
      el.style.zIndex = ICON_Z;
    });
  }

  function initAll() {
    const grids = document.querySelectorAll(".process-grid");
    if (!grids.length) return;

    grids.forEach((container) => {
      const processItems = container.querySelectorAll(".process-item");
      const iconBoxes = container.querySelectorAll(".brxe-icon-box");

      let items = [];
      if (processItems.length) items = Array.from(processItems);
      else if (iconBoxes.length) items = Array.from(iconBoxes);
      else items = Array.from(container.children);

      if (items.length < 2) return;

      container.style.position = "relative";
      // If any parent/this has overflow hidden, this helps prevent clipping:
      container.style.overflow = "visible";

      function drawLines() {
        container.querySelectorAll(".connector-line").forEach(el => el.remove());

        const containerRect = container.getBoundingClientRect();

        // Keep icons above lines
        ensureIconsAboveLines(container);

        for (let i = 0; i < items.length - 1; i++) {
          const aEl = pickIconWrapper(items[i]);
          const bEl = pickIconWrapper(items[i + 1]);
          if (!aEl || !bEl) continue;

          const a = aEl.getBoundingClientRect();
          const b = bEl.getBoundingClientRect();

          const ax = a.left + a.width / 2;
          const ay = a.top + a.height / 2;
          const bx = b.left + b.width / 2;
          const by = b.top + b.height / 2;

          const dx = bx - ax;
          const dy = by - ay;

          // Decide orientation per pair (layout-proof)
          const vertical = Math.abs(dy) > Math.abs(dx);

          const line = document.createElement("div");
          line.className = "connector-line";

          if (vertical) {
            const ra = a.height / 2;
            const rb = b.height / 2;

            const x = ax - containerRect.left;
            const y1 = (ay + ra) - containerRect.top - OVERLAP_PX;
            const y2 = (by - rb) - containerRect.top + OVERLAP_PX;

            Object.assign(line.style, {
              position: "absolute",
              left: `${x - 1}px`,
              top: `${Math.min(y1, y2)}px`,
              width: "2px",
              height: `${Math.max(0, Math.abs(y2 - y1))}px`,
              background: "linear-gradient(to bottom, #5EB1BF, #1D234E)",
              WebkitMaskImage: "repeating-linear-gradient(to bottom, black 0px, black 10px, transparent 10px, transparent 15px)",
              maskImage: "repeating-linear-gradient(to bottom, black 0px, black 10px, transparent 10px, transparent 15px)",
              zIndex: LINE_Z,
              pointerEvents: "none"
            });

          } else {
            const ra = a.width / 2;
            const rb = b.width / 2;

            // IMPORTANT: Keep line centered on the circle, but behind it (z-index),
            // so it looks like it runs *under* the icon, not on top.
            const y = ay - containerRect.top;

            const x1 = (ax + ra) - containerRect.left - OVERLAP_PX;
            const x2 = (bx - rb) - containerRect.left + OVERLAP_PX;

            Object.assign(line.style, {
              position: "absolute",
              left: `${Math.min(x1, x2)}px`,
              top: `${y - 1}px`,
              width: `${Math.max(0, Math.abs(x2 - x1))}px`,
              height: "2px",
              background: "linear-gradient(to right, #5EB1BF, #1D234E)",
              WebkitMaskImage: "repeating-linear-gradient(to right, black 0px, black 10px, transparent 10px, transparent 15px)",
              maskImage: "repeating-linear-gradient(to right, black 0px, black 10px, transparent 10px, transparent 15px)",
              zIndex: LINE_Z,
              pointerEvents: "none"
            });
          }

          container.appendChild(line);
        }
      }

      setTimeout(drawLines, 60);
      setTimeout(drawLines, 200);
      setTimeout(drawLines, 500);

      window.addEventListener("resize", drawLines);
      window.addEventListener("load", drawLines);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  setTimeout(initAll, 400);
  setTimeout(initAll, 900);
})();
