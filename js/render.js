/* ==========================================================================
   RENDER ENGINE
   You should not normally need to edit this file. It turns each object in
   QUESTIONS (from data.js) into a card, and wires up all the interactive
   bits: accordion open/close, Mermaid diagrams, copy buttons, MCQs,
   flashcards, glossary tooltips, and the mobile sidebar drawer.
   ========================================================================== */

const container = document.getElementById('qcontainer');
const rack = document.getElementById('rackList');

function renderCmd(c){
  return `<div class="cmd-block">
    <div class="cmd-head"><code>${c.cmd}</code><button class="copy-btn" onclick="copyCmd(this)" data-copy="${c.cmd.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/"/g,'&quot;')}">copy</button></div>
    <div class="cmd-body">
      <dl>
        <dt>Purpose</dt><dd>${c.purpose}</dd>
        <dt>Syntax</dt><dd><code>${c.syntax}</code></dd>
        <dt>Args/Flags</dt><dd>${c.args}</dd>
        <dt>Example</dt><dd><code>${c.examples}</code></dd>
        <dt>Output</dt><dd><code>${c.output}</code></dd>
        <dt>Common mistake</dt><dd>${c.mistakes}</dd>
        <dt>Related</dt><dd>${c.related}</dd>
      </dl>
    </div>
  </div>`;
}

function renderQuestion(q){
  // Mermaid: store the RAW code in a data attribute and render it lazily
  // (only once the card is actually opened) — this is what fixes the
  // "translate(undefined, NaN)" crash: Mermaid can't measure a diagram
  // sitting inside a display:none element.
  const mermaidBlock = q.visual
    ? `<div class="mermaid-wrap"><div class="mermaid" data-rendered="false" data-code="${encodeURIComponent(q.visual.code)}"><span class="mermaid-loading">diagram will render when you open this card…</span></div></div>`
    : `<p style="color:var(--text-faint); font-size:13.5px;">No standalone diagram needed — this is a direct factual/personal-experience answer.</p>`;

  const cmdBlock = q.commands.length
    ? q.commands.map(renderCmd).join('')
    : `<p style="color:var(--text-faint); font-size:13.5px;">No specific commands are introduced in this question.</p>`;

  const termBlock = q.terminal
    ? `<div class="term">${q.terminal}</div>`
    : `<p style="color:var(--text-faint); font-size:13.5px;">No terminal output applicable for this question.</p>`;

  const troubleBlock = q.trouble ? `<div class="trouble-flow">
      <div class="trouble-step"><span class="tag">PROBLEM</span>${q.trouble.problem}</div>
      <div class="trouble-arrow">↓</div>
      <div class="trouble-step"><span class="tag">REASON</span>${q.trouble.reason}</div>
      <div class="trouble-arrow">↓</div>
      <div class="trouble-step"><span class="tag">SOLUTION</span>${q.trouble.solution}</div>
    </div>` : `<p style="color:var(--text-faint); font-size:13.5px;">No common failure mode specifically documented for this topic.</p>`;

  return `
  <article class="qcard" id="q${q.num}">
    <div class="qcard-head" onclick="toggleCard(this)">
      <span class="traffic"><span class="r"></span><span class="a"></span><span class="g"></span></span>
      <span class="prompt">student@linux-lab:~$ <b>open</b></span>
      <span class="qcard-title">Q${q.num}. ${q.q}</span>
      <span class="chevron">▶</span>
    </div>
    <div class="qcard-body">

      <div class="sec"><div class="sec-label"><span class="sec-num">1</span><h3>Original Question</h3></div>
        <div class="sec-content"><div class="original-box">${q.q}</div></div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">2</span><h3>Original Answer (verbatim)</h3></div>
        <div class="sec-content"><div class="original-box">${q.original}</div></div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">3</span><h3>Beginner Explanation</h3></div>
        <div class="sec-content">${q.beginner}</div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">4</span><h3>Why It Exists</h3></div>
        <div class="sec-content">${q.why}</div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">5</span><h3>Real World Scenario</h3></div>
        <div class="sec-content">${q.real}</div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">6</span><h3>Interview Answer</h3></div>
        <div class="sec-content"><div class="interview-box">${q.interview}</div></div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">7</span><h3>Visual Explanation</h3></div>
        <div class="sec-content">${mermaidBlock}</div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">8</span><h3>Command Breakdown</h3></div>
        <div class="sec-content">${cmdBlock}</div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">9</span><h3>Real Terminal Output</h3></div>
        <div class="sec-content">${termBlock}</div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">10</span><h3>Mini Lab</h3></div>
        <div class="sec-content"><div class="lab-box">${q.lab}</div></div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">11</span><h3>Common Mistakes</h3></div>
        <div class="sec-content"><div class="mistake-box">${q.mistakes}</div></div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">12</span><h3>Troubleshooting</h3></div>
        <div class="sec-content">${troubleBlock}</div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">13</span><h3>Memory Trick</h3></div>
        <div class="sec-content"><div class="memory-trick"><span class="icon">💡</span><span>${q.memory}</span></div></div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">14</span><h3>Flashcard</h3></div>
        <div class="sec-content">
          <div class="flip-card" onclick="this.classList.toggle('flipped')">
            <div class="flip-inner">
              <div class="flip-front">${q.flashcard.q}</div>
              <div class="flip-back">${q.flashcard.a}</div>
            </div>
          </div>
          <div class="flip-hint">tap card to flip</div>
        </div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">15</span><h3>MCQ</h3></div>
        <div class="sec-content">
          <div class="mcq-box">
            <p style="margin:0 0 10px; font-weight:600;">${q.mcq.q}</p>
            ${q.mcq.options.map((opt,i)=>`<button class="mcq-opt" onclick="answerMcq(this, ${i===q.mcq.answer}, '${q.num}')">${opt}</button>`).join('')}
            <div class="mcq-explain" id="mcqexp-${q.num}">${q.mcq.explain}</div>
          </div>
        </div></div>

      <div class="sec"><div class="sec-label"><span class="sec-num">16</span><h3>Summary</h3></div>
        <div class="sec-content"><ul class="summary-grid">${q.summary.map(s=>`<li>${s}</li>`).join('')}</ul></div></div>

    </div>
  </article>`;
}

/* ---------------- Mermaid: lazy render on open ---------------- */
async function renderMermaidIn(cardEl){
  if(!window.mermaid || !cardEl) return;
  const nodes = cardEl.querySelectorAll('.mermaid[data-rendered="false"]');
  for(const node of nodes){
    const code = decodeURIComponent(node.getAttribute('data-code') || '');
    if(!code) continue;
    try{
      const id = 'mmd-' + Math.random().toString(36).slice(2, 10);
      const { svg } = await window.mermaid.render(id, code);
      node.innerHTML = svg;
      node.setAttribute('data-rendered', 'true');
    }catch(err){
      node.innerHTML = '<p style="color:var(--danger); font-size:12px;">Diagram failed to render. Check the browser console for details.</p>';
      node.setAttribute('data-rendered', 'error');
      console.error('Mermaid render error:', err);
    }
  }
}

function reRenderOpenMermaidDiagrams(){
  // Called after a theme switch, so already-drawn diagrams pick up new colors.
  document.querySelectorAll('.qcard.open .mermaid').forEach(node=>{
    node.setAttribute('data-rendered', 'false');
    node.setAttribute('data-code', node.getAttribute('data-code'));
  });
  document.querySelectorAll('.qcard.open').forEach(renderMermaidIn);
}

/* ---------------- Card open/close ---------------- */
function toggleCard(headEl){
  const card = headEl.parentElement;
  card.classList.toggle('open');
  if(card.classList.contains('open')){
    renderMermaidIn(card);
  }
}

function jumpTo(num){
  const card = document.getElementById('q'+num);
  card.classList.add('open');
  renderMermaidIn(card);
  card.scrollIntoView({behavior:'smooth', block:'start'});
  document.querySelectorAll('.rack-unit').forEach(r=>r.classList.remove('active'));
  document.getElementById('rack'+num).classList.add('active');
  closeSidebarOnMobile();
}

/* ---------------- Copy buttons ---------------- */
function copyCmd(btn){
  navigator.clipboard.writeText(btn.dataset.copy).then(()=>{
    const orig = btn.textContent;
    btn.textContent = 'copied ✓';
    setTimeout(()=>btn.textContent = orig, 1200);
  });
}

/* ---------------- MCQ ---------------- */
function answerMcq(btn, isCorrect, num){
  const box = btn.parentElement;
  const opts = [...box.querySelectorAll('.mcq-opt')];
  opts.forEach(o=>o.style.pointerEvents='none');
  btn.classList.add(isCorrect ? 'correct' : 'wrong');
  document.getElementById('mcqexp-'+num).classList.add('show');
  const qObj = QUESTIONS.find(q=>q.num===num);
  opts[qObj.mcq.answer].classList.add('correct');
}

/* ---------------- Expand all / theme / print ---------------- */
let expanded = false;
function currentMermaidTheme(){
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  return isLight ? 'default' : 'dark';
}
function applyMermaidTheme(){
  if(!window.mermaid) return;
  window.mermaid.initialize({
    startOnLoad:false,
    theme: currentMermaidTheme(),
    securityLevel:'loose',
    themeVariables:{ fontFamily:'JetBrains Mono, monospace' }
  });
}
function setBtnLabel(btn, text){
  const label = btn.querySelector('.label');
  if(label) label.textContent = text; else btn.textContent = text;
}

function initTopbarControls(){
  const expandBtn = document.getElementById('expandAllBtn');
  expandBtn.addEventListener('click', ()=>{
    expanded = !expanded;
    document.querySelectorAll('.qcard').forEach(c=>{
      c.classList.toggle('open', expanded);
      if(expanded) renderMermaidIn(c);
    });
    setBtnLabel(expandBtn, expanded ? 'collapse --all' : 'expand --all');
  });

  const themeBtn = document.getElementById('themeToggle');
  themeBtn.addEventListener('click', ()=>{
    const html = document.documentElement;
    const isLight = html.getAttribute('data-theme') === 'light';
    html.setAttribute('data-theme', isLight ? 'dark' : 'light');
    setBtnLabel(themeBtn, isLight ? 'theme --light' : 'theme --dark');
    applyMermaidTheme();
    reRenderOpenMermaidDiagrams();
  });
}

/* ---------------- Mobile sidebar drawer ---------------- */
function initMobileDrawer(){
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const menuBtn = document.getElementById('menuToggle');
  if(!sidebar || !menuBtn) return;

  function open(){ sidebar.classList.add('open'); backdrop.classList.add('open'); }
  function close(){ sidebar.classList.remove('open'); backdrop.classList.remove('open'); }

  menuBtn.addEventListener('click', ()=>{
    sidebar.classList.contains('open') ? close() : open();
  });
  backdrop.addEventListener('click', close);
  window.closeSidebarOnMobile = close;
}
function closeSidebarOnMobile(){
  if(typeof window.closeSidebarOnMobile === 'function') window.closeSidebarOnMobile();
}

/* ---------------- Glossary tooltips (Tippy.js) ---------------- */
function wrapFirstOccurrence(root, term, definition){
  const re = new RegExp('\\b(' + term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')\\b', 'i');
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      const p = node.parentElement;
      if(!p) return NodeFilter.FILTER_REJECT;
      if(p.closest('.mermaid-wrap, .term, code, pre, .cmd-block, .tip-term, .qcard-head')) return NodeFilter.FILTER_REJECT;
      return re.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  const node = walker.nextNode();
  if(!node) return false;
  const match = re.exec(node.nodeValue);
  const before = node.nodeValue.slice(0, match.index);
  const matched = match[0];
  const after = node.nodeValue.slice(match.index + matched.length);
  const span = document.createElement('span');
  span.className = 'tip-term';
  span.textContent = matched;
  span.setAttribute('data-tippy-content', definition);
  const parent = node.parentNode;
  parent.insertBefore(document.createTextNode(before), node);
  parent.insertBefore(span, node);
  parent.insertBefore(document.createTextNode(after), node);
  parent.removeChild(node);
  return true;
}

function applyGlossaryTooltips(){
  if(typeof GLOSSARY === 'undefined') return;
  document.querySelectorAll('.qcard').forEach(card=>{
    Object.entries(GLOSSARY).forEach(([term, def])=>{
      wrapFirstOccurrence(card, term, def);
    });
  });
  if(window.tippy){
    window.tippy('.tip-term', {
      theme: 'linuxlab',
      delay: [150, 0],
      maxWidth: 260,
      placement: 'top'
    });
  }
}

/* ---------------- Boot ---------------- */
function boot(){
  container.innerHTML = QUESTIONS.map(renderQuestion).join('');
  rack.innerHTML = QUESTIONS.map(q =>
    `<div class="rack-unit" onclick="jumpTo('${q.num}')" id="rack${q.num}"><span class="u-tag">U${q.num}</span><span>${q.q.length>34 ? q.q.slice(0,34)+'…' : q.q}</span></div>`
  ).join('');

  initTopbarControls();
  initMobileDrawer();
  applyGlossaryTooltips();
  applyMermaidTheme();

  // Open the first card by default and render its diagram.
  const first = document.getElementById('q01');
  if(first){
    first.classList.add('open');
    renderMermaidIn(first);
  }
}

function startBoot(){
  if(window.mermaid){
    boot();
  }else{
    window.addEventListener('mermaid-ready', boot, { once:true });
  }
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', startBoot);
}else{
  startBoot();
}