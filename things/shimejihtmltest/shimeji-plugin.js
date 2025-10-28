// === Shimeji Plugin v1.2 ===
// Safe version: waits for DOM before accessing document.body.
// Requires: shimeji.js + randomWalk.js + shimeji.css

(function() {
  const SHIMEJI_BASE =
    "https://naplet.space/shimejiee%20-%20Tama%20Mod/img/Shimeji/";

  const CONFIG = {
    name: "Squalo",
    license: "unknown",
    baseUrl: SHIMEJI_BASE,
    actions: {
      sleep: [{ src: "shime21.png", anchor:[64,128], move:{x:0,y:0}, duration:2500 }],
      stand: [{ src: "shime1.png", anchor:[64,128], move:{x:0,y:0}, duration:250 }],
      walk: [
        { src:"shime1.png", anchor:[64,128], move:{x:-20,y:0}, duration:300 },
        { src:"shime2.png", anchor:[64,128], move:{x:-20,y:0}, duration:300 },
        { src:"shime1.png", anchor:[64,128], move:{x:-20,y:0}, duration:300 },
        { src:"shime3.png", anchor:[64,128], move:{x:-20,y:0}, duration:300 }
      ],
      shift: [
        { src:"shime25.png",anchor:[64,128],move:{x:0,y:0},duration:800 },
        { src:"shime25.png",anchor:[64,128],move:{x:-10,y:0},duration:200 },
        { src:"shime23.png",anchor:[64,128],move:{x:-10,y:0},duration:200 },
        { src:"shime24.png",anchor:[64,128],move:{x:-10,y:0},duration:200 },
        { src:"shime24.png",anchor:[64,128],move:{x:0,y:0},duration:800 },
        { src:"shime24.png",anchor:[64,128],move:{x:-20,y:0},duration:200 },
        { src:"shime23.png",anchor:[64,128],move:{x:-20,y:0},duration:200 },
        { src:"shime25.png",anchor:[64,128],move:{x:-20,y:0},duration:200 }
      ],
      sit_sing: [
        { src:"shime31.png",anchor:[64,128],move:{x:0,y:0},duration:250 },
        { src:"shime32.png",anchor:[64,128],move:{x:0,y:0},duration:750 },
        { src:"shime31.png",anchor:[64,128],move:{x:0,y:0},duration:250 },
        { src:"shime33.png",anchor:[64,128],move:{x:0,y:0},duration:750 }
      ],
      jump: [{ src:"shime22.png",anchor:[64,128],move:{x:0,y:0},duration:200 }],
      fall: [{ src:"shime4.png",anchor:[64,128],move:{x:0,y:40},duration:100 }],
      land: [
        { src:"shime18.png",anchor:[64,128],move:{x:0,y:0},duration:200 },
        { src:"shime19.png",anchor:[64,128],move:{x:0,y:0},duration:200 }
      ],
      climb: [
        { src:"shime14.png",anchor:[64,128],move:{x:0,y:0},duration:800 },
        { src:"shime14.png",anchor:[64,128],move:{x:0,y:-10},duration:200 },
        { src:"shime12.png",anchor:[64,128],move:{x:0,y:-10},duration:200 },
        { src:"shime13.png",anchor:[64,128],move:{x:0,y:-10},duration:200 },
        { src:"shime13.png",anchor:[64,128],move:{x:0,y:0},duration:800 },
        { src:"shime13.png",anchor:[64,128],move:{x:0,y:-20},duration:200 },
        { src:"shime12.png",anchor:[64,128],move:{x:0,y:-20},duration:200 },
        { src:"shime14.png",anchor:[64,128],move:{x:0,y:-20},duration:200 }
      ]
    },
    behavior: {}
  };

  window.addEventListener("DOMContentLoaded", () => {
    // --- Styling ---
    const style = document.createElement("style");
    style.textContent = `
      #shimeji-menu {
        position: absolute;
        display: none;
        background: rgba(30,30,30,0.95);
        border: 1px solid #888;
        border-radius: 10px;
        padding: 5px;
        z-index: 9999;
      }
      .shimeji-btn {
        border: 1px solid #ccc;
        padding: 5px 10px;
        margin: 3px;
        cursor: pointer;
        display: block;
        background-color: #444;
        color: #fff;
        border-radius: 6px;
        transition: background 0.2s;
        text-align: center;
      }
      .shimeji-btn:hover { background-color: #666; }
      .shimeji { user-select: none; cursor: grab; }
      .shimeji.dragging { cursor: grabbing; opacity: 0.8; }
    `;
    document.head.appendChild(style);

    // --- DOM Setup ---
    const container = document.createElement("div");
    container.id = "shimeji-container";
    container.style.position = "fixed";
    container.style.bottom = "0";
    container.style.left = "0";
    container.style.zIndex = "9998";
    document.body.appendChild(container);

    const menu = document.createElement("div");
    menu.id = "shimeji-menu";
    menu.innerHTML = `
      <div class="shimeji-btn" data-action="walk">Walk</div>
      <div class="shimeji-btn" data-action="climb">Climb</div>
      <div class="shimeji-btn" data-action="stand">Stand</div>
      <div class="shimeji-btn" data-action="fall">Drop</div>
      <div class="shimeji-btn" data-action="hide">Hide</div>
    `;
    document.body.appendChild(menu);

    let squalo;

    function createShimeji(x = 500, y = 500) {
      const shime = new Shimeji(CONFIG);
      const div = document.createElement("div");
      div.className = "shimeji";
      container.appendChild(div);
      shime.init(div, x, y);
      shime.makeEnvironment([]);
      shime.act("fall", 40);
      squalo = shime;

      // --- Dragging Logic ---
      let isDragging = false;
      let offsetX = 0, offsetY = 0;

      function startDrag(e) {
        e.preventDefault();
        const cX = e.touches ? e.touches[0].clientX : e.clientX;
        const cY = e.touches ? e.touches[0].clientY : e.clientY;
        offsetX = cX - div.offsetLeft;
        offsetY = cY - div.offsetTop;
        isDragging = true;
        div.classList.add("dragging");
        shime.cancelAct();
      }

      function duringDrag(e) {
        if (!isDragging) return;
        const cX = e.touches ? e.touches[0].clientX : e.clientX;
        const cY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = cX - offsetX;
        const y = cY - offsetY;
        div.style.left = x + "px";
        div.style.top = y + "px";
        div.style.position = "fixed";
        shime._x = x;
        shime._y = y;
      }

      function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        div.classList.remove("dragging");
        shime.act("land", 1);
      }

      div.addEventListener("mousedown", startDrag);
      div.addEventListener("touchstart", startDrag, { passive: false });
      document.addEventListener("mousemove", duringDrag);
      document.addEventListener("touchmove", duringDrag, { passive: false });
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchend", endDrag);

      // --- Right-click menu trigger ---
      div.addEventListener("contextmenu", e => {
        e.preventDefault();
        menu.style.display = "block";
        menu.style.left = e.pageX + "px";
        menu.style.top = e.pageY + "px";
      });
    }

    // Hide context menu on click elsewhere
    document.addEventListener("click", e => {
      if (!menu.contains(e.target)) menu.style.display = "none";
    });

    // Menu actions
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

    // Initialize mascot
    createShimeji(window.innerWidth / 2, window.innerHeight / 2);
  });
})();
