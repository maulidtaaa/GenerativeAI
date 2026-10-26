(() => {
  'use strict';
  const modules = window.LEARNING_MODULES || [];
  const STORAGE_KEY = 'generativeAI.learning.v1';
  const THEME_KEY = 'generativeAI.theme.v1';
  const PROJECT_KEY = 'generativeAI.projectChecklist.v1';
  const planetData = [
    {name:'Merkurius',className:'mercury',label:'Modul 1',desc:'Konsep dasar'}, {name:'Venus',className:'venus',label:'Modul 2',desc:'Rancang solusi'},
    {name:'Bumi',className:'earth',label:'Modul 3',desc:'Kembangkan media'}, {name:'Mars',className:'mars',label:'Modul 4',desc:'Implementasi'},
    {name:'Jupiter',className:'jupiter',label:'Modul 5',desc:'Evaluasi media'}, {name:'Saturnus',className:'saturn',label:'Modul 6',desc:'Personalisasi'},
    {name:'Uranus',className:'uranus',label:'Eksplorasi',desc:'Glosarium dan prompt'}, {name:'Neptunus',className:'neptune',label:'Project akhir',desc:'Terapkan hasil belajar'}
  ];
  const projectItems = [
    'Judul media pembelajaran yang jelas dan sesuai isi.', 'Topik atau kompetensi yang diajarkan.', 'Target pengguna dan kebutuhan belajarnya.',
    'Tujuan pembelajaran yang diharapkan setelah menggunakan media.', 'Bentuk media yang dikembangkan, misalnya modul web, kuis, infografik, atau video.',
    'Nama alat Generative AI dan tugas spesifik yang dibantu AI.', 'Tautan, berkas, atau demonstrasi produk yang bisa diperiksa.',
    'Penjelasan cara menggunakan produk dan proses pembuatannya.'
  ];
  let state = loadProgress();
  let currentModuleId = null;
  let quizSelections = {};
  let toastTimer;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  function loadProgress() {
    try { const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); return {completed:Array.isArray(value.completed)?value.completed.filter(Number.isInteger):[], scores:value.scores && typeof value.scores === 'object'?value.scores:{}, lastOpened:Number.isInteger(value.lastOpened)?value.lastOpened:null}; }
    catch { return {completed:[],scores:{},lastOpened:null}; }
  }
  function saveProgress() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { showToast('Progres hanya tersimpan sementara di sesi ini.'); } }
  function escapeHTML(value) { return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
  function showToast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2800); }
  window.showToast = showToast;
  function progressPercent() { return Math.round(state.completed.length / modules.length * 100) || 0; }
  function updateProgressUI() {
    const done = state.completed.length, percent = progressPercent();
    $('#progressText').textContent = `${done} dari ${modules.length} modul selesai`;
    $('#progressBar').style.width = `${percent}%`;
    $('#heroProgress').textContent = `${percent}%`;
    $$('.module-card').forEach(card => {
      const id = Number(card.dataset.id), isDone = state.completed.includes(id);
      const status = $('.module-status', card); if (status) { status.textContent = isDone ? '✓ Selesai' : state.scores[id] !== undefined ? 'Sudah dipelajari' : 'Belum dimulai'; status.classList.toggle('done', isDone); }
    });
    renderPlanetMap();
  }
  function renderPlanetMap() {
    $('#planetMap').innerHTML = planetData.map((p, index) => {
      const mod = modules[index]; const done = mod && state.completed.includes(mod.id);
      const action = mod ? `openModule(${mod.id})` : p.name === 'Neptunus' ? "location.hash='project'" : "showToast('Area eksplorasi tambahan: glosarium dan contoh prompt akan menjadi ruang belajar mandiri.')";
      return `<button class="planet-stop ${p.className}" type="button" onclick="${action}" aria-label="${escapeHTML(p.name)}: ${escapeHTML(p.desc)}"><span class="planet-dot ${p.className}"></span><span class="planet-label"><b>${escapeHTML(p.name)}</b><small>${escapeHTML(p.label)}${done?' · Selesai':''}</small></span></button>`;
    }).join('');
  }
  function renderModules() {
    const query = $('#moduleSearch').value.trim().toLowerCase(), filter = $('#statusFilter').value;
    const filtered = modules.filter(m => {
      const done = state.completed.includes(m.id), matchesStatus = filter === 'all' || (filter === 'completed' && done) || (filter === 'not-started' && !done);
      const searchable = `${m.title} ${m.summary} ${m.keywords} ${m.planet}`.toLowerCase(); return matchesStatus && searchable.includes(query);
    });
    $('#moduleGrid').innerHTML = filtered.map(m => `<article class="module-card" data-id="${m.id}"><div class="module-card-top"><span class="planet-mini ${m.className}">${m.symbol}</span><span class="module-status ${state.completed.includes(m.id)?'done':''}">${state.completed.includes(m.id)?'✓ Selesai':state.scores[m.id]!==undefined?'Sudah dipelajari':'Belum dimulai'}</span></div><p class="module-kicker">MODUL 0${m.id} · ${escapeHTML(m.planet.toUpperCase())}</p><h3>${escapeHTML(m.title)}</h3><p class="module-summary">${escapeHTML(m.summary)}</p><div class="module-card-bottom"><span>◷ ${m.minutes} menit</span><button class="button small secondary" type="button" onclick="openModule(${m.id})">Pelajari <span aria-hidden="true">↗</span></button></div></article>`).join('');
    $('#emptyState').hidden = filtered.length !== 0;
  }
  function renderLesson(id) {
    const m = modules.find(item => item.id === id); if (!m) return;
    currentModuleId = id; state.lastOpened = id; saveProgress(); quizSelections = {};
    const content = $('#lessonContent');
    content.innerHTML = `<div class="lesson-top"><a class="back-link" href="#modules">← Kembali ke semua modul</a><span class="module-kicker">MODUL 0${m.id} · PLANET ${escapeHTML(m.planet.toUpperCase())}</span></div><div class="lesson-hero"><div><p class="eyebrow">ESTIMASI ${m.minutes} MENIT</p><h2>${escapeHTML(m.title)}</h2><p>${escapeHTML(m.summary)}</p></div><span class="lesson-planet ${m.className}">${m.symbol}</span></div><div class="lesson-layout"><aside class="lesson-toc"><h3>Di modul ini</h3><a href="#lesson-objectives">Tujuan belajar</a>${m.sections.map((s,i)=>`<a href="#lesson-part-${i}">${escapeHTML(s.title)}</a>`).join('')}<a href="#lesson-example">Contoh prompt</a><a href="#lesson-activity">Aktivitas</a><a href="#lesson-quiz">Evaluasi</a></aside><article class="lesson-body"><section id="lesson-objectives" class="content-block"><p class="eyebrow">TUJUAN PEMBELAJARAN</p><ul>${m.objectives.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></section>${m.sections.map((s,i)=>`<section id="lesson-part-${i}" class="content-block"><h3>${escapeHTML(s.title)}</h3><p>${escapeHTML(s.body)}</p></section>`).join('')}<section id="lesson-example" class="content-block"><h3>Contoh penerapan</h3><p>Contoh prompt yang dapat kamu adaptasi:</p><div class="prompt-box"><span class="prompt-label">CONTOH PROMPT</span><p>${escapeHTML(m.example)}</p><button class="text-button" type="button" onclick="copyPrompt(${m.id})">Salin contoh prompt</button></div></section><section id="lesson-activity" class="content-block activity-box"><p class="eyebrow">COBA SEKARANG</p><h3>Aktivitas dan refleksi</h3><p>${escapeHTML(m.activity)}</p><label class="reflection-label" for="reflection-${m.id}">Catatan refleksi (tersimpan di halaman ini selama dibuka)</label><textarea id="reflection-${m.id}" rows="3" placeholder="Tuliskan hasil pengamatanmu..."></textarea></section><section class="content-block summary-box"><h3>Rangkuman modul</h3><ul>${m.summary.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></section><section id="lesson-quiz" class="content-block quiz-box"><div class="quiz-heading"><div><p class="eyebrow">UJI PEMAHAMAN</p><h3>Evaluasi singkat</h3></div><span>3 pertanyaan</span></div><form id="quizForm" onsubmit="submitQuiz(event, ${m.id})">${m.quiz.map((q,i)=>`<fieldset class="quiz-question"><legend><span>0${i+1}</span>${escapeHTML(q.q)}</legend>${q.options.map((opt,j)=>`<label class="quiz-option"><input type="radio" name="q${i}" value="${j}"><span>${escapeHTML(opt)}</span></label>`).join('')}<div class="quiz-feedback" id="feedback-${i}" hidden></div></fieldset>`).join('')}<button class="button primary" type="submit">Periksa jawaban</button></form><div id="quizResult" class="quiz-result" hidden></div></section><div class="lesson-navigation"><button class="button secondary" type="button" ${id===1?'disabled':''} onclick="openModule(${id-1})">← Modul sebelumnya</button><button id="completeModule" class="button primary" type="button" onclick="completeModule(${id})">Tandai selesai ✓</button><button class="button secondary" type="button" ${id===6?'disabled':''} onclick="openModule(${id+1})">Modul berikutnya →</button></div></article></div>`;
    $('#completeModule').textContent = state.completed.includes(id) ? '✓ Modul selesai' : 'Tandai selesai ✓';
    $('#lesson').hidden = false; $('#lesson').scrollIntoView({behavior: reducedMotion()?'auto':'smooth',block:'start'});
  }
  function reducedMotion(){ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  window.openModule = id => { renderLesson(Number(id)); location.hash = 'lesson'; $$('#mainNav a').forEach(a=>a.classList.toggle('active',a.dataset.nav==='modules')); $('#mainNav').classList.remove('open'); $('#menuToggle').setAttribute('aria-expanded','false'); };
  window.copyPrompt = id => { const m=modules.find(x=>x.id===Number(id)); if(!m)return; if(navigator.clipboard && navigator.clipboard.writeText){navigator.clipboard.writeText(m.example).then(()=>showToast('Contoh prompt berhasil disalin.')).catch(()=>fallbackCopy(m.example));} else fallbackCopy(m.example); };
  function fallbackCopy(text){const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();try{document.execCommand('copy');showToast('Contoh prompt disalin.');}catch{showToast('Salin prompt secara manual dari kotak contoh.');}area.remove();}
  window.submitQuiz = (event,id) => {
    event.preventDefault(); const m=modules.find(x=>x.id===Number(id)); let unanswered=[];
    m.quiz.forEach((q,i)=>{const chosen=$(`input[name="q${i}"]:checked`,event.target); if(!chosen)unanswered.push(i);});
    if(unanswered.length){showToast(`Jawab semua pertanyaan terlebih dahulu. Belum dijawab: ${unanswered.map(x=>x+1).join(', ')}.`);unanswered.forEach(i=>{$(`input[name="q${i}"]`,event.target).closest('.quiz-option').classList.add('needs-answer')});return;}
    let score=0; m.quiz.forEach((q,i)=>{const chosen=Number($(`input[name="q${i}"]:checked`,event.target).value), box=$(`#feedback-${i}`);if(chosen===q.answer)score++;box.hidden=false;box.className=`quiz-feedback ${chosen===q.answer?'correct':'incorrect'}`;box.innerHTML=`<b>${chosen===q.answer?'Benar.':'Belum tepat.'}</b> ${escapeHTML(q.why)}`;$$(`input[name="q${i}"]`,event.target).forEach(input=>input.disabled=true);});
    state.scores[id]={score,total:m.quiz.length,at:new Date().toISOString()};saveProgress();const result=$('#quizResult');result.hidden=false;result.innerHTML=`<strong>Skor kamu: ${score}/${m.quiz.length}</strong><span>${score===m.quiz.length?'Bagus! Semua jawaban tepat.':score>=2?'Sudah baik. Pelajari lagi penjelasan jawaban yang belum tepat.':'Baca kembali materi, lalu coba lagi setelah meninjau pembahasan.'}</span><button type="button" class="button secondary small" onclick="retryQuiz(${id})">Ulangi kuis</button>`;showToast('Kuis selesai. Skor tersimpan di browser.');
  };
  window.retryQuiz = id => { renderLesson(Number(id)); $('#lesson-quiz').scrollIntoView({behavior:reducedMotion()?'auto':'smooth'}); };
  window.completeModule = id => { if(!state.completed.includes(Number(id)))state.completed.push(Number(id));saveProgress();updateProgressUI();renderModules();$('#completeModule').textContent='✓ Modul selesai';showToast('Modul ditandai selesai. Progres tersimpan.'); };
  function setupProjectChecklist(){let checked={};try{checked=JSON.parse(localStorage.getItem(PROJECT_KEY)||'{}')||{};}catch{};$('#projectChecklist').innerHTML=projectItems.map((label,i)=>`<label class="checklist-item"><input type="checkbox" data-project-item="${i}" ${checked[i]?'checked':''}><span class="checkmark" aria-hidden="true"></span><span><small>KOMPONEN 0${i+1}</small>${escapeHTML(label)}</span></label>`).join('');$('#projectChecklist').addEventListener('change',event=>{const input=event.target.closest('input[data-project-item]');if(!input)return;try{const values=JSON.parse(localStorage.getItem(PROJECT_KEY)||'{}')||{};values[input.dataset.projectItem]=input.checked;localStorage.setItem(PROJECT_KEY,JSON.stringify(values));}catch{showToast('Checklist hanya tersimpan sementara.');}const total=$$('#projectChecklist input:checked').length;showToast(`${total} dari ${projectItems.length} komponen ditandai.`);});}
  function setupFooter(){
    const year=$('#currentYear');
    if(year)year.textContent=String(new Date().getFullYear());
    const backToTop=$('#backToTop');
    if(backToTop)backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
  }
  function setupTheme(){let theme='dark';try{theme=localStorage.getItem(THEME_KEY)||'dark';}catch{};applyTheme(theme);$('#themeToggle').addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='light'?'dark':'light';applyTheme(next);try{localStorage.setItem(THEME_KEY,next);}catch{};});}
  function applyTheme(theme){document.documentElement.dataset.theme=theme;$('#themeToggle').textContent=theme==='light'?'☾ Tema gelap':'☀ Tema terang';$('#themeToggle').setAttribute('aria-label',theme==='light'?'Ganti ke tema gelap':'Ganti ke tema terang');const meta=$('meta[name="theme-color"]');if(meta)meta.content=theme==='light'?'#f3faf8':'#080a18';}
  function setupNavigation(){const toggle=$('#menuToggle'),nav=$('#mainNav');toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Tutup menu':'Buka menu');toggle.textContent=open?'×':'☰';});$$('#mainNav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰';}));window.addEventListener('hashchange',()=>{const hash=location.hash.slice(1)||'home';if(hash!=='lesson')$('#lesson').hidden=true;$$('[data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===hash));});}
  function setupReset(){ $('#resetProgress').addEventListener('click',()=>{if(!confirm('Atur ulang seluruh progres modul dan skor kuis di browser ini? Tindakan ini tidak dapat dibatalkan.'))return;state={completed:[],scores:{},lastOpened:null};try{localStorage.removeItem(STORAGE_KEY);}catch{};renderModules();updateProgressUI();showToast('Progres modul dan skor telah diatur ulang.');}); }
  $('#moduleSearch').addEventListener('input',renderModules);$('#statusFilter').addEventListener('change',renderModules);
  setupTheme();setupNavigation();setupProjectChecklist();setupReset();setupFooter();renderModules();updateProgressUI();
  if(location.hash.startsWith('#module-')){const id=Number(location.hash.replace('#module-',''));if(modules.some(m=>m.id===id))window.openModule(id);}
})();
