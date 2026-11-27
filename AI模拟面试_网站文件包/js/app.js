/* =========================================================
   AI 模拟面试 · 四屏交互原型
   原生 JavaScript，无依赖，可直接部署到 GitHub Pages
   ========================================================= */
(function () {
  'use strict';

  const BANK = [
    { title: '两数之和', category: '技术类', icon: 'code', color: 'code', practices: '12,345', rating: '4.8', level: '简单', desc: '给定一个整数数组和一个目标值，找出数组中和为目标值的两个整数，并返回它们的下标。' },
    { title: '最长回文子串', category: '技术类', icon: 'string', color: 'string', practices: '8,234', rating: '4.7', level: '中等', desc: '给定一个字符串，找到其中最长的回文子串，并说明中心扩散与动态规划两种解法。' },
    { title: '二叉树的层序遍历', category: '技术类', icon: 'tree', color: 'tree', practices: '6,789', rating: '4.9', level: '困难', desc: '按层从左到右遍历二叉树，并输出每一层的节点值集合。' },
    { title: '寻找两个正序数组的中位数', category: '技术类', icon: 'array', color: 'array', practices: '5,678', rating: '4.6', level: '困难', desc: '给定两个有序数组，在 O(log(m+n)) 时间复杂度内求出合并后的中位数。' },
    { title: '请描述一次你解决团队冲突的经历', category: '行为类', icon: 'behavior', color: 'behavior', practices: '4,210', rating: '4.8', level: '中等', desc: '使用 STAR 框架说明背景、任务、行动与结果，重点体现沟通与协作方式。' },
    { title: '你如何推动一个跨部门项目落地？', category: '行为类', icon: 'behavior', color: 'behavior', practices: '3,908', rating: '4.7', level: '中等', desc: '从目标对齐、里程碑拆分、风险同步和结果复盘四个维度展开。' },
    { title: '你的职业规划是什么？', category: 'HR面', icon: 'hr', color: 'hr', practices: '9,120', rating: '4.6', level: '简单', desc: '结合岗位能力模型，说明未来 1-3 年的成长方向与稳定性。' },
    { title: '你为什么选择我们公司？', category: 'HR面', icon: 'hr', color: 'hr', practices: '7,650', rating: '4.7', level: '简单', desc: '从业务方向、团队氛围与个人能力匹配三个角度回答。' },
    { title: '无领导小组讨论：资源如何分配', category: '群面', icon: 'group', color: 'group', practices: '2,890', rating: '4.5', level: '困难', desc: '在限定时间内完成立场陈述、自由讨论、总结陈词并达成共识。' },
    { title: '群面中如何推进讨论节奏？', category: '群面', icon: 'group', color: 'group', practices: '2,305', rating: '4.6', level: '中等', desc: '体现时间管理、观点归纳与沉默成员邀请能力。' }
  ];

  const INTERVIEW_QUESTIONS = [
    '请介绍一下你的项目经验',
    '你在项目中遇到过最大的技术难点是什么？如何解决的？',
    '如何设计一个高并发场景下的限流方案？',
    '请谈谈你对团队协作和代码评审的理解'
  ];

  const SAMPLE_ANSWERS = [
    '项目背景：我负责一个面向企业用户的智能面试平台。\n你担任的角色：前端负责人，带领 3 人小组。\n你完成的工作：搭建组件体系、优化面试实时交互链路。\n取得的成果：首屏加载时间降低 42%，面试完成率提升 18%。',
    '难点在于高峰期语音流并发导致延迟明显。我先通过日志定位瓶颈，再把音频处理拆成独立服务并加入缓冲队列，最后用灰度发布验证效果。平均延迟从 1.8 秒降到 400 毫秒以内。',
    '我会先明确限流目标，再在网关层做令牌桶限流，对核心接口设置优先级和降级策略；同时配合监控告警，按用户维度和接口维度动态调参，避免一刀切影响体验。',
    '我认为代码评审的重点是知识共享和风险前置。评论要对事不对人，优先关注逻辑正确性和可维护性；小的风格问题交给工具处理，重要分歧通过短会快速对齐。'
  ];

  const BASE_DIMS = [82, 87, 91, 76];
  const DIM_COLORS = ['#3d7bff', '#8e6cff', '#5b6cf5', '#f5a340'];
  const DIM_NAMES = ['表达能力', '逻辑思维', '专业知识', '应变能力'];

  const state = {
    screen: 'home',
    category: '技术类',
    search: '',
    favoritesOnly: false,
    favorites: new Set(),
    questionIndex: 0,
    interviewQuestions: INTERVIEW_QUESTIONS.slice(),
    answers: [],
    recording: true,
    seconds: 323,
    timerId: null,
    submitting: false
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (s) => pad(Math.floor(s / 60)) + ':' + pad(s % 60);

  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2300);
  }

  /* ---------- 通用弹层 ---------- */
  function openModal(title, bodyHtml, actions = []) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = bodyHtml;
    const actionsEl = $('#modalActions');
    actionsEl.innerHTML = '';
    actions.forEach((action) => {
      const btn = document.createElement('button');
      btn.className = action.style === 'secondary' ? 'secondary' : 'primary';
      btn.textContent = action.label;
      btn.addEventListener('click', action.onClick);
      actionsEl.appendChild(btn);
    });
    actionsEl.classList.toggle('hidden', actions.length === 0);
    $('#modalBackdrop').classList.add('show');
    $('#modalBackdrop').setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    $('#modalBackdrop').classList.remove('show');
    $('#modalBackdrop').setAttribute('aria-hidden', 'true');
  }

  /* ---------- 页面导航 ---------- */
  function syncTabBar(name) {
    const visible = name === 'home' || name === 'bank';
    $('#tabBar').classList.toggle('hidden', !visible);
    if (!visible) return;

    const home = name === 'home';
    $('#tabHome').classList.toggle('active', home);
    $('#tabLearn').classList.toggle('active', !home && !state.favoritesOnly);
    $('#tabThird').classList.toggle('active', !home && state.favoritesOnly);
    $('#tabProfile').classList.remove('active');
    $('#tabLearn').querySelector('span').textContent = home ? '学习' : '练习';
    $('#tabThird').querySelector('span').textContent = home ? '报告' : '收藏';
  }

  function goto(name, options = {}) {
    const target = document.getElementById('screen-' + name);
    if (!target) return;

    if (state.screen === 'interview' && name !== 'interview') stopTimer();
    if (name === 'interview' && options.fresh !== false) resetInterview(options.question);

    $$('.screen').forEach((screen) => screen.classList.toggle('active', screen === target));
    $$('.switch-item').forEach((item) => item.classList.toggle('active', item.dataset.goto === name));
    $('#phoneScreen').dataset.tone = name === 'interview' ? 'dark' : 'light';
    syncTabBar(name);
    state.screen = name;

    const scroller = target.querySelector('.scroll-area, .interview-content');
    if (scroller) scroller.scrollTop = 0;

    if (name === 'bank') renderBank();
    if (name === 'report') renderReport();
  }

  /* ---------- 面试计时 ---------- */
  function startTimer() {
    stopTimer();
    state.timerId = setInterval(() => {
      state.seconds += 1;
      $('#recordTime').textContent = fmt(state.seconds);
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
  }

  function resetInterview(question) {
    stopTimer();
    state.interviewQuestions = question
      ? [question].concat(INTERVIEW_QUESTIONS.filter((q) => q !== question))
      : INTERVIEW_QUESTIONS.slice();
    state.questionIndex = 0;
    state.answers = [];
    state.seconds = 323;
    state.recording = true;
    state.submitting = false;
    $('#answerInput').value = '';
    $('#answerCount').textContent = '0/2000';
    $('#recordCard').classList.remove('paused');
    $('#recordTime').textContent = fmt(state.seconds);
    renderQuestion();
    startTimer();
  }

  function renderQuestion() {
    $('#interviewQuestion').textContent = state.interviewQuestions[state.questionIndex];
    $('#answerInput').value = '';
    $('#answerCount').textContent = '0/2000';
  }

  function submitAnswer() {
    if (state.submitting) return;
    const text = $('#answerInput').value.trim();
    if (!text) {
      toast('请先输入回答，或点击工具栏生成示例');
      $('#answerInput').focus();
      return;
    }
    state.submitting = true;
    state.answers.push(text);
    toast('回答已记录，正在进入下一题…');
    setTimeout(() => {
      state.submitting = false;
      if (state.questionIndex < state.interviewQuestions.length - 1) {
        state.questionIndex += 1;
        renderQuestion();
      } else {
        stopTimer();
        toast('面试完成，正在生成评估报告…');
        setTimeout(() => goto('report'), 650);
      }
    }, 900);
  }

  function startInterview(question) {
    goto('interview', { question });
  }

  /* ---------- 题库 ---------- */
  function filteredQuestions() {
    return BANK.filter((item) => {
      if (state.favoritesOnly && !state.favorites.has(item.title)) return false;
      if (!state.favoritesOnly && item.category !== state.category) return false;
      if (state.search && !item.title.toLowerCase().includes(state.search.toLowerCase())) return false;
      return true;
    });
  }

  function renderBankProgress() {
    const values = [40, 25, 60, 10];
    const labels = ['技术类', '行为类', 'HR面', '群面'];
    const box = $('#bankProgress');
    box.innerHTML = values.map((value, i) =>
      '<div class="progress-item"><div class="progress-track"><span class="progress-fill" data-value="' + value + '"></span></div>' +
      '<strong>' + value + '%</strong><span>' + labels[i] + '</span></div>'
    ).join('');
    requestAnimationFrame(() => {
      $$('#bankProgress .progress-fill').forEach((fill) => { fill.style.width = fill.dataset.value + '%'; });
    });
  }

  function renderBank() {
    const items = filteredQuestions();
    $('#resultCount').textContent = items.length + ' 题';
    const list = $('#questionList');

    if (!items.length) {
      list.innerHTML = '<div class="empty-state">没有找到匹配的题目<br />换个关键词或分类试试</div>';
      return;
    }

    list.innerHTML = items.map((item) => {
      const levelClass = item.level === '简单' ? 'easy' : item.level === '中等' ? 'medium' : 'hard';
      const favorite = state.favorites.has(item.title) ? ' on' : '';
      return '<div class="question-card" role="button" tabindex="0" data-title="' + item.title + '">' +
        '<span class="q-icon ' + item.color + '"><svg class="icon"><use href="#i-' + item.icon + '"/></svg></span>' +
        '<span class="q-main"><span class="q-title">' + item.title + '</span>' +
        '<span class="q-meta"><span>练习 ' + item.practices + ' 次</span><span>·</span>' +
        '<svg class="icon star"><use href="#i-star"/></svg><span>' + item.rating + ' 评价</span></span></span>' +
        '<span class="q-right"><span class="q-level ' + levelClass + '">' + item.level + '</span>' +
        '<svg class="icon fav-mark' + favorite + '"><use href="#i-star"/></svg>' +
        '<svg class="icon chev"><use href="#i-chevron"/></svg></span></div>';
    }).join('');
  }

  function openQuestion(title) {
    const item = BANK.find((q) => q.title === title);
    if (!item) return;
    const isFav = state.favorites.has(title);
    openModal(
      item.title,
      '<p>' + item.desc + '</p><div class="tag-list"><span>' + item.category + '</span><span>难度：' + item.level + '</span><span>练习 ' + item.practices + ' 次</span></div>',
      [
        {
          label: isFav ? '取消收藏' : '收藏题目',
          style: 'secondary',
          onClick: () => {
            if (isFav) state.favorites.delete(title); else state.favorites.add(title);
            closeModal();
            renderBank();
            toast(isFav ? '已取消收藏' : '已加入收藏');
          }
        },
        {
          label: '开始练习',
          onClick: () => {
            closeModal();
            startInterview(item.title);
          }
        }
      ]
    );
  }

  /* ---------- 报告 ---------- */
  function computeScores() {
    const count = state.answers.length;
    const avg = count ? state.answers.reduce((sum, text) => sum + text.length, 0) / count : 0;
    const bonus = count ? Math.min(3, Math.floor(avg / 100)) : 0;
    return {
      dims: BASE_DIMS.map((value) => Math.min(98, value + bonus)),
      overall: Math.min(99, 87 + bonus)
    };
  }

  function renderReport() {
    const { dims, overall } = computeScores();
    $('#scoreValue').textContent = overall;

    const gauge = $('#gaugeValue');
    const length = gauge.getTotalLength();
    gauge.style.strokeDasharray = length;
    gauge.style.strokeDashoffset = length * (1 - overall / 100);

    const list = $('#dimList');
    list.innerHTML = dims.map((value, i) =>
      '<div class="dim-row"><span class="dim-name">' + DIM_NAMES[i] + '</span>' +
      '<span class="dim-track"><span class="dim-fill" data-value="' + value + '" style="background:' + DIM_COLORS[i] + '"></span></span>' +
      '<span class="dim-score" style="color:' + DIM_COLORS[i] + '">' + value + '</span></div>'
    ).join('');
    requestAnimationFrame(() => {
      $$('#dimList .dim-fill').forEach((fill) => { fill.style.width = fill.dataset.value + '%'; });
    });

    drawRadar([dims[0], dims[1], dims[2], dims[3], 85]);
  }

  function drawRadar(values) {
    const cx = 110, cy = 95, radius = 63;
    const labels = ['表达能力', '逻辑思维', '专业知识', '应变能力', '综合分析'];
    const point = (i, r) => {
      const angle = (-90 + i * 72) * Math.PI / 180;
      return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
    };
    const polygon = (arr) => arr.map((r, i) => point(i, r).map((n) => n.toFixed(1)).join(',')).join(' ');
    let html = '';

    for (let layer = 1; layer <= 4; layer++) {
      const r = radius * layer / 4;
      html += '<polygon points="' + polygon(Array(5).fill(r)) + '" fill="' + (layer === 4 ? 'rgba(111,119,245,.035)' : 'none') + '" stroke="#e6e9f2" stroke-width="1"/>';
    }
    for (let i = 0; i < 5; i++) {
      const [x, y] = point(i, radius);
      const [lx, ly] = point(i, radius + 18);
      html += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="#e9ecf4" stroke-width="1"/>';
      html += '<text x="' + lx.toFixed(1) + '" y="' + (ly + 3).toFixed(1) + '" text-anchor="middle" font-size="8" fill="#98a2b4">' + labels[i] + '</text>';
    }
    const data = values.map((v) => radius * v / 100);
    html += '<polygon points="' + polygon(data) + '" fill="rgba(121,110,246,.22)" stroke="#7b67f2" stroke-width="1.8" stroke-linejoin="round"/>';
    data.forEach((r, i) => {
      const [x, y] = point(i, r);
      html += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.6" fill="#fff" stroke="#7b67f2" stroke-width="1.6"/>';
    });
    $('#radarChart').innerHTML = html;
  }

  function exportReport() {
    const { dims, overall } = computeScores();
    const lines = [
      'AI 模拟面试 · 面试结果报告',
      '================================',
      '综合得分：' + overall + ' / 100',
      '',
      '维度得分：',
      ...dims.map((v, i) => '  ' + DIM_NAMES[i] + '：' + v),
      '',
      '表现亮点：',
      '  1. 专业知识扎实，核心概念掌握准确',
      '  2. 逻辑清晰，分析问题有条理',
      '  3. 表达流畅，观点明确，易于理解',
      '',
      '改进建议：',
      '  1. 加强应变能力训练，提高临场发挥水平',
      '  2. 增加案例练习，提升实际问题解决能力',
      '  3. 可适当优化答题语速，让表达更从容',
      '',
      'AI 评语：整体表现良好，专业基础扎实，思维清晰，能够准确表达观点。'
    ];
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'AI模拟面试_报告.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('报告已导出');
  }

  /* ---------- 事件绑定 ---------- */
  function bindEvents() {
    $$('[data-goto]').forEach((el) => {
      el.addEventListener('click', () => {
        if (el.dataset.goto === 'interview') startInterview();
        else goto(el.dataset.goto);
      });
    });

    $('#modalClose').addEventListener('click', closeModal);
    $('#modalBackdrop').addEventListener('click', (e) => {
      if (e.target === $('#modalBackdrop')) closeModal();
    });

    $('#startInterview').addEventListener('click', () => startInterview());

    $('#avatarBtn').addEventListener('click', showProfile);
    $('#tabProfile').addEventListener('click', showProfile);
    $('#tabHome').addEventListener('click', () => goto('home'));
    $('#tabLearn').addEventListener('click', () => {
      state.favoritesOnly = false;
      goto('bank');
    });
    $('#tabThird').addEventListener('click', () => {
      if (state.screen === 'bank') {
        state.favoritesOnly = !state.favoritesOnly;
        syncTabBar('bank');
        renderBank();
        toast(state.favoritesOnly ? '仅显示收藏题目' : '显示全部题目');
      } else {
        goto('report');
      }
    });

    $('[data-action="resume"]').addEventListener('click', () => {
      openModal('简历优化', '<p>上传简历后，AI 会从岗位匹配度、项目量化表达、关键词覆盖三个维度给出优化建议。</p>', [
        { label: '稍后再说', style: 'secondary', onClick: closeModal },
        { label: '模拟上传', onClick: () => { closeModal(); toast('已模拟上传，分析将在面试后生成'); } }
      ]);
    });

    $('#upcomingBtn').addEventListener('click', () => {
      openModal('系统架构师面试', '<p>面试时间：后天 10:00</p><p>建议提前 15 分钟进入面试室，完成设备与网络检测。</p>', [
        { label: '知道了', onClick: closeModal },
        { label: '加入日程', style: 'secondary', onClick: () => { closeModal(); toast('已加入模拟日程'); } }
      ]);
    });

    $('[data-action="clipboard"]').addEventListener('click', () => {
      toast('已完成 ' + state.answers.length + ' 道面试题，共 ' + (state.answers.length || 3) + ' 场练习');
    });

    $('[data-action="interview-menu"]').addEventListener('click', () => {
      openModal('面试设置', '<p>可在此切换岗位、暂停面试或提前结束。当前为交互演示，操作不会离开页面。</p>', [
        { label: '继续面试', onClick: closeModal },
        { label: '结束并生成报告', style: 'secondary', onClick: () => { closeModal(); stopTimer(); goto('report'); } }
      ]);
    });

    $('#searchInput').addEventListener('input', (e) => {
      state.search = e.target.value.trim();
      state.favoritesOnly = false;
      syncTabBar('bank');
      renderBank();
    });

    $$('.chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        $$('.chip').forEach((c) => c.classList.toggle('active', c === chip));
        state.category = chip.dataset.category;
        state.favoritesOnly = false;
        syncTabBar('bank');
        renderBank();
      });
    });

    $('#questionList').addEventListener('click', (e) => {
      const card = e.target.closest('.question-card');
      if (card) openQuestion(card.dataset.title);
    });
    $('#questionList').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const card = e.target.closest('.question-card');
      if (card) openQuestion(card.dataset.title);
    });

    $('#randomPractice').addEventListener('click', () => {
      const items = filteredQuestions();
      if (!items.length) { toast('当前筛选下没有题目'); return; }
      const picked = items[Math.floor(Math.random() * items.length)];
      toast('随机练习：' + picked.title);
      startInterview(picked.title);
    });

    $('#recordBtn').addEventListener('click', () => {
      state.recording = !state.recording;
      $('#recordCard').classList.toggle('paused', !state.recording);
      $('#recordBtn').setAttribute('aria-label', state.recording ? '暂停录音' : '继续录音');
      if (state.recording) startTimer(); else stopTimer();
      toast(state.recording ? '已继续录音' : '已暂停录音');
    });

    const answerInput = $('#answerInput');
    answerInput.addEventListener('input', () => {
      $('#answerCount').textContent = answerInput.value.length + '/2000';
    });

    $$('.answer-tools button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        if (tool === 'submit') { submitAnswer(); return; }
        if (tool === 'sample') {
          answerInput.value = SAMPLE_ANSWERS[state.questionIndex % SAMPLE_ANSWERS.length];
        } else if (tool === 'template') {
          answerInput.value = '项目背景：\n你担任的角色：\n你完成的工作：\n取得的成果：';
        } else if (tool === 'star') {
          toast('回答框架：情境 → 任务 → 行动 → 结果');
          return;
        } else if (tool === 'attach') {
          toast('已添加模拟附件');
          return;
        }
        answerInput.dispatchEvent(new Event('input'));
        answerInput.focus();
      });
    });

    $('#exportBtn').addEventListener('click', exportReport);
    $('#dimFilter').addEventListener('click', () => toast('已切换为本次面试维度得分'));

    $$('.note-row').forEach((row) => {
      row.addEventListener('click', () => {
        let detail = row.nextElementSibling;
        if (!detail || !detail.classList.contains('note-detail')) {
          detail = document.createElement('div');
          detail.className = 'note-detail';
          detail.textContent = row.dataset.detail;
          row.insertAdjacentElement('afterend', detail);
        }
        detail.classList.toggle('show');
        row.classList.toggle('expanded');
      });
    });

    $('#coachBtn').addEventListener('click', () => {
      openModal('个性化面试辅导', '<p>根据本报告，建议优先提升应变表达，并补充两道真实案例练习。</p><div class="tag-list"><span>7 天练习计划</span><span>每日 1 题</span><span>AI 逐句点评</span></div>', [
        { label: '暂不生成', style: 'secondary', onClick: closeModal },
        { label: '生成计划', onClick: () => { closeModal(); toast('已生成 7 天辅导计划'); } }
      ]);
    });

    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;
      if (e.key === 'Escape') {
        if ($('#modalBackdrop').classList.contains('show')) closeModal();
        else if (state.screen !== 'home') goto('home');
        return;
      }
      const map = { '1': 'home', '2': 'bank', '3': 'interview', '4': 'report' };
      if (map[e.key]) {
        if (map[e.key] === 'interview') startInterview();
        else goto(map[e.key]);
      }
    });
  }

  function showProfile() {
    openModal('个人中心', '<p>张明 · 求职中</p><p>已完成 3/5 道今日面试题，连续打卡 7 天，最近一次面试得分 87。</p><div class="tag-list"><span>技术类 40%</span><span>行为类 25%</span><span>HR面 60%</span><span>群面 10%</span></div>', [
      { label: '关闭', onClick: closeModal },
      { label: '查看报告', style: 'secondary', onClick: () => { closeModal(); goto('report'); } }
    ]);
  }

  /* ---------- 初始化 ---------- */
  bindEvents();
  renderBankProgress();
  renderBank();
  goto('home', { fresh: false });
})();
