/* Música de fondo opcional para Dropix Tools.
   - Se genera en el navegador con código: no usa archivos de audio ni canciones de nadie.
   - Empieza APAGADA. Solo suena si la persona toca el botón 🎵.
   - Se calla sola si la página reproduce un audio (por ejemplo, en el recortador de audio).
   Para quitarla de todo el sitio: borra el archivo musica.js del repositorio. */
(function () {
  "use strict";
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC || !document.body) return;

  /* La menor pentatónica: casi cualquier combinación suena tranquila */
  var SCALE = [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
  /* Am - F - C - G, un acorde cada 8 segundos */
  var CHORDS = [
    [110.00, 164.81, 220.00, 261.63],
    [87.31, 130.81, 174.61, 220.00],
    [130.81, 196.00, 261.63, 329.63],
    [98.00, 146.83, 196.00, 246.94]
  ];
  var LOOK = 1.5;      /* segundos de notas que se programan por adelantado */
  var MASTER = 0.35;   /* volumen general, bajo a propósito */

  var ctx = null, master = null, bus = null, timer = null, closeTimer = null;
  var on = false, nextChord = 0, nextNote = 0, chordIdx = 0, noteIdx = 3;
  var btn = null;

  function build() {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    var lp = ctx.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 2200;
    bus = ctx.createGain();
    var dly = ctx.createDelay(1.0); dly.delayTime.value = 0.42;
    var fb = ctx.createGain(); fb.gain.value = 0.38;
    var fbLp = ctx.createBiquadFilter(); fbLp.type = "lowpass"; fbLp.frequency.value = 1500;
    var wet = ctx.createGain(); wet.gain.value = 0.35;
    bus.connect(lp);                                  /* sonido directo */
    bus.connect(dly); dly.connect(fbLp); fbLp.connect(fb); fb.connect(dly);  /* eco suave */
    dly.connect(wet); wet.connect(lp);
    lp.connect(master); master.connect(ctx.destination);
  }

  function voice(freq, t, type, peak, attack, hold, rel) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    o.detune.value = (Math.random() - 0.5) * 8;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.setTargetAtTime(0, t + attack + hold, rel);
    o.connect(g); g.connect(bus);
    o.start(t); o.stop(t + attack + hold + rel * 7);
  }

  function chord(t) {
    var c = CHORDS[chordIdx++ % CHORDS.length];
    for (var i = 0; i < c.length; i++) voice(c[i], t, "sine", 0.07, 2.5, 4.5, 1.4);
  }

  function melody(t) {
    if (Math.random() < 0.22) return;                 /* a veces, silencio */
    noteIdx += Math.floor(Math.random() * 5) - 2;     /* paso corto arriba o abajo */
    noteIdx = Math.max(0, Math.min(SCALE.length - 1, noteIdx));
    voice(SCALE[noteIdx], t, "triangle", 0.12, 0.03, 0.1, 0.9);
    if (Math.random() < 0.15) voice(SCALE[noteIdx] * 2, t, "sine", 0.04, 0.02, 0.05, 0.7);
  }

  function tick() {
    if (!ctx || !on) return;
    var now = ctx.currentTime;
    while (nextChord < now + LOOK) { chord(nextChord); nextChord += 8; }
    while (nextNote < now + LOOK) { melody(nextNote); nextNote += 1.1 + Math.random() * 2.3; }
  }

  function start() {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; if (ctx) { try { ctx.close(); } catch (e) {} ctx = null; } }
    if (!ctx) build();
    try { ctx.resume(); } catch (e) {}
    on = true;
    var now = ctx.currentTime;
    nextChord = now + 0.1; nextNote = now + 1.2;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(MASTER, now + 2);
    timer = setInterval(tick, 400);
    tick();
    paint();
  }

  function stop() {
    on = false;
    if (timer) { clearInterval(timer); timer = null; }
    if (ctx && master) {
      var now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.8);
      var c = ctx;
      closeTimer = setTimeout(function () {
        closeTimer = null;
        if (!on && ctx === c) { try { c.close(); } catch (e) {} ctx = null; }
      }, 900);
    }
    paint();
  }

  /* ---------- botón ---------- */
  var css = document.createElement("style");
  css.textContent =
    "#dpx-musica{position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9999;" +
    "min-height:44px;padding:10px 16px;border-radius:999px;border:1px solid rgba(127,127,127,.5);" +
    "background:rgba(127,127,127,.22);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);" +
    "color:inherit;font:600 14px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;cursor:pointer}" +
    "#dpx-musica[aria-pressed=true]{background:rgba(47,91,255,.28);border-color:rgba(47,91,255,.8)}" +
    "#dpx-musica:focus-visible{outline:3px solid #2F5BFF;outline-offset:2px}" +
    "@media print{#dpx-musica{display:none}}";
  document.head.appendChild(css);

  btn = document.createElement("button");
  btn.id = "dpx-musica"; btn.type = "button";
  btn.onclick = function () { if (on) stop(); else start(); };
  document.body.appendChild(btn);

  function paint() {
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.setAttribute("aria-label", on ? "Apagar la música de fondo" : "Encender la música de fondo");
    btn.title = on ? "Apagar la música" : "Encender la música (empieza apagada)";
    btn.textContent = on ? "🔊 Música" : "🎵 Música";
  }
  paint();

  /* ---------- cortesía ---------- */
  /* Si la página reproduce un audio, la música se calla para no taparlo */
  function quietOnPlay(proto, name) {
    if (!proto || !proto[name]) return;
    var orig = proto[name];
    proto[name] = function () { if (on) stop(); return orig.apply(this, arguments); };
  }
  quietOnPlay(window.HTMLMediaElement && HTMLMediaElement.prototype, "play");
  quietOnPlay(window.AudioBufferSourceNode && AudioBufferSourceNode.prototype, "start");

  /* Si la pestaña queda oculta, se pausa; al volver, sigue */
  document.addEventListener("visibilitychange", function () {
    if (!ctx || !on) return;
    try { if (document.hidden) ctx.suspend(); else ctx.resume(); } catch (e) {}
  });
})();
