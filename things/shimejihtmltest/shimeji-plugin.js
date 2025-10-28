// Shimeji Web Plugin by GPT-5
// Loads a mascot that can walk, fall, climb, stand, be dragged, and has a right-click menu

(function() {
  const SHIMEJI_PATH = "https://naplet.space/things/shimejiee%20-%20Tama%20Mod/img/Shimeji/";

  let squalo = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  // Helper
  const $ = id => document.getElementById(id);

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

  // Main function to create mascot
  function createShimeji(config, x = 500, y = 500) {
    const shime = new Shimeji(config);
    const div = document.createElement("div");
    div.className = "shimeji";
    container.appendChild(div);

    // Initialize mascot
    shime.init(div, x, y);

    // Define a virtual floor (bottom of window)
    shime.makeEnvironment([
      { x: 0, y: window.innerHeight - 128, width: window.innerWidth, height: 10 }
    ]);

    // Initial fall animation
    shime.act("fall", 40);

    // Store reference
    squalo = shime;

    // Right-click menu
    div.addEventListener("contextmenu", e => {
      e.preventDefault();
      menu.style.display = "block";
      menu.style.left = e.pageX + "px";
      menu.style.top = e.pageY + "px";
    });

    // Dragging
    div.addEventListener("mousedown", e => {
      if (e.button === 0) { // left mouse
        isDragging = true;
        dragOffset.x = e.clientX - parseInt(div.style.left || 0);
        dragOffset.y = e.clientY - parseInt(div.style.top || 0);
        e.preventDefault();
      }
    });

    window.addEventListener("mousemove", e => {
      if (!isDragging) return;
      const xPos = e.clientX - dragOffset.x;
      const yPos = e.clientY - dragOffset.y;
      div.style.left = xPos + "px";
      div.style.top = yPos + "px";
      if (squalo) squalo.place(xPos, yPos);
    });

    window.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        // Snap to floor if below bottom
        const floorY = window.innerHeight - 128;
        if (squalo._y > floorY) {
          squalo.place(squalo._x, floorY);
          div.style.top = floorY + "px";
        }
      }
    });
  }

  // Hide menu when clicking elsewhere
  document.addEventListener("click", e => {
    if (!menu.contains(e.target)) menu.style.display = "none";
  });

  // Menu button actions
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

  // Load config and start mascot
  window.addEventListener("DOMContentLoaded", () => {
    fetch(SHIMEJI_PATH + "mascot.json")
      .then(r => r.json())
      .then(conf => {
        // Replace all image sources with the new base path
        for (const act in conf.actions) {
          conf.actions[act].forEach(frame => {
            frame.src = SHIMEJI_PATH + frame.src.replace(/^.*?shime/, "shime");
          });
        }
        createShimeji(conf);
      })
      .catch(err => console.error("Failed to load mascot.json:", err));
  });

  // Adjust floor when window resizes
  window.addEventListener("resize", () => {
    if (squalo && squalo.environment) {
      squalo.environment[0].y = window.innerHeight - 128;
      squalo.environment[0].width = window.innerWidth;
    }
  });
})();
