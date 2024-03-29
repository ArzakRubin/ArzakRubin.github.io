(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ReliefIcons = factory());
}(this, (function () {'use strict';

  const ReliefIcons = function() {
    console.time('drawRelief');
    terrain.selectAll("*").remove();
    const density = terrain.attr("density") || .4;
    const size = 1.6 * (terrain.attr("size") || 1);
    const mod = .2 * size; // size modifier;s
    const relief = []; // t: type, c: cell, x: centerX, y: centerY, s: size;
    const cells = pack.cells;

    for (const i of cells.i) {
      const height = cells.h[i];
      if (height < 20) continue; // no icons on water
      if (cells.r[i]) continue; // no icons on rivers
      const b = cells.biome[i];
      if (height < 50 && biomesData.iconsDensity[b] === 0) continue; // no icons for this biome
      const polygon = getPackPolygon(i);
      const x = d3.extent(polygon, p => p[0]), y = d3.extent(polygon, p => p[1]);
      const e = [Math.ceil(x[0]), Math.ceil(y[0]), Math.floor(x[1]), Math.floor(y[1])]; // polygon box

      if (height < 50) placeBiomeIcons(i, b); else placeReliefIcons(i);

      function placeBiomeIcons() {
        const iconsDensity = biomesData.iconsDensity[b] / 100;
        const radius = 2 / iconsDensity / density;
        if (Math.random() > iconsDensity * 10) return;

        for (const [cx, cy] of poissonDiscSampler(e[0], e[1], e[2], e[3], radius)) {
          if (!d3.polygonContains(polygon, [cx, cy])) continue;
          let h = rn((4 + Math.random()) * size, 2);
          const icon = getBiomeIcon(i, biomesData.icons[b]);
          if (icon === "#relief-grass-1") h *= 1.3;
          relief.push({i: icon, x: rn(cx-h, 2), y: rn(cy-h, 2), s: h*2});
        }
      }

      function placeReliefIcons(i) {
        const radius = 2 / density;
        const [icon, h] = getReliefIcon(i, height);

        for (const [cx, cy] of poissonDiscSampler(e[0], e[1], e[2], e[3], radius)) {
          if (!d3.polygonContains(polygon, [cx, cy])) continue;
          relief.push({i: icon, x: rn(cx-h, 2), y: rn(cy-h, 2), s: h*2});
        }
      }

      function getReliefIcon(i, h) {
        const temp = grid.cells.temp[pack.cells.g[i]];
        const type = h > 70 && temp < 0 ? "mountSnow" : h > 70 ? "mount" : "hill";
        const size = h > 70 ? (h - 45) * mod : Math.min(Math.max((h - 40) * mod, 3), 6);
        return [getIcon(type), size];
      }
    }

    // sort relief icons by y+size
    relief.sort((a, b) => (a.y + a.s) - (b.y + b.s));

    // append relief icons at once using pure js
    void function renderRelief() {
      let reliefHTML = "";
      for (const r of relief) {
        reliefHTML += `<use xlink:href="${r.i}" data-type="${r.i}" x=${r.x} y=${r.y} data-size=${r.s} width=${r.s} height=${r.s}></use>`;
      }
      terrain.html(reliefHTML);
    }()

    console.timeEnd('drawRelief');
  }

  function getBiomeIcon(i, b) {
    let type = b[Math.floor(Math.random() * b.length)];
    const temp = grid.cells.temp[pack.cells.g[i]];
    if (type === "conifer" && temp < 0) type = "coniferSnow";
    return getIcon(type);
  }
<!--Início Alteração FRD-->
  function getVariant(type) {
    switch(type) {
      case "mount": return rand(2,12);
      case "mountSnow": return rand(1,10);
      case "hill": return rand(2,9);
      case "conifer": return rand(2,11);
      case "coniferSnow": return rand(1,10);
      case "swamp": return rand(2,3);
      case "cactus": return rand(1,3);
      case "deadTree": return rand(1,2);
      case "deciduous": return rand(2,10);
      case "acacia": return rand(2,11);
      case "dune": return rand(2,6);
      case "deadTree": return rand(1,3);
      default: return 2;
    }
  }

  function getOldIcon(type) {
    switch(type) {
      case "mountSnow": return "mount";
      case "vulcan": return "mount";
      case "coniferSnow": return "conifer";
      case "cactus": return "dune";
      case "deadTree": return "dune";
      default: return type;
    }
  }

  function getIcon(type) {
    const set = terrain.attr("set") || "simple";
    if (set === "simple") return "#relief-" + getOldIcon(type) + "-1";
    if (set === "colored") return "#relief-" + type + "-" + getVariant(type);
    if (set === "gray") return "#relief-" + type + "-" + getVariant(type) + "-bw";
    return "#relief-" + getOldIcon(type) + "-1"; // simple
  }

  return ReliefIcons;

})));