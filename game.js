// =====================================
// VARIABLES GLOBALES DECLARADAS
// =====================================
let regla;
let reglah;
let textoAltura;
let textoDistancia;
let textoVelocidad;
let textoCaudal;
let textoDiametro;
let textoAngulo;
let musica;
let angulo = 0;
let torso;
let piernas;
let bombero;
let escaleras;
let estado = "menu";
let boca;
let jugador;
let jugador2; 
let cursors;
let space;
let springtrap;
let fuegogif;
let agua;
let aguas;
let ultimoDisparo = 0;
let fuegos;
let humo;

// Variables de escenario añadidas para evitar fugas de memoria globales
let fondo, calle, edificio, puerta, camion, arbol, pastos, canon, cabeza, fazbear;

let diametro = 0.8; // 0.3 a 2 (escala del juego)
let presion = 300000; // 300 kPa típico de manguera
let caudalSimulado = 50; // Nuevo: En litros por segundo para el modo Caudal Constante
let modoFisica = "presion"; // Nuevo: Puede ser "presion" o "caudal"

const rho = 1000; // densidad del agua
const escala = 2; // ajuste del juego

const config = {
  type: Phaser.AUTO,
  width: 930,
  height: 600,
  backgroundColor: "#443a31",
  parent: "game",
  scene: {
    preload,
    create,
    update,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 500,
      },
    },
  },
};

new Phaser.Game(config);

// ======================
// PRELOAD
// ======================
function preload() {
  cargarSprites.call(this);
}

// ======================
// CREATE
// ======================
function create() {
  console.log("creating...");

  crearAnimaciones.call(this);

  fuegos = this.physics.add.group();
  aguas = this.physics.add.group();

  this.physics.add.overlap(aguas, fuegos, apagarFuego, null, this);

  musica = this.sound.add("music", {
    volume: 0.2,
    loop: true,
  });
  musica.play();

  const btnMusica = document.getElementById("btnMusica");
  let musicaActiva = true;

  if (btnMusica) {
    btnMusica.addEventListener("click", () => {
      if (musicaActiva) {
        musica.pause();
        btnMusica.src = "assets/texturas/icons/musicyes.png";
        musicaActiva = false;
      } else {
        musica.resume();
        btnMusica.src = "assets/texturas/icons/musicno.png";
        musicaActiva = true;
      }
    });
  }

  crearInput.call(this);
  crearMenu.call(this);

  // Ocultar los controles de caudal al iniciar el juego
  mostrarControlCaudal(false);

  // --- CONFIGURACIÓN DE INTERFAZ HTML ---
  const sliderPresion = document.getElementById("presionSlider");
  const textoPresion = document.getElementById("presionTexto");
  const sliderCaudal = document.getElementById("caudalSlider");
  const textoCaudalHTML = document.getElementById("caudalTexto");

  // Escuchador Slider Presión
  if (sliderPresion && textoPresion) {
    // Sincronizar valor inicial
    presion = Number(sliderPresion.value) * 1000;
    textoPresion.innerText = "Presión: "+sliderPresion.value + " kPa";

    sliderPresion.addEventListener("input", (e) => {
      presion = Number(e.target.value) * 1000;
      textoPresion.innerText = "Presión: "+e.target.value + " kPa";
    });
  }

  //Escuchador Slider Caudal
  if (sliderCaudal) {
    // Sincronizar valor inicial del slider con la simulación
    caudalSimulado = Number(sliderCaudal.value);
    
    sliderCaudal.addEventListener("input", (e) => {
      caudalSimulado = Number(e.target.value);
      if (textoCaudalHTML) {
        textoCaudalHTML.innerText = "Caudal: " + e.target.value + " L/s";
      }
    });
  }

  // Escuchador de los botones Radio (Modos de física)
  const radios = document.getElementsByName("modoFisica");
  radios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      modoFisica = e.target.value;
      if (modoFisica === "presion") {
        if (sliderPresion) sliderPresion.disabled = false;
        if (sliderCaudal) sliderCaudal.disabled = true;
      } else {
        if (sliderPresion) sliderPresion.disabled = true;
        if (sliderCaudal) sliderCaudal.disabled = false;
      }
    });
  });
}

// ======================
// UPDATE
// ======================
function update() {
  if (estado === "caso1") {
    moverJugador();
    if (space.isDown && this.time.now > ultimoDisparo) {
      dispararAgua.call(this);
      ultimoDisparo = this.time.now + 50;
    }
  }

  if (estado === "caso2") {
    moverJugador2();
    if (space.isDown && this.time.now > ultimoDisparo) {
      dispararAgua2.call(this);
      ultimoDisparo = this.time.now + 35;
    }
  }

  if (estado === "caso3") {
    moverCanon();
    if (space.isDown && this.time.now > ultimoDisparo) {
      dispararCanon.call(this);
      ultimoDisparo = this.time.now + 70;
    }
  }
}

// ======================
// MÉTODOS
// ======================

function cargarSprites() {
  this.load.audio("music", "assets/audio/music.mp3");
  this.load.spritesheet("springtrap", "assets/texturas/elementos/springtrap.png", {
    frameWidth: 375, frameHeight: 279, spacing: 2, margin: 0,
  });
  this.load.spritesheet("fuegogif", "assets/texturas/elementos/fuegogif.png", {
    frameWidth: 200, frameHeight: 200, spacing: 2, margin: 0,
  });
  this.load.spritesheet("humo", "assets/texturas/elementos/humo.png", {
    frameWidth: 1024, frameHeight: 1024, spacing: 2, margin: 0,
  });

  this.load.image("torres", "assets/texturas/fondo/torres.jpg");
  this.load.image("bosque", "assets/texturas/fondo/bosque.png");
  this.load.image("roca", "assets/texturas/bomberos/bombero1.png");
  this.load.image("ventana", "assets/texturas/elementos/ventana.png");
  this.load.image("escaleras", "assets/texturas/elementos/escaleras.png");
  this.load.image("boca", "assets/texturas/bomberos/boca.png");
  this.load.image("camion", "assets/texturas/elementos/camion.png");
  this.load.image("puerta", "assets/texturas/elementos/puerta.png");
  this.load.image("gota", "assets/texturas/elementos/gota.png");
  this.load.image("torso", "assets/texturas/bomberos/torso.png");
  this.load.image("piernas", "assets/texturas/bomberos/piernas.png");
  this.load.image("cabeza", "assets/texturas/bomberos/cabeza.png");
  this.load.image("pasto", "assets/texturas/elementos/pasto.png");
  this.load.image("arbol", "assets/texturas/elementos/arbol.png");
  this.load.image("city", "assets/texturas/elementos/city.jpg");
  this.load.image("cannon", "assets/texturas/elementos/cannon.png");
  this.load.image("watercannon", "assets/texturas/elementos/watercanon.png");
  this.load.image("fazbear", "assets/texturas/elementos/fazbear.png");
  this.load.image("bloque", "assets/texturas/elementos/bloque.png");
  this.load.image("regla","assets/texturas/elementos/regla.jpg");
  this.load.image("reglah","assets/texturas/elementos/reglah.jpg");
}

function crearAnimaciones() {
  this.anims.create({
    key: "spring",
    frames: this.anims.generateFrameNumbers("springtrap", { start: 0, end: 35 }),
    frameRate: 5,
    repeat: -1,
  });
  this.anims.create({
    key: "fueguitogif",
    frames: this.anims.generateFrameNumbers("fuegogif", { start: 0, end: 3 }),
    frameRate: 5,
    repeat: -1,
  });
  this.anims.create({
    key: "humito",
    frames: this.anims.generateFrameNumbers("humo", { start: 0, end: 3 }),
    frameRate: 5,
    repeat: -1,
  });
}

function crearMapa() {
  fondo = this.add.image(420, 250, "torres").setScale(1.5);
  calle = this.add.rectangle(300, 580, 1500, 60, 0x2c2c2c);
  edificio = this.add.rectangle(700, 300, 300, 500, 0x555555);
  puerta = this.add.image(600, 485, "puerta").setScale(0.3);
  camion = this.add.image(180, 475, "camion").setScale(0.82).setDepth(2);
  regla =this.add.image();
  reglah=this.add.image();
  crearVentanas.call(this);
  crearFuegos.call(this);
}

function crearMapa2() {
  fondo = this.add.image(467, 250, "bosque").setScale(1.2);
  calle = this.add.rectangle(300, 580, 1500, 60, 0x183710);
  camion = this.add.image(-20, 490, "camion").setScale(0.5).setDepth(2);
  arbol = this.add.image(700, 370, "arbol").setScale(1);
  pastos = this.add.image(650, 560, "pasto");
  crearFuegos2.call(this);
}

function crearMapa3() {
  fondo = this.add.image(467, 270, "city").setScale(0.55);
  calle = this.add.rectangle(300, 580, 1500, 60, 0x2c2c2c);
  canon = this.add.image(240, 340, "cannon");
  camion = this.add.image(150, 400, "watercannon").setScale(0.6).setDepth(2);
  cabeza = this.add.image(200, 210, "cabeza").setScale(0.5);
  fazbear = this.add.image(680, 350, "fazbear").setScale(1);
  crearFuegos3.call(this);
}

function crearVentanas() {
  const posiciones = [
    [800, 150], [700, 150], [600, 150],
    [800, 250], [700, 250], [600, 250],
    [800, 350], [700, 350], [600, 350],
  ];
  posiciones.forEach(([x, y]) => {
    this.add.image(x, y, "ventana").setScale(0.5);
  });
}

function crearFuegos() {
  const posiciones = [
    [800, 150], [700, 150], [600, 150],
    [800, 250], [700, 250], [600, 250],
    [800, 350], [700, 350], [600, 350],
  ];
  posiciones.forEach(([x, y]) => { crearFuegogif.call(this, x, y); });
}

function crearFuegos2() {
  const posiciones = [
    [900, 550], [700, 550], [450, 550], [550, 550], [600, 550],
    [700, 100], [800, 250], [600, 250],
    [850, 350], [720, 350], [600, 350],
  ];
  posiciones.forEach(([x, y]) => { crearFuegogif.call(this, x, y); });
}

function crearFuegos3() {
  const posiciones = [
    [900, 550], [700, 550], [450, 550], [550, 550], [600, 550],
    [300, 550], [380, 550], [390, 550], [430, 550], [400, 550],
    [700, 100], [800, 250], [600, 250], [720, 100], [880, 250], [590, 250],
    [760, 90],  [820, 270], [640, 210], [850, 390], [720, 320], [640, 280],
    [890, 690], [680, 120], [520, 230], [700, 350]
  ];
  posiciones.forEach(([x, y]) => { crearFuegogif2.call(this, x, y); });
}

function crearJugador() {
  escaleras = this.add.image(100, 60, "escaleras").setScale(0.5);
  boca = this.add.image(132, -78, "boca").setScale(0.8);
  bombero = this.add.image(100, 30, "roca").setScale(0.5);
  jugador = this.add.container(180, 300, [escaleras, bombero, boca]);
}

function crearJugador2() {
  piernas = this.add.image(60, 300, "piernas");
  torso = this.add.image(200, 200, "torso");
  jugador2 = this.add.container(90, 420, [piernas, torso]).setScale(0.4);
}

function crearSpringtrap() {
  springtrap = this.add.sprite(770, 470, "springtrap").setScale(0.3);
  springtrap.play("spring");
}

function crearFuegogif(x, y) {
  let f = fuegos.create(x, y, "fuegogif").setScale(0.4);
  f.play("fueguitogif");
  f.setImmovable(true);
  f.body.allowGravity = false;
  f.vida = 60;
  f.escalaHumo = 0.2;
  return f;
}

function crearFuegogif2(x, y) {
  let f = fuegos.create(x, y, "fuegogif").setScale(2);
  f.play("fueguitogif");
  f.setImmovable(true);
  f.body.allowGravity = false;
  f.vida = 300;
  f.escalaHumo = 0.9;
  return f;
}

// Controla la visibilidad de los elementos de caudal en la interfaz HTML
// Controla la visibilidad de todas las herramientas avanzadas del Caso 3
function mostrarControlCaudal(visible) {
  const bloqueCaso3 = document.getElementById("controles-caso3");
  if (bloqueCaso3) {
    // Si es visible usamos "block" (o el diseño que tengas), si no, "none"
    bloqueCaso3.style.display = visible ? "flex" : "none";
  }
}

function crearInput() {
  cursors = this.input.keyboard.createCursorKeys();
  space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function moverJugador() {
  if (cursors.up.isDown) jugador.y -= 4;
  if (cursors.down.isDown) jugador.y += 4;
  jugador.y = Phaser.Math.Clamp(jugador.y, 220, 380);

  // --- CÁLCULO DE ALTURA COHERENTE ---
  // El punto más bajo del jugador es Y = 380 (esto será 0 metros en el suelo)
  // El punto más alto es Y = 220 (representará una altura máxima de, por ejemplo, 8.0 metros)
  let alturaMaximaMetros = 8.0;
  let rangoPixeles = 380 - 220; // 160 píxeles de recorrido
  
  // Mapeamos los píxeles de Phaser a metros (a menor Y, mayor altura)
  let alturaReal = ((380 - jugador.y) / rangoPixeles) * alturaMaximaMetros;

  // Actualizamos el texto en pantalla con un decimal
  if (textoAltura) {
    textoAltura.setText("Altura: " + alturaReal.toFixed(1) + " m");
  }
}

function moverJugador2() {
  if (cursors.up.isDown) angulo += 1;
  if (cursors.down.isDown) angulo -= 1;
  angulo = Phaser.Math.Clamp(angulo, -10, 65);

  torso.rotation = Phaser.Math.DegToRad(-angulo);
  if (textoAngulo) textoAngulo.setText("Ángulo: " + angulo + "°");

  let velocidadReal = Math.sqrt((2 * presion) / rho);
  if (textoVelocidad) textoVelocidad.setText("Velocidad: " + velocidadReal.toFixed(2) + " m/s");

  let rad = Phaser.Math.DegToRad(angulo);
  let gReal = 9.81;

  let alcanceHorizontal = (Math.pow(velocidadReal, 2) * Math.sin(2 * rad)) / gReal;

  if (alcanceHorizontal < 0 || angulo <= 0) {
    alcanceHorizontal = 0;
  }

  if (textoDistancia) {
    textoDistancia.setText("Alcance: " + alcanceHorizontal.toFixed(2) + " m");
  }
}

function moverCanon() {
  if (cursors.up.isDown) angulo += 1;
  if (cursors.down.isDown) angulo -= 1;
  angulo = Phaser.Math.Clamp(angulo, 0, 70);
  if (canon) canon.rotation = Phaser.Math.DegToRad(-angulo);

  if (cursors.right.isDown) diametro += 0.01;
  if (cursors.left.isDown) diametro -= 0.01;
  diametro = Phaser.Math.Clamp(diametro, 0.3, 2);

  if (canon) canon.setScale(diametro - 0.3);
  if (textoAngulo) textoAngulo.setText("Ángulo: " + angulo + "°");

  let diametroCm = diametro * 10;
  let diametroMetros = diametroCm / 100;
  if (textoDiametro) textoDiametro.setText("Diámetro: " + diametroCm.toFixed(1) + " cm");

  let area = (Math.PI * Math.pow(diametroMetros, 2)) / 4;

  if (modoFisica === "presion") {
    let velocidadReal = Math.sqrt((2 * presion) / rho);
    let caudalM3S = area * velocidadReal;
    let caudalLps = caudalM3S * 1000;

    if (textoVelocidad) textoVelocidad.setText("Velocidad: " + velocidadReal.toFixed(2) + " m/s");
    if (textoCaudal) textoCaudal.setText("Caudal: " + caudalLps.toFixed(1) + " L/s");
  } else {
    let caudalM3S = caudalSimulado / 1000;
    let velocidadReal = caudalM3S / area;
    let presionCalculadaPa = (rho * Math.pow(velocidadReal, 2)) / 2;
    let presionCalculadakPa = presionCalculadaPa / 1000;

    if (textoVelocidad) textoVelocidad.setText("Velocidad: " + velocidadReal.toFixed(2) + " m/s");
    if (textoCaudal) textoCaudal.setText("Caudal: " + caudalSimulado.toFixed(1) + " L/s");
    
    const textoPresionHTML = document.getElementById("presionTexto");
    if (textoPresionHTML) {
      textoPresionHTML.innerText = presionCalculadakPa.toFixed(1) + " kPa (Calculado)";
    }
  }
}

function crearMenu() {
  this.add.text(240, 80, "HYDRODYNAMIX", { fontSize: "42px", fill: "#ffffff" });

  let boton1 = this.add.text(320, 220, "CASO 1", { fontSize: "32px", backgroundColor: "#000", padding: { x: 20, y: 10 } }).setInteractive();
  let boton2 = this.add.text(320, 320, "CASO 2", { fontSize: "32px", backgroundColor: "#000", padding: { x: 20, y: 10 } }).setInteractive();
  let boton3 = this.add.text(320, 420, "CASO 3", { fontSize: "32px", backgroundColor: "#000", padding: { x: 20, y: 10 } }).setInteractive();

  boton1.on("pointerdown", () => { limpiarPantalla.call(this); estado = "caso1"; iniciarCaso1.call(this); });
  boton2.on("pointerdown", () => { limpiarPantalla.call(this); estado = "caso2"; iniciarCaso2.call(this); });
  boton3.on("pointerdown", () => { limpiarPantalla.call(this); estado = "caso3"; iniciarCaso3.call(this); });
}

function limpiarPantalla() {
  this.children.removeAll();
  // Asegurarnos de apagar el control de caudal HTML siempre que cambiemos de escena
  mostrarControlCaudal(false); 
}

function dispararAgua() {
  let ag = aguas.create(jugador.x + 150, jugador.y - 80, "gota").setScale(0.25);
  let velocidadReal = Math.sqrt((2 * presion) / rho); 

  if (textoVelocidad) textoVelocidad.setText("Velocidad: " + velocidadReal.toFixed(2) + " m/s");

  let factorPhaser = 15; 
  ag.setVelocityX(velocidadReal * factorPhaser);
  ag.setVelocityY(-velocidadReal * (factorPhaser * 0.6));
}

function dispararAgua2() {
  let ag = aguas.create(170, 520, "gota").setScale(0.18);
  let velocidadReal = Math.sqrt((2 * presion) / rho); 

  if (textoVelocidad) textoVelocidad.setText("Velocidad: " + velocidadReal.toFixed(2) + " m/s");

  let rad = Phaser.Math.DegToRad(angulo);
  let factorPhaser = 35.2; 
  let vx = Math.cos(rad) * velocidadReal * factorPhaser;
  let vy = Math.sin(rad) * velocidadReal * factorPhaser;

  ag.setVelocityX(vx);
  ag.setVelocityY(-vy);
}

function dispararCanon() {
  let origenX = 280;
  let origenY = 340;
  let rad = Phaser.Math.DegToRad(angulo);

  let velocidadReal = 0;
  let caudalLps = 0;
  let diametroMetros = (diametro * 10) / 100;
  let area = (Math.PI * Math.pow(diametroMetros, 2)) / 4;

  if (modoFisica === "presion") {
    velocidadReal = Math.sqrt((2 * presion) / rho);
    caudalLps = area * velocidadReal * 1000;
  } else {
    caudalLps = caudalSimulado;
    velocidadReal = (caudalLps / 1000) / area;
  }

  if (textoVelocidad) textoVelocidad.setText("Velocidad: " + velocidadReal.toFixed(2) + " m/s");
  if (textoCaudal) textoCaudal.setText("Caudal: " + caudalLps.toFixed(1) + " L/s");

  let cantidadParticulas = Math.floor(caudalLps * 0.3); 
  cantidadParticulas = Phaser.Math.Clamp(cantidadParticulas, 2, 18); 

  for (let i = 0; i < cantidadParticulas; i++) {
    let dispersion = Phaser.Math.FloatBetween(-0.04, 0.04);
    let variacionVel = Phaser.Math.FloatBetween(0.9, 1.1);

    let factorPhaser = 18;
    let vx = Math.cos(rad + dispersion) * velocidadReal * factorPhaser * variacionVel;
    let vy = Math.sin(rad + dispersion) * velocidadReal * factorPhaser * variacionVel;

    let ag = aguas.create(origenX, origenY, "gota").setScale(diametro * 0.3).setAlpha(0.75);
    ag.setVelocityX(vx);
    ag.setVelocityY(-vy);
    
    this.time.delayedCall(2500, () => {
      if (ag && ag.active) ag.destroy();
    });
  }
}

function apagarFuego(ag, fuego) {
  ag.destroy();
  fuego.vida--;

  if (fuego.vida <= 30 && fuego.humoCreado !== true) {
    fuego.humoCreado = true;
    let humoSprite = this.add.sprite(fuego.x, fuego.y + 20, "humo").setScale(fuego.escalaHumo);
    humoSprite.play("humito");
    fuego.humoSprite = humoSprite;

    this.time.delayedCall(12000, () => {
      if (humoSprite && humoSprite.active) humoSprite.destroy();
    });
  }

  if (fuego.vida <= 0) {
    if (fuego.humoSprite && fuego.humoSprite.active) fuego.humoSprite.destroy();
    fuego.destroy();
  }
}

function iniciarCaso1() {
  
  crearMapa.call(this);
  crearJugador.call(this);
  crearSpringtrap.call(this);
  crearBotonVolver.call(this);

  textoVelocidad = this.add.text(20, 60, "Velocidad: 0 m/s", {
    fontSize: "24px", fill: "#ffffff", backgroundColor: "#000000", padding: { x: 10, y: 5 }
  });

  textoAltura = this.add.text(320, 60, "Altura: 0.0 m", {
    fontSize: "24px", fill: "#ffffff", backgroundColor: "#000000", padding: { x: 10, y: 5 }
  });
  crearReglaArrastrable.call(this);
}

function iniciarCaso2() {
  crearMapa2.call(this);
  crearJugador2.call(this);
  crearBotonVolver.call(this);

  textoAngulo = this.add.text(20, 70, "Ángulo: 0°", {
    fontSize: "24px", fill: "#ffffff", backgroundColor: "#000000", padding: { x: 10, y: 5 }
  });
  textoVelocidad = this.add.text(20, 110, "Velocidad: 0 m/s", {
    fontSize: "24px", fill: "#ffffff", backgroundColor: "#000000", padding: { x: 10, y: 5 }
  });
  textoDistancia = this.add.text(320, 110, "Alcance: 0.0 m", {
    fontSize: "24px", fill: "#ffffff", backgroundColor: "#000000", padding: { x: 10, y: 5 }
  });
}

function iniciarCaso3() {
  // Hacer visibles los sliders y textos HTML de caudal únicamente en esta escena
  mostrarControlCaudal(true);

  crearMapa3.call(this);
  crearBotonVolver.call(this);

  textoAngulo = this.add.text(20, 70, "Ángulo: 0°", {
    fontSize: "24px", fill: "#ffffff", backgroundColor: "#000000", padding: { x: 10, y: 5 }
  });
  textoVelocidad = this.add.text(220, 70, "Velocidad: 0 m/s", {
    fontSize: "24px", fill: "#ffffff", backgroundColor: "#000000", padding: { x: 10, y: 5 }
  });
  textoDiametro = this.add.text(20, 110, "Diámetro: 8.0 cm", {
    fontSize: "24px", fill: "#ffffff", backgroundColor: "#000000", padding: { x: 10, y: 5 }
  });

  textoCaudal = this.add.text(20, 150, "Caudal: 0.0 L/s", {
    fontSize: "24px", fill: "#ffffff", backgroundColor: "#000000", padding: { x: 10, y: 5 }
  });
}

function crearReglaArrastrable() {
  // 1. Creamos la imagen en la posición X: 400, Y: 500 (ajústalo si quieres)
  // Asegúrate de haber hecho un: this.load.image("regla", "assets/...") en cargarSprites()
  regla = this.add.image(20, 250, "regla").setScale(0.2).setDepth(5);
  reglah = this.add.image(50, 350, "reglah").setScale(0.21).setDepth(5)
  
  // 2. La hacemos interactiva y le decimos directamente que es arrastrable
  regla.setInteractive({ draggable: true });
  reglah.setInteractive({ draggable: true });
  // 3. Configuramos el evento de arrastre de Phaser
  this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
    // Usamos dragX y dragY para que el movimiento sea súper suave
    gameObject.x = dragX;
    gameObject.y = dragY;
  });
}

function crearBotonVolver() {
  let volver = this.add.text(20, 20, "VOLVER", {
    fontSize: "28px", backgroundColor: "#000", padding: { x: 15, y: 10 }
  }).setInteractive();

  volver.on("pointerdown", () => {
    limpiarPantalla.call(this);
    estado = "menu";
    crearMenu.call(this);
  });
}