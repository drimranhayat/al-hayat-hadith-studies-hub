(function () {
  const storageKey = "alHayatHadithProgress";
  const motionReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (motionReduced) document.body.classList.add("reduce-motion");

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const topics = window.HADITH_TOPICS || [];
  const mcqs = window.HADITH_MCQS || [];
  const study = window.HADITH_STUDY || {};
  const glossary = window.HADITH_GLOSSARY || [];
  const books = window.HADITH_BOOKS || [];
  const templates = window.HADITH_TEMPLATES || [];
  const siteMeta = window.HADITH_SITE || {};
  const defaults = window.HADITH_PROGRESS_DEFAULTS || {};

  function getProgress() {
    try {
      return Object.assign({}, defaults, JSON.parse(localStorage.getItem(storageKey) || "{}"));
    } catch {
      return Object.assign({}, defaults);
    }
  }

  function setProgress(progress) {
    localStorage.setItem(storageKey, JSON.stringify(progress));
    renderDashboard();
    renderDashboardPreview();
  }

  function topicById(id) {
    return topics.find((topic) => topic.id === id || topic.slug === id);
  }

  function rel(url) {
    const depth = location.pathname.split("/").filter(Boolean).length;
    if (location.protocol === "file:") return url.startsWith("../") ? url : url;
    return url;
  }

  function makeCard(topic) {
    const href = document.body.dataset.current === "home" || location.pathname.endsWith("/") === false ? topic.url : "../" + topic.url;
    return `<article class="recommendation-card">
      <span class="chip">Level ${topic.level}</span>
      <h3>${topic.titleUrdu}</h3>
      <p>یہ سبق کیوں؟ ${topic.goals.slice(0, 2).join("، ")} کے لیے مناسب۔</p>
      <div class="badge-row">${topic.formats.slice(0, 3).map((x) => `<span>${x}</span>`).join("")}</div>
      <div class="hero-actions">
        <a class="button primary" href="${href}">سبق شروع کریں</a>
        <a class="button ghost" href="${href}#practice">سوالات حل کریں</a>
      </div>
    </article>`;
  }

  function applyFilters(panel) {
    const values = {};
    $$("[data-filter]", panel).forEach((select) => values[select.dataset.filter] = select.value);
    let results = topics.filter((topic) => {
      if (values.learner && !topic.learnerTypes.includes(values.learner)) return false;
      if (values.level && String(topic.level) !== String(values.level)) return false;
      if (values.goal && !topic.goals.includes(values.goal)) return false;
      if (values.format && !topic.formats.includes(values.format)) return false;
      if (values.difficulty && topic.difficulty !== values.difficulty) return false;
      return true;
    });
    if (values.time === "5 منٹ") results = results.filter((topic) => topic.level <= 2);
    if (values.time === "تفصیلی مطالعہ") results = results.filter((topic) => topic.level >= 4);
    const limit = panel.dataset.limit === "all" ? results.length : Number(panel.dataset.limit || 6);
    const target = $("[data-filter-results]", panel);
    target.innerHTML = results.slice(0, limit).map(makeCard).join("") || `<div class="recommendation-card"><h3>نتیجہ نہیں ملا</h3><p>فلٹر نرم کریں یا topic index دیکھیں۔</p></div>`;
  }

  function initFilters() {
    $$("[data-topic-filters]").forEach((panel) => {
      $("[data-apply-filters]", panel)?.addEventListener("click", () => applyFilters(panel));
      $("[data-reset-filters]", panel)?.addEventListener("click", () => {
        $$("[data-filter]", panel).forEach((select) => select.value = "");
        applyFilters(panel);
      });
      $$("[data-filter]", panel).forEach((select) => select.addEventListener("change", () => applyFilters(panel)));
      applyFilters(panel);
    });
  }

  function renderFeatured() {
    const target = $("[data-featured-topics]");
    if (!target) return;
    const featured = ["sahih-hadith", "daeef-hadith", "takhrij-hadith", "jarh-tadeel", "ilal-hadith", "verification-lab"].map(topicById).filter(Boolean);
    target.innerHTML = featured.map((topic) => `<article class="topic-card">
      <span class="chip">${topic.category}</span>
      <h3>${topic.titleUrdu}</h3>
      <p>Level ${topic.level} • ${topic.difficulty} • ${topic.formats.slice(0, 2).join("، ")}</p>
      <a class="button ghost" href="${topic.url}">کھولیں</a>
    </article>`).join("");
  }

  function renderDirectory() {
    const target = $("[data-topic-directory]");
    if (!target) return;
    target.innerHTML = topics.map((topic) => `<article class="topic-card">
      <span class="chip">Level ${topic.level}</span>
      <h3>${topic.titleUrdu}</h3>
      <p>${topic.category} / ${topic.subcategory}</p>
      <p>${topic.learnerTypes.join("، ")}</p>
      <a class="button ghost" href="${topic.url}">صفحہ کھولیں</a>
    </article>`).join("");
  }

  function initNavigation() {
    const toggle = $(".nav-toggle");
    const nav = $("#primaryNav");
    toggle?.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    $$(".mega").forEach((mega) => {
      const trigger = $(".mega-trigger", mega);
      trigger?.addEventListener("click", () => {
        const isOpen = mega.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", String(isOpen));
      });
      trigger?.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          mega.classList.remove("is-open");
          trigger.setAttribute("aria-expanded", "false");
          trigger.focus();
        }
      });
    });
  }

  function initTabs() {
    $$("[data-tabs]").forEach((tabs) => {
      const buttons = $$('[role="tab"]', tabs);
      const panels = $$(".tab-panel", tabs);
      buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
          buttons.forEach((btn) => btn.setAttribute("aria-selected", "false"));
          panels.forEach((panel) => panel.classList.remove("is-active"));
          button.setAttribute("aria-selected", "true");
          panels[index]?.classList.add("is-active");
        });
      });
    });
  }

  function initDiagrams() {
    $$("[data-expandable-diagram] button").forEach((button) => {
      button.addEventListener("click", () => button.classList.toggle("is-expanded"));
    });
    $$("[data-scroll-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = $(button.dataset.scrollTarget);
        target?.scrollIntoView({ behavior: motionReduced ? "auto" : "smooth", block: "start" });
      });
    });
  }

  function initBackToTop() {
    const button = $("[data-back-to-top]");
    if (!button) return;
    window.addEventListener("scroll", () => button.classList.toggle("is-visible", window.scrollY > 500));
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: motionReduced ? "auto" : "smooth" }));
  }

  let audioContext;
  function playClick() {
    const enabled = localStorage.getItem("alHayatSound") === "on";
    if (!enabled) return;
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.frequency.value = 420;
    gain.gain.value = 0.025;
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.045);
  }

  function initSound() {
    const toggle = $("[data-sound-toggle]");
    const enabled = localStorage.getItem("alHayatSound") === "on";
    if (toggle) {
      toggle.textContent = enabled ? "آواز آن" : "آواز بند";
      toggle.setAttribute("aria-pressed", String(enabled));
      toggle.addEventListener("click", () => {
        const next = localStorage.getItem("alHayatSound") === "on" ? "off" : "on";
        localStorage.setItem("alHayatSound", next);
        toggle.textContent = next === "on" ? "آواز آن" : "آواز بند";
        toggle.setAttribute("aria-pressed", String(next === "on"));
      });
    }
    document.addEventListener("click", (event) => {
      if (event.target.closest("button, .button")) playClick();
    });
  }

  function markComplete(topicId) {
    const progress = getProgress();
    progress.completedLessons = Array.from(new Set([...(progress.completedLessons || []), topicId]));
    progress.lastStudiedLesson = topicId;
    const now = new Date().toISOString();
    progress.lastStudyDate = now;
    setProgress(progress);
  }

  function saveTopic(topicId) {
    const progress = getProgress();
    progress.savedTopics = Array.from(new Set([...(progress.savedTopics || []), topicId]));
    progress.revisionDue = Array.from(new Set([...(progress.revisionDue || []), topicId]));
    setProgress(progress);
  }

  function initProgressButtons() {
    $$("[data-mark-complete]").forEach((button) => button.addEventListener("click", () => {
      markComplete(button.dataset.topic || $("main")?.dataset.lessonId);
      button.textContent = "سبق محفوظ ہوگیا";
    }));
    $$("[data-save-topic]").forEach((button) => button.addEventListener("click", () => {
      saveTopic(button.dataset.topic || $("main")?.dataset.lessonId);
      button.textContent = "Revision میں شامل";
    }));
    $$("[data-confidence]").forEach((button) => button.addEventListener("click", () => {
      const topicId = $("main")?.dataset.lessonId || "global";
      const progress = getProgress();
      progress.confidence = progress.confidence || {};
      progress.confidence[topicId] = button.dataset.confidence;
      setProgress(progress);
      $$("[data-confidence]").forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");
    }));
    $("[data-reset-progress]")?.addEventListener("click", () => {
      localStorage.removeItem(storageKey);
      renderDashboard();
      renderDashboardPreview();
    });
  }

  function questionPool(root) {
    const topic = root.dataset.topic;
    let pool = topic ? mcqs.filter((q) => q.topic === topic) : mcqs.slice();
    if (!pool.length) pool = mcqs.slice(0, 5);
    return pool;
  }

  function renderQuiz(root, pool, index, state) {
    const question = pool[index];
    if (!question) return renderResult(root, pool, state);
    root.innerHTML = `<div class="quiz-box">
      <p class="quiz-question">${question.questionUrdu}</p>
      <div class="option-grid">${question.options.map((option, optionIndex) => `<button type="button" data-option="${optionIndex}">${option}</button>`).join("")}</div>
      <div class="quiz-footer"><span>سوال ${index + 1} / ${pool.length}</span><span>${question.difficulty} • ${question.type}</span></div>
      <div class="result-panel" hidden data-explanation></div>
    </div>`;
    $$("[data-option]", root).forEach((button) => {
      button.addEventListener("click", () => {
        const selected = Number(button.dataset.option);
        const correct = selected === question.correctAnswer;
        if (correct) state.correct += 1;
        state.answers.push({ id: question.id, topic: question.topic, correct });
        $$("[data-option]", root).forEach((btn) => {
          btn.disabled = true;
          const value = Number(btn.dataset.option);
          if (value === question.correctAnswer) btn.classList.add("correct");
          if (value === selected && !correct) btn.classList.add("wrong");
        });
        const explanation = $("[data-explanation]", root);
        explanation.hidden = false;
        explanation.innerHTML = `<strong>${correct ? "درست" : "مزید مشق کریں"}</strong><p>${question.explanationUrdu}</p><button class="button primary" type="button" data-next-question>اگلا سوال</button>`;
        $("[data-next-question]", root).addEventListener("click", () => renderQuiz(root, pool, index + 1, state));
      });
    });
  }

  function renderResult(root, pool, state) {
    const score = Math.round((state.correct / pool.length) * 100);
    const weak = state.answers.filter((a) => !a.correct).map((a) => a.topic);
    const strong = state.answers.filter((a) => a.correct).map((a) => a.topic);
    const progress = getProgress();
    progress.quizAttempts = [...(progress.quizAttempts || []), { date: new Date().toISOString(), score, total: pool.length, correct: state.correct }];
    progress.weakTopics = Array.from(new Set([...(progress.weakTopics || []), ...weak])).slice(-12);
    progress.strongTopics = Array.from(new Set([...(progress.strongTopics || []), ...strong])).slice(-12);
    setProgress(progress);
    root.innerHTML = `<div class="quiz-box">
      <h2>Quiz Result</h2>
      <strong class="mega-number">${score}%</strong>
      <p>درست جوابات: ${state.correct} / ${pool.length}</p>
      <p>Mastery level: ${score >= 80 ? "مضبوط" : score >= 50 ? "درمیانی" : "دوبارہ مطالعہ"}</p>
      <div class="hero-actions">
        <button class="button primary" type="button" data-retry-quiz>دوبارہ کوئز دیں</button>
        <a class="button ghost" href="../topic-index.html">کمزور موضوعات پڑھیں</a>
        <a class="button secondary" href="../dashboard.html">نتیجہ محفوظ کریں</a>
      </div>
    </div>`;
    $("[data-retry-quiz]", root)?.addEventListener("click", () => startQuiz(root));
  }

  function startQuiz(root) {
    const count = Number(root.dataset.count || 5);
    const pool = questionPool(root).slice(0, count);
    renderQuiz(root, pool, 0, { correct: 0, answers: [] });
  }

  function initQuiz() {
    const topicSelect = $('[data-quiz-filter="topic"]');
    if (topicSelect) {
      topicSelect.innerHTML += topics.map((topic) => `<option value="${topic.id}">${topic.titleUrdu}</option>`).join("");
    }
    $("[data-start-quiz]")?.addEventListener("click", () => {
      const root = $("[data-quiz]");
      const topic = $('[data-quiz-filter="topic"]')?.value;
      const count = $('[data-quiz-filter="count"]')?.value;
      const difficulty = $('[data-quiz-filter="difficulty"]')?.value;
      root.dataset.topic = topic || "";
      root.dataset.count = count || "5";
      let pool = questionPool(root);
      if (difficulty) pool = pool.filter((q) => q.difficulty === difficulty);
      renderQuiz(root, pool.slice(0, Number(count || 5)), 0, { correct: 0, answers: [] });
    });
    $$("[data-quiz]").forEach((root) => startQuiz(root));
  }

  function mastery(progress) {
    const completion = Math.min((progress.completedLessons || []).length / Math.max(topics.length, 1), 1) * 25;
    const attempts = progress.quizAttempts || [];
    const avg = attempts.length ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length : 0;
    const quiz = (avg / 100) * 25;
    const confidenceValues = Object.values(progress.confidence || {});
    const confidence = confidenceValues.length ? 15 : 0;
    const revision = (progress.revisionDue || []).length ? 8 : 0;
    const shortAnswer = (progress.completedLessons || []).length ? 10 : 0;
    return Math.round(Math.min(100, completion + quiz + confidence + revision + shortAnswer));
  }

  function renderDashboardPreview() {
    const progress = getProgress();
    const complete = (progress.completedLessons || []).length;
    const score = mastery(progress);
    const completeEl = $("[data-preview-complete]");
    const masteryEl = $("[data-preview-mastery]");
    if (completeEl) completeEl.textContent = complete;
    if (masteryEl) masteryEl.textContent = score + "%";
  }

  function pillList(ids) {
    return (ids && ids.length) ? ids.map((id) => `<span>${topicById(id)?.titleUrdu || id}</span>`).join("") : "<span>ابھی کوئی data نہیں</span>";
  }

  function renderDashboard() {
    const root = $("[data-dashboard]");
    if (!root) return;
    const progress = getProgress();
    const score = mastery(progress);
    $("[data-mastery-score]", root).textContent = score + "%";
    $("[data-mastery-bar]", root).style.width = score + "%";
    $("[data-completed-count]", root).textContent = (progress.completedLessons || []).length;
    const attempts = progress.quizAttempts || [];
    const avg = attempts.length ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length) : 0;
    $("[data-average-score]", root).textContent = avg + "%";
    $("[data-streak]", root).textContent = progress.streak || 0;
    $("[data-weak-topics]", root).innerHTML = pillList(progress.weakTopics || []);
    $("[data-strong-topics]", root).innerHTML = pillList(progress.strongTopics || []);
    $("[data-revision-due]", root).innerHTML = pillList(progress.revisionDue || []);
    const completed = new Set(progress.completedLessons || []);
    const next = topics.find((topic) => !completed.has(topic.id)) || topics[0];
    $("[data-next-lesson]", root).innerHTML = next ? `<a class="button primary" href="${next.url}">${next.titleUrdu}</a>` : "<p>تمام lessons complete ہیں۔</p>";
    $("[data-saved-topics]", root).innerHTML = (progress.savedTopics || []).length ? (progress.savedTopics || []).map((id) => `<a href="${id}/">${topicById(id)?.titleUrdu || id}</a>`).join("") : "<span class='chip'>ابھی کوئی saved topic نہیں</span>";
  }

  function initContact() {
    $("[data-contact-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const messages = JSON.parse(localStorage.getItem("alHayatContactMessages") || "[]");
      messages.push({ name: form.name.value, message: form.message.value, date: new Date().toISOString() });
      localStorage.setItem("alHayatContactMessages", JSON.stringify(messages));
      $("[data-contact-note]").textContent = "پیغام demo storage میں محفوظ ہوگیا۔";
      form.reset();
    });
  }

  function initConfusionCards() {
    const target = $("[data-confusion-cards]");
    if (!target) return;
    const prefix = location.pathname.split("/").filter(Boolean).length > 1 ? "../" : "";
    target.innerHTML = (study.confusions || []).map((item) => `<article class="confusion-card">
      <span class="chip">فرق کا جدول</span>
      <h3>${item.pair}</h3>
      <p>${item.oneLine}</p>
      <div class="comparison-strip">
        <div>${item.left}</div>
        <div>${item.right}</div>
      </div>
      <p class="caution-note">${item.caution}</p>
      <a class="button ghost" href="${prefix}${item.related}">متعلقہ سبق کھولیں</a>
    </article>`).join("");
  }

  function initFlashcards() {
    const target = $("[data-flashcards]");
    if (target) {
      target.innerHTML = (study.flashcards || []).map((card) => `<button class="flashcard" type="button" data-flashcard>
        <span class="front">${card.front}</span>
        <span class="back">${card.back}</span>
      </button>`).join("");
    }
    $$("[data-flashcard]").forEach((card) => {
      card.addEventListener("click", () => card.classList.toggle("is-flipped"));
    });
  }

  function initShortQA() {
    const target = $("[data-short-qa]");
    if (!target) return;
    target.innerHTML = (study.shortQuestions || []).map((item, index) => `<div class="accordion-item">
      <button class="accordion-trigger" type="button" aria-expanded="${index === 0 ? "true" : "false"}">${item.question}</button>
      <div class="accordion-panel"${index === 0 ? "" : " hidden"}><p>${item.answer}</p><span class="chip">${topicById(item.topic)?.titleUrdu || item.topic}</span></div>
    </div>`).join("");
    const first = $(".accordion-item", target);
    if (first) first.classList.add("is-open");
  }

  function initAccordions() {
    $$("[data-accordion] .accordion-trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const item = trigger.closest(".accordion-item");
        const panel = item?.querySelector(".accordion-panel");
        const isOpen = item?.classList.toggle("is-open");
        trigger.setAttribute("aria-expanded", String(Boolean(isOpen)));
        if (panel) panel.hidden = !isOpen;
      });
    });
  }

  function initReadiness() {
    $$("[data-readiness-test]").forEach((box) => {
      const button = $("[data-readiness-check]", box);
      const result = $("[data-readiness-result]", box);
      button?.addEventListener("click", () => {
        const items = $$("[data-readiness-item]", box);
        const checked = items.filter((item) => item.checked).length;
        const prereq = result.dataset.original || result.innerHTML;
        result.dataset.original = prereq;
        if (checked >= items.length - 1) {
          result.innerHTML = "آپ اس topic کے لیے اچھی طرح تیار لگتے ہیں۔ اب lesson پڑھیں، practice کریں، اور آخر میں quiz دیں۔";
        } else if (checked >= 2) {
          result.innerHTML = "آپ شروع کر سکتے ہیں، مگر پہلے prerequisite links کو جلدی revise کر لیں۔ " + prereq;
        } else {
          result.innerHTML = "بہتر ہے پہلے prerequisites پڑھیں، پھر اس advanced topic پر آئیں۔ " + prereq;
        }
      });
    });
  }

  function initCitationBuilder() {
    $("[data-citation-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const book = form.book.value.trim() || "کتاب";
      const chapter = form.chapter.value.trim() || "باب / مقام";
      const number = form.number.value.trim() || "رقم / حوالہ";
      $("[data-citation-output]", form).textContent = `${book}، ${chapter}، ${number}۔ حکم یا درجہ صرف معتبر اہلِ علم کے حوالہ سے شامل کریں۔`;
    });
  }

  function initVerificationGuide() {
    $("[data-verification-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const report = form.report.value.trim();
      const level = form.sourceLevel.value;
      const output = $("[data-verification-output]", form);
      if (!report) {
        output.textContent = "پہلے روایت، quote، یا حوالہ لکھیں۔";
        return;
      }
      if (!level || level === "عوامی غیر تحقیقی مواد") {
        output.textContent = "احتیاط: source کمزور یا نامکمل ہے۔ اصل کتاب، معتبر شرح، یا معروف تحقیق تلاش کریں؛ ابھی share نہ کریں۔";
        return;
      }
      output.textContent = "اگلا قدم: wording، اصل source، chapter/number، context، اور معتبر اہلِ علم کا حکم الگ الگ note کریں۔";
    });
  }

  function initGlossary() {
    const target = $("[data-glossary-list]");
    if (!target) return;
    target.innerHTML = glossary.map((item) => `<article class="glossary-card">
      <span class="chip">Level ${item.level}</span>
      <h3>${item.term}</h3>
      <p>${item.definition}</p>
      <div class="meta-line"><a class="button ghost" href="${item.topic}/">متعلقہ سبق</a></div>
    </article>`).join("");
  }

  function initBooksCatalog() {
    const target = $("[data-books-catalog]");
    if (!target) return;
    target.innerHTML = books.map((book) => `<article class="catalog-card">
      <span class="chip">${book.type}</span>
      <h3>${book.title}</h3>
      <p>Level ${book.level} • ${book.status}</p>
      <div class="meta-line"><a class="button ghost" href="${book.topic}/">Source map</a></div>
    </article>`).join("");
  }

  function initTemplateLibrary() {
    const target = $("[data-template-library]");
    if (!target) return;
    target.innerHTML = templates.map((template) => `<article class="library-card">
      <span class="chip">${template.id}</span>
      <h3>${template.title}</h3>
      <p>${template.fields.join("، ")}</p>
      <div class="meta-line"><a class="button ghost" href="${template.page}">Template کھولیں</a></div>
    </article>`).join("");
  }

  function searchRecords(query) {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    const topicRecords = topics.map((topic) => ({
      type: "Topic",
      title: topic.titleUrdu,
      text: `${topic.category} ${topic.subcategory} ${topic.keywords.join(" ")} ${topic.goals.join(" ")}`,
      url: topic.url
    }));
    const glossaryRecords = glossary.map((item) => ({
      type: "Glossary",
      title: item.term,
      text: item.definition,
      url: `${item.topic}/`
    }));
    const bookRecords = books.map((book) => ({
      type: "Book",
      title: book.title,
      text: `${book.type} ${book.status}`,
      url: `${book.topic}/`
    }));
    const mcqRecords = mcqs.map((mcq) => ({
      type: "MCQ",
      title: mcq.questionUrdu,
      text: `${mcq.subject} ${mcq.topic} ${mcq.type} ${mcq.explanationUrdu}`,
      url: mcq.relatedLesson
    }));
    return [...topicRecords, ...glossaryRecords, ...bookRecords, ...mcqRecords]
      .filter((record) => `${record.title} ${record.text}`.toLowerCase().includes(value))
      .slice(0, 24);
  }

  function initSiteSearch() {
    const input = $("[data-site-search]");
    const target = $("[data-site-search-results]");
    if (!input || !target) return;
    const render = () => {
      const results = searchRecords(input.value);
      target.innerHTML = results.length ? results.map((record) => `<article class="search-card">
        <span class="chip">${record.type}</span>
        <h3>${record.title}</h3>
        <p>${record.text.slice(0, 180)}</p>
        <div class="meta-line"><a class="button ghost" href="${record.url}">کھولیں</a></div>
      </article>`).join("") : `<article class="search-card"><h3>تلاش شروع کریں</h3><p>مثلاً: سند، صحیح، تخریج، بخاری، رجال</p></article>`;
    };
    input.addEventListener("input", render);
    input.value = "";
    render();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initSound();
    initFilters();
    renderFeatured();
    renderDirectory();
    initTabs();
    initDiagrams();
    initBackToTop();
    initProgressButtons();
    initQuiz();
    renderDashboard();
    renderDashboardPreview();
    initContact();
    initConfusionCards();
    initFlashcards();
    initShortQA();
    initAccordions();
    initReadiness();
    initCitationBuilder();
    initVerificationGuide();
    initGlossary();
    initBooksCatalog();
    initTemplateLibrary();
    initSiteSearch();
  });
})();
