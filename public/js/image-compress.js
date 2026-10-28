/* image-compress.js: shrinks PNG/JPEG uploads to WebP in the browser before they reach Firebase Storage. */
window.compressImageFile = function (file, opts) {
  opts = opts || {};
  var maxW = opts.maxWidth || 1600, q = opts.quality || 0.82;
  return new Promise(function (resolve) {
    try {
      if (!file || !/^image\/(png|jpe?g)$/i.test(file.type)) return resolve(file);
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var s = Math.min(1, maxW / img.naturalWidth);
        var c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) {
          if (!b || b.type !== "image/webp" || b.size >= file.size) return resolve(file);
          resolve(new File([b], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" }));
        }, "image/webp", q);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    } catch (e) { resolve(file); }
  });
};
