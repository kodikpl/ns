// Self-contained Shimeji plugin (no mascot.json needed)
(function() {
  const SHIMEJI_PATH = "//example.space/shimejiee%20-%20Tama%20Mod/img/Shimeji/";

  let squalo = null;
  let dragData = { dragging: false, offsetX: 0, offsetY: 0 };

  window.addEventListener("DOMContentLoaded", () => {
    // --- Container ---
    const container = document.createElement("div");
    container.id = "shimeji-container";
    container.style.position = "fixed";
    container.style.left = "500px";
    container.style.top = "500px";
    container.style.zIndex = "9998";
    container.style.userSelect = "none";
    document.body.appendChild(container);

    // --- Context menu ---
    const menu = document.createElement("div");
    menu.id = "shimeji-menu";
    menu.style.position = "absolute";
    menu.style.display = "none";
    menu.style.background = "rgba(30,30,30,0.9)";
    menu.style.border = "1px solid #888";
    menu.style.borderRadius = "10px";
    menu.style.padding = "5px";
    menu.style.zIndex = "9999";

    ["walk","climb","stand","fall","hide"].forEach(action => {
      const btn = document.createElement("div");
      btn.className = "shimeji-btn";
      btn.dataset.action = action;
      btn.textContent = action.charAt(0).toUpperCase() + action.slice(1);
      btn.style.cssText = "border:1px solid #ccc; padding:5px 10px; margin:3px; cursor:pointer; background:#444; color:#fff; border-radius:6px; text-align:center;";
      btn.addEventListener("mouseenter", () => btn.style.background = "#666");
      btn.addEventListener("mouseleave", () => btn.style.background = "#444");
      menu.appendChild(btn);
    });
    document.body.appendChild(menu);

    // --- Shimeji configuration (directly in plugin) ---
    const CONFIG = {
      name: "Squalo",
      license: "unknown",
      baseUrl: SHIMEJI_PATH,
      actions: {
        stand: [{ src: "shime1.png", anchor:[64,128], move:{x:0,y:0}, duration:250 }],
        walk: [
          { src:"shime1.png", anchor:[64,128], move:{x:-20,y:0}, duration:300 },
          { src:"shime2.png", anchor:[64,128], move:{x:-20,y:0}, duration:300 },
          { src:"shime1.png", anchor:[64,128], move:{x:-20,y:0}, duration:300 },
          { src:"shime3.png", anchor:[64,128], move:{x:-20,y:0}, duration:300 }
        ],
        fall: [{ src:"shime4.png", anchor:[64,128], move:{x:0,y:40}, duration:100 }],
        land: [
          { src:"shime18.png", anchor:[64,128], move:{x:0,y:0}, duration:200 },
          { src:"shime19.png", anchor:[64,128], move:{x:0,y:0}, duration:200 }
        ],
        climb: [
          { src:"shime14.png", anchor:[64,128], move:{x:0,y:0}, duration:800 },
          { src:"shime14.png", anchor:[64,128], move:{x:0,y:-10}, duration:200 },
          { src:"shime12.png", anchor:[64,128], move:{x:0,y:-10}, duration:200 },
          { src:"shime13.png", anchor:[64,128], move:{x:0,y:-10}, duration:200 },
          { src:"shime13.png", anchor:[64,128], move:{x:0,y:0}, duration:800 },
          { src:"shime13.png", anchor:[64,128], move:{x:0,y:-20}, duration:200 },
          { src:"shime12.png", anchor:[64,128], move:{x:0,y:-20}, duration:200 },
          { src:"shime14.png", anchor:[64,128], move:{x:0,y:-20}, duration:200 }
        ]
      },
      behavior: {}
    };

    // --- Create Shimeji ---
    function createShimeji(x=500, y=500){
      const shime = new Shimeji(CONFIG);
      const div = document.createElement("div");
      div.className = "shimeji";
      container.appendChild(div);

      shime.init(div, x, y);
      shime.makeEnvironment([
        { x:0, y:window.innerHeight-128, width:window.innerWidth, height:10 }
      ]);
      shime.act("fall", 40);
      squalo = shime;

      // --- Dragging ---
      div.addEventListener("mousedown", e=>{
        if(e.button!==0) return;
        dragData.dragging=true;
        dragData.offsetX = e.clientX - div.offsetLeft;
        dragData.offsetY = e.clientY - div.offsetTop;
        shime.cancelAct();
      });
      window.addEventListener("mousemove", e=>{
        if(!dragData.dragging) return;
        const x = e.clientX - dragData.offsetX;
        const y = e.clientY - dragData.offsetY;
        div.style.left = x+"px";
        div.style.top = y+"px";
        shime.place(x,y);
      });
      window.addEventListener("mouseup", ()=>{
        if(!dragData.dragging) return;
        dragData.dragging=false;
        const floorY = window.innerHeight-128;
        if(shime._y>floorY){
          shime.place(shime._x,floorY);
          div.style.top = floorY+"px";
        }
      });

      // --- Right-click menu ---
      div.addEventListener("contextmenu", e=>{
        e.preventDefault();
        menu.style.display="block";
        menu.style.left=e.pageX+"px";
        menu.style.top=e.pageY+"px";
      });
    }

    // --- Menu button actions ---
    menu.addEventListener("click", e=>{
      if(!e.target.classList.contains("shimeji-btn")) return;
      const action = e.target.dataset.action;
      menu.style.display="none";
      if(action==="hide"){ container.style.display="none"; return; }
      if(squalo) squalo.act(action,1,false,false,false);
    });

    // Hide menu when clicking outside
    document.addEventListener("click", e=>{
      if(!menu.contains(e.target)) menu.style.display="none";
    });

    // --- Init mascot ---
    createShimeji(window.innerWidth/2, window.innerHeight/2);

    // --- Adjust floor on resize ---
    window.addEventListener("resize", ()=>{
      if(squalo && squalo.environment){
        squalo.environment[0].y = window.innerHeight-128;
        squalo.environment[0].width = window.innerWidth;
      }
    });
  });
})();
