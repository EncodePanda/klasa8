// Play buttons for the chapter page. One recording plays at a time. A
// player with data-words also highlights the word being read.
(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll(".player"));
  var lastManualScroll = 0;

  ["wheel", "touchmove", "keydown"].forEach(function (name) {
    window.addEventListener(name, function () {
      lastManualScroll = Date.now();
    }, { passive: true });
  });

  function clock(seconds) {
    if (!isFinite(seconds)) return "";
    seconds = Math.floor(seconds);
    var rest = seconds % 60;
    return Math.floor(seconds / 60) + ":" + (rest < 10 ? "0" : "") + rest;
  }

  players.forEach(function (player) {
    var audio = player.querySelector("audio");
    var button = player.querySelector("button");
    var bar = player.querySelector("input");
    var time = player.querySelector(".time");

    // Words to highlight, and when each one starts.
    var words = [];
    var starts = [];
    var current = -1;
    var timesId = player.getAttribute("data-words");
    if (timesId) {
      var source = document.getElementById(timesId);
      var times = source ? JSON.parse(source.textContent) : [];
      var spans = (player.closest("article") || player.parentNode).querySelectorAll(".w");
      if (spans.length === times.length) {
        words = spans;
        starts = times.map(function (pair) { return pair[0]; });
      }
    }

    // Keep the word being read on screen, unless the reader is scrolling.
    function follow(word) {
      if (audio.paused || Date.now() - lastManualScroll < 4000) return;
      var box = word.getBoundingClientRect();
      var height = window.innerHeight;
      if (box.top < height * 0.15 || box.bottom > height * 0.75) {
        window.scrollBy({ top: box.top - height * 0.35, behavior: "smooth" });
      }
    }

    function mark() {
      if (!words.length) return;
      var found = -1;
      if (player.classList.contains("started") && !audio.ended) {
        // The last word that has started by now.
        var low = 0;
        var high = starts.length - 1;
        while (low <= high) {
          var middle = (low + high) >> 1;
          if (starts[middle] <= audio.currentTime) {
            found = middle;
            low = middle + 1;
          } else {
            high = middle - 1;
          }
        }
      }
      if (found === current) return;
      if (current >= 0) words[current].classList.remove("now");
      current = found;
      if (current >= 0) {
        words[current].classList.add("now");
        follow(words[current]);
      }
    }

    function loop() {
      mark();
      if (!audio.paused) window.requestAnimationFrame(loop);
    }

    function show() {
      if (isFinite(audio.duration)) {
        bar.max = Math.floor(audio.duration);
        bar.value = Math.floor(audio.currentTime);
      }
      time.textContent = clock(audio.currentTime) + " / " + clock(audio.duration);
      mark();
    }

    button.addEventListener("click", function () {
      if (audio.paused) {
        players.forEach(function (other) {
          if (other !== player) other.querySelector("audio").pause();
        });
        audio.play();
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", function () {
      player.classList.add("playing", "started");
      button.setAttribute("aria-pressed", "true");
      loop();
    });
    audio.addEventListener("pause", function () {
      player.classList.remove("playing");
      button.setAttribute("aria-pressed", "false");
    });
    ["timeupdate", "loadedmetadata", "durationchange", "seeked", "ended"].forEach(function (name) {
      audio.addEventListener(name, show);
    });
    bar.addEventListener("input", function () {
      audio.currentTime = Number(bar.value);
    });
  });
})();
