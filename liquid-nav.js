import { createLiquidGlass } from "./vendor/liquid-glass/glass-effect.js";

const surfaces = [
  [".brand-pod", "nav-brand-glass"],
  [".chapter-nav", "nav-chapters-glass"],
  [".poster-controls", "nav-language-glass"]
];

const appleLikeEffect = {
  radius: 72,
  blur: 62,
  distortion: 46,
  zoom: 42,
  chromaticAberration: 4,
  frost: 0,
  frostScale: 50,
  light: 48,
  edgeGlow: 82,
  edgeWidth: 38,
  tint: 100,
  alpha: 50
};

const effects = { ...appleLikeEffect };

function mountGlass(selector, id) {
  const glass = document.querySelector(selector);
  if (!glass || !window.html2canvas) return;

  glass.id = id;
  glass.dataset.html2canvasIgnore = "true";
  glass.classList.add("liquid-nav-webgl");
  glass.insertAdjacentHTML(
    "afterbegin",
    `<canvas class="liquid-glass-canvas" id="${id}-canvas" aria-hidden="true"></canvas><span class="liquid-glass-fallback" id="${id}-fallback" aria-hidden="true"></span>`
  );

  return createLiquidGlass({
    container: "#top",
    glass: `#${id}`,
    canvas: `#${id}-canvas`,
    fallback: `#${id}-fallback`,
    effect: effects,
    performance: { maxDpr: 1.15, targetFps: 24 }
  });
}

function mountDebugPanel(apis) {
  if (!new URLSearchParams(location.search).has("glass-debug")) return;

  const panel = document.createElement("aside");
  panel.className = "glass-debug";
  panel.innerHTML = `<h2>Liquid Glass 调试</h2><p>仅在 <code>?glass-debug=1</code> 下显示。所有参数均直接传给组件的 effect API。</p><div class="glass-debug-grid"></div><button type="button">恢复推荐参数</button>`;
  const grid = panel.querySelector(".glass-debug-grid");

  Object.entries(effects).forEach(([key, value]) => {
    const label = document.createElement("label");
    const output = document.createElement("output");
    const input = document.createElement("input");
    label.htmlFor = `glass-${key}`;
    label.textContent = key;
    output.htmlFor = input.id = `glass-${key}`;
    output.value = value;
    output.textContent = value;
    input.type = "range";
    input.min = key === "alpha" ? "30" : "0";
    input.max = "100";
    input.value = value;
    input.addEventListener("input", () => {
      effects[key] = Number(input.value);
      output.value = input.value;
      output.textContent = input.value;
      apis.forEach((api) => api.setEffect(effects));
    });
    grid.append(label, output, input);
  });

  panel.querySelector("button").addEventListener("click", () => {
    Object.assign(effects, appleLikeEffect);
    grid.querySelectorAll("input").forEach((input) => {
      input.value = effects[input.id.replace("glass-", "")];
      input.dispatchEvent(new Event("input"));
    });
  });
  document.body.append(panel);
}

try {
  const apis = surfaces.map(([selector, id]) => mountGlass(selector, id)).filter(Boolean);
  mountDebugPanel(apis);
} catch (error) {
  console.warn("Liquid navigation unavailable; CSS fallback remains active.", error);
}
