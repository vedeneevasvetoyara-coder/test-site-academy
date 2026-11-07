/* Помощник Светланы: окошко с вопросами перед разговором в мессенджере.
   Ничего не сохраняет и никуда не отправляет сам: клиент пересылает ответы своими руками.
   Если этот файл не загрузится, кнопки просто откроют Telegram. */
(function () {
  'use strict';

  var TELEGRAM = 'https://t.me/Website_bystro';
  var MAX = 'https://max.ru/u/f9LHodD0cOKmZTJR2Hq6jo_UnEer7Ip-8JwHayHEPmbGhq7Ukyw1NXHAREg';
  var NB = ' ';

  var INTRO = 'Здравствуйте! Я помощник Светланы. Задам 5 коротких вопросов - это займёт около минуты. ' +
    'Потом Вы отправите ответы Светлане в Telegram или Макс, и она ответит Вам сегодня.';

  var QUESTIONS = [
    {
      key: 'Сфера',
      title: 'Чем Вы занимаетесь?',
      options: ['Ремонт и стройка', 'Автосервис', 'Красота и здоровье', 'Эксперт или обучение', 'Гостевой дом'],
      custom: 'Другое (свой ответ)'
    },
    {
      key: 'Задача',
      title: 'Что сайт должен делать в первую очередь?',
      options: ['Приносить заявки', 'Показывать работы и цены', 'Рассказать о новой услуге', 'Заменить старый сайт']
    },
    {
      key: 'Уже есть',
      title: 'Что у Вас уже есть?',
      hint: 'Можно выбрать несколько',
      multi: true,
      none: 'Пока ничего',
      options: ['Логотип', 'Фото работ', 'Тексты', 'Пока ничего']
    },
    {
      key: 'Сроки',
      title: 'Когда нужен сайт?',
      options: ['Как можно скорее', 'В течение недели', 'В этом месяце', 'Пока присматриваюсь']
    },
    {
      key: 'Вариант',
      title: 'Какой вариант Вам ближе?',
      options: [
        'Визитка - 3' + NB + '000' + NB + '₽, 2' + NB + 'дня',
        'Визитка с фото - 5' + NB + '000' + NB + '₽, 3' + NB + 'дня',
        'Под ключ - 7' + NB + '000' + NB + '₽, 4' + NB + 'дня',
        'Пока не знаю, нужен совет'
      ]
    }
  ];

  var COMMENT_STEP = QUESTIONS.length + 1;
  var RESULT_STEP = QUESTIONS.length + 2;

  var state = { step: 0, answers: {}, comment: '', customOpen: false };
  var dialog, body;

  /* Оформление берём из цветов и шрифтов самой страницы */
  function theme() {
    var css = getComputedStyle(document.documentElement);
    var read = function (name) { return css.getPropertyValue(name).trim(); };
    if (read('--accent')) {
      return { main: read('--accent'), mainText: '#FFFFFF', soft: read('--soft'), ink: read('--ink'), muted: read('--muted'), line: read('--line'), radius: '999px', card: '22px', head: read('--f-head'), weight: '500', shadow: 'none' };
    }
    if (read('--sun')) {
      return { main: read('--sun'), mainText: read('--ink'), soft: read('--sky'), ink: read('--ink'), muted: read('--muted'), line: read('--line'), radius: '14px', card: '18px', head: read('--f-head'), weight: '700', shadow: '4px 4px 0 ' + read('--ink') };
    }
    return { main: read('--lemon'), mainText: read('--ink'), soft: read('--panel'), ink: read('--ink'), muted: read('--muted'), line: read('--slate-light'), radius: '999px', card: '22px', head: read('--f-head'), weight: '700', shadow: 'none' };
  }

  function addStyles() {
    var t = theme();
    var style = document.createElement('style');
    style.textContent =
      '.pm{--pm-main:' + t.main + ';--pm-main-text:' + t.mainText + ';--pm-soft:' + t.soft + ';--pm-ink:' + t.ink + ';--pm-muted:' + t.muted + ';--pm-line:' + t.line + ';--pm-radius:' + t.radius + ';' +
      'width:min(520px,calc(100vw - 32px));max-height:min(720px,calc(100dvh - 32px));margin:auto;padding:0;border:0;border-radius:' + t.card + ';background:#fff;color:var(--pm-ink);font:400 16px/1.5 var(--f-text);overflow:auto;box-shadow:0 20px 60px rgba(20,30,50,.3)}' +
      '.pm::backdrop{background:rgba(20,30,50,.55)}' +
      '.pm *{box-sizing:border-box}' +
      '.pm-in{padding:22px 24px 26px}' +
      '.pm-top{display:flex;align-items:center;gap:12px;margin-bottom:18px}' +
      '.pm-top img{width:44px;height:44px;border-radius:50%;object-fit:cover;flex:none}' +
      '.pm-who{flex:1;min-width:0}.pm-who b{display:block;font-weight:700;line-height:1.25}.pm-who small{color:var(--pm-muted);font-size:14px}' +
      '.pm-x{width:44px;height:44px;flex:none;border:0;background:transparent;color:var(--pm-ink);font:400 26px/1 var(--f-text);cursor:pointer;border-radius:50%}' +
      '.pm-x:hover{background:var(--pm-soft)}' +
      '.pm-bar{height:6px;border-radius:3px;background:var(--pm-soft);margin-bottom:16px;overflow:hidden}.pm-bar i{display:block;height:100%;background:var(--pm-ink);border-radius:3px}' +
      '.pm h2{font:' + t.weight + ' clamp(20px,5vw,24px)/1.25 ' + t.head + ';margin:0 0 6px;outline:0;color:var(--pm-ink)}' +
      '.pm p{margin:0 0 14px}.pm .pm-hint{color:var(--pm-muted);font-size:15px}' +
      '.pm-opts{display:grid;gap:10px;margin:14px 0 0}' +
      '.pm-opt{width:100%;min-height:50px;padding:12px 16px;text-align:left;font:600 16px/1.3 var(--f-text);color:var(--pm-ink);background:#fff;border:2px solid var(--pm-line);border-radius:var(--pm-radius);cursor:pointer}' +
      '.pm-opt:hover{border-color:var(--pm-ink)}' +
      '.pm-opt[aria-pressed=true]{background:var(--pm-soft);border-color:var(--pm-ink)}' +
      '.pm-field{width:100%;margin-top:12px;padding:12px 14px;font:400 16px/1.4 var(--f-text);color:var(--pm-ink);background:#fff;border:2px solid var(--pm-line);border-radius:14px;resize:vertical}' +
      '.pm-field:focus{outline:0;border-color:var(--pm-ink)}' +
      '.pm-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}' +
      '.pm-btn{display:inline-flex;flex:1 1 200px;align-items:center;justify-content:center;min-height:50px;padding:12px 18px;font:700 16px/1.2 var(--f-text);text-align:center;text-decoration:none;cursor:pointer;color:var(--pm-main-text);background:var(--pm-main);border:2px solid ' + (t.shadow === 'none' ? 'var(--pm-main)' : 'var(--pm-ink)') + ';border-radius:var(--pm-radius);box-shadow:' + t.shadow + '}' +
      '.pm-btn[disabled]{opacity:.45;cursor:not-allowed}' +
      '.pm-btn.pm-alt{color:var(--pm-ink);background:#fff;border-color:var(--pm-ink);box-shadow:none}' +
      '.pm-link{min-height:44px;padding:8px 4px;border:0;background:none;color:var(--pm-muted);font:600 15px/1.2 var(--f-text);text-decoration:underline;cursor:pointer}' +
      '.pm-sum{white-space:pre-wrap;overflow-wrap:anywhere;padding:14px 16px;margin:12px 0 0;background:var(--pm-soft);border-radius:14px;font-size:15px}' +
      '.pm-ok{min-height:24px;margin:12px 0 0;font-size:15px;font-weight:600}' +
      '@media (max-width:560px){.pm{width:100%;max-width:100%;max-height:92dvh;margin:auto 0 0;border-radius:' + t.card + ' ' + t.card + ' 0 0}.pm-in{padding:16px 16px calc(20px + env(safe-area-inset-bottom,0px))}}';
    document.head.appendChild(style);
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(cls, text, onClick) {
    var node = el('button', cls, text);
    node.type = 'button';
    node.addEventListener('click', onClick);
    return node;
  }

  function lower(text) {
    return text.charAt(0).toLowerCase() + text.slice(1);
  }

  function goTo(step) {
    state.step = step;
    state.customOpen = false;
    render();
  }

  function messageText() {
    var lines = ['Здравствуйте, Светлана! Хочу обсудить сайт.'];
    QUESTIONS.forEach(function (q) {
      var value = state.answers[q.key];
      if (Array.isArray(value)) value = value.map(lower).join(', ');
      else if (value && value !== state.answers[q.key + ':свой']) value = lower(value);
      if (value) lines.push(q.key + ': ' + value.split(NB).join(' '));
    });
    if (state.comment) lines.push('Комментарий: ' + state.comment);
    return lines.join('\n');
  }

  function copyText(text) {
    function fallback() {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      dialog.appendChild(area);
      area.select();
      var done = false;
      try { done = document.execCommand('copy'); } catch (e) { done = false; }
      area.remove();
      return done;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, fallback);
    }
    return Promise.resolve(fallback());
  }

  function renderIntro() {
    var title = el('h2', '', 'Обсудим Ваш сайт');
    title.tabIndex = -1;
    body.appendChild(title);
    body.appendChild(el('p', '', INTRO));
    var row = el('div', 'pm-row');
    row.appendChild(button('pm-btn', 'Начать', function () { goTo(1); }));
    body.appendChild(row);
    return title;
  }

  function progress(number) {
    var bar = el('div', 'pm-bar');
    var fill = document.createElement('i');
    fill.style.width = Math.round(number / QUESTIONS.length * 100) + '%';
    bar.appendChild(fill);
    body.appendChild(bar);
    body.appendChild(el('p', 'pm-hint', 'Вопрос ' + number + ' из ' + QUESTIONS.length));
  }

  function backButton(step) {
    return button('pm-link', 'Назад', function () { goTo(step); });
  }

  function renderQuestion(number) {
    var q = QUESTIONS[number - 1];
    progress(number);
    var title = el('h2', '', q.title);
    title.tabIndex = -1;
    body.appendChild(title);
    if (q.hint) body.appendChild(el('p', 'pm-hint', q.hint));

    var opts = el('div', 'pm-opts');
    var row = el('div', 'pm-row');
    var chosen = state.answers[q.key];

    if (q.multi) {
      var list = Array.isArray(chosen) ? chosen.slice() : [];
      var next = button('pm-btn', 'Дальше', function () {
        state.answers[q.key] = list;
        goTo(number + 1);
      });
      next.disabled = list.length === 0;
      q.options.forEach(function (text) {
        var opt = button('pm-opt', text, function () {
          var at = list.indexOf(text);
          if (at >= 0) list.splice(at, 1);
          else if (text === q.none) list = [text];
          else {
            var noneAt = list.indexOf(q.none);
            if (noneAt >= 0) list.splice(noneAt, 1);
            list.push(text);
          }
          Array.prototype.forEach.call(opts.children, function (child) {
            child.setAttribute('aria-pressed', String(list.indexOf(child.textContent) >= 0));
          });
          next.disabled = list.length === 0;
        });
        opt.setAttribute('aria-pressed', String(list.indexOf(text) >= 0));
        opts.appendChild(opt);
      });
      body.appendChild(opts);
      row.appendChild(next);
    } else {
      q.options.forEach(function (text) {
        var opt = button('pm-opt', text, function () {
          state.answers[q.key] = text;
          delete state.answers[q.key + ':свой'];
          goTo(number + 1);
        });
        opt.setAttribute('aria-pressed', String(chosen === text));
        opts.appendChild(opt);
      });
      body.appendChild(opts);
      if (q.custom) {
        var ownValue = state.answers[q.key + ':свой'];
        var own = button('pm-opt', q.custom, function () {
          state.customOpen = true;
          render();
        });
        own.setAttribute('aria-pressed', String(Boolean(ownValue) || state.customOpen));
        opts.appendChild(own);
        if (state.customOpen || ownValue) {
          var input = el('input', 'pm-field');
          input.type = 'text';
          input.maxLength = 120;
          input.value = ownValue || '';
          input.setAttribute('aria-label', 'Чем Вы занимаетесь');
          body.appendChild(input);
          var ok = button('pm-btn', 'Дальше', function () {
            var value = input.value.trim();
            if (!value) { input.focus(); return; }
            state.answers[q.key] = value;
            state.answers[q.key + ':свой'] = value;
            goTo(number + 1);
          });
          row.appendChild(ok);
          if (state.customOpen) {
            body.appendChild(row);
            if (number > 1) row.appendChild(backButton(number - 1));
            return input;
          }
        }
      }
    }
    body.appendChild(row);
    if (number > 1) {
      var back = el('div', 'pm-row');
      back.appendChild(backButton(number - 1));
      body.appendChild(back);
    } else {
      var toStart = el('div', 'pm-row');
      toStart.appendChild(backButton(0));
      body.appendChild(toStart);
    }
    return title;
  }

  function renderComment() {
    var title = el('h2', '', 'Хотите что-то добавить своими словами?');
    title.tabIndex = -1;
    body.appendChild(title);
    body.appendChild(el('p', 'pm-hint', 'Это необязательно. Можно сразу нажать «Дальше».'));
    var area = el('textarea', 'pm-field');
    area.rows = 4;
    area.maxLength = 500;
    area.value = state.comment;
    area.setAttribute('aria-label', 'Комментарий');
    body.appendChild(area);
    var save = function () { state.comment = area.value.trim(); };
    var row = el('div', 'pm-row');
    row.appendChild(button('pm-btn', 'Дальше', function () { save(); goTo(RESULT_STEP); }));
    body.appendChild(row);
    var back = el('div', 'pm-row');
    back.appendChild(button('pm-link', 'Назад', function () { save(); goTo(QUESTIONS.length); }));
    body.appendChild(back);
    return title;
  }

  function renderResult() {
    var text = messageText();
    var title = el('h2', '', 'Готово! Отправьте ответы Светлане');
    title.tabIndex = -1;
    body.appendChild(title);
    body.appendChild(el('p', 'pm-hint', 'Выберите, где Вам удобнее. Текст скопируется сам. Если чат откроется пустым, вставьте текст в поле сообщения и нажмите «Отправить».'));
    body.appendChild(el('div', 'pm-sum', text));

    var status = el('p', 'pm-ok');
    status.setAttribute('role', 'status');

    function sendLink(label, href, cls) {
      var link = el('a', cls, label);
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener';
      link.addEventListener('click', function () {
        copyText(text).then(function (done) {
          status.textContent = done ? 'Текст скопирован.' : 'Скопировать не получилось: выделите текст выше вручную.';
        });
      });
      return link;
    }

    var row = el('div', 'pm-row');
    row.appendChild(sendLink('Отправить в Telegram', TELEGRAM + '?text=' + encodeURIComponent(text), 'pm-btn'));
    row.appendChild(sendLink('Отправить в Макс', MAX, 'pm-btn pm-alt'));
    body.appendChild(row);
    body.appendChild(status);

    var more = el('div', 'pm-row');
    more.appendChild(button('pm-link', 'Назад', function () { goTo(COMMENT_STEP); }));
    more.appendChild(button('pm-link', 'Скопировать текст', function () {
      copyText(text).then(function (done) {
        status.textContent = done ? 'Текст скопирован.' : 'Скопировать не получилось: выделите текст выше вручную.';
      });
    }));
    more.appendChild(button('pm-link', 'Начать заново', function () {
      state.answers = {};
      state.comment = '';
      goTo(0);
    }));
    body.appendChild(more);
    return title;
  }

  function render() {
    body.textContent = '';
    var focus;
    if (state.step === 0) focus = renderIntro();
    else if (state.step <= QUESTIONS.length) focus = renderQuestion(state.step);
    else if (state.step === COMMENT_STEP) focus = renderComment();
    else focus = renderResult();
    dialog.scrollTop = 0;
    if (focus) focus.focus();
  }

  function build() {
    addStyles();
    dialog = el('dialog', 'pm');
    dialog.setAttribute('aria-label', 'Помощник Светланы');

    var inner = el('div', 'pm-in');
    var top = el('div', 'pm-top');
    var photo = document.createElement('img');
    photo.src = 'img/svetlana.jpg';
    photo.alt = '';
    photo.width = 44;
    photo.height = 44;
    top.appendChild(photo);
    var who = el('div', 'pm-who');
    who.appendChild(el('b', '', 'Помощник Светланы'));
    who.appendChild(el('small', '', 'автоматические вопросы, отвечает Светлана'));
    top.appendChild(who);
    var close = button('pm-x', '×', function () { dialog.close(); });
    close.setAttribute('aria-label', 'Закрыть');
    top.appendChild(close);
    inner.appendChild(top);

    body = el('div');
    inner.appendChild(body);
    dialog.appendChild(inner);

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', function () {
      document.documentElement.style.overflow = '';
    });
    document.body.appendChild(dialog);
  }

  function open(event) {
    event.preventDefault();
    if (!dialog.open) {
      document.documentElement.style.overflow = 'hidden';
      dialog.showModal();
      render();
    }
  }

  function start() {
    if (typeof HTMLDialogElement === 'undefined') return;
    var triggers = document.querySelectorAll('a.top-btn, a.seal-link, a.chat, a[aria-label^="Обсудить"]');
    if (!triggers.length) return;
    build();
    Array.prototype.forEach.call(triggers, function (link) {
      link.addEventListener('click', open);
      link.setAttribute('aria-haspopup', 'dialog');
      if (link.hasAttribute('aria-label')) link.setAttribute('aria-label', 'Обсудить Ваш сайт с помощником Светланы');
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
