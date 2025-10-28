(function() {
  const SHIMEJI_PATH = "//naplet.space/shimejiee%20-%20Tama%20Mod/img/Shimeji/";

  let squalo = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  window.addEventListener("DOMContentLoaded", () => {
    // Create mascot container
    const container = document.createElement("div");
    container.id = "shimeji-container";
    container.style.position = "fixed";
    container.style.left = "500px";
    container.style.top = "500px";
    container.style.zIndex = "9998";
    container.style.userSelect = "none";
    document.body.appendChild(container);

    // Context menu
    const menu = document.createElement("div");
    menu.id = "shimeji-menu";
    menu.style.position = "absolute";
    menu.style.display = "none";
    menu.style.background = "rgba(30,30,30,0.9)";
    menu.style.border = "1px solid #888";
    menu.style.borderRadius = "10px";
    menu.style.padding = "5px";
    menu.style.zIndex = "9999";
    const menuActions = ["walk", "climb", "stand", "fall", "hide"];
    menuActions.forEach(action => {
      const btn = document.createElement("div");
      btn.className = "shimeji-btn";
      btn.dataset.action = action;
      btn.textContent = action.charAt(0).toUpperCase() + action.slice(1);
      btn.style.border = "1px solid #ccc";
      btn.style.padding = "5px 10px";
      btn.style.margin = "3px";
      btn.style.cursor = "pointer";
      btn.style.backgroundColor = "#444";
      btn.style.color = "#fff";
      btn.style.borderRadius = "6px";
      btn.style.textAlign = "center";
      btn.style.transition = "background 0.2s";
      btn.addEventListener("mouseenter", () => (btn.style.background = "#666"));
      btn.addEventListener("mouseleave", () => (btn.style.background = "#444"));
      menu.appendChild(btn);
    });
    document.body.appendChild(menu);

    // Load mascot.json and create mascot
    fetch(SHIMEJI_PATH + "mascot.json")
      .then(r => r.json())
      .then(conf => {
        // Update frame paths
        for (const act in conf.actions) {
          conf.actions[act].forEach(frame => {
            frame.src = SHIMEJI_PATH + frame.src.replace(/^.*?shime/, "shime");
          });
        }
        createShimeji(conf, container, menu);
      })
      .catch(err => console.error("Failed to load mascot.json:", err));

    // Adjust floor on resize
    window.addEventListener("resize", () => {
      if (squalo && squalo.environment) {
        squalo.environment[0].y = window.innerHeight - 128;
        squalo.environment[0].width = window.innerWidth;
      }
    });
  });

  function createShimeji(config, container, menu, x = 500, y = 500) {
    const shime = new Shimeji(config);
    const div = document.createElement("div");
    div.className = "shimeji";
    container.appendChild(div);

    // Initialize mascot
    shime.init(div, x, y);

    // Add virtual floor
    shime.makeEnvironment([
      { x: 0, y: window.innerHeight - 128, width: window.innerWidth, height: 10 }
    ]);

    shime.act("fall", 40);
    squalo = shime;

    // Right-click menu
    div.addEventListener("contextmenu", e => {
      e.preventDefault();
      menu.style.display = "block";
      menu.style.left = e.pageX + "px";
      menu.style.top = e.pageY + "px";
    });

    // Dragging
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    div.addEventListener("mousedown", e => {
      if (e.button === 0) {
        isDragging = true;
        offsetX = e.clientX - div.offsetLeft;
        offsetY = e.clientY - div.offsetTop;
      }
    });

    window.addEventListener("mousemove", e => {
      if (!isDragging) return;
      const xPos = e.clientX - offsetX;
      const yPos = e.clientY - offsetY;
      div.style.left = xPos + "px";
      div.style.top = yPos + "px";
      if (squalo) squalo.place(xPos, yPos);
    });

    window.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      const floorY = window.innerHeight - 128;
      if (squalo._y > floorY) {
        squalo.place(squalo._x, floorY);
        div.style.top = floorY + "px";
      }
    });

    // Menu buttons
    menu.addEventListener("click", e => {
      if (!e.target.classList.contains("shimeji-btn")) return;
      const action = e.target.dataset.action;
      menu.style.display = "none";
      if (action === "hide") {
        container.style.display = "none";
        return;
      }
      if (squalo) squalo.act(action, 1, false, false, false);
    });

    // Hide menu on outside click
    document.addEventListener("click", e => {
      if (!menu.contains(e.target)) menu.style.display = "none";
    });
  }
})();
