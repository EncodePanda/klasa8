// Light and dark mode. Follows the device until the reader chooses, then
// remembers the choice. Loaded in <head> so the page never flashes the
// wrong colours.
(function () {
  var KEY = "study-companion-theme";
  var root = document.documentElement;

  var saved = null;
  try {
    saved = window.localStorage.getItem(KEY);
  } catch (error) {
    // Storage can be unavailable (private windows); the device setting applies.
  }
  if (saved === "light" || saved === "dark") {
    root.setAttribute("data-theme", saved);
  }

  function current() {
    var chosen = root.getAttribute("data-theme");
    if (chosen) return chosen;
    var dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return dark ? "dark" : "light";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector(".theme-toggle");
    if (!button) return;
    button.setAttribute("aria-pressed", String(current() === "dark"));
    button.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      button.setAttribute("aria-pressed", String(next === "dark"));
      try {
        window.localStorage.setItem(KEY, next);
      } catch (error) {
        // The choice still holds for this page.
      }
    });
  });
})();
