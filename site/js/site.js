/* CountryData: filter the country list as you type. */
(function () {
  "use strict";
  var input = document.querySelector("[data-filter]");
  if (!input) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card"));
  var sections = Array.prototype.slice.call(document.querySelectorAll(".cont"));
  var count = document.querySelector("[data-filter-count]");
  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase(), shown = 0;
    cards.forEach(function (c) {
      var hit = !q || c.dataset.name.indexOf(q) !== -1;
      c.hidden = !hit;
      if (hit) shown++;
    });
    sections.forEach(function (s) { s.hidden = !s.querySelector(".card:not([hidden])"); });
    count.textContent = q ? shown + (shown === 1 ? " country" : " countries") + " match." : "";
  });
})();
