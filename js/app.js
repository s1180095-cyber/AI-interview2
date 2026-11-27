/* AI 面试助手 · 交互逻辑（无依赖，可直接部署到 GitHub Pages） */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const phone = $('#phone');
  const main = $('#main');
  const tabbar = $('#tabbar');
  const toastEl = $('#toast');
  const sheetMask = $('#sheetMask');
  const sheet = $('#sheet');

  const questions = [
    { id: 1, title: '两数之和', category: '技术类', difficulty: '简单', practice: '12,345', rating: '4.8', icon: 'i-code', tone: 'blue' },
    { id: 2, title: '最长回文子串', category: '技术类', difficulty: '中等', practice: '8,234', rating: '4.7', icon: 'i-code', tone: 'cyan' },
    { id: 3, title: '二叉树的层序遍历', category: '技术类', difficulty: '困难', practice: '6,789', rating: '4.9', icon: 'i-grid', tone: 'green' },
    { id: 4, title: '寻找两个正序数组的中位数', category: '技术类', difficulty: '困难', practice: '5,678', rating: '4.6', icon: 'i-chart', tone: 'purple' },
    { id: 5, title: '请讲一次你解决团队冲突的经历', category: '行为类', difficulty: '中等', practice: '9,120', rating: '4.8', icon: 'i-user', tone: 'blue' },
    { id: 6, title: '描述你最有成就感的一个项目', category: '行为类', difficulty: '简单', practice: '7,430', rating: '4.7', icon: 'i-star', tone: 'cyan' },
    { id: 7, title: '你为什么选择我们公司？', category: 'HR面', difficulty: '简单', practice: '15,230', rating: '4.9', icon: 'i-doc', tone: 'purple' },
    { id: 8, title: '你的职业规划是什么？', category: 'HR面', difficulty: '中等', practice: '11,560', rating: '4.6', icon: 'i-bulb', tone: 'green' },
    { id: 9, title: '系统设计：短链接服务', category: '群面', difficulty: '困难', practice: '3,240', rating: '4.8', icon: 'i-code', tone: 'blue' },
    { id: 10, title: '小组讨论：产品优先级排序', category: '群面', difficulty: '中等', practice: '2,980', rating: '4.7', icon: 'i-list', tone: 'cyan' }
  ];

  const progress = { '技术类': 40, '行为类': 25, 'HR面': 60, '群面': 10 };

  const reports = {
    current: {
      score: 87, dims: [82, 87, 91, 76], radar: [82, 87, 91, 76, 84], trust: '高',
      highlights: ['专业知识扎实，核心概念掌握准确', '逻辑清晰，分析问题有条理', '表达流畅，观点明确，易于理解'],
      advice: ['加强应变能力训练，提高临场发挥水平', '增加案例练习，提升实际问题解决能力', '可适当优化答题语速，让表达更从容'],
      comment: '整体表现良好，专业基础扎实，思维清晰，能够准确表达观点。在应变处理上还有提升空间，建议加强练习。继续保持！'
    },
    previous: {
      score: 74, dims: [75, 79, 83, 70], radar: [75, 79, 83, 70, 78], trust: '中',
      highlights: ['态度积极，能够完整回答全部问题', '基础知识有一定积累', '表达意愿强，沟通配合度高'],
      advice: ['系统梳理专业知识体系，补齐核心概念', '使用 STAR 法则组织回答，增强逻辑性', '多进行模拟练习，提升表达流畅度'],
      comment: '本次面试态度认真，能够完成基本表达。专业知识与逻辑结构仍需加强，建议结合题库进行专项练习，逐步提升面试表现。'
    }
  };

  const icons = id => `<svg class="icon"><use href="#${id}"/></svg>`;
  const tabSets = {
    home: [{ id: 'home', label: '首页', icon: 'i-home' }, { id: 'learning', label: '学习', icon: 'i-book' }, { id: 'report', label: '报告', icon: 'i-chart' }, { id: 'profile', label: '我的', icon: 'i-user' }],
    bank: [{ id: 'home', label: '首页', icon: 'i-home' }, { id: 'bank', label: '练习', icon: 'i-book' }, { id: 'favorites', label: '收藏', icon: 'i-star' }, { id: 'profile', label: '我的', icon: 'i-user' }]
  };

  let currentPage = 'home';
  let currentCategory = '技术类';
  let searchTerm = '';
  let favorites = loadFavorites();
  let currentQuestion = null;
  let seconds = 323;
  let recording = false;
  let timerId = null;
  let toastId = null;

  function loadFavorites() {
    try { return new Set(JSON.parse(localStorage.getItem('ai-interview-favorites') || '[]')); }
    catch (e) { return new Set(); }
  }
  function saveFavorites() {
    try { localStorage.setItem('ai-interview-favorites', JSON.stringify([...favorites])); } catch (e) { /* 本地文件模式可忽略 */ }
  }

  function toast(message) {
    clearTimeout(toastId);
    toastEl.textContent = message;
    toastEl.classList.add('show');
    toastId = setTimeout(() => toastEl.classList.remove('show'), 2400);
  }

  function openSheet(html) {
    sheet.innerHTML = '<div class="sheet-handle"></div>' + html;
    sheetMask.hidden = false;
  }
  function closeSheet() { sheetMask.hidden = true; sheet.innerHTML = ''; }

  function renderTabs(page) {
    let set = null, active = page;
    if (page === 'home' || page === 'learning' || page === 'profile') set = tabSets.home;
    if (page === 'bank' || page === 'favorites') set = tabSets.bank;
    if (!set) { phone.classList.add('no-tab'); phone.classList.remove('has-tab'); return; }
    phone.classList.remove('no-tab');
    phone.classList.add('has-tab');
    tabbar.innerHTML = set.map(tab => `
      <button class="tab ${tab.id === active ? 'is-active' : ''}" data-go="${tab.id}" aria-label="${tab.label}">
        ${icons(tab.icon)}<span>${tab.label}</span>
      </button>`).join('');
  }

  function navigate(page) {
    if (!document.getElementById('page-' + page)) return;
    closeSheet();
    if (currentPage === 'interview' && page !== 'interview') pauseTimer();
    document.querySelectorAll('.page').forEach(el => el.classList.toggle('is-active', el.id === 'page-' + page));
    currentPage = page;
    try { history.replaceState(null, '', '#' + page); } catch (e) { /* file:// 模式忽略 */ }
    phone.classList.toggle('dark-theme', page === 'interview');
    renderTabs(page);
    $('#page-' + page).scrollTop = 0;
    if (page === 'report') renderReport($('#reportSelect').value);
    if (page === 'interview') { updateTimer(); resumeTimer(); }
    if (page === 'favorites') renderFavorites();
  }

  /* ---------- 题库 ---------- */
  function renderProgress() {
    $('#progressGrid').innerHTML = Object.keys(progress).map(name => `
      <div class="progress-item">
        <div class="progress-track"><i style="width:${progress[name]}%"></i></div>
        <strong>${progress[name]}%</strong><span>${name}</span>
      </div>`).join('');
  }

  function questionCard(q) {
    const isFav = favorites.has(q.id);
    const diffClass = q.difficulty === '简单' ? 'easy' : q.difficulty === '中等' ? 'medium' : 'hard';
    return `<div class="question-card" data-question="${q.id}">
      <span class="question-icon ${q.tone}">${icons(q.icon)}</span>
      <div class="question-info">
        <h4>${q.title}</h4>
        <div class="question-meta"><svg class="icon trend"><use href="#i-chart"/></svg> 练习 ${q.practice} 次
          <svg class="icon star"><use href="#i-star"/></svg> ${q.rating} 评价</div>
      </div>
      <div class="question-end">
        <span class="difficulty ${diffClass}">${q.difficulty}</span>
        <button class="fav-btn ${isFav ? 'is-fav' : ''}" data-fav="${q.id}" aria-label="收藏题目">${icons('i-bookmark')}</button>
      </div>
      ${icons('i-chevron-right').replace('class="icon"', 'class="icon chev"')}
    </div>`;
  }

  function renderQuestions() {
    const list = questions.filter(q => q.category === currentCategory &&
      (!searchTerm || q.title.toLowerCase().includes(searchTerm) || q.category.toLowerCase().includes(searchTerm)));
    $('#questionCount').textContent = `共 ${list.length} 题`;
    $('#questionList').innerHTML = list.length ? list.map(questionCard).join('')
      : '<p class="no-result">没有找到相关题目，换个关键词试试</p>';
  }

  function renderFavorites() {
    const list = questions.filter(q => favorites.has(q.id));
    $('#favoriteCount').textContent = `${list.length} 题`;
    $('#favoriteEmpty').style.display = list.length ? 'none' : 'block';
    $('#favoriteList').innerHTML = list.map(questionCard).join('');
  }

  function toggleFavorite(id) {
    const qid = Number(id);
    if (favorites.has(qid)) { favorites.delete(qid); toast('已取消收藏'); }
    else { favorites.add(qid); toast('已加入收藏'); }
    saveFavorites();
    renderQuestions();
    if (currentPage === 'favorites') renderFavorites();
  }

  /* ---------- 面试中 ---------- */
  function setQuestion(q) {
    currentQuestion = q;
    $('#interviewQuestion').textContent = q ? q.title : '请介绍一下你的项目经验';
    $('#answerInput').value = '';
    $('#charCount').textContent = '0';
    seconds = 323;
    updateTimer();
  }

  function formatTime(s) {
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  function updateTimer() { $('#timer').textContent = formatTime(seconds); }
  function pauseTimer() { recording = false; clearInterval(timerId); timerId = null; }
  function resumeTimer() {
    if (timerId || !recording) return;
    timerId = setInterval(() => { seconds += 1; updateTimer(); }, 1000);
  }
  function updateRecordUI() {
    $('#recordBtn').classList.toggle('is-paused', !recording);
    $('#recordBtn').setAttribute('aria-label', recording ? '暂停录音' : '继续录音');
    $('#recordWave').classList.toggle('is-paused', !recording);
  }

  /* ---------- 报告 ---------- */
  function renderRadar(values) {
    const cx = 105, cy = 96, radius = 66;
    const labels = ['表达能力', '逻辑思维', '专业知识', '应变能力', '学习能力'];
    const point = (i, ratio) => {
      const angle = (-90 + i * 72) * Math.PI / 180;
      return [cx + Math.cos(angle) * radius * ratio, cy + Math.sin(angle) * radius * ratio];
    };
    const poly = ratio => Array.from({ length: 5 }, (_, i) => point(i, ratio).map(n => n.toFixed(1)).join(',')).join(' ');
    let svg = '';
    [0.25, 0.5, 0.75, 1].forEach(r => { svg += `<polygon points="${poly(r)}" fill="none" stroke="#e6eaf3" stroke-width="1"/>`; });
    for (let i = 0; i < 5; i++) {
      const [x, y] = point(i, 1);
      svg += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e6eaf3" stroke-width="1"/>`;
    }
    const dataPoints = values.map((v, i) => point(i, v / 100));
    svg += `<polygon points="${dataPoints.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ')}" fill="rgba(124,92,255,.26)" stroke="#8b6cff" stroke-width="2" stroke-linejoin="round"/>`;
    dataPoints.forEach(([x, y]) => { svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.8" fill="#7c5cff" stroke="#fff" stroke-width="1"/>`; });
    labels.forEach((label, i) => {
      const [x, y] = point(i, 1.27);
      const anchor = x > cx + 6 ? 'start' : x < cx - 6 ? 'end' : 'middle';
      svg += `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="${anchor}">${label}</text>`;
    });
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    svg += `<text x="${cx}" y="${cy + 3}" text-anchor="middle" font-size="11" fill="#a4b0c2">${avg}</text>`;
    $('#radarChart').innerHTML = svg;
  }

  function renderBars(dims) {
    const names = ['表达能力', '逻辑思维', '专业知识', '应变能力'];
    $('#scoreBars').innerHTML = dims.map((v, i) => `
      <div class="bar-item">
        <span class="bar-value">${v}</span>
        <div class="bar-track"><div class="bar-fill" style="height:${v}%"></div></div>
        <span class="bar-label">${names[i]}</span>
      </div>`).join('');
  }

  function renderReport(key) {
    const data = reports[key] || reports.current;
    $('#scoreNumber').textContent = data.score;
    $('#gaugeValue').style.strokeDashoffset = String(Math.round(289 * (1 - data.score / 100)));
    renderRadar(data.radar);
    renderBars(data.dims);
    $('#highlightList').innerHTML = data.highlights.map(t => `<li>${icons('i-check-circle')}<span>${t}</span>${icons('i-chevron-right').replace('class="icon"', 'class="icon chev"')}</li>`).join('');
    $('#adviceList').innerHTML = data.advice.map(t => `<li>${icons('i-bulb')}<span>${t}</span>${icons('i-chevron-right').replace('class="icon"', 'class="icon chev"')}</li>`).join('');
    $('#aiComment').textContent = data.comment;
    $('#trustLevel').textContent = data.trust;
  }

  /* ---------- 事件 ---------- */
  document.addEventListener('click', async e => {
    const sheetAction = e.target.closest('[data-sheet-action]');
    if (sheetAction) {
      const action = sheetAction.dataset.sheetAction;
      const category = sheetAction.dataset.category;
      closeSheet();
      if (action === 'category' && category) {
        currentCategory = category;
        document.querySelectorAll('#categoryChips .chip').forEach(el => el.classList.toggle('is-active', el.dataset.category === category));
        renderQuestions();
        navigate('bank');
        toast(`已切换到「${category}」练习`);
        return;
      }
      if (action === 'random') { startRandom(); return; }
      if (action === 'finish') { navigate('home'); toast('本次面试已结束'); return; }
      if (action === 'remind') { toast('已设置提醒，我们将准时通知你'); return; }
      if (action === 'upload') { toast('简历上传功能即将开放'); return; }
      if (action === 'coach-basic') { toast('已为你预约基础面试辅导'); return; }
      if (action === 'coach-pro') { toast('已为你预约一对一面试辅导'); return; }
      return;
    }

    const favBtn = e.target.closest('[data-fav]');
    if (favBtn) { e.stopPropagation(); toggleFavorite(favBtn.dataset.fav); return; }

    const questionEl = e.target.closest('[data-question]');
    if (questionEl) {
      const q = questions.find(item => item.id === Number(questionEl.dataset.question));
      setQuestion(q);
      recording = true; updateRecordUI();
      navigate('interview');
      toast('面试已开始，请回答面试官的问题');
      return;
    }

    const chip = e.target.closest('[data-category]');
    if (chip) {
      currentCategory = chip.dataset.category;
      document.querySelectorAll('#categoryChips .chip').forEach(el => el.classList.toggle('is-active', el === chip));
      renderQuestions();
      return;
    }

    const go = e.target.closest('[data-go]');
    if (go) { navigate(go.dataset.go); return; }

    const actionEl = e.target.closest('[data-action]');
    if (actionEl) {
      const action = actionEl.dataset.action;
      switch (action) {
        case 'start-interview':
          setQuestion(null);
          navigate('interview');
          recording = true; updateRecordUI(); resumeTimer();
          toast('面试已开始，请回答面试官的问题');
          break;
        case 'random': startRandom(); break;
        case 'submit-answer':
          if (!$('#answerInput').value.trim()) { toast('请先输入你的回答内容'); $('#answerInput').focus(); return; }
          pauseTimer();
          navigate('report');
          toast('面试报告已生成');
          break;
        case 'interview-menu':
          openSheet(`<h3>面试设置</h3><p>当前题目：${currentQuestion ? currentQuestion.title : '请介绍一下你的项目经验'}</p>
            <button class="sheet-option" data-sheet-action="random">${icons('i-shuffle')} 切换一道题目</button>
            <button class="sheet-option" data-sheet-action="finish">${icons('i-check-circle')} 结束本次面试</button>
            <button class="sheet-cancel" data-sheet-action="close">继续面试</button>`);
          break;
        case 'leave-interview':
          openSheet(`<h3>结束本次面试？</h3><p>当前回答尚未提交，结束后本次练习将不会生成报告。</p>
            <button class="sheet-option danger" data-sheet-action="finish">${icons('i-close')} 确定结束面试</button>
            <button class="sheet-cancel" data-sheet-action="close">继续面试</button>`);
          break;
        case 'record-toggle':
          recording = !recording; updateRecordUI();
          recording ? resumeTimer() : pauseTimer();
          toast(recording ? '已继续录音' : '已暂停录音');
          break;
        case 'share':
          shareReport();
          break;
        case 'coach':
          openSheet(`<h3>个性化面试辅导</h3><span class="sheet-badge">${icons('i-sparkle')} 专业面试官 1 对 1</span>
            <p>根据你的面试报告定制辅导方案，针对性提升薄弱环节。</p>
            <button class="sheet-option" data-sheet-action="coach-basic">${icons('i-book')} AI 专项提升计划 · 免费</button>
            <button class="sheet-option" data-sheet-action="coach-pro">${icons('i-user')} 真人面试官 1 对 1 · 体验价</button>
            <button class="sheet-cancel" data-sheet-action="close">暂不需要</button>`);
          break;
        case 'upcoming':
          openSheet(`<h3>系统架构师面试</h3><p>后天 10:00 · 线上视频面试<br>建议提前 30 分钟进入模拟面试室进行热身练习。</p>
            <button class="sheet-option" data-sheet-action="remind">${icons('i-bell')} 设置提醒</button>
            <button class="sheet-option" data-sheet-action="close">${icons('i-book')} 查看准备建议</button>`);
          break;
        case 'resume':
          openSheet(`<h3>AI 简历优化</h3><p>上传简历后，AI 将从内容结构、关键词匹配、成果量化三个维度给出优化建议。</p>
            <button class="sheet-option" data-sheet-action="upload">${icons('i-doc')} 上传简历文件</button>
            <button class="sheet-cancel" data-sheet-action="close">稍后再说</button>`);
          break;
        case 'bank-menu':
          openSheet(`<h3>选择练习分类</h3><p>共 ${questions.length} 道精选题目，覆盖四大面试场景。</p>
            ${Object.keys(progress).map(name => `<button class="sheet-option" data-sheet-action="category" data-category="${name}">${icons('i-book')} ${name} · ${questions.filter(q => q.category === name).length} 题</button>`).join('')}
            <button class="sheet-cancel" data-sheet-action="close">取消</button>`);
          break;
        case 'practice-history':
          openSheet(`<h3>练习记录</h3><p>今日已完成 3 道面试题，连续打卡 7 天，继续保持！</p>
            <button class="sheet-option" data-sheet-action="close">${icons('i-check-circle')} 两数之和 · 已完成</button>
            <button class="sheet-option" data-sheet-action="close">${icons('i-check-circle')} 最长回文子串 · 已完成</button>
            <button class="sheet-option" data-sheet-action="close">${icons('i-check-circle')} 二叉树的层序遍历 · 已完成</button>
            <button class="sheet-cancel" data-sheet-action="close">关闭</button>`);
          break;
        case 'setting': toast('设置功能即将开放'); break;
        case 'notice': toast('暂无新消息'); break;
        case 'course': toast(`已打开「${actionEl.dataset.title}」`); break;
      }
      return;
    }

    const tool = e.target.closest('[data-tool]');
    if (tool) { toast(`${tool.dataset.tool}功能即将开放`); return; }

    if (e.target.closest('#searchClear')) {
      $('#questionSearch').value = ''; searchTerm = ''; $('#searchClear').classList.remove('show'); renderQuestions(); return;
    }
    if (e.target.closest('#recordBtn')) {
      recording = !recording; updateRecordUI();
      recording ? resumeTimer() : pauseTimer();
      toast(recording ? '已继续录音' : '已暂停录音');
      return;
    }
    if (e.target === sheetMask) closeSheet();
  });

  async function shareReport() {
    const text = `我在 AI 面试助手完成了模拟面试，综合得分 ${reports.current.score} 分！`;
    try {
      if (navigator.share) { await navigator.share({ title: '面试结果报告', text, url: location.href }); }
      else if (navigator.clipboard) { await navigator.clipboard.writeText(location.href); toast('报告链接已复制，快分享给朋友吧'); }
      else { toast(text); }
    } catch (err) { /* 用户取消分享 */ }
  }

  function startRandom() {
    const pool = questions.filter(q => q.category === currentCategory);
    const q = (pool.length ? pool : questions)[Math.floor(Math.random() * (pool.length || questions.length))];
    setQuestion(q);
    navigate('interview');
    recording = true; updateRecordUI(); resumeTimer();
    toast(`已切换题目：${q.title}`);
  }

  $('#questionSearch').addEventListener('input', e => {
    searchTerm = e.target.value.trim().toLowerCase();
    $('#searchClear').classList.toggle('show', !!searchTerm);
    renderQuestions();
  });

  $('#answerInput').addEventListener('input', e => { $('#charCount').textContent = e.target.value.length; });

  $('#reportSelect').addEventListener('change', e => renderReport(e.target.value));

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  /* ---------- 初始化 ---------- */
  renderProgress();
  renderQuestions();
  renderFavorites();
  const initialPage = location.hash.replace('#', '');
  if (initialPage && initialPage !== 'home' && document.getElementById('page-' + initialPage)) {
    navigate(initialPage);
    if (initialPage === 'interview') { recording = true; updateRecordUI(); resumeTimer(); }
  } else {
    renderTabs('home');
  }
  updateRecordUI();
  updateTimer();
  setTimeout(() => { if (currentPage === 'report') renderReport($('#reportSelect').value); }, 80);
})();
