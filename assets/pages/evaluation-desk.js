/* =====================================================================
   评估作业台（项目评估页）
   口径来源：区级人工智能项目评估系统 V0.4
   · 选定投标项目并启动评估，系统按阶段推进逐部分给出分值
   · 指标按 0—100 分、五档；锚点 1/3/5，档内按「满足子项数比例」插值
   · 总分 = Σ(指标得分 × 指标权重) ÷ 100
   · 证据形式要件不满足 → 该指标 0 分（形式先于锚点判定）
   · F1、F2 为一票否决前置，不进入插值
   ===================================================================== */
(function () {
  'use strict';
  var DATA = window.IND_DATA || [];
  if (!DATA.length) return;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var C = window.CONFIG;
  if (!$('#edProj')) return;

  /* ---------- 指标 → 子项清单（V0.4 4.3 插值方式补充） ---------- */
  var SUB = {
    A1: ['有明确业务痛点', '有发生频次数据', '有现有处理方式', '有基线数据与成本'],
    A2: ['有覆盖事项数', '有服务对象规模', '有预计年调用量', '覆盖规模已拆既有/新建两数', '三者可与台账互证'],
    A3: ['设解决率目标', '设一次办结率目标', '设人工转接率目标', '设满意度目标值'],
    A4: ['与既有系统边界清楚', '与在建项目边界清楚', '与市级平台边界清楚', '有去重承诺'],
    B1: ['路线属主流', '有同类落地案例', '案例可验证', '政务场景已落地'],
    B2: ['复用市级大模型底座', '复用统一身份', '复用事项库/电子证照', '复用政务云算力', '复用有清单'],
    B3: ['能力与场景匹配', '有评测集', '有拒答与人工兜底', '有可核验运行监测证明', '现场演示通过'],
    B4: ['接口开放', '模型可替换', '完成信创适配'],
    B5: ['有存量迁移路径', '有割接方案', '有回退预案', '割接可行性经论证'],
    C1: ['有功能清单', '功能清单可计数', '与申报金额互证', '偏差15%以内'],
    C2: ['逐项对标基准单价', '逐项对标同类成交价', '偏离可解释', '附工程量清单'],
    C3: ['底座未重复计价', '接口未重复计价', '数据未重复计价', '算力未重复计价', '附复用清单'],
    C4: ['运维费率达标', '运维内容完整', '算力另计清晰', '无以运维补贴建设'],
    D1: ['高新/专精特新', '体系认证', '信用记录良好', '无处罚与失信'],
    D2: ['有同类案例', '案例数量充足', '合同金额可核验', '验收结论良好', '用户评价良好'],
    D3: ['项目经理明确', '关键人员已锁定', '有独有技术或专利', '近六个月社保证明'],
    D4: ['有本地机构', '承诺驻场', '响应时效量化', '承诺7×24接管并有组网拓扑'],
    E1: ['园区注册', '在区纳税', '完成纳统', '新引进企业政策折算'],
    E2: ['属区重点扶持方向', '在扶持清单内', '有政策文件依据'],
    E3: ['对招商有带动', '对产业链协同有带动', '对就业有带动'],
    F1: ['有数据分类分级', '最小必要', '脱敏方案完整', '共享审批完备'],
    F2: ['等保测评完成', '密评完成', '生成式AI安全评估完成', '算法备案完成'],
    F3: ['语料合规', '输出审核', '拒答策略', '人工兜底', '有评测集'],
    F4: ['多源可替换', '有退出方案', '有迁移方案'],
    F5: ['告警分级机制', '各级通知与到场时限', '备件到场时限', '巡检频次', '可用率承诺', '漏洞修复时限']
  };

  /* ---------- 证据等级 ---------- */
  var EV = {
    L4: { t: 'L4 实测/现场验证', d: '现场演示、实测数据、第三方现场核验结论' },
    L3: { t: 'L3 第三方权威评测', d: '权威机构评测报告、权威榜单、第三方检测结论' },
    L2: { t: 'L2 公开基准/行业数据', d: '公开基准数据、行业统计、标准与政策文件' },
    L1: { t: 'L1 认证资质类', d: '证书、备案证明、体系认证；仅用于通过门槛，不单独支撑高分' },
    X:  { t: '形式要件不满足', d: '证据形式要件不满足，按无效证据处理，该指标不得分' }
  };

  /* ---------- 评估阶段：六个维度 + 汇总 ---------- */
  var PHASES = [
    { k: 'A', n: '需求必要性', o: '需求解析',   d: '生成需求画像，判断痛点真实性与重复建设' },
    { k: 'B', n: '技术适配',   o: '技术初判',   d: '判断技术路线成熟度与底座、算力复用' },
    { k: 'C', n: '造价合理性', o: '造价核定',   d: '功能点计数、市场对标与复用抵扣' },
    { k: 'D', n: '企业能力',   o: '企业核验',   d: '资质信用、同类业绩与本地交付能力' },
    { k: 'E', n: '园区产业',   o: '政策核验',   d: '园区注册纳税、重点产业方向与带动' },
    { k: 'F', n: '安全合规',   o: '合规核查',   d: '数据安全、等保备案与内容安全' },
    { k: 'Z', n: '汇总出分',   o: '结论出具',   d: '加权汇总、等级判定与结论生成' }
  ];

  /* ---------- 评估对象：投标项目基础信息与造价核定共用 CONFIG.bidProjects ---------- */
  var SCORE = {
    P1: {
      preset: { A1: 5, A2: 3, A3: 3, A4: 5, B1: 5, B2: 5, B3: 5, B4: 3, B5: 3,
        C1: 3, C2: 3, C3: 5, C4: 3, D1: 5, D2: 5, D3: 3, D4: 5, E1: 5, E2: 5, E3: 3, F1: 3, F2: 3, F3: 3, F4: 3, F5: 3 },
      ev: { A1: 'L4', A2: 'L3', A3: 'L3', A4: 'L4', B1: 'L4', B2: 'L4', B3: 'L3', B4: 'L2', B5: 'L2',
        C1: 'L3', C2: 'L3', C3: 'L4', C4: 'L3', D1: 'L4', D2: 'L4', D3: 'L3', D4: 'L4', E1: 'L4', E2: 'L4',
        E3: 'L2', F1: 'L3', F2: 'L3', F3: 'L2', F4: 'L2', F5: 'L2' }
    },
    P2: {
      preset: { A1: 5, A2: 5, A3: 3, A4: 3, B1: 5, B2: 3, B3: 3, B4: 3, B5: 3,
        C1: 3, C2: 3, C3: 3, C4: 3, D1: 5, D2: 3, D3: 5, D4: 3, E1: 5, E2: 3, E3: 3, F1: 3, F2: 3, F3: 3, F4: 3, F5: 3 },
      ev: { A1: 'L4', A2: 'L3', A3: 'L2', A4: 'L3', B1: 'L3', B2: 'L3', B3: 'L2', B4: 'L2', B5: 'L2',
        C1: 'L3', C2: 'L2', C3: 'L3', C4: 'L2', D1: 'L4', D2: 'L3', D3: 'L4', D4: 'L2', E1: 'L4', E2: 'L2',
        E3: 'L2', F1: 'L3', F2: 'L1', F3: 'L2', F4: 'L2', F5: 'L2' }
    },
    P3: {
      preset: { A1: 3, A2: 3, A3: 3, A4: 3, B1: 5, B2: 5, B3: 5, B4: 5, B5: 3,
        C1: 3, C2: 5, C3: 5, C4: 3, D1: 5, D2: 5, D3: 5, D4: 3, E1: 5, E2: 5, E3: 5, F1: 5, F2: 5, F3: 5, F4: 3, F5: 3 },
      ev: { A1: 'L3', A2: 'L3', A3: 'L2', A4: 'L3', B1: 'L4', B2: 'L4', B3: 'L4', B4: 'L3', B5: 'L2',
        C1: 'L3', C2: 'L4', C3: 'L4', C4: 'L2', D1: 'L4', D2: 'L4', D3: 'L4', D4: 'L3', E1: 'L4', E2: 'L4',
        E3: 'L3', F1: 'L4', F2: 'L4', F3: 'L3', F4: 'L2', F5: 'L2' }
    },
    P4: {
      preset: { A1: 3, A2: 3, A3: 3, A4: 5, B1: 3, B2: 3, B3: 3, B4: 3, B5: 3,
        C1: 3, C2: 3, C3: 3, C4: 3, D1: 3, D2: 3, D3: 3, D4: 3, E1: 3, E2: 3, E3: 3, F1: 3, F2: 1, F3: 3, F4: 1, F5: 1 },
      ev: { A1: 'L3', A2: 'L2', A3: 'L2', A4: 'L3', B1: 'L2', B2: 'L2', B3: 'L2', B4: 'L2', B5: 'L2',
        C1: 'L2', C2: 'L3', C3: 'L3', C4: 'L2', D1: 'L3', D2: 'L3', D3: 'L2', D4: 'L2', E1: 'L3', E2: 'L2',
        E3: 'L2', F1: 'L2', F2: 'L1', F3: 'L2', F4: 'L1', F5: 'L1' }
    }
  };
  var PROJ = (C.bidProjects || []).map(function (b) {
    var s = SCORE[b.id] || { preset: {}, ev: {} };
    return {
      id: b.id, name: b.name, unit: b.unit, scene: b.scene,
      declared: b.declared, price: b.price, verdict: b.verdict, date: b.date,
      preset: s.preset, ev: s.ev
    };
  });
  if (!PROJ.length) return;

  /* ---------- 工具 ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var AN = { 1: 20, 3: 60, 5: 100 };
  var TOTAL_ITEMS = DATA.length;

  /* ---------- 系统自动打分 ---------- */
  function scoreOf(it, p) {
    var a = p.preset[it.code];
    if (a == null) return null;
    var ev = p.ev[it.code] || 'L3';
    if (ev === 'X') return 0;
    if (it.code === 'F1' || it.code === 'F2') return ev === 'L1' ? 60 : AN[a];
    var subs = SUB[it.code] || [];
    var n = subs.length || 1;
    var hit = a === 5 ? n : (a === 3 ? Math.ceil(n / 2) : 0);
    var ratio = hit / n;
    if (a === 1) return 20;
    if (a === 3) return ratio >= 0.5 ? Math.round(60 + 40 * ((ratio - 0.5) / 0.5)) : Math.round(20 + 40 * ratio);
    return Math.round(Math.max(60, 100 - 20 * (1 - ratio)));
  }
  function grade(s) {
    if (s >= 85) return { t: 'A 档', c: 'g-a' };
    if (s >= 75) return { t: 'B 档', c: 'g-b' };
    if (s >= 65) return { t: 'C 档', c: 'g-c' };
    if (s >= 55) return { t: 'D 档', c: 'g-d' };
    return { t: 'E 档', c: 'g-e' };
  }
  function band(s) {
    if (s >= 90) return '优秀';
    if (s >= 75) return '良好';
    if (s >= 60) return '合格';
    if (s >= 40) return '不足';
    return '缺失';
  }
  function anchorOf(s) {
    if (s >= 90) return { t: '5 分锚点', c: 'a5' };
    if (s >= 60) return { t: '3 分锚点', c: 'a3' };
    return { t: '1 分锚点', c: 'a1' };
  }
  function vetoPassed(p) {
    return !['F1', 'F2'].some(function (c) {
      var e = p.ev[c];
      return e === 'X' || e === 'L1';
    });
  }
  function totalScore(p) {
    var t = 0;
    DATA.forEach(function (it) { t += scoreOf(it, p) * it.w; });
    return t / 100;
  }
  function dimScore(code, p) {
    var items = DATA.filter(function (x) { return x.dim === code; });
    var sum = 0, max = 0;
    items.forEach(function (it) { sum += scoreOf(it, p) * it.w; max += it.w * 100; });
    return max ? (sum / max * 100) : 0;
  }

  /* ---------- 状态 ---------- */
  var curProj = PROJ[0];
  var phase = 0;        /* 已推进到的阶段序号 */
  var view = 0;         /* 当前查看的阶段序号（可回看历史） */
  var follow = true;    /* 视图是否跟随评估推进 */
  var revealed = {};    /* 各阶段已显示到的指标数 */
  var running = false;
  var summarizing = false;  /* 汇总阶段加权中 */
  var timer = null;

  var sel = $('#edProj');
  sel.innerHTML = PROJ.map(function (p) {
    return '<option value="' + p.id + '">' + esc(p.name) + '（' + esc(p.unit) + '）</option>';
  }).join('');

  function renderMeta(p) {
    $('#edProjMeta').innerHTML =
      '<div class="ed-meta-i"><span>申报单位</span><b>' + esc(p.unit) + '</b></div>' +
      '<div class="ed-meta-i"><span>申报金额</span><b class="num">' + p.declared + ' <small>万元</small></b></div>' +
      '<div class="ed-meta-i"><span>核定价</span><b class="num">' + p.price + ' <small>万元</small></b></div>' +
      '<div class="ed-meta-i"><span>受理日期</span><b>' + esc(p.date) + '</b></div>';
  }

  /* ---------- 阶段条 ---------- */
  function renderPhases() {
    $('#edPhases').innerHTML = PHASES.map(function (ph, i) {
      var st = i < phase ? 'done' : (i === phase ? 'now' : 'wait');
      /* 正在推进的阶段加 live 标记 */
      var live = (i === phase && running) ? ' live' : '';
      /* 只有已完成的阶段才显示分数；汇总阶段总分最后才出 */
      var scVal = null;
      if (i < phase) scVal = ph.k === 'Z' ? totalScore(curProj) : dimScore(ph.k, curProj);
      else if (ph.k === 'Z' && phase >= PHASES.length - 1) scVal = totalScore(curProj);
      var sub = scVal == null ? '' : (ph.k === 'Z' ? scVal.toFixed(1) : scVal.toFixed(1) + ' 分');
      var gCls = scVal == null ? '' : ' ' + grade(scVal).c;
      return '<li class="ed-phase ' + st + live + '" data-i="' + i + '">' +
        '<span class="ed-phase-n num">' + (i + 1) + '</span>' +
        '<span class="ed-phase-b"><b>' + esc(ph.n) + '</b><small>' + esc(ph.o) + '</small></span>' +
        '<span class="ed-phase-s num' + gCls + '" data-v="' + i + '">' + sub + '</span>' +
        '</li>';
    }).join('');
    $$('#edPhases .ed-phase').forEach(function (li) {
      li.addEventListener('click', function () {
        var i = +li.dataset.i;
        if (i > phase) return;      /* 尚未推进到的阶段不可点 */
        /* 手动查看不中断评估；查看历史即固定，点回当前阶段恢复跟随 */
        follow = (i === phase);
        view = i;
        renderDesk();
      });
    });
  }

  /* ---------- 左侧导航 ---------- */
  function renderNav() {
    $('#edNav').innerHTML = PHASES.map(function (ph, i) {
      var st = i < phase ? 'done' : (i === phase ? 'on' : 'lock');
      if (i === view) st = i < phase ? 'done cur' : 'on';
      /* 正在推进的阶段加 live 标记，便于用户点回恢复自动跟随 */
      var live = (i === phase && running) ? ' live' : '';
      /* 未出分的阶段不显示分值；汇总阶段总分最后才出 */
      var sc = '—', gCls = '';
      if (i < phase) {
        var dv = ph.k === 'Z' ? totalScore(curProj) : dimScore(ph.k, curProj);
        sc = dv.toFixed(1);
        gCls = ' ' + grade(dv).c;
      } else if (ph.k === 'Z' && phase >= PHASES.length - 1) {
        var tv = totalScore(curProj);
        sc = tv.toFixed(1);
        gCls = ' ' + grade(tv).c;
      }
      /* 左侧以序号 1—6 标识，汇总阶段用 Σ */
      var code = ph.k === 'Z' ? 'Σ' : (i + 1);
      var nm = ph.k === 'Z' ? '汇总出分' : ph.n;
      var sub = ph.k === 'Z' ? '结论出具' : ph.o;
      return '<button class="ed-nav-i ' + st + live + '" data-i="' + i + '"' + (i > phase ? ' disabled' : '') + '>' +
        '<span class="ed-nav-code">' + code + '</span>' +
        '<span class="ed-nav-b"><b>' + esc(nm) + '</b><small>' + esc(sub) + '</small></span>' +
        '<span class="ed-nav-s num' + gCls + '">' + sc + '</span>' +
        '</button>';
    }).join('');
    $$('#edNav .ed-nav-i').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.i;
        if (i > phase) return;
        /* 手动查看不中断评估：仅切换视图，评估继续在后台推进。
           查看历史阶段即固定在该阶段；点回正在推进的阶段恢复跟随 */
        follow = (i === phase);
        view = i;
        renderDesk();
      });
    });
  }

  /* ---------- 右侧明细 ---------- */
  function renderPane() {
    var ph = PHASES[view];
    if (ph.k === 'Z') { renderFinal(summarizing); return; }
    var dm = C.dims.filter(function (x) { return x.code === ph.k; })[0];
    var items = DATA.filter(function (x) { return x.dim === ph.k; });
    var shown = revealed[ph.k] == null ? 0 : revealed[ph.k];
    /* 本阶段是否已全部出分：全部出分后才显示该维度得分与等级 */
    var full = shown >= items.length;
    var sc = dimScore(ph.k, curProj);
    var g = grade(sc);

    $('#edPaneH').innerHTML =
      '<div class="ed-pane-t">' +
        '<span class="ed-pane-code">' + dm.code + '</span>' +
        '<div><h3>' + esc(dm.full) + '</h3>' +
        '<p>' + esc(ph.o) + ' · ' + esc(ph.d) + '</p></div>' +
      '</div>' +
      '<div class="ed-pane-s">' +
        (full
          ? '<span class="num ' + g.c + '">' + sc.toFixed(1) + '</span>' +
            '<span class="ed-pane-g ' + g.c + '">' + g.t + '</span>'
          : '<span class="num pend">···</span>' +
            '<span class="ed-pane-pend">已出 ' + shown + ' / ' + items.length + '</span>') +
        '<small>权重 ' + dm.w + ' · ' + items.length + ' 项</small>' +
      '</div>';

    var html = items.map(function (it, idx) {
      var s = scoreOf(it, curProj);
      var ev = EV[curProj.ev[it.code]] || EV.L3;
      var an = anchorOf(s);
      var isVeto = (it.code === 'F1' || it.code === 'F2');
      var bad = (curProj.ev[it.code] === 'X');
      var aDesc = s >= 90 ? it.a5 : (s >= 60 ? it.a3 : it.a1);
      var subs = SUB[it.code] || [];
      var n = subs.length || 1;
      var a = curProj.preset[it.code] || 3;
      var hit = a === 5 ? n : (a === 3 ? Math.ceil(n / 2) : 0);
      var subHtml = subs.length
        ? '<div class="ed-sub-list">' + subs.map(function (sb, si) {
            var ok = si < hit;
            return '<span class="ed-sub-i' + (ok ? ' ok' : '') + '"><i aria-hidden="true">' + (ok ? '✓' : '—') + '</i>' + esc(sb) + '</span>';
          }).join('') + '</div>'
        : '';
      /* 只有已出分的项才显示分值、锚点与依据；未出分项仅占位 */
      var on = idx < shown;
      var body = on
        ? '<div class="ed-item-basis"><span class="ed-basis-l">判档依据</span><p>' + esc(aDesc) + '</p></div>' +
          (subHtml ? '<div class="ed-item-subs">' + subHtml + '</div>' : '') +
          '<div class="ed-item-foot">' +
            '<span class="ed-ev-tag ' + (curProj.ev[it.code] === 'L4' ? 'l4' : (curProj.ev[it.code] === 'L3' ? 'l3' : (curProj.ev[it.code] === 'L2' ? 'l2' : 'l1'))) + '">' + esc(ev.t) + '</span>' +
            '<span class="ed-ev-desc">' + esc(ev.d) + '</span>' +
            (isVeto ? '<span class="ed-veto-tag">一票否决前置 · 不进入插值</span>' : '') +
          '</div>'
        : '<div class="ed-item-pending">等待系统判档…</div>';
      return '<div class="ed-item' + (on ? ' show' : '') + '" style="--d:' + (idx * .09).toFixed(2) + 's">' +
        '<div class="ed-item-h">' +
          '<span class="ed-item-c mono">' + it.code + '</span>' +
          '<span class="ed-item-n">' + esc(it.name) + '</span>' +
          '<span class="ed-item-w">权重 ' + it.w + '</span>' +
          (on ? '<span class="ed-item-a ' + an.c + '">' + an.t + '</span>' +
                '<span class="ed-item-s num ' + (bad ? 'zero ' : '') + grade(s).c + '">' + s + '</span>' : '') +
        '</div>' +
        body +
      '</div>';
    }).join('');
    $('#edPaneB').innerHTML = html;
    /* 新项出现时把最新一条滚入视野，内容超出则区域内上滑 */
    if (shown > 0) {
      var box = $('#edPaneB');
      var vis = box.querySelectorAll('.ed-item.show');
      var last = vis[vis.length - 1];
      if (last && box.scrollHeight > box.clientHeight) {
        requestAnimationFrame(function () {
          var want = last.offsetTop + last.offsetHeight - box.clientHeight;
          if (want > box.scrollTop) box.scrollTo({ top: want, behavior: 'smooth' });
        });
      }
    }
  }

  /* ---------- 汇总 ---------- */
  function renderFinal(pending) {
    var p = curProj;
    var sc = totalScore(p);
    var g = grade(sc);
    var calc = [];
    DATA.forEach(function (it) {
      var s = scoreOf(it, p);
      calc.push({ c: it.code, n: it.name, s: s, w: it.w, part: s * it.w / 100 });
    });
    var worst = calc.slice().sort(function (a, b) { return (a.s - b.s) * (b.w - a.w); }).slice(0, 3);

    if (pending) {
      /* 加权汇总中：总分暂不呈现 */
      $('#edPaneH').innerHTML =
        '<div class="ed-pane-t"><span class="ed-pane-code">Z</span>' +
        '<div><h3>汇总出分</h3><p>结论出具 · 加权汇总、等级判定与结论生成</p></div></div>' +
        '<div class="ed-pane-s"><span class="num pend">···</span>' +
        '<span class="ed-pane-pend">加权汇总中</span></div>';
      $('#edPaneB').innerHTML = '<div class="ed-final-pending">' +
        '<span class="ed-fp-ico"></span>' +
        '<p>正在汇总 ' + TOTAL_ITEMS + ' 项指标得分与权重，生成综合得分与等级…</p></div>';
      return;
    }

    /* 汇总阶段：总分在此才最终呈现 */
    $('#edPaneH').innerHTML =
      '<div class="ed-pane-t"><span class="ed-pane-code">Z</span>' +
      '<div><h3>汇总出分</h3><p>结论出具 · 加权汇总、等级判定与结论生成</p></div></div>' +
      '<div class="ed-pane-s"><span class="num ' + g.c + '">' + sc.toFixed(1) + '</span>' +
      '<span class="ed-pane-g ' + g.c + '">' + g.t + '</span>' +
      '<small>' + TOTAL_ITEMS + ' 项指标加权</small></div>';
    $('#edPaneB').innerHTML =
      '<div class="ed-final">' +
        '<div class="ed-final-main">' +
          '<span class="ed-final-l">综合得分（' + TOTAL_ITEMS + ' 项指标加权汇总）</span>' +
          '<span class="ed-final-band">' + band(sc) + '</span>' +
        '</div>' +
        '<div class="ed-final-side">' +
          '<div class="ed-final-i"><span>评估结论</span><b>' + esc(p.verdict) + '</b></div>' +
          '<div class="ed-final-i"><span>申报金额</span><b class="num">' + p.declared + ' 万元</b></div>' +
          '<div class="ed-final-i"><span>核定价</span><b class="num">' + p.price + ' 万元</b></div>' +
          '<div class="ed-final-i"><span>核减率</span><b class="num">' + ((p.declared - p.price) / p.declared * 100).toFixed(1) + '%</b></div>' +
          '<div class="ed-final-i"><span>一票否决</span><b>' + (vetoPassed(p) ? '未触发' : '已触发') + '</b></div>' +
        '</div>' +
        '<div class="ed-final-dims">' + C.dims.map(function (dm) {
          var v = dimScore(dm.code, p);
          return '<div class="ed-fd"><span class="mono">' + dm.code + '</span>' +
            '<span>' + esc(dm.name) + '</span>' +
            '<div class="ed-fd-bar"><i style="width:' + v.toFixed(1) + '%"></i></div>' +
            '<span class="num ' + grade(v).c + '">' + v.toFixed(1) + '</span></div>';
        }).join('') + '</div>' +
        (worst.length ? '<div class="ed-final-worst"><h5>关键扣分项（按权重 × 失分排序）</h5><ul>' +
          worst.map(function (w) {
            var it = DATA.filter(function (x) { return x.code === w.c; })[0];
            return '<li><span class="mono">' + w.c + '</span> ' + esc(w.n) +
              ' <b class="num">' + w.s + '</b> 分 / 权重 ' + w.w +
              '<span class="ed-fw-d">' + esc(w.s >= 90 ? it.a5 : (w.s >= 60 ? it.a3 : it.a1)) + '</span></li>';
          }).join('') + '</ul></div>' : '') +
        '<p class="ed-final-note">所有得分均挂接证据编号，评估过程输入数据、参数版本与中间计算结果完整留痕，可逐项回溯到原始材料。</p>' +
      '</div>';
  }

  /* ---------- 一票否决（右侧常驻） ---------- */
  function renderVeto() {
    var p = curProj;
    $('#edVeto').innerHTML = DATA.filter(function (x) { return x.code === 'F1' || x.code === 'F2'; }).map(function (it) {
      var ev = p.ev[it.code];
      var bad = (ev === 'X' || ev === 'L1');
      return '<div class="ed-veto' + (bad ? ' bad' : '') + '">' +
        '<span class="ed-vc">' + it.code + '</span>' +
        '<span>' + esc(it.name) + '</span>' +
        '<span class="ed-vres">' + (bad ? '门槛未过' : '已过门槛') + '</span></div>';
    }).join('');
  }

  /* ---------- 进度 ---------- */
  var shownPct = 0, targetPct = 0;
  /* 真实进度：由 phase 与当前阶段已出分项数推算，避免不同入口算出不同的百分比 */
  function realPct() {
    var ph = PHASES[phase];
    if (phase >= PHASES.length - 1) return 100;
    var items = ph.k === 'Z' ? [] : DATA.filter(function (x) { return x.dim === ph.k; });
    var shown = items.length ? (revealed[ph.k] == null ? 0 : revealed[ph.k]) : 0;
    var base = (phase / (PHASES.length - 1)) * 100;
    var step = (80 / (PHASES.length - 1)) * (items.length ? shown / items.length : 1);
    return base + step;
  }
  /* 进度数字直接跟随目标值；条宽由 CSS transition 做平滑，避免依赖 rAF 被节流 */
  function setProgress(pct, text) {
    pct = Math.max(0, Math.min(100, pct));
    targetPct = pct;
    shownPct = pct;
    $('#edProgPct').textContent = Math.round(pct) + '%';
    $('#edProgBar').style.width = pct + '%';
    if (text != null) {
      var sp = $('#edProgStep');
      sp.style.opacity = '0';
      setTimeout(function () { sp.textContent = text; sp.style.opacity = '1'; }, 160);
    }
  }

  function renderDesk() {
    renderPhases();
    renderNav();
    renderPane();
    var pct = realPct();
    /* 进度条反映真实评估进度：视图跟随时标签取当前查看阶段，
       手动查看其他阶段时标签仍显示正在推进的阶段 */
    var lbl = follow ? view : phase;
    setProgress(pct, PHASES[lbl].o + ' · ' + PHASES[lbl].n);
  }

  /* ---------- 自动推进 ---------- */
  function stopAuto() {
    if (timer) { clearTimeout(timer); timer = null; }
    running = false;
    $('#edRunT').textContent = '开始评估';
    $('#edRun').classList.remove('running');
  }

  function advance() {
    if (!running) return;
    var ph = PHASES[phase];
    /* 汇总阶段：先显示"加权汇总中"，延迟后呈现总分 */
    if (ph.k === 'Z') {
      if (!summarizing) {
        summarizing = true;
        /* 汇总阶段呈现汇总视图 */
        view = phase;
        renderPhases();
        renderNav();
        renderPane();
        setProgress(96, '结论出具 · 加权汇总中');
        timer = setTimeout(function () {
          summarizing = false;
          running = false;
          $('#edRunT').textContent = '评估完成';
          $('#edRun').classList.remove('running');
          $('#edRun').classList.add('done');
          $('#edReset').hidden = false;
          setProgress(100, '评估完成 · 结论已出具');
          renderPhases();
          renderNav();
          renderPane();
        }, 1100);
        return;
      }
      return;
    }
    var items = DATA.filter(function (x) { return x.dim === ph.k; });
    var shown = (revealed[ph.k] == null ? 0 : revealed[ph.k]);
    if (shown < items.length) {
      revealed[ph.k] = shown + 1;
      /* 用户手动查看其他阶段时，评估继续推进但不改变视图 */
      if (follow) { view = phase; renderPane(); }
      else renderNav();
      /* 进度：阶段内推进占 80%，阶段间占 20% */
      /* 标签始终显示评估正在推进的阶段 */
      setProgress(realPct(), PHASES[phase].o + ' · ' + PHASES[phase].n);
      timer = setTimeout(advance, 560);
      return;
    }
    /* 本阶段完成，进入下一阶段 */
    if (phase < PHASES.length - 1) {
      phase++;
      /* 视图跟随时才切换；否则保持用户正在查看的阶段 */
      if (follow) view = phase;
      /* 汇总阶段由 advance 单独渲染（先显示加权中） */
      if (PHASES[phase].k !== 'Z') { if (follow) renderDesk(); else { renderPhases(); renderNav(); } }
      /* 进度推进到新阶段起点，标签显示正在推进的阶段 */
      setProgress(realPct(), PHASES[phase].o + ' · ' + PHASES[phase].n);
      timer = setTimeout(advance, 700);
      return;
    }
    /* 全部完成 */
    running = false;
    $('#edRunT').textContent = '评估完成';
    $('#edRun').classList.remove('running');
    $('#edRun').classList.add('done');
    $('#edReset').hidden = false;
    setProgress(100, '评估完成 · 结论已出具');
    renderPhases();
    renderNav();
  }
  function start() {
    phase = 0;
    view = 0;
    follow = true;
    revealed = {};
    running = true;
    $('#edProg').hidden = false;
    $('#edDesk').hidden = false;
    $('#edFinal').hidden = true;
    $('#edReset').hidden = true;
    $('#edRun').classList.add('running');
    $('#edRun').classList.remove('done');
    $('#edRunT').textContent = '评估中…';
    shownPct = 0; targetPct = 0;
    $('#edProgPct').textContent = '0%';
    $('#edProgBar').style.width = '0%';
    setProgress(0, '启动评估');
    renderDesk();
    timer = setTimeout(advance, 380);
  }

  /* ---------- 事件 ---------- */
  $('#edRun').addEventListener('click', function () {
    if (running) { stopAuto(); $('#edRunT').textContent = '继续评估'; return; }
    start();
  });
  $('#edReset').addEventListener('click', function () {
    stopAuto();
    $('#edRun').classList.remove('done');
    $('#edRunT').textContent = '开始评估';
    phase = 0; view = 0; follow = true; revealed = {}; summarizing = false;
    shownPct = 0; targetPct = 0;
    $('#edProgPct').textContent = '0%';
    $('#edProgBar').style.width = '0%';
    setProgress(0, '等待启动');
    renderDesk();
  });
  sel.addEventListener('change', function () {
    var p = PROJ.filter(function (x) { return x.id === sel.value; })[0];
    if (!p) return;
    stopAuto();
    curProj = p;
    renderMeta(p);
    renderVeto();
    $('#edRun').classList.remove('done');
    $('#edRunT').textContent = '开始评估';
    $('#edReset').hidden = true;
    phase = 0; view = 0; follow = true; revealed = {}; summarizing = false;
    shownPct = 0; targetPct = 0;
    $('#edProgPct').textContent = '0%';
    $('#edProgBar').style.width = '0%';
    setProgress(0, '等待启动');
    renderDesk();
  });

  /* ---------- 初始化 ---------- */
  renderMeta(curProj);
  renderVeto();
  renderPhases();
  renderNav();
  renderPane();
  setProgress(0, '等待启动');
})();
