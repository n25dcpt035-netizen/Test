const A='assets/figma/';
const state={view:'dashboard',vocabTab:'topics',words:[],topics:[],settings:{profileName:'Thảo Nguyên',dailyGoal:20,soundEnabled:true},analytics:{},session:1,due:[],cardIndex:0,cardFlipped:false,studyBoxFilter:0,studyTopicId:'',quiz:[],quizIndex:0,quizCorrect:0,quizMode:'EN_TO_VI',quizSource:'all',dictionaryResults:[]};
const view=document.getElementById('view'),modal=document.getElementById('modal'),modalContent=document.getElementById('modalContent');

async function api(path,options={}){const response=await fetch(path,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});let data=null;try{data=await response.json()}catch{}if(!response.ok)throw new Error(data?.error||`HTTP ${response.status}`);return data}
const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const arr=value=>Array.isArray(value)?value:[];
function toast(message,error=false){const el=document.getElementById('toast');el.textContent=message;el.className=`toast show${error?' error':''}`;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.className='toast',3000)}
function iconFor(topic){const key=topic==='technology'?'tech':topic;return ['travel','business','daily','academic','food','tech'].includes(key)?`${A}topic-${key}.svg`:`${A}nav-vocabulary.svg`}
function topicName(id){return state.topics.find(t=>t.id===id)?.name||id}
function closeModal(){modal.hidden=true;modalContent.innerHTML=''}
function openModal(html){modalContent.innerHTML=html;modal.hidden=false}

async function hydrate(){view.innerHTML='<div class="loading">Đang tải dữ liệu...</div>';try{const [words,topics,settings,analytics,session]=await Promise.all([api('/api/words'),api('/api/topics'),api('/api/settings'),api('/api/analytics/dashboard'),api('/api/study/session')]);Object.assign(state,{words,topics,settings,analytics,session:session.currentSession});syncShell();render()}catch(error){view.innerHTML=`<div class="glass-card empty"><h2>Không kết nối được backend</h2><p>${esc(error.message)}</p><p>Hãy chạy <b>build.bat</b>, sau đó <b>run.bat</b>.</p></div>`}}
function syncShell(){document.body.classList.toggle('dashboard-view',state.view==='dashboard');document.body.classList.toggle('dictionary-view',state.view==='dictionary');document.body.classList.toggle('vocabulary-view',state.view==='vocabulary'&&state.vocabTab!=='study');document.body.classList.toggle('leitner-view',state.view==='vocabulary');document.getElementById('sidebarName').textContent=state.settings.profileName||'Người học';document.getElementById('sessionBadge').textContent=`Phiên ${state.session}`;document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.classList.contains('nav-item')&&el.dataset.view===state.view))}
function go(name){state.view=name;location.hash=name;syncShell();render()}
function render(){const fn={dashboard:renderDashboard,dictionary:renderDictionary,vocabulary:renderVocabulary,quiz:renderQuizSetup,analytics:renderAnalytics,settings:renderSettings}[state.view]||renderDashboard;fn()}
function pageHead(kicker,title,subtitle,actions=''){return `<div class="page-head"><div><p class="eyebrow">${kicker}</p><h1>${title}</h1><p class="page-subtitle">${subtitle}</p></div><div class="actions">${actions}</div></div>`}

async function refreshData(rerender=true){const [words,topics,settings,analytics,session]=await Promise.all([api('/api/words'),api('/api/topics'),api('/api/settings'),api('/api/analytics/dashboard'),api('/api/study/session')]);Object.assign(state,{words,topics,settings,analytics,session:session.currentSession});syncShell();if(rerender)render()}
