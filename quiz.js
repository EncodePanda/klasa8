// The quiz page: one question at a time, answers in random order, the
// explanation after each answer, the score at the end. Nothing is sent
// anywhere and nothing is stored.
(function () {
  var source = document.getElementById("quiz-data");
  var root = document.getElementById("quiz");
  if (!source || !root) return;
  var data = JSON.parse(source.textContent);
  var text = data.text;
  var questions = data.questions;
  var index = 0;
  var score = 0;

  function make(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function fill(template, values) {
    return template.replace(/\{(\w+)\}/g, function (_, name) { return values[name]; });
  }

  function shuffled(count) {
    var order = [];
    for (var i = 0; i < count; i++) order.push(i);
    for (var j = order.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var held = order[j];
      order[j] = order[k];
      order[k] = held;
    }
    return order;
  }

  function showQuestion() {
    var question = questions[index];
    root.innerHTML = "";
    root.appendChild(make("p", "quiz-progress",
      fill(text.progress, { number: index + 1, total: questions.length })));
    var heading = make("h2", "quiz-question", question.q);
    heading.setAttribute("tabindex", "-1");
    root.appendChild(heading);
    if (question.multiple) root.appendChild(make("p", "quiz-hint", text.selectAll));

    var form = make("form", "quiz-answers");
    var inputs = [];
    shuffled(question.answers.length).forEach(function (answerIndex) {
      var answer = question.answers[answerIndex];
      var label = make("label", "quiz-answer");
      var input = document.createElement("input");
      input.type = question.multiple ? "checkbox" : "radio";
      input.name = "answer";
      input.value = String(answerIndex);
      label.appendChild(input);
      label.appendChild(make("span", "", answer.t));
      form.appendChild(label);
      inputs.push({ input: input, label: label, correct: answer.c });
    });
    var check = make("button", "quiz-button", text.check);
    check.type = "submit";
    check.disabled = true;
    form.appendChild(check);
    root.appendChild(form);

    form.addEventListener("change", function () {
      check.disabled = !inputs.some(function (item) { return item.input.checked; });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (check.disabled) return;
      // Right means: every correct answer chosen and no wrong one.
      var right = inputs.every(function (item) { return item.input.checked === item.correct; });
      if (right) score += 1;
      inputs.forEach(function (item) {
        item.input.disabled = true;
        if (item.correct) item.label.classList.add("correct");
        else if (item.input.checked) item.label.classList.add("wrong");
      });
      form.removeChild(check);

      var result = make("div", "quiz-result " + (right ? "right" : "missed"));
      result.setAttribute("role", "status");
      result.setAttribute("tabindex", "-1");
      result.appendChild(make("p", "quiz-verdict", right ? text.correct : text.wrong));
      result.appendChild(make("p", "quiz-explanation", question.e));
      root.appendChild(result);

      var last = index === questions.length - 1;
      var next = make("button", "quiz-button", last ? text.seeResult : text.next);
      next.type = "button";
      next.addEventListener("click", function () {
        index += 1;
        if (last) showScore(); else showQuestion();
      });
      root.appendChild(next);
      result.focus();
    });

    if (index > 0) heading.focus();
  }

  function showScore() {
    root.innerHTML = "";
    var summary = make("div", "quiz-score");
    summary.setAttribute("tabindex", "-1");
    summary.appendChild(make("p", "quiz-score-label", text.scoreLabel));
    summary.appendChild(make("p", "quiz-score-number",
      fill(text.score, { score: score, total: questions.length })));
    root.appendChild(summary);

    var again = make("button", "quiz-button", text.again);
    again.type = "button";
    again.addEventListener("click", start);
    root.appendChild(again);
    var back = make("a", "quiz-back", text.backToChapter);
    back.href = "index.html";
    root.appendChild(back);
    summary.focus();
  }

  function start() {
    index = 0;
    score = 0;
    showQuestion();
  }

  start();
})();
