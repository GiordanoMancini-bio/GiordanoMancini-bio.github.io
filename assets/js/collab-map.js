(function () {
  var data = window.COLLAB || [];
  var el = document.getElementById('collab-map');
  var worldUrl = el.getAttribute('data-world');

  // Co-authors per country
  var byCountry = {};
  data.forEach(function (inst) { byCountry[inst.country] = (byCountry[inst.country] || 0) + inst.people.length; });
  var classes = [1, 3, 6, 10];                        // upper bounds of the colour classes
  var blues = ['#c9d9ea', '#9bb9d8', '#6c94bf', '#4a73a1', '#2c4a6b'];
  function colorFor(n) { var i = 0; while (i < classes.length && n > classes[i]) i++; return blues[i]; }

  var WORLD = [[-56, -170], [78, 190]];
  var map = L.map('collab-map', {
    scrollWheelZoom: false, maxZoom: 7, zoomSnap: 0.25,
    maxBounds: [[-75, -200], [88, 220]], maxBoundsViscosity: 0.8
  });
  map.fitBounds(WORLD);
  map.setMinZoom(map.getZoom());
  map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a> · Natural Earth');

  var homeInst = data.filter(function (d) { return d.home; })[0];
  var home = homeInst ? [homeInst.lat, homeInst.lon] : null;

  fetch(worldUrl).then(function (r) { return r.json(); }).then(function (world) {
    // World base map: countries with co-authors are coloured
    L.geoJSON(world, {
      style: function (f) {
        var n = byCountry[f.properties.name];
        return n ? { color: '#ffffff', weight: 0.8, fillColor: colorFor(n), fillOpacity: 1 }
                 : { color: '#ffffff', weight: 0.6, fillColor: '#dfe4ea', fillOpacity: 1 };
      },
      onEachFeature: function (f, layer) {
        var n = byCountry[f.properties.name];
        if (n) layer.bindTooltip('<strong>' + f.properties.name + '</strong><br>' + n + ' co-author' + (n > 1 ? 's' : ''), { sticky: true });
      }
    }).addTo(map);
    drawNetwork();
  }).catch(drawNetwork);

  function drawNetwork() {
    if (home) {
      data.forEach(function (inst) {
        if (inst.home) return;
        L.polyline([home, [inst.lat, inst.lon]], { color: '#1b2c40', weight: 1, opacity: 0.35, interactive: false }).addTo(map);
      });
    }
    data.forEach(function (inst) {
      var n = inst.people.reduce(function (s, p) { return s + p.papers; }, 0);
      var r = 4 + 2.6 * Math.sqrt(n);
      var list = inst.people.map(function (p) {
        return '<li>' + p.name + ' <span>(' + p.papers + (p.papers > 1 ? ' papers' : ' paper') + ')</span></li>';
      }).join('');
      var m = L.circleMarker([inst.lat, inst.lon], {
        radius: r, color: '#fff', weight: 1.5, fillColor: inst.home ? '#c2653a' : '#1b2c40', fillOpacity: 0.85
      }).addTo(map).bindPopup(
        '<div class="popup"><strong>' + inst.institution + '</strong><em>' + inst.place +
        (inst.home ? ' · home institution' : '') + '</em><ul>' + list + '</ul></div>'
      );
      m.bindTooltip(inst.institution, { direction: 'top', offset: [0, -r] });
    });
  }

  // Legend
  var Legend = L.Control.extend({
    options: { position: 'bottomleft' },
    onAdd: function () {
      var d = L.DomUtil.create('div', 'map-legend');
      var labels = ['1', '2–3', '4–6', '7–10', '> 10'];
      d.innerHTML = '<b>Co-authors per country</b>' + blues.map(function (c, i) {
        return '<div class="row"><span class="sw" style="background:' + c + '"></span>' + labels[i] + '</div>';
      }).join('') + '<div class="row" style="margin-top:.3rem"><span class="dot" style="background:#1b2c40"></span>Institution (size = joint papers)</div>' +
        '<div class="row"><span class="dot" style="background:#c2653a"></span>Sapienza (home)</div>';
      return d;
    }
  });
  map.addControl(new Legend());

  // Quick zoom buttons
  var Views = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function () {
      var d = L.DomUtil.create('div', 'leaflet-bar map-views');
      d.innerHTML = '<a href="#" data-v="world">World</a><a href="#" data-v="europe">Europe</a>';
      L.DomEvent.disableClickPropagation(d);
      d.addEventListener('click', function (e) {
        e.preventDefault();
        var v = e.target.getAttribute('data-v');
        if (v === 'world') map.fitBounds(WORLD);
        if (v === 'europe') map.fitBounds([[36, -10], [58, 25]]);
      });
      return d;
    }
  });
  map.addControl(new Views());

  // Country chips under the map
  var chips = document.getElementById('country-chips');
  if (chips) {
    chips.innerHTML = Object.keys(byCountry).sort(function (a, b) { return byCountry[b] - byCountry[a]; })
      .map(function (c) { return '<li>' + c.replace('United States of America', 'USA') + ' <strong>' + byCountry[c] + '</strong></li>'; }).join('');
  }
})();
