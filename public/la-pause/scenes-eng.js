/* La Pause scenes, Engineering: car, house, bridge, robot, bulb.
   Each scene is ONE coordinate space (400x300). A scene function receives a drawing context k and returns
   { bg: backdrop svg, parts: [{id, svg}] }; every part is a layer, shown as a ghost until it is placed. */
(function () {
  "use strict";
  var LP = window.LP = window.LP || {}, d = LP.draw, P = d.P, E = d.E, R = d.R, S = d.S, lt = d.lt, dk = d.dk;
  LP.scenes = LP.scenes || {};
  function hills(k) { return P("M0 210 Q70 150 150 200 Q230 140 320 200 Q370 170 400 190 V300 H0 Z", k.g("#7fc58a")) + P("M0 230 Q90 190 190 225 Q300 180 400 225 V300 H0 Z", k.g("#5fae72")); }
  function cloud(x, y, s) { return '<g opacity=".85" transform="translate(' + x + " " + y + ") scale(" + s + ')"><ellipse cx="0" cy="0" rx="26" ry="9" fill="#fff"/><ellipse cx="-12" cy="-7" rx="13" ry="9" fill="#fff"/><ellipse cx="8" cy="-10" rx="15" ry="11" fill="#fff"/></g>'; }

  /* ---------------- the car ---------------- */
  LP.scenes.car = function (k) {
    var c = "#d6453d", body = "M50 200 L50 178 Q52 164 78 160 L140 154 L168 122 Q176 114 192 114 L262 114 Q276 114 286 128 L304 154 L340 160 Q356 166 356 186 L356 200 L324 200 A34 34 0 0 0 256 200 L144 200 A34 34 0 0 0 76 200 Z";
    function wheel(x) { return E(x, 200, 30, 30, "#22252e") + E(x, 200, 22, 22, k.r("#3b4050")) + E(x, 200, 13, 13, k.g("#cfd4de")) + E(x, 200, 4, 4, "#6b7080") + S("M" + x + " 188 V212 M" + (x - 12) + " 200 H" + (x + 12) + " M" + (x - 8.5) + " 191.5 L" + (x + 8.5) + " 208.5 M" + (x + 8.5) + " 191.5 L" + (x - 8.5) + " 208.5", "#8a90a0", 1.6); }
    return {
      bg: R(0, 0, 400, 300, 0, k.g("#bfe6f7")) + cloud(80, 50, 1) + cloud(320, 70, .8) + P("M0 190 Q60 140 130 180 Q200 120 280 175 Q350 140 400 170 V300 H0 Z", k.g("#8fc9a0")) + R(0, 228, 400, 72, 0, k.g("#6a6f7c")) + S("M0 262 H400", "#f6e7a4", 3).replace('stroke-linecap="round"', 'stroke-dasharray="26 18"'),
      parts: [
        { id: "wheels", svg: wheel(110) + wheel(290) },
        { id: "body", svg: P(body, k.g(c)) + P("M168 122 L140 154 L304 154 L286 128 Q276 114 262 114 L192 114 Q176 114 168 122 Z", "none") + P("M60 178 Q60 168 80 166 L350 166 L350 172 L60 172 Z", "", 'fill="#fff" opacity=".18"') + S("M56 186 H74 M146 186 H254 M326 186 H350", dk(c, 0.3), 1.6) },
        { id: "windows", svg: P("M150 150 L172 124 Q178 118 190 118 L262 118 Q272 118 279 128 L296 150 Z", k.g("#a9dcf0")) + P("M158 146 L176 126 L196 126 L184 146 Z", "", 'fill="#fff" opacity=".45"') + R(222, 116, 7, 36, 2, dk(c, 0.2)) },
        { id: "door", svg: R(152, 156, 70, 42, 7, k.g(lt(c, 0.06)), 'stroke="' + dk(c, 0.35) + '" stroke-width="2"') + R(198, 164, 16, 5, 2.5, "#e8eaf0") + R(158, 160, 40, 5, 2.5, "#fff", 'opacity=".25"') },
        { id: "wheel", svg: E(256, 138, 14, 14, "none", 'stroke="#2a2e3a" stroke-width="3.4"') + S("M256 138 L246 146 M256 138 L266 146 M256 138 V124", "#2a2e3a", 3) + S("M268 144 L292 150", "#2a2e3a", 3) },
        { id: "lights", svg: P("M336 164 Q352 164 354 176 Q340 178 332 172 Z", k.g("#ffe58a")) + P("M354 170 L388 156 L388 196 L354 182 Z", "", 'fill="#ffe98a" opacity=".5"') + R(50, 168, 10, 14, 3, k.g("#e02a3a")) },
        { id: "bumper", svg: R(338, 190, 26, 11, 5, k.g("#cfd4de")) + R(40, 190, 24, 11, 5, k.g("#cfd4de")) + R(344, 193, 14, 3, 1.5, "#fff", 'opacity=".6"') },
        { id: "mirror", svg: P("M294 148 L310 142 Q316 144 314 150 L298 156 Z", k.g(dk(c, 0.1))) + P("M300 148 L310 145 L311 149 L301 152 Z", "#a9dcf0") }
      ]
    };
  };

  /* ---------------- the house ---------------- */
  LP.scenes.house = function (k) {
    return {
      bg: R(0, 0, 400, 300, 0, k.g("#bfe6f7")) + cloud(70, 44, 1) + cloud(340, 64, .8) + E(340, 40, 22, 22, k.r("#ffd84a")) + R(0, 250, 400, 50, 0, k.g("#6fbf7a")) + E(40, 256, 36, 14, "#4f9d62") + E(366, 258, 40, 14, "#4f9d62"),
      parts: [
        { id: "foundation", svg: R(80, 234, 240, 18, 3, k.g("#9aa0ad")) + S("M110 234 V252 M170 234 V252 M230 234 V252 M290 234 V252", "#7c8290", 1.4) },
        { id: "walls", svg: R(90, 140, 220, 96, 2, k.g("#e0a07a")) + S("M90 156 H310 M90 172 H310 M90 188 H310 M90 204 H310 M90 220 H310", "#b7714f", 1.4) + S("M120 140 V156 M160 156 V172 M120 172 V188 M160 188 V204 M120 204 V220 M200 140 V156 M240 140 V156 M280 156 V172 M240 172 V188 M280 188 V204 M240 204 V220", "#b7714f", 1.4) },
        { id: "chimney", svg: R(258, 62, 26, 62, 2, k.g("#b4543f")) + R(254, 58, 34, 8, 2, k.g("#8a3a2c")) + S("M258 80 H284 M258 98 H284", "#8a3a2c", 1.2) },
        { id: "roof", svg: P("M66 148 L200 58 L334 148 Z", k.g("#8b3a3a")) + P("M200 58 L334 148 L318 148 L200 70 Z", "", 'fill="#fff" opacity=".14"') + S("M84 140 L200 66 L316 140", "#6a2a2a", 2) + R(62, 144, 276, 8, 3, k.g("#6a2a2a")) },
        { id: "door", svg: R(178, 170, 44, 66, 4, k.g("#7a4f3a")) + R(186, 178, 28, 22, 3, "", 'fill="#fff" opacity=".12"') + E(212, 206, 2.8, 2.8, "#f2dc9c") + R(186, 208, 28, 22, 3, "", 'fill="#000" opacity=".1"') },
        { id: "windows", svg: R(106, 162, 48, 40, 3, k.g("#a9dcf0"), 'stroke="#f6efe4" stroke-width="4"') + S("M130 164 V200 M108 182 H152", "#f6efe4", 3) + R(246, 162, 48, 40, 3, k.g("#a9dcf0"), 'stroke="#f6efe4" stroke-width="4"') + S("M270 164 V200 M248 182 H292", "#f6efe4", 3) },
        { id: "steps", svg: R(172, 252, 56, 7, 1.5, k.g("#c9ced8")) + R(166, 259, 68, 7, 1.5, k.g("#bcc2ce")) + R(160, 266, 80, 7, 1.5, k.g("#aeb4c2")) }
      ]
    };
  };

  /* ---------------- the bridge ---------------- */
  LP.scenes.bridge = function (k) {
    return {
      bg: R(0, 0, 400, 300, 0, k.g("#cfeaf8")) + cloud(90, 40, 1) + cloud(300, 56, .9) + P("M0 190 V300 H110 V230 Q80 200 0 190 Z", k.g("#8a9a6a")) + P("M400 190 V300 H290 V230 Q320 200 400 190 Z", k.g("#8a9a6a")) + R(100, 236, 200, 64, 0, k.g("#4a9fd0")) + S("M120 256 q14 -6 28 0 t28 0 t28 0 t28 0 M130 276 q14 -6 28 0 t28 0 t28 0", "#bfe6f7", 2),
      parts: [
        { id: "piers", svg: R(114, 204, 32, 98, 3, k.g("#b9bfc9")) + R(254, 204, 32, 98, 3, k.g("#b9bfc9")) + S("M122 214 V300 M138 214 V300 M262 214 V300 M278 214 V300", "#9aa0ad", 1.2) },
        { id: "deck", svg: R(30, 188, 340, 16, 3, k.g("#8d93a0")) + R(30, 202, 340, 4, 1, "#5f6573") },
        { id: "road", svg: R(30, 190, 340, 8, 2, k.g("#3d414d")) + S("M40 194 H360", "#f6e7a4", 2).replace('stroke-linecap="round"', 'stroke-dasharray="14 10"') },
        { id: "towers", svg: R(122, 82, 16, 108, 3, k.g("#d9534a")) + R(262, 82, 16, 108, 3, k.g("#d9534a")) + R(116, 106, 28, 7, 2, k.g("#b9382f")) + R(256, 106, 28, 7, 2, k.g("#b9382f")) + R(118, 76, 24, 8, 3, k.g("#b9382f")) + R(258, 76, 24, 8, 3, k.g("#b9382f")) },
        { id: "cables", svg: S("M34 188 Q86 92 130 82 Q200 170 270 82 Q314 92 366 188", "#464b58", 3.6) },
        { id: "hangers", svg: (function () {
          var t = "", i, u, x, y;
          function add(x, y) { if (y < 184) t += "M" + Math.round(x) + " " + Math.round(y) + " V190 "; }
          for (i = 1; i <= 4; i++) { u = i / 5; add(34 * (1 - u) * (1 - u) + 172 * u * (1 - u) + 130 * u * u, 188 * (1 - u) * (1 - u) + 184 * u * (1 - u) + 82 * u * u); }
          for (i = 1; i <= 8; i++) { u = i / 9; add(130 + 140 * u, 82 + 176 * u * (1 - u)); }
          for (i = 1; i <= 4; i++) { u = i / 5; add(270 * (1 - u) * (1 - u) + 314 * 2 * u * (1 - u) + 366 * u * u, 82 * (1 - u) * (1 - u) + 92 * 2 * u * (1 - u) + 188 * u * u); }
          return S(t, "#5f6573", 1.8);
        })() }
      ]
    };
  };

  /* ---------------- the robot ---------------- */
  LP.scenes.robot = function (k) {
    var c = "#4a8fd4";
    return {
      bg: R(0, 0, 400, 300, 0, k.g("#3a3f66")) + R(0, 262, 400, 38, 0, k.g("#262a48")) + '<g fill="#fff" opacity=".6"><circle cx="40" cy="40" r="2"/><circle cx="360" cy="70" r="2.4"/><circle cx="90" cy="120" r="1.6"/><circle cx="330" cy="140" r="1.8"/><circle cx="60" cy="210" r="2"/></g>',
      parts: [
        { id: "legs", svg: R(150, 216, 32, 44, 8, k.g("#9aa3b8")) + R(218, 216, 32, 44, 8, k.g("#9aa3b8")) + R(140, 252, 52, 14, 7, k.g(dk(c, 0.25))) + R(208, 252, 52, 14, 7, k.g(dk(c, 0.25))) },
        { id: "arms", svg: R(96, 140, 32, 76, 14, k.g("#9aa3b8")) + R(272, 140, 32, 76, 14, k.g("#9aa3b8")) + E(112, 222, 15, 15, k.r(dk(c, 0.2))) + E(288, 222, 15, 15, k.r(dk(c, 0.2))) },
        { id: "body", svg: R(136, 130, 128, 94, 18, k.g(c)) + R(142, 136, 116, 10, 5, "#fff", 'opacity=".25"') + E(158, 208, 5, 5, "#ffd84a") + E(242, 208, 5, 5, "#e0457b") },
        { id: "screen", svg: R(166, 152, 68, 40, 7, k.g("#16203a"), 'stroke="#cfd4de" stroke-width="3"') + S("M174 174 H190 L196 162 L206 186 L212 174 H226", "#6ef0a8", 2.6) },
        { id: "head", svg: R(152, 62, 96, 66, 16, k.g("#cfd4de")) + R(158, 68, 84, 10, 5, "#fff", 'opacity=".4"') + R(190, 126, 20, 8, 3, "#8a90a0") },
        { id: "eyes", svg: E(180, 96, 13, 13, "#16203a") + E(220, 96, 13, 13, "#16203a") + E(180, 96, 8, 8, k.r("#6ef0a8")) + E(220, 96, 8, 8, k.r("#6ef0a8")) + E(177, 92, 2.6, 2.6, "#fff") + E(217, 92, 2.6, 2.6, "#fff") + S("M188 114 Q200 120 212 114", "#16203a", 2.6) },
        { id: "antenna", svg: S("M200 62 V38", "#8a90a0", 4) + E(200, 32, 9, 9, k.r("#e0457b")) + E(197, 29, 2.6, 2.6, "#fff") }
      ]
    };
  };

  /* ---------------- the light bulb (inventions) ---------------- */
  LP.scenes.bulb = function (k) {
    var teeth = "", i, a, gear;
    for (i = 0; i < 10; i++) { a = i * 36; teeth += R(-5, -34, 10, 12, 2, k.g("#c9a24a"), 'transform="rotate(' + a + ')"'); }
    gear = '<g transform="translate(320 92)">' + teeth + E(0, 0, 26, 26, k.g("#d9b24c")) + E(0, 0, 11, 11, "#6a5a2a") + E(0, 0, 5, 5, "#e8d89a") + "</g>";
    return {
      bg: R(0, 0, 400, 300, 0, k.g("#2f3b5e")) + R(0, 262, 400, 38, 0, k.g("#202a47")) + E(200, 120, 120, 100, '#fff', 'opacity=".05"'),
      parts: [
        { id: "wires", svg: S("M130 236 H172 V210 M228 210 V236 H282 M60 236 H64", "#d9873a", 4) },
        { id: "battery", svg: R(56, 214, 80, 44, 8, k.g("#3fa38a")) + R(136, 227, 10, 18, 3, k.g("#cfd4de")) + R(66, 222, 20, 28, 3, "", 'fill="#fff" opacity=".22"') + S("M100 236 H116 M108 228 V244", "#fff", 3) },
        { id: "switch", svg: R(280, 244, 70, 14, 5, k.g("#8a90a0")) + E(292, 244, 5, 5, "#d9b24c") + E(340, 244, 5, 5, "#d9b24c") + S("M292 244 L330 226", "#e0457b", 4) },
        { id: "gear", svg: gear },
        { id: "base", svg: R(176, 164, 48, 44, 6, k.g("#9aa3b8")) + S("M178 176 H222 M178 188 H222 M178 200 H222", "#6b7388", 2.4) + R(186, 206, 28, 8, 4, "#4a5066") },
        { id: "glass", svg: P("M200 22 C144 22 132 98 170 130 Q176 142 176 166 H224 Q224 142 230 130 C268 98 256 22 200 22 Z", "", 'fill="#cfe9ff" opacity=".28" stroke="#e8f4ff" stroke-width="3"') + P("M164 54 Q150 80 160 104", "", 'fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55"') },
        { id: "filament", svg: S("M190 164 V120 L198 106 L206 120 L214 106 L222 120 V164", "#ffd84a", 3.4) + E(206, 104, 24, 22, "#ffd84a", 'opacity=".28"') },
        { id: "rays", svg: (function () { var t = "", i, r; for (i = 0; i < 9; i++) { r = (-160 + i * 17.5) * Math.PI / 180; t += "M" + Math.round(200 + Math.cos(r) * 88) + " " + Math.round(92 + Math.sin(r) * 92) + " L" + Math.round(200 + Math.cos(r) * 112) + " " + Math.round(92 + Math.sin(r) * 112) + " "; } return S(t, "#ffe58a", 4); })() }
      ]
    };
  };
})();
