/* La Pause art: every object is drawn here in SVG (original, layered, one consistent soft style).
   LP.art(name, color) returns a self-contained 100x100 <svg> string. New objects: add a function to ART. */
(function () {
  "use strict";
  var LP = window.LP = window.LP || {}, n = 0;
  function hex(c) { c = c.replace("#", ""); if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2]; return [parseInt(c.substr(0, 2), 16), parseInt(c.substr(2, 2), 16), parseInt(c.substr(4, 2), 16)]; }
  function mix(c, t, k) { var a = hex(c), b = hex(t), r = a.map(function (v, i) { return Math.round(v + (b[i] - v) * k); }); return "#" + r.map(function (v) { return ("0" + v.toString(16)).slice(-2); }).join(""); }
  function lt(c, k) { return mix(c, "#ffffff", k); }
  function dk(c, k) { return mix(c, "#1b1020", k); }

  /* a drawing context: g(color) -> url(#gradient) registered in this svg's defs */
  function ctx() {
    var defs = "", id = "a" + (++n) + "_", i = 0;
    var C = {
      g: function (c, dir) {
        var k = id + (i++);
        defs += '<linearGradient id="' + k + '" x1="0" y1="0" x2="' + (dir === "h" ? 1 : 0.35) + '" y2="' + (dir === "h" ? 0 : 1) + '"><stop offset="0" stop-color="' + lt(c, 0.38) + '"/><stop offset=".55" stop-color="' + c + '"/><stop offset="1" stop-color="' + dk(c, 0.3) + '"/></linearGradient>';
        return "url(#" + k + ")";
      },
      r: function (c) {
        var k = id + (i++);
        defs += '<radialGradient id="' + k + '" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="' + lt(c, 0.5) + '"/><stop offset=".5" stop-color="' + c + '"/><stop offset="1" stop-color="' + dk(c, 0.38) + '"/></radialGradient>';
        return "url(#" + k + ")";
      },
      defs: function () { return defs; },
      wrap: function (body) {
        return '<svg class="lp-art" viewBox="0 0 100 100" aria-hidden="true"><defs>' + defs + '</defs><ellipse cx="50" cy="93" rx="30" ry="3.6" fill="#000" opacity=".16"/>' + body + "</svg>";
      }
    };
    return C;
  }
  function P(d, f, x) { return '<path d="' + d + '"' + (f ? ' fill="' + f + '"' : "") + (x ? " " + x : "") + "/>"; }
  function E(cx, cy, rx, ry, f, x) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"' + (f ? ' fill="' + f + '"' : "") + (x ? " " + x : "") + "/>"; }
  function R(x, y, w, h, rx, f, o) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '"' + (f ? ' fill="' + f + '"' : "") + (o ? " " + o : "") + "/>"; }
  function S(d, c, w) { return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  var SH = 'fill="#fff" opacity=".28"';       /* soft highlight */
  var SD = 'fill="#000" opacity=".12"';       /* soft shade */
  var D = "#40324a";

  var ART = {
    /* ---------------- clothes ---------------- */
    dress: function (c, k) { return P("M38 12 L46 12 L50 24 L54 12 L62 12 L59 40 L76 87 Q50 96 24 87 L41 40 Z", k.g(c)) + R(40, 38, 20, 5, 2, dk(c, 0.25)) + P("M44 44 L36 86 Q42 88 46 87 Z", "", SH) + P("M56 44 L66 86 Q60 89 55 88 Z", "", SD) + S("M46 12 L50 24 L54 12", dk(c, 0.35), 1.6); },
    shirt: function (c, k) { return P("M30 18 L42 12 Q50 22 58 12 L70 18 L84 38 L73 45 L69 38 L69 86 L31 86 L31 38 L27 45 L16 38 Z", k.g(c)) + P("M42 12 Q50 22 58 12 L54 11 Q50 16 46 11 Z", lt(c, 0.6)) + E(50, 40, 1.8, 1.8, lt(c, 0.7)) + E(50, 54, 1.8, 1.8, lt(c, 0.7)) + E(50, 68, 1.8, 1.8, lt(c, 0.7)) + P("M31 40 L31 86 L38 86 L38 42 Z", "", SH); },
    trousers: function (c, k) { return P("M29 12 H71 L76 90 H55 L50 40 L45 90 H24 Z", k.g(c)) + R(29, 12, 42, 7, 2, dk(c, 0.22)) + E(40, 15.5, 1.6, 1.6, "#f2dc9c") + S("M50 20 V40", dk(c, 0.3), 1.2) + P("M33 22 L28 88 L36 88 L38 24 Z", "", SH) + S("M30 60 H50 M52 60 H72", dk(c, 0.18), 1); },
    skirt: function (c, k) { return P("M34 16 H66 L84 85 Q50 95 16 85 Z", k.g(c)) + R(34, 16, 32, 7, 2, dk(c, 0.25)) + S("M42 24 L30 88 M50 24 V92 M58 24 L70 88", dk(c, 0.22), 1.3) + P("M36 24 L22 86 Q28 88 32 88 Z", "", SH); },
    jacket: function (c, k) { return P("M30 16 L42 10 L50 24 L58 10 L70 16 L86 40 L76 48 L70 42 L70 88 L30 88 L30 42 L24 48 L14 40 Z", k.g(c)) + P("M42 10 L50 24 L50 88 L44 88 L40 30 Z", dk(c, 0.2)) + P("M58 10 L50 24 L50 88 L56 88 L60 30 Z", lt(c, 0.12)) + E(53, 52, 2, 2, "#f2dc9c") + E(53, 66, 2, 2, "#f2dc9c") + P("M30 44 L30 88 L36 88 L36 46 Z", "", SH); },
    coat: function (c, k) { return P("M30 14 L42 8 L50 20 L58 8 L70 14 L86 40 L77 50 L71 44 L74 94 L26 94 L29 44 L23 50 L14 40 Z", k.g(c)) + P("M42 8 L50 20 L47 94 L40 94 L38 32 Z", dk(c, 0.2)) + R(29, 54, 42, 5, 2, dk(c, 0.3)) + E(54, 40, 2.2, 2.2, dk(c, 0.5)) + E(54, 70, 2.2, 2.2, dk(c, 0.5)) + P("M30 46 L28 94 L35 94 L35 48 Z", "", SH); },
    sweater: function (c, k) { return P("M32 18 Q50 28 68 18 L84 40 L74 52 L70 44 L70 84 L30 84 L30 44 L26 52 L16 40 Z", k.g(c)) + R(30, 80, 40, 7, 3, dk(c, 0.2)) + P("M32 18 Q50 30 68 18 L65 14 Q50 22 35 14 Z", dk(c, 0.18)) + S("M30 56 H70 M30 64 H70", lt(c, 0.5), 3) + P("M30 46 L30 84 L37 84 L37 48 Z", "", SH); },
    shoes: function (c, k) { return P("M10 58 Q10 44 26 44 L40 44 Q46 60 70 62 Q92 64 92 78 L92 84 H10 Z", k.g(c)) + R(8, 80, 86, 7, 3.5, "#f6efe4") + P("M40 44 L46 56 Q52 60 58 61 L52 50 Z", dk(c, 0.2)) + S("M20 56 H30 M22 62 H34", lt(c, 0.7), 1.6) + P("M12 60 Q12 48 24 47 Q16 52 15 62 Z", "", SH); },
    hat: function (c, k) { return E(50, 66, 42, 12, dk(c, 0.15)) + E(50, 62, 42, 11, k.g(c, "h")) + P("M26 62 Q24 24 50 22 Q76 24 74 62 Q50 72 26 62 Z", k.g(c)) + P("M26 58 Q50 68 74 58 L74 50 Q50 60 26 50 Z", dk(c, 0.35)) + P("M32 52 Q32 32 44 28 Q36 38 38 56 Z", "", SH); },
    scarf: function (c, k) { return P("M12 28 Q50 52 88 28 L90 44 Q50 68 10 44 Z", k.g(c, "h")) + P("M64 50 L80 50 L84 86 L66 88 Z", k.g(c)) + S("M12 36 Q50 60 88 36 M12 42 Q50 66 88 42", lt(c, 0.55), 2.4) + S("M68 56 L69 84 M74 56 L75 85 M80 56 L80 84", lt(c, 0.45), 1.6) + S("M66 88 V94 M70 88 V94 M74 88 V94 M78 87 V93 M82 87 V93", dk(c, 0.2), 1.6); },
    bag: function (c, k) { return S("M34 38 Q34 12 50 12 Q66 12 66 38", dk(c, 0.3), 5) + P("M18 38 H82 L90 88 H10 Z", k.g(c)) + R(18, 38, 64, 9, 3, dk(c, 0.2)) + E(50, 56, 5.5, 5.5, "#f2dc9c") + E(50, 56, 2.4, 2.4, dk(c, 0.4)) + P("M22 50 L14 86 L22 86 L28 50 Z", "", SH); },
    belt: function (c, k) { return R(6, 40, 88, 20, 4, k.g(c)) + R(36, 33, 28, 34, 5, "none", 'stroke="#d9b24c" stroke-width="5"') + R(48, 46, 14, 8, 2, "#d9b24c") + E(20, 50, 1.6, 1.6, dk(c, 0.45)) + E(74, 50, 1.6, 1.6, dk(c, 0.45)) + E(82, 50, 1.6, 1.6, dk(c, 0.45)) + S("M8 44 H92", lt(c, 0.5), 1.4); },

    /* ---------------- food ---------------- */
    apple: function (c, k) { return P("M50 30 C36 20 16 28 16 52 C16 76 34 92 50 86 C66 92 84 76 84 52 C84 28 64 20 50 30 Z", k.r(c)) + S("M50 30 Q50 18 56 12", "#6b4423", 3.4) + P("M56 20 Q70 8 80 16 Q68 26 56 20 Z", k.g("#58b04a")) + E(33, 44, 6, 10, "#fff", 'opacity=".32" transform="rotate(24 33 44)"'); },
    banana: function (c, k) { return P("M20 30 Q24 74 70 84 Q86 86 90 74 Q60 76 44 52 Q36 38 36 26 Z", k.g(c)) + P("M20 30 L36 26 L34 18 L22 20 Z", "#6a5a2a") + P("M30 34 Q36 64 62 76 Q42 66 32 36 Z", "", SH) + P("M90 74 L86 80 Q92 80 94 76 Z", "#4a3a1a"); },
    carrot: function (c, k) { return P("M56 22 L72 30 Q62 70 20 90 Q26 46 56 22 Z", k.g(c)) + S("M56 36 L62 38 M46 48 L54 52 M38 62 L46 66", dk(c, 0.3), 1.8) + P("M56 22 Q52 6 44 8 Q50 14 52 24 Z", k.g("#4aa84a")) + P("M60 22 Q66 4 76 6 Q68 14 66 26 Z", k.g("#58b856")) + P("M52 24 Q44 14 36 20 Q46 22 52 28 Z", k.g("#3e9444")) + P("M30 70 Q40 52 54 34 L50 34 Q36 50 28 70 Z", "", SH); },
    tomato: function (c, k) { return E(50, 56, 38, 33, k.r(c)) + P("M50 30 L56 20 L52 30 L64 24 L56 34 L70 34 L58 38 L66 46 L52 40 L44 48 L46 38 L32 38 L44 32 L36 22 L48 30 Z", k.g("#3f9a4d")) + E(34, 48, 7, 11, "#fff", 'opacity=".3" transform="rotate(25 34 48)"'); },
    orange: function (c, k) { return E(50, 56, 36, 35, k.r(c)) + P("M50 22 Q60 6 76 12 Q66 24 50 22 Z", k.g("#4aa84a")) + E(50, 22, 3, 2, "#6b4423") + E(35, 48, 6, 9, "#fff", 'opacity=".3" transform="rotate(28 35 48)"') + '<g fill="#000" opacity=".1"><circle cx="58" cy="60" r="1.2"/><circle cx="66" cy="52" r="1.2"/><circle cx="48" cy="72" r="1.2"/><circle cx="70" cy="70" r="1.2"/><circle cx="40" cy="64" r="1.2"/></g>'; },
    lemon: function (c, k) { return P("M10 56 Q14 52 22 48 Q36 30 56 30 Q82 32 88 54 Q82 76 56 80 Q34 80 22 64 Q14 62 10 56 Z", k.r(c)) + P("M10 56 L4 54 L10 52 Z", dk(c, 0.1)) + P("M88 54 L96 56 L90 60 Z", dk(c, 0.1)) + P("M40 36 Q56 30 70 38 Q56 38 44 44 Z", "#fff", 'opacity=".34"') + P("M70 30 Q78 18 88 22 Q80 30 70 30 Z", k.g("#4aa84a")); },
    bread: function (c, k) { return P("M10 62 Q8 34 34 28 Q50 24 66 28 Q92 34 90 62 Q90 80 78 84 H22 Q10 80 10 62 Z", k.g(c)) + S("M30 42 Q36 52 32 62 M48 38 Q54 50 50 62 M66 42 Q72 52 68 62", dk(c, 0.38), 3.6) + S("M30 42 Q36 52 32 62 M48 38 Q54 50 50 62 M66 42 Q72 52 68 62", lt(c, 0.6), 1.2) + P("M18 52 Q20 38 34 33 Q24 44 24 58 Z", "", SH) + P("M14 70 H86 L84 80 Q80 84 70 84 H30 Q18 84 14 76 Z", dk(c, 0.2), 'opacity=".55"'); },
    milk: function (c, k) { return P("M28 34 L50 14 L72 34 V90 H28 Z", "#f6f7fb") + P("M50 14 L72 34 L72 90 L50 90 Z", "#dde2ee") + R(28, 48, 44, 30, 0, k.g(c)) + E(50, 63, 8, 8, "#fff") + S("M44 63 L50 56 L56 63", c, 2) + P("M32 34 H68 L50 18 Z", "#fff") + P("M30 38 V88 L36 88 V38 Z", "", 'fill="#fff" opacity=".6"') + R(42, 12, 16, 6, 2, c); },
    cheese: function (c, k) { return P("M8 62 L56 24 Q84 30 92 62 V76 H8 Z", k.g(c)) + P("M8 62 H92 V76 H8 Z", dk(c, 0.16)) + E(38, 50, 7, 5, dk(c, 0.22)) + E(66, 52, 5, 4, dk(c, 0.22)) + E(52, 69, 6, 4, dk(c, 0.3)) + E(78, 69, 4, 3, dk(c, 0.3)) + E(24, 69, 4.4, 3, dk(c, 0.3)) + P("M12 58 L54 28 L50 36 L16 62 Z", "", SH); },
    eggs: function (c, k) { return P("M12 62 H88 L82 86 H18 Z", "#c9a878") + P("M12 62 H88 L86 70 H14 Z", "#ddc08e") + E(30, 52, 14, 18, k.r("#fff7ea")) + E(50, 54, 14, 18, k.r("#fff7ea")) + E(70, 52, 14, 18, k.r(c)) + E(24, 44, 3, 6, "#fff", 'opacity=".6"') + E(44, 46, 3, 6, "#fff", 'opacity=".6"') + E(64, 44, 3, 6, "#fff", 'opacity=".5"'); },
    bottle: function (c, k) { return R(42, 6, 16, 10, 3, k.g("#2f78c6")) + P("M44 16 H56 V28 Q70 36 70 54 V86 Q70 92 64 92 H36 Q30 92 30 86 V54 Q30 36 44 28 Z", k.g(c, "h")) + R(30, 52, 40, 20, 0, "#fff", 'opacity=".78"') + S("M36 62 Q43 56 50 62 T64 62", "#2f78c6", 2.4) + P("M35 44 Q36 36 44 31 L44 86 L36 86 Z", "", SH); },
    grapes: function (c, k) { var s = "", pts = [[34, 40], [50, 38], [66, 40], [28, 54], [42, 52], [58, 52], [72, 54], [36, 67], [50, 66], [64, 67], [44, 79], [57, 79], [50, 90]], i; for (i = 0; i < pts.length; i++) s += E(pts[i][0], pts[i][1], 9.4, 9.4, k.r(c)) + E(pts[i][0] - 3, pts[i][1] - 3, 2.4, 2.4, "#fff", 'opacity=".5"'); return S("M50 30 Q50 18 60 12", "#6b4423", 3.4) + P("M54 20 Q70 6 84 16 Q70 28 54 20 Z", k.g("#58b04a")) + s; },

    /* ---------------- hair salon ---------------- */
    comb: function (c, k) { var t = "", i; for (i = 0; i < 14; i++) t += R(14 + i * 5.2, 52, 3, 28, 1.5, dk(c, 0.15)); return R(10, 38, 80, 18, 6, k.g(c, "h")) + t + P("M14 42 H80 L80 46 H14 Z", "", SH); },
    brush: function (c, k) { var d = "", i, j; for (i = 0; i < 5; i++) for (j = 0; j < 3; j++) d += E(32 + i * 9, 24 + j * 8, 2.2, 2.2, "#f4ead6"); return R(43, 52, 14, 42, 7, k.g(dk(c, 0.1))) + E(50, 36, 28, 26, k.g(c)) + E(50, 36, 24, 22, dk(c, 0.25)) + d + P("M30 24 Q36 12 52 12 Q38 18 34 34 Z", "", SH); },
    scissors: function (c, k) { return P("M44 46 L84 10 Q90 8 88 14 L54 54 Z", "#d6dbe4") + P("M56 46 L16 10 Q10 8 12 14 L46 54 Z", "#bcc3d0") + E(33, 74, 14, 14, "none", 'stroke="' + c + '" stroke-width="7"') + E(67, 74, 14, 14, "none", 'stroke="' + c + '" stroke-width="7"') + P("M44 54 L52 54 L66 66 L58 68 Z", c) + P("M56 54 L48 54 L34 66 L42 68 Z", dk(c, 0.15)) + E(50, 50, 2.6, 2.6, "#7b8496") + P("M52 44 L84 12 L86 14 L54 46 Z", "", 'fill="#fff" opacity=".7"'); },
    dryer: function (c, k) { return P("M10 24 Q10 12 26 12 H58 Q76 12 76 30 V38 Q76 50 58 50 H26 Q10 50 10 38 Z", k.g(c)) + R(70, 22, 22, 22, 4, dk(c, 0.3)) + R(72, 26, 18, 3, 1, "#222") + R(72, 33, 18, 3, 1, "#222") + P("M30 48 L44 48 L46 92 Q46 96 40 96 H34 Q28 96 28 92 Z", dk(c, 0.15)) + E(40, 70, 4, 4, "#f2dc9c") + P("M14 18 Q16 14 26 14 H44 Q22 16 18 28 Z", "", SH); },
    mirror: function (c, k) { return R(44, 62, 12, 32, 6, k.g("#c9a24a")) + E(50, 36, 30, 32, k.g("#d9b24c")) + E(50, 36, 25, 27, k.g("#cfe9f6")) + P("M32 28 Q36 16 50 12 Q38 22 38 40 Z", "#fff", 'opacity=".7"') + S("M56 24 L66 36 M52 42 L62 52", "#fff", 2.4); },
    shampoo: function (c, k) { return R(40, 6, 20, 12, 3, k.g("#e9e4f2")) + R(46, 12, 8, 6, 1, "#c8c0d8") + P("M34 20 H66 Q74 26 74 40 V84 Q74 92 66 92 H34 Q26 92 26 84 V40 Q26 26 34 20 Z", k.g(c, "h")) + E(50, 62, 16, 18, "#fff", 'opacity=".85"') + S("M42 64 Q50 52 58 64 Q50 74 42 64 Z", c, 2.4) + P("M31 36 Q32 28 38 24 L38 86 L32 86 Z", "", SH); },
    towel: function (c, k) { return P("M12 30 H88 V76 H12 Z", k.g(c)) + R(12, 30, 76, 46, 0, "none", 'stroke="' + dk(c, 0.2) + '" stroke-width="1"') + R(12, 44, 76, 5, 0, lt(c, 0.7)) + R(12, 56, 76, 5, 0, lt(c, 0.7)) + P("M12 30 L18 24 H94 L88 30 Z", lt(c, 0.25)) + P("M88 30 L94 24 V70 L88 76 Z", dk(c, 0.2)) + S("M12 76 V82 M20 76 V82 M28 76 V82 M36 76 V82 M44 76 V82 M52 76 V82 M60 76 V82 M68 76 V82 M76 76 V82 M84 76 V82", dk(c, 0.1), 1.6); },
    chair: function (c, k) { return R(36, 10, 28, 36, 8, k.g(c)) + R(24, 44, 52, 16, 7, k.g(dk(c, 0.1))) + R(18, 40, 8, 22, 4, dk(c, 0.3)) + R(74, 40, 8, 22, 4, dk(c, 0.3)) + R(46, 60, 8, 20, 2, "#aab2c0") + P("M30 84 H70 L66 90 H34 Z", "#8b93a3") + E(30, 91, 5, 3, "#555") + E(70, 91, 5, 3, "#555") + E(50, 92, 5, 3, "#555") + P("M40 14 Q42 12 46 12 L44 40 L40 40 Z", "", SH); },
    clip: function (c, k) { return P("M14 40 Q14 22 40 22 H84 V38 H44 Q32 38 32 46 Q32 54 44 54 H84 V70 H40 Q14 70 14 52 Z", k.g(c)) + P("M84 22 V38 Q74 40 74 46 Q74 52 84 54 V70 Q96 66 96 46 Q96 26 84 22 Z", dk(c, 0.2)) + P("M18 36 Q22 28 40 27 H70 Q30 30 22 40 Z", "", SH); },
    straightener: function (c, k) { return P("M40 8 L52 8 L66 62 L56 64 Z", k.g(c)) + P("M60 8 L72 8 L84 62 L74 64 Z", k.g(dk(c, 0.1))) + P("M56 64 L66 62 L84 62 L74 64 L72 90 L64 92 Z", "#2f2a38") + R(44, 22, 24, 6, 3, "#d9b24c", 'transform="rotate(14 56 25)"') + P("M44 12 L50 12 L60 54 L56 56 Z", "", SH); },

    /* ---------------- beauty ---------------- */
    lipstick: function (c, k) { return P("M38 40 L38 16 Q50 6 62 16 L62 40 Z", k.g(c)) + P("M38 16 Q50 6 62 16 L50 22 Z", lt(c, 0.3)) + R(34, 40, 32, 12, 2, "#d9b24c") + R(32, 52, 36, 38, 6, k.g("#352c3d")) + R(32, 52, 36, 6, 2, "#d9b24c") + P("M36 60 L42 60 L42 88 L36 88 Z", "", 'fill="#fff" opacity=".18"'); },
    perfume: function (c, k) { return R(42, 4, 16, 14, 4, k.g("#d9b24c")) + R(46, 16, 8, 8, 1, "#bdb7c9") + P("M26 38 Q26 26 40 26 H60 Q74 26 74 38 V82 Q74 92 64 92 H36 Q26 92 26 82 Z", k.g(c, "h")) + E(50, 62, 16, 20, "#fff", 'opacity=".26"') + R(38, 56, 24, 14, 2, "#fff", 'opacity=".8"') + P("M31 40 Q32 32 40 30 L38 84 L32 84 Z", "", 'fill="#fff" opacity=".4"') + E(78, 12, 1.6, 1.6, "#fff") + E(86, 20, 1.2, 1.2, "#fff") + E(82, 28, 1.4, 1.4, "#fff"); },
    polish: function (c, k) { return R(42, 6, 16, 36, 5, k.g("#2f2a38")) + R(40, 40, 20, 6, 2, "#d9b24c") + P("M26 54 Q26 44 36 44 H64 Q74 44 74 54 V84 Q74 92 66 92 H34 Q26 92 26 84 Z", k.g(c)) + P("M31 56 Q32 50 38 48 L36 84 L31 84 Z", "", 'fill="#fff" opacity=".4"') + E(62, 62, 3, 6, "#fff", 'opacity=".25"'); },
    makeupbrush: function (c, k) { return P("M44 40 L56 40 L60 92 Q60 96 56 96 H44 Q40 96 40 92 Z", k.g(c)) + R(42, 30, 16, 16, 2, "#d9b24c") + P("M40 34 Q38 12 50 6 Q62 12 60 34 Z", k.g("#f4d9c9")) + P("M44 24 Q44 14 50 10 Q48 20 48 30 Z", "", SH); },
    cream: function (c, k) { return P("M22 44 H78 V80 Q78 90 66 90 H34 Q22 90 22 80 Z", k.g("#f4f1fb")) + R(18, 28, 64, 20, 6, k.g(c)) + R(18, 28, 64, 5, 3, lt(c, 0.5)) + E(50, 66, 14, 14, c, 'opacity=".85"') + S("M44 66 Q50 58 56 66 Q50 74 44 66 Z", "#fff", 2) + P("M26 50 V82 L32 82 V50 Z", "", SH); },
    soap: function (c, k) { return P("M12 46 Q12 32 26 32 H74 Q88 32 88 46 V62 Q88 74 74 74 H26 Q12 74 12 62 Z", k.g(c)) + P("M12 52 Q12 40 26 40 H74 Q88 40 88 52 V56 Q88 48 74 48 H26 Q12 48 12 56 Z", lt(c, 0.3), 'opacity=".5"') + S("M30 56 Q38 50 46 56 T62 56", lt(c, 0.7), 2.4) + E(78, 20, 7, 7, "#fff", 'opacity=".55"') + E(66, 12, 4, 4, "#fff", 'opacity=".5"') + E(88, 32, 3, 3, "#fff", 'opacity=".5"'); },
    mascara: function (c, k) { return R(44, 4, 12, 56, 5, k.g("#2a2432")) + R(41, 56, 18, 8, 2, "#d9b24c") + R(36, 62, 28, 32, 8, k.g(c)) + P("M40 68 L44 68 L44 90 L40 90 Z", "", 'fill="#fff" opacity=".3"') + P("M44 12 L46 12 L46 56 L44 56 Z", "", 'fill="#fff" opacity=".25"'); },
    powder: function (c, k) { return E(50, 62, 40, 26, k.g("#d9b24c")) + E(50, 58, 40, 26, k.g("#e9c878")) + E(50, 56, 30, 17, k.r(c)) + P("M12 56 Q12 36 50 34 Q88 36 88 56 Q50 38 12 56 Z", "", SH) + E(40, 52, 8, 3.2, "#fff", 'opacity=".4" transform="rotate(-14 40 52)"'); },
    /* ---------------- housekeeping ---------------- */
    broom: function (c, k) { return P("M60 4 L67 7 L50 62 L43 59 Z", k.g("#a8743a")) + P("M26 62 Q46 52 66 60 L76 90 Q50 100 22 92 Z", k.g(c)) + P("M29 60 Q46 52 66 58 L67 66 Q46 60 28 68 Z", k.g("#8a6a3a")) + S("M34 74 L30 92 M44 72 L42 94 M54 72 L54 95 M64 74 L68 92", dk(c, 0.3), 1.6) + P("M32 62 Q46 56 60 62 L62 68 Q46 62 30 68 Z", "", SH); },
    mop: function (c, k) { var s = "", i; for (i = 0; i < 6; i++) s += S("M" + (32 + i * 7) + " 64 Q" + (30 + i * 7) + " 80 " + (28 + i * 7 + (i % 2 ? 3 : -1)) + " 94", i % 2 ? lt(c, 0.2) : c, 5.4); return P("M52 4 L58 4 L58 58 L52 58 Z", k.g("#a8743a")) + s + R(36, 56, 38, 9, 3, k.g("#9aa0ad")) + R(36, 56, 38, 3, 1.5, "#fff", 'opacity=".4"'); },
    bucket: function (c, k) { return S("M24 38 Q50 -2 76 38", "#8a8f9a", 3.4) + P("M20 34 H80 L72 88 Q50 95 28 88 Z", k.g(c)) + E(50, 34, 30, 6.5, dk(c, 0.25)) + E(50, 35, 25, 4, "#8fd3f0") + R(24, 56, 52, 5, 2, lt(c, 0.35)) + P("M26 42 L32 86 Q36 88 38 88 L33 42 Z", "", SH); },
    vacuum: function (c, k) { return S("M66 54 Q88 44 84 12", "#555a66", 5) + R(74, 4, 18, 9, 3.5, k.g("#3a3f4c")) + E(50, 68, 30, 22, k.r(c)) + E(46, 60, 15, 8, lt(c, 0.35), 'opacity=".6"') + R(6, 86, 56, 8, 3.5, k.g("#3a3f4c")) + E(72, 86, 9, 9, k.r("#3a3f4c")) + E(72, 86, 3.4, 3.4, "#aab") + S("M30 84 L20 88", "#555a66", 4); },
    sponge: function (c, k) { return R(12, 36, 76, 44, 9, k.g(c)) + R(12, 60, 76, 20, 9, k.g("#4aa84a")) + E(28, 46, 3.4, 2.6, dk(c, 0.25)) + E(46, 52, 3, 2.4, dk(c, 0.25)) + E(64, 44, 3.6, 2.8, dk(c, 0.25)) + E(74, 53, 2.8, 2.2, dk(c, 0.25)) + R(16, 40, 22, 6, 3, "#fff", 'opacity=".3"') + '<circle cx="78" cy="24" r="7" fill="#fff" opacity=".5"/><circle cx="66" cy="14" r="4.4" fill="#fff" opacity=".5"/><circle cx="86" cy="12" r="3" fill="#fff" opacity=".5"/>'; },
    duster: function (c, k) { return S("M30 92 L58 42", "#a8743a", 5.4) + P("M58 42 Q40 10 56 4 Q70 14 62 40 Z", k.g(c)) + P("M58 42 Q66 8 84 12 Q88 30 62 44 Z", k.g(lt(c, 0.22))) + P("M56 44 Q28 26 26 40 Q38 52 56 48 Z", k.g(dk(c, 0.1))) + P("M58 42 Q54 24 60 12", "", 'fill="none" stroke="#fff" stroke-width="1.6" opacity=".4"'); },
    iron: function (c, k) { return P("M32 52 Q34 28 52 28 H64 Q72 30 70 52 L62 52 Q62 40 56 40 H50 Q44 40 42 52 Z", k.g(dk(c, 0.2))) + P("M12 74 Q12 56 34 52 H68 Q90 54 90 76 V80 H12 Z", k.g(c)) + R(10, 78, 82, 8, 4, k.g("#c9ced8")) + E(66, 64, 4.4, 4.4, "#f2dc9c") + P("M18 70 Q22 60 36 58 L60 58 Q40 62 28 72 Z", "", SH) + S("M20 94 Q16 90 20 86 M30 94 Q26 90 30 86", "#9fd3f0", 2.2); },
    basket: function (c, k) { return P("M24 38 Q28 12 46 22 Q56 8 72 24 Q82 22 78 40 Z", k.g("#6fb3e0")) + P("M44 36 Q50 20 62 28 L60 40 Z", "#f2c0d0") + P("M12 40 H88 L80 88 Q50 95 20 88 Z", k.g(c)) + S("M15 54 H85 M17 66 H83 M19 78 H81", dk(c, 0.28), 1.6) + S("M32 42 L30 90 M50 42 V93 M68 42 L70 90", dk(c, 0.28), 1.6) + R(8, 34, 84, 10, 5, k.g(dk(c, 0.12))) + P("M16 46 L20 86 Q23 87 25 88 L21 46 Z", "", SH); },
    spray: function (c, k) { return P("M34 42 H64 Q68 46 68 52 V88 Q68 95 60 95 H40 Q32 95 32 88 V52 Q32 46 34 42 Z", k.g(c)) + R(42, 28, 16, 16, 2, "#e8e8ee") + P("M36 14 H72 Q78 14 78 20 V28 H44 Q36 28 36 22 Z", k.g("#3a4a6a")) + P("M64 36 Q76 38 72 52 L66 48 Z", "#2b3a5a") + R(36, 58, 28, 20, 3, "#fff", 'opacity=".85"') + S("M42 66 H58 M42 72 H54", c, 2) + '<circle cx="86" cy="18" r="2.2" fill="#9fd3f0"/><circle cx="90" cy="26" r="2.6" fill="#9fd3f0"/><circle cx="84" cy="30" r="1.8" fill="#9fd3f0"/>' + P("M36 48 L38 90 Q40 92 42 92 L40 48 Z", "", SH); },
    gloves: function (c, k) { return R(26, 18, 11, 38, 5.5, k.g(c)) + R(38, 10, 11, 42, 5.5, k.g(c)) + R(50, 12, 11, 40, 5.5, k.g(c)) + R(62, 22, 10, 32, 5, k.g(c)) + R(26, 44, 46, 40, 12, k.g(c)) + P("M28 60 L10 48 Q6 40 14 38 Q24 38 32 50 Z", k.g(c)) + R(30, 78, 38, 16, 4, k.g(dk(c, 0.2))) + S("M32 24 V40 M44 16 V38 M56 18 V38", "#fff", 2.4).replace('/>', ' opacity=".4"/>'); }

  };

  LP.art = function (name, color) {
    var f = ART[name]; if (!f) f = ART.apple;
    var k = ctx();
    return k.wrap(f(color || "#c0476b", k));
  };
  LP.artCtx = ctx; LP.draw = { P: P, E: E, R: R, S: S, lt: lt, dk: dk, mix: mix, SH: SH, SD: SD, D: D };
  LP.artNames = function () { return Object.keys(ART); };
  LP.artDefault = {   /* default colour per object when the vocabulary file gives none */
    dress: "#c0476b", shirt: "#4a8fd4", trousers: "#3b5a8c", skirt: "#8e5bc4", jacket: "#7a4f3a", coat: "#b8864f", sweater: "#d9684a", shoes: "#a8453d", hat: "#d4a24a", scarf: "#c0476b", bag: "#8a4b3a", belt: "#6b4a30",
    apple: "#d63a3a", banana: "#f2cf3a", carrot: "#f08a2a", tomato: "#e04a3a", orange: "#f59a2a", lemon: "#f6e04a", bread: "#d9a45a", milk: "#4a8fd4", cheese: "#f2c84a", eggs: "#e8c9a0", bottle: "#9fd3ee", grapes: "#7b4fb0",
    comb: "#2f78c6", brush: "#c9824a", scissors: "#c0476b", dryer: "#d94a7a", mirror: "#d9b24c", shampoo: "#4aa8c8", towel: "#3fa38a", chair: "#c0476b", clip: "#e0457b", straightener: "#2a2432",
    broom: "#e0b04a", mop: "#eceaf4", bucket: "#2f9fd6", vacuum: "#d94a4a", sponge: "#f2d23a", duster: "#e06a8a", iron: "#4a8fd4", basket: "#c79a5a", spray: "#4ab08a", gloves: "#f2c63a",
    lipstick: "#d63a5a", perfume: "#b46ad4", polish: "#e0457b", makeupbrush: "#c9824a", cream: "#f08aa8", soap: "#58b8a8", mascara: "#2a2432", powder: "#e8b4a0"
  };
})();
