/* ==== COMPLETA ESTOS DATOS ANTES DE PUBLICAR (entre las comillas) ==== */
window.SITE = {
  nombre: "Dropix Tools",
  responsable: "",        /* tu nombre o el de tu marca, por ejemplo: "Juan Pérez" */
  email: "soportedropixtools@gmail.com",              /* tu correo de contacto */
  whatsappCodigo: "",     /* código de país sin +, por ejemplo 51 */
  whatsapp: "",           /* tu número sin el código de país */
  url: "https://creador5.github.io/dropix-tools/"
};
/* ==== no cambies nada de aquí para abajo ==== */
document.addEventListener("DOMContentLoaded", function () {
  var S = window.SITE, q = function (s) { return document.querySelectorAll(s); };
  var wa = function (text) { var c = String(S.whatsappCodigo || "").replace(/\D/g, ""), n = String(S.whatsapp || "").replace(/\D/g, "").replace(/^0+/, ""); return c && n ? "https://wa.me/" + c + n + (text ? "?text=" + encodeURIComponent(text) : "") : ""; };
  window.SITE_WA = wa;
  q('[data-site="responsable"]').forEach(function (e) { e.textContent = S.responsable || "el creador de Dropix Tools"; });
  q('[data-site="email"]').forEach(function (e) { if (S.email) { e.textContent = S.email; e.href = "mailto:" + S.email; } else { e.style.display = "none"; } });
  q('[data-site="wa"]').forEach(function (e) { var u = wa(e.getAttribute("data-text")); if (u) { e.href = u; e.textContent = "Escríbeme por WhatsApp"; e.target = "_blank"; e.rel = "noopener"; } else { e.style.display = "none"; } });
});
