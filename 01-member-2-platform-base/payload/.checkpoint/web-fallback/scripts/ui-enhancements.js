/* Figma q23yWUXBoWa8GIzD0tvLcj: interactive views, using existing local assets/API. */
const originalShell = syncShell;
const originalDashboard = renderDashboard;
const originalCatalog = renderVocabContent;
const originalSaved = renderSavedWords;
const originalManage = renderManage;
const originalEntry = renderDictionaryEntry;
const originalSettings = renderSettings;
const ui = {analyticsTab:'progress', activities:[], timeline:[], busy:false, answers:[], quizSource:'all', quizTopic:'', quizBox:0, quizCount:10, studySource:'topic', reviewed:new Set(), hint:false, cardStarted:0, runStarted:0, quizAttempt:null, savingResult:false, translationDraft:null};
const localDay = (date=new Date()) => [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
const percent = (n,d) => d ? Math.round(n/d*1000)/10 : 0;
const elapsed = since => Math.max(0,Math.min(14400,Math.round((Date.now()-since)/1000)));
const img = (name,alt='') => '<img src="'+A+name+'.svg" alt="'+esc(alt)+'">';
const jsarg = value => esc(JSON.stringify(value));
const isLearned = word => Boolean(word.progress?.isLearned);
const currentLevel = word => isLearned(word) ? word.progress.level : 0;
const dueNow = word => isLearned(word) && word.progress.nextReviewAt <= Date.now()/1000;
function streakDays(){
  const dates=new Set(ui.activities.filter(x=>['LEITNER_REVIEW','QUIZ_ANSWER'].includes(x.type)).map(x=>x.localDate));
  let day=new Date(),count=0;
  if(!dates.has(localDay(day)))day.setDate(day.getDate()-1);
  while(dates.has(localDay(day))){count++;day.setDate(day.getDate()-1);}
  return count;
}
syncShell = function(){
  originalShell();
  document.body.classList.add('figma-app');
  document.body.classList.toggle('updated-view',['quiz','analytics','settings'].includes(state.view));
  document.getElementById('sessionBadge').textContent=streakDays()+' Days';
};
async function loadActivity(){
  try{
    const [backup,timeline]=await Promise.all([api('/api/export'),api('/api/analytics/timeline?days=14')]);
    ui.activities=arr(backup.activityHistory);ui.timeline=arr(timeline);syncShell();
    if(state.view==='analytics')renderAnalytics();
    if(state.view==='dashboard')renderDashboard();
  }catch(error){toast(error.message,true);}
}
function todayStats(){
  return ui.timeline.find(x=>x.date===localDay())||{reviewCount:0,quizCount:0,durationSeconds:0};
}
renderDashboard = function(){
  originalDashboard();
  const a=state.analytics,total=a.totalWords??state.words.length,learned=a.learnedCount||0,mastered=a.memorizedCount||0,today=todayStats(),goal=state.settings.dailyGoal||20,done=Math.min(goal,today.reviewCount+today.quizCount);
  const week=ui.timeline.slice(-7),seconds=week.reduce((sum,x)=>sum+x.durationSeconds,0);
  const p=percent(done,goal),m=percent(mastered,total),boxDue=state.words.filter(w=>currentLevel(w)===1&&dueNow(w)).length;
  const copy=view.querySelector('.dashboard-welcome-copy');
  copy.querySelector('p').textContent='Bạn đã học xong '+done+'/'+goal+' từ trong tiến độ học tập hằng ngày, hãy tiếp tục duy trì như vậy nhé !';
  copy.querySelector('.dashboard-goal-track span').style.width=p+'%';copy.querySelector('.dashboard-goal b').textContent=p+'%';
  view.querySelector('.dashboard-alert span').textContent=boxDue+' từ ở Box 1 Leitner cần học trong ngày hôm nay !';
  view.querySelector('.dashboard-alert button').onclick=()=>beginStudy('due');
  const metrics=view.querySelectorAll('.dashboard-metrics article');
  metrics[0].querySelector('small').textContent='Tổng số từ vựng đã học';
  metrics[0].querySelector('strong').textContent=learned+'/'+total;
  const gained=new Set(ui.activities.filter(x=>x.type==='LEITNER_REVIEW'&&x.rating==='EASY'&&x.occurredAt>=Date.now()/1000-604800).map(x=>x.wordId)).size;
  metrics[0].querySelector('.dashboard-metric-value span').textContent='+'+gained+' tuần này';
  metrics[1].querySelector('strong').textContent=(seconds/3600).toFixed(1)+' h';
  metrics[2].querySelector('strong').textContent=m+'%';
  metrics[2].querySelector('.dashboard-ring').innerHTML='<div class="live-ring" style="--value:'+m+'"><b>'+m+'%</b></div>';
  view.querySelectorAll('.dashboard-deck button').forEach(b=>b.textContent='Flashcards');
};
function boxCards(onclick='studyBox'){
  const dist=state.analytics.distribution||{};
  return '<div class="box-grid">'+[1,2,3].map((n)=>leitnerBoxCard(n,dist['level'+n]||0,['Khó','Vừa','Dễ'][n-1],['Daily Review','Every 3 Days','Mastered'][n-1],['Những từ quên nhiều, ôn tập mỗi ngày','Những từ bạn đã biết, ôn tập mỗi 3 ngày','Những từ thuộc lòng, ôn tập mỗi tuần 1 lần'][n-1],['red','yellow','green'][n-1]).replace('studyBox('+n+')',onclick+'('+n+')')).join('')+'</div>';
}
renderVocabContent = function(){
  originalCatalog();
  if(state.vocabTab==='topics'){
    document.getElementById('vocabContent').insertAdjacentHTML('beforeend','<section class="catalog-boxes"><div class="vocabulary-section-heading"><h2>Hộp Leitner của bạn</h2><span>'+(state.analytics.learnedCount||0)+' từ đang học</span></div>'+boxCards()+'</section>');
  }
};
renderSavedTable = function(box,words){
  box.innerHTML=words.length?'<div class="saved-table"><div class="saved-table-head"><span>TỪ</span><span>PHIÊN ÂM</span><span>LOẠI TỪ</span><span>NGHĨA</span><span>STATUS</span><span>PHÂN LOẠI</span></div>'+words.map(w=>{const level=currentLevel(w);return '<div class="saved-row"><strong>'+esc(w.english)+'</strong><span>'+esc(w.phonetic||'—')+'</span><span>'+esc(w.partOfSpeech||'—')+'</span><span title="'+esc(w.definition||w.vietnamese)+'">'+esc(w.definition||w.vietnamese)+'</span><span><b class="status-badge status-'+level+'">'+(level?['Review','Hard','Easy'][level-1]:'Chưa học')+'</b></span><span class="saved-row-actions"><button aria-label="Phát âm '+esc(w.english)+'" onclick="speakWord('+w.id+')">'+img('audio-lines')+'</button><button aria-label="Bỏ lưu '+esc(w.english)+'" onclick="toggleSaved('+w.id+',false)">'+img('saved-trash')+'</button></span></div>';}).join('')+'</div>':'<div class="saved-empty">Chưa có từ nào được lưu.</div>';
};
renderSavedWords = function(box){
  originalSaved(box);
  const update=()=>{
    const q=document.getElementById('savedSearch').value.trim().toLowerCase(),sort=document.getElementById('savedSort').value;
    const words=state.words.filter(w=>w.saved&&(w.english+' '+w.vietnamese+' '+w.partOfSpeech).toLowerCase().includes(q)).sort(sort==='az'?(a,b)=>a.english.localeCompare(b.english):sort==='topic'?(a,b)=>topicName(a.topicId).localeCompare(topicName(b.topicId)):(a,b)=>(b.savedAt||0)-(a.savedAt||0)||b.id-a.id);
    renderSavedTable(document.getElementById('savedTable'),words);
  };
  document.getElementById('savedSearch').oninput=update;document.getElementById('savedSort').onchange=update;update();
};
renderManage = function(box){
  originalManage(box);
  box.insertAdjacentHTML('afterbegin','<div class="manage-topics">'+state.topics.map(t=>'<article><span>'+img(iconFor(t.icon||t.id).split('/').pop().replace('.svg',''))+'<b>'+esc(t.name)+'</b><small>'+t.wordCount+' từ</small></span><div><button class="mini" onclick="showTopicModal('+jsarg(t.id)+')">Sửa</button><button class="mini danger-mini" onclick="deleteTopic('+jsarg(t.id)+')">Xóa</button></div></article>').join('')+'</div>');
};
async function beginStudy(source,id=''){
  if(ui.busy)return;
  state.view='vocabulary';state.vocabTab='study';state.studyTopicId=source==='topic'?id:source==='saved'?'__saved':'';
  state.studyBoxFilter=source==='box'?Number(id):0;
  ui.studySource=source;ui.reviewed=new Set();ui.hint=false;ui.runStarted=Date.now();ui.busy=false;
  state.due=state.words.filter(w=>source==='topic'?w.topicId===id:source==='saved'?w.saved:source==='box'?isLearned(w)&&currentLevel(w)===Number(id):source==='all'||dueNow(w));
  state.cardIndex=0;state.cardFlipped=false;ui.cardStarted=Date.now();location.hash='vocabulary';syncShell();renderVocabulary();window.scrollTo(0,0);
}
openTopic = id=>beginStudy('topic',id);
openStudy = ()=>beginStudy('due');
studyBox = n=>beginStudy('box',n);
startSavedStudy = ()=>beginStudy('saved');
loadStudy = ()=>renderStudy();
renderVocabulary = function(){
  if(state.vocabTab==='study'){
    view.innerHTML='<section class="study-page"><header class="study-heading"><h1>Học Thuộc Leitner</h1><p>Phương pháp học tập thông minh bằng cách ôn tập lại mỗi ngày các từ ở mỗi hộp.</p><button class="text-button study-back" onclick="returnToVocabulary()">← Bộ từ vựng</button></header><div id="vocabContent"></div></section>';
    renderStudy();return;
  }
  view.innerHTML='<section class="vocabulary-page"><header class="vocabulary-heading"><div><h1>Bộ Chủ Đề Từ Vựng</h1><p>Hệ thống từ vựng thực tế cho người học.</p></div><div class="vocabulary-heading-actions"><button class="vocabulary-manage '+(state.vocabTab==='manage'?'active':'')+'" onclick="setVocabTab(\'manage\')">Quản lý</button><div class="vocabulary-tabs" role="tablist"><button role="tab" aria-selected="'+(state.vocabTab==='topics')+'" class="'+(state.vocabTab==='topics'?'active':'')+'" onclick="setVocabTab(\'topics\')">Tất cả</button><button role="tab" aria-selected="'+(state.vocabTab==='saved')+'" class="'+(state.vocabTab==='saved'?'active':'')+'" onclick="setVocabTab(\'saved\')">Từ đã lưu</button></div></div></header><div id="vocabContent" class="vocabulary-content"></div></section>';
  renderVocabContent();
};
function studyActions(w){
  return '<div class="study-actions"><button class="hint-button" onclick="event.stopPropagation();toggleHint()">'+img('lightbulb')+'Gợi ý</button><button class="save-button" onclick="event.stopPropagation();toggleSaved('+w.id+','+!w.saved+')">'+img('bookmark')+(w.saved?'Đã lưu':'Lưu vào từ của tôi')+'</button></div>';
}
renderStudy = function(){
  const box=document.getElementById('vocabContent');if(!box||state.vocabTab!=='study')return;
  const w=state.due[state.cardIndex];
  if(!w){box.innerHTML='<div class="study-empty"><h2>'+ (state.due.length?'Hoàn thành bộ thẻ!':'Chưa có từ để ôn tập')+'</h2><p>'+ (ui.studySource==='due'?'Bạn đã ôn hết các từ đến hạn. Lịch ôn tiếp theo sẽ tự cập nhật theo thời gian trên máy.':'Chọn một chủ đề hoặc hộp khác để tiếp tục.')+'</p><button class="btn btn-primary" onclick="returnToVocabulary()">Về bộ từ vựng</button></div>';return;}
  const reviewed=ui.reviewed.has(w.id),label=state.studyBoxFilter?'BOX '+state.studyBoxFilter+':':'CHỦ ĐỀ: '+topicName(w.topicId);
  box.innerHTML='<section class="study-review '+(state.cardFlipped?'is-flipped':'')+'"><article class="study-card" tabindex="0" aria-label="Lật thẻ từ vựng" onclick="flipCard()"><div class="study-meta"><span><i></i>'+esc(label)+'</span><span>Card '+(state.cardIndex+1)+' of '+state.due.length+'</span></div><div class="study-word"><h2>'+esc(w.english)+'</h2><p>'+esc(w.phonetic||'—')+'</p></div>'+studyActions(w)+'<p class="flip-caption">Ấn chuột trái hoặc Enter để lật thẻ</p>'+(state.cardFlipped?'<div class="study-rating" onclick="event.stopPropagation()"><h3>MỨC ĐỘ NHỚ CỦA BẠN LÀ BAO NHIÊU ?</h3><div><button class="again" '+(reviewed||ui.busy?'disabled':'')+' onclick="review(\'AGAIN\')">Tôi quên rồi</button><button class="hard" '+(reviewed||ui.busy?'disabled':'')+' onclick="review(\'HARD\')">Khó</button><button class="easy" '+(reviewed||ui.busy?'disabled':'')+' onclick="review(\'EASY\')">Tôi nhớ</button></div>'+(reviewed?'<small>Đã đánh giá thẻ này trong lượt học.</small>':'')+'</div>':'')+'</article><button class="study-arrow previous" aria-label="Thẻ trước" '+(state.cardIndex===0?'disabled':'')+' onclick="previousStudyCard()">'+img('leitner-arrow')+'</button><button class="study-arrow next" aria-label="Thẻ tiếp theo" '+(state.cardIndex===state.due.length-1?'disabled':'')+' onclick="nextStudyCard()">'+img('leitner-arrow')+'</button></section>'+((ui.hint||state.cardFlipped)?'<article class="study-definition"><h2>'+esc(w.vietnamese)+'</h2><span class="dictionary-pos">'+esc(w.partOfSpeech||'Từ vựng')+'</span><h3>Ý nghĩa &amp; Định nghĩa:</h3><p><b>1.</b> '+esc(w.definition||w.vietnamese)+'</p>'+(arr(w.examples).length?'<div class="dictionary-example"><strong>VÍ DỤ THỰC TẾ:</strong><em>'+esc(w.examples[0])+'</em></div>':'')+'</article>':'');
  box.querySelector('.study-card').onkeydown=e=>{if(e.target===e.currentTarget&&(e.key==='Enter'||e.key===' ')){e.preventDefault();flipCard();}};
};
flipCard = ()=>{state.cardFlipped=!state.cardFlipped;renderStudy();};
function toggleHint(){ui.hint=!ui.hint;renderStudy();}
previousStudyCard = ()=>moveStudy(-1);
nextStudyCard = ()=>moveStudy(1);
function moveStudy(delta){if(ui.busy)return;state.cardIndex=Math.max(0,Math.min(state.due.length-1,state.cardIndex+delta));state.cardFlipped=false;ui.hint=false;ui.cardStarted=Date.now();renderStudy();}
review = async function(rating){
  const w=state.due[state.cardIndex];if(!w||ui.busy||ui.reviewed.has(w.id))return;
  ui.busy=true;renderStudy();
  try{
    const result=await api('/api/study/review',{method:'POST',body:JSON.stringify({wordId:w.id,rating,durationSeconds:elapsed(ui.cardStarted)})});
    w.progress=result.progress;const stored=state.words.find(x=>x.id===w.id);if(stored)stored.progress=result.progress;ui.reviewed.add(w.id);
    const next=state.due.findIndex((x,i)=>i>state.cardIndex&&!ui.reviewed.has(x.id));
    state.cardIndex=next>=0?next:state.due.findIndex(x=>!ui.reviewed.has(x.id));
    if(state.cardIndex<0){
      await api('/api/analytics/activity',{method:'POST',body:JSON.stringify({type:ui.studySource==='topic'?'TOPIC_COMPLETED':'FLASHCARDS_COMPLETED',topicId:state.studyTopicId,total:state.due.length,wordIds:state.due.map(x=>x.id),wrongWordIds:state.due.filter(x=>currentLevel(x)===1).map(x=>x.id),accuracy:percent(state.due.filter(x=>currentLevel(x)!==1).length,state.due.length)})});
      state.cardIndex=state.due.length;await refreshData(false);loadActivity();
    }
    state.cardFlipped=false;ui.hint=false;ui.cardStarted=Date.now();
  }catch(error){toast(error.message,true);}finally{ui.busy=false;renderStudy();}
};
toggleSaved = async function(id,saved){
  try{
    const result=await api('/api/words/'+id+'/saved',{method:'POST',body:JSON.stringify({saved})});
    for(const collection of [state.words,state.due]){const w=collection.find(x=>x.id===id);if(w){w.saved=result.saved;w.savedAt=result.savedAt;}}
    state.dictionaryResults.forEach(w=>{if(w.learningWordId===id)w.saved=saved;});
    toast(saved?'Đã thêm vào mục Đã lưu':'Đã bỏ khỏi mục Đã lưu');
    if(state.view==='dictionary'){renderDictionaryEntry(ui.dictionaryIndex||0);}
    else if(state.view==='vocabulary'&&state.vocabTab==='study')renderStudy();
    else if(state.view==='vocabulary')renderVocabContent();
    else if(state.view==='quiz'&&state.quiz.length)renderQuizQuestion();
  }catch(error){toast(error.message,true);}
};
renderQuizSetup = function(){
  syncShell();state.quiz=[];ui.answers=[];ui.quizAttempt=null;ui.savingResult=false;
  view.innerHTML='<section class="quiz-page"><header><h1>Kiểm tra kiến thức</h1><p>Chế độ luyện tập và tự đánh giá</p></header><section class="quiz-panel"><h2>Hộp Leitner</h2>'+boxCards('studyBox')+'<button class="primary-button quiz-all" onclick="beginStudy(\'all\')">Kiểm tra tất cả</button></section><section class="quiz-panel quiz-writing"><h2>Kiểm Tra Tự Luận</h2><div class="quiz-config"><label class="quiz-count">'+img('search')+'<input id="quizCount" type="number" min="1" max="20" value="'+ui.quizCount+'" aria-label="Số câu hỏi" placeholder="Nhập số câu hỏi muốn làm"></label><div class="mode-tabs"><button class="'+(state.quizMode==='EN_TO_VI'?'active':'')+'" onclick="setQuizDirection(\'EN_TO_VI\')">Tự luận Anh-Việt</button><button class="'+(state.quizMode==='VI_TO_EN'?'active':'')+'" onclick="setQuizDirection(\'VI_TO_EN\')">Tự luận Việt-Anh</button></div><span>'+state.words.length+' từ</span></div><div class="quiz-source"><label>Nguồn câu hỏi <select id="quizSource" onchange="quizSourceChanged()"><option value="all">Tất cả từ</option><option value="topic">Theo chủ đề</option><option value="saved">Từ đã lưu</option><option value="box">Theo hộp Leitner</option></select></label><span id="quizFilter"></span></div><button class="primary-button" onclick="startQuiz()">Bắt đầu kiểm tra</button></section></section>';
};
const renderQuizSetupLayout=renderQuizSetup;
renderQuizSetup = function(){
  renderQuizSetupLayout();
  window.scrollTo(0,0);
  document.getElementById('quizCount').outerHTML='<select id="quizCount" aria-label="Số câu hỏi">'+[5,10,20].map(n=>'<option value="'+n+'" '+(n===ui.quizCount?'selected':'')+'>'+n+' câu hỏi</option>').join('')+'</select>';
};
function setQuizDirection(mode){
  ui.quizCount=Number(document.getElementById('quizCount').value)||10;state.quizMode=mode;
  document.querySelectorAll('.mode-tabs button').forEach((b,i)=>b.classList.toggle('active',i===(mode==='EN_TO_VI'?0:1)));
}
quizSourceChanged = function(){
  const source=document.getElementById('quizSource').value;document.getElementById('quizFilter').innerHTML=source==='topic'?'<select id="quizTopic" aria-label="Chủ đề kiểm tra">'+state.topics.map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join('')+'</select>':source==='box'?'<select id="quizBox" aria-label="Hộp kiểm tra"><option value="1">BOX 1</option><option value="2">BOX 2</option><option value="3">BOX 3</option></select>':'';
};
startQuiz = async function(payload){
  if(ui.busy)return;
  if(!payload){
    const count=Number(document.getElementById('quizCount').value);
    if(!Number.isInteger(count)||count<1||count>20)return toast('Chọn từ 1 đến 20 câu hỏi.',true);
    payload={count,mode:state.quizMode,source:document.getElementById('quizSource').value,topicId:document.getElementById('quizTopic')?.value||'',box:Number(document.getElementById('quizBox')?.value||0)};
  }
  ui.busy=true;
  try{
    const questions=await api('/api/quiz/generate',{method:'POST',body:JSON.stringify(payload)});
    if(!questions.length)return toast('Nguồn này chưa có từ để kiểm tra.',true);
    state.quiz=questions;state.quizMode=payload.mode;state.quizIndex=0;state.quizCorrect=0;
    ui.answers=Array(questions.length).fill(null);ui.quizTopic=payload.topicId||'';ui.quizSource=payload.source;ui.quizAttempt=null;ui.savingResult=false;ui.cardStarted=Date.now();ui.runStarted=Date.now();
    state.view='quiz';location.hash='quiz';syncShell();renderQuizQuestion();
  }catch(error){toast(error.message,true);}finally{ui.busy=false;}
};
renderQuizQuestion = function(){
  const q=state.quiz[state.quizIndex];if(!q)return;const w=state.words.find(x=>x.id===q.wordId),a=ui.answers[state.quizIndex];
  view.innerHTML='<section class="study-page quiz-question-page"><header class="study-heading"><h1>Kiểm tra tự luận '+(q.mode==='VI_TO_EN'?'Việt - Anh':'Anh - Việt')+'</h1><p>Phương pháp học tập thông minh bằng cách ôn tập lại mỗi ngày các từ ở mỗi hộp.</p><button class="text-button study-back" onclick="renderQuizSetup()">← Kiểm tra</button></header><section class="study-review"><article class="study-card"><div class="study-meta"><span><i></i>CHỦ ĐỀ: '+esc(topicName(q.topicId))+'</span><span>Card '+(state.quizIndex+1)+' of '+state.quiz.length+'</span></div><div class="study-word"><h2>'+esc(q.prompt)+'</h2><p>'+esc(q.mode==='EN_TO_VI'?q.phonetic||'—':'')+'</p></div><div class="study-actions"><button class="hint-button" onclick="toast('+jsarg('Gợi ý: '+(w?.partOfSpeech||'Từ vựng'))+')">'+img('lightbulb')+'Gợi ý</button>'+(w?'<button class="save-button" onclick="toggleSaved('+w.id+','+!w.saved+')">'+img('bookmark')+(w.saved?'Đã lưu':'Lưu vào từ của tôi')+'</button>':'')+'</div><form class="quiz-answer" onsubmit="event.preventDefault();submitQuiz()"><label>'+img('search')+'<input id="quizAnswer" aria-label="Đáp án" placeholder="'+(q.mode==='VI_TO_EN'?'Nhập từ tiếng Anh':'Nhập nghĩa tiếng Việt')+'" autocomplete="off" value="'+esc(a?.userAnswer||'')+'" '+(a?'disabled':'')+'></label><button class="primary-button" '+(a?'disabled':'')+'>Kiểm tra đáp án</button></form><div id="quizFeedback">'+(a?'<div class="feedback '+(a.isCorrect?'good':'bad')+'">'+(a.isCorrect?'Chính xác!':'Đáp án: '+esc(a.correctAnswer))+'</div><button class="text-button" onclick="nextQuiz()">'+(ui.answers.every(Boolean)?'Xem kết quả':'Câu tiếp theo')+' →</button>':'')+'</div></article><button class="study-arrow previous" aria-label="Câu trước" '+(state.quizIndex===0?'disabled':'')+' onclick="moveQuiz(-1)">'+img('leitner-arrow')+'</button><button class="study-arrow next" aria-label="Câu tiếp theo" '+(state.quizIndex===state.quiz.length-1?'disabled':'')+' onclick="moveQuiz(1)">'+img('leitner-arrow')+'</button></section></section>';
};
function moveQuiz(delta){if(ui.busy)return;state.quizIndex=Math.max(0,Math.min(state.quiz.length-1,state.quizIndex+delta));ui.cardStarted=Date.now();renderQuizQuestion();}
submitQuiz = async function(){
  const q=state.quiz[state.quizIndex],input=document.getElementById('quizAnswer');
  if(ui.busy||ui.answers[state.quizIndex])return;
  if(!input.value.trim())return toast('Vui lòng nhập đáp án',true);
  const index=state.quizIndex,userAnswer=input.value.trim();ui.busy=true;input.disabled=true;
  try{
    const result=await api('/api/quiz/submit',{method:'POST',body:JSON.stringify({wordId:q.wordId,userAnswer,mode:q.mode,durationSeconds:elapsed(ui.cardStarted)})});
    ui.answers[index]={wordId:q.wordId,prompt:q.prompt,userAnswer,correctAnswer:result.correctAnswer,isCorrect:result.isCorrect};
    state.quizCorrect=ui.answers.filter(a=>a?.isCorrect).length;
  }catch(error){toast(error.message,true);}finally{ui.busy=false;renderQuizQuestion();}
};
nextQuiz = function(){const next=ui.answers.findIndex(x=>!x);if(next<0){finishQuiz();return;}state.quizIndex=next;ui.cardStarted=Date.now();renderQuizQuestion();};
finishQuiz = async function(){
  if(ui.savingResult)return;
  if(!ui.answers.every(Boolean))return nextQuiz();
  ui.savingResult=true;
  try{
    if(!ui.quizAttempt)ui.quizAttempt=await api('/api/quiz/history',{method:'POST',body:JSON.stringify({mode:state.quizMode,topicId:ui.quizTopic,source:ui.quizSource,answers:ui.answers})});
    showQuizResult(ui.quizAttempt);await refreshData(false);loadActivity();
  }catch(error){toast('Chưa lưu được kết quả: '+error.message,true);ui.savingResult=false;}
};
function donut(value,label='Correct'){
  return '<div class="chart-donut" role="img" aria-label="'+value+'% '+label+'" style="--value:'+value+'"><div><strong>'+value+'%</strong><small>'+label+'</small></div></div>';
}
function showQuizResult(attempt){
  const value=percent(attempt.correct,attempt.total);ui.quizAttempt=attempt;
  view.innerHTML='<section class="result-page"><header><h1>Kết quả</h1><button class="text-button" onclick="renderQuizSetup()">← Kiểm tra</button></header><div class="result-layout"><article class="result-chart"><h2>Tỉ lệ đúng sai</h2>'+donut(value)+'<div class="chart-legends"><span>Đúng ('+value+'%)</span><span>Sai ('+(100-value).toFixed(1)+'%)</span></div><button class="text-button" onclick="showAttemptReview()">Xem lại bài làm</button></article><div class="result-kpis"><article class="analytics-kpi"><small>Mức độ chính xác</small><strong>'+value+'%</strong></article><article class="analytics-kpi"><small>Số câu hỏi đã làm</small><strong>'+attempt.total+'</strong><small>Chủ đề: '+esc(topicName(attempt.topicId)||'Tất cả')+'</small></article></div></div></section>';
}
function showAttemptReview(){
  const attempt=ui.quizAttempt;
  view.innerHTML='<section class="review-page"><header><h1>Xem lại bài làm</h1><button class="text-button" onclick="showQuizResult(ui.quizAttempt)">← Kết quả</button></header><div class="review-answers">'+arr(attempt.answers).map((a,i)=>'<article class="'+(a.isCorrect?'correct':'incorrect')+'"><span>Câu '+(i+1)+' · '+(a.isCorrect?'Đúng':'Sai')+'</span><h2>'+esc(a.prompt||state.words.find(w=>w.id===a.wordId)?.english||'Từ đã xóa')+'</h2><p>Bạn trả lời: '+esc(a.userAnswer)+'</p><p>Đáp án: <b>'+esc(a.correctAnswer)+'</b></p></article>').join('')+'</div><button class="primary-button" '+(!arr(attempt.wrongWordIds).length?'disabled':'')+' onclick="retryMistakes()">Ôn lại câu sai</button></section>';
}
function retryMistakes(){
  const attempt=ui.quizAttempt;
  startQuiz({mode:attempt.mode||'EN_TO_VI',source:'mistakes',count:Math.min(20,arr(attempt.wrongWordIds).length),wordIds:attempt.wrongWordIds});
}
async function openHistory(id){
  try{ui.quizAttempt=await api('/api/quiz/history/'+encodeURIComponent(id));state.view='quiz';location.hash='quiz';syncShell();showAttemptReview();}catch(error){toast(error.message,true);}
}
renderAnalytics = function(){
  const a=state.analytics,total=a.totalWords||0,learned=a.learnedCount||0,mastered=a.memorizedCount||0,accuracy=percent(a.totalCorrect||0,a.totalAttempts||0),timeline=ui.timeline.slice(-7),previous=ui.timeline.slice(0,-7);
  const score=days=>{const correct=days.reduce((n,d)=>n+d.correct,0),wrong=days.reduce((n,d)=>n+d.wrong,0);return percent(correct,correct+wrong);};
  const delta=Math.round((score(timeline)-score(previous))*10)/10;
  const tabs='<div class="analytics-tabs"><button class="'+(ui.analyticsTab==='progress'?'active':'')+'" onclick="setAnalyticsTab(\'progress\')">Tiến độ</button><button class="'+(ui.analyticsTab==='history'?'active':'')+'" onclick="setAnalyticsTab(\'history\')">Lịch sử học</button></div>';
  view.innerHTML='<section class="analytics-page"><header><h1>Phân tích tiến độ</h1>'+tabs+'</header>'+(ui.analyticsTab==='history'?renderActivityLog():
    '<div class="analytics-kpis"><article class="analytics-kpi"><small>Mức độ chính xác</small><strong>'+accuracy+'%</strong><small class="trend">'+(delta>=0?'+':'')+delta+'% <span>this week</span></small></article><article class="analytics-kpi"><small>Số câu hỏi đã làm</small><strong>'+(a.totalAttempts||0)+'</strong><small>Tổng chủ đề: '+state.topics.length+'</small></article><article class="analytics-kpi"><small>Những từ thuộc lòng</small><strong>'+mastered+' / '+total+'</strong></article><article class="analytics-kpi"><small>Chuỗi</small><strong>'+streakDays()+' Ngày</strong><small>Duy trì như vậy nhé !</small></article></div><div class="mastery-summary">'+[3,2,1].map((level,i)=>{const count=a.distribution?.['level'+level]||0;return '<div><span><i class="status-dot level-'+level+'"></i>'+['Thuộc lòng','Khó','Xem lại'][i]+' <small>('+count+' words)</small></span><b>'+percent(count,learned)+'%</b></div>';}).join('')+'</div><div class="analytics-charts"><article class="hours-chart"><h2>Số giờ học hằng ngày</h2>'+hoursChart(timeline)+'</article><article class="accuracy-chart"><h2>Tỉ lệ đúng sai</h2>'+donut(accuracy)+'<div class="chart-legends"><span>Đúng ('+accuracy+'%)</span><span>Sai ('+(100-accuracy).toFixed(1)+'%)</span></div></article></div><section class="analytics-boxes"><div class="vocabulary-section-heading"><h2>Hộp Leitner của bạn</h2><span>'+learned+' từ đang học</span></div>'+boxCards()+'</section>')+'</section>';
};
const renderAnalyticsLayout = renderAnalytics;
renderAnalytics = function(){
  renderAnalyticsLayout();
  if(ui.analyticsTab!=='progress')return;
  const panel=view.querySelector('.analytics-boxes'),charts=view.querySelector('.analytics-charts'),summary=view.querySelector('.mastery-summary');
  charts.before(panel);panel.append(summary);
  summary.insertAdjacentHTML('beforeend','<div class="mastery-track">'+[3,2,1].map(level=>{const p=percent(state.analytics.distribution?.['level'+level]||0,state.analytics.learnedCount||0);return '<span class="level-'+level+'" style="width:'+p+'%">'+(p?p+'%':'')+'</span>';}).join('')+'</div>');
  const kpis=view.querySelectorAll('.analytics-kpis .analytics-kpi');
  kpis[2].insertAdjacentHTML('beforeend','<span class="kpi-ring" style="--value:'+percent(state.analytics.memorizedCount||0,state.analytics.totalWords||0)+'"></span>');
  kpis[3].insertAdjacentHTML('beforeend',img('flame'));
};
function hoursChart(days){
  const max=Math.max(3,...days.map(d=>d.durationSeconds/3600));
  return '<div class="hours-plot"><div class="hours-axis"><span>'+max.toFixed(1)+'h</span><span>'+(max*2/3).toFixed(1)+'h</span><span>'+(max/3).toFixed(1)+'h</span><span>0h</span></div><div class="hours-bars">'+days.map(d=>'<div title="'+esc(d.date)+': '+Math.round(d.durationSeconds/60)+' phút"><div class="hours-bar" style="height:'+Math.max(0,d.durationSeconds/3600/max*100)+'%"></div><span>'+esc(d.weekday)+'</span></div>').join('')+'</div></div>';
}
function setAnalyticsTab(name){ui.analyticsTab=name;renderAnalytics();}
function renderActivityLog(){
  const events=ui.activities.filter(x=>!['LEITNER_REVIEW','QUIZ_ANSWER'].includes(x.type));
  return '<article class="activity-log"><h2>Hoạt động gần đây</h2>'+(events.length?events.map(e=>'<div class="activity-row"><span class="activity-icon">'+img(e.type==='QUIZ_COMPLETED'?'nav-quiz':'nav-vocabulary')+'</span><div><strong>'+esc((e.type==='QUIZ_COMPLETED'?'Completed Quiz':e.type==='TOPIC_COMPLETED'?'Finished Reviewing':'Reviewed Flashcards')+(e.topicId?' · '+topicName(e.topicId):''))+'</strong><small>'+new Date(e.occurredAt*1000).toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'})+'</small></div><span>'+Number(e.accuracy||0).toFixed(1)+'% '+(e.type==='QUIZ_COMPLETED'?'Accuracy':'Mastery')+'</span>'+(e.quizHistoryId?'<button class="text-button" onclick="openHistory('+jsarg(e.quizHistoryId)+')">Review Mistakes</button>':'<button class="text-button" onclick="reviewActivity('+jsarg(e.id)+')">Review Mistakes</button>')+'</div>').join(''):'<div class="empty">Chưa có hoạt động học. Hoàn thành một bộ thẻ hoặc bài kiểm tra để xem lịch sử.</div>')+'</article>';
}
function reviewActivity(id){
  const activity=ui.activities.find(a=>a.id===id),ids=arr(activity?.wrongWordIds);
  if(!ids.length)return toast('Lượt học này không có từ sai được lưu.');
  beginStudy('all');state.due=state.words.filter(w=>ids.includes(w.id));renderStudy();
}
renderSettings = function(){
  originalSettings();
  view.querySelectorAll('.eyebrow').forEach(el=>el.remove());
  const label=view.querySelector('label[for="dailyGoal"]')||document.getElementById('dailyGoal')?.parentElement.querySelector('label');if(label)label.textContent='Mục tiêu mỗi ngày';
  const p=view.querySelector('.settings-grid > div .page-subtitle');if(p)p.textContent='Xuất hoặc nhập từ, chủ đề, tiến độ, lịch sử và hồ sơ bằng một file JSON.';
};
document.querySelector('[aria-label="Thông báo"]').onclick=()=>openModal('<div class="modal-head"><h2>Thông báo</h2><button class="close" data-close-modal>×</button></div><p>'+state.words.filter(dueNow).length+' từ đã đến hạn ôn tập hôm nay.</p><button class="btn btn-primary" onclick="closeModal();beginStudy(\'due\')">Ôn ngay</button>');
document.querySelector('[aria-label="Gợi ý học tập"]').onclick=()=>openModal('<div class="modal-head"><h2>Gợi ý học tập</h2><button class="close" data-close-modal>×</button></div><p>Chọn một chủ đề và bắt đầu bằng Flashcards. Lật thẻ để xem nghĩa, sau đó chọn mức độ nhớ. Ôn lại các từ đến hạn mỗi ngày.</p>');
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeModal();});

// A late search/translation response must not overwrite a newer request or route.
let dictionaryRequest=0,translationRequest=0;
lookup = async function(q){
  const input=document.getElementById('lookupInput');if(!input)return;
  if(q)input.value=q;const query=input.value.trim();if(!query)return;
  const request=++dictionaryRequest,box=document.getElementById('wordResult');
  box.innerHTML='<div class="dictionary-loading">Đang tra từ…</div>';
  try{
    let results=await api('/api/dictionary/search?q='+encodeURIComponent(query)+'&lang=en&limit=12');
    if(!results.length)results=await api('/api/dictionary/search?q='+encodeURIComponent(query)+'&lang=vi&limit=12');
    if(request!==dictionaryRequest||!box.isConnected)return;
    state.dictionaryResults=results;ui.dictionaryQuery=query;ui.dictionaryIndex=0;
    if(!results.length){box.innerHTML='<div class="empty">Không tìm thấy từ trong kho từ điển.</div>';return;}
    renderDictionaryEntry(0);
  }catch(error){if(request===dictionaryRequest&&box.isConnected)box.innerHTML='<div class="empty">'+esc(error.message)+'</div>';}
};
renderDictionaryEntry = function(index){
  ui.dictionaryIndex=index;originalEntry(index);
  const box=document.getElementById('wordResult'),entry=state.dictionaryResults[index];if(!box||!entry)return;
  const learning=state.words.find(w=>w.id===entry.learningWordId),example=arr(learning?.examples)[0];
  if(!example)box.querySelector('.dictionary-example').innerHTML='<strong>VÍ DỤ THỰC TẾ:</strong><span>Kho từ điển chưa có ví dụ cho từ này.</span>';
  if(state.dictionaryResults.length>1)box.insertAdjacentHTML('afterbegin','<select class="dictionary-results-select" aria-label="Chọn kết quả tra từ" onchange="renderDictionaryEntry(Number(this.value))">'+state.dictionaryResults.map((w,i)=>'<option value="'+i+'" '+(i===index?'selected':'')+'>'+esc(w.english+' — '+w.vietnamese)+'</option>').join('')+'</select>');
};
const baseDictionary = renderDictionary;
renderDictionary = function(){
  const results=state.dictionaryResults,index=ui.dictionaryIndex||0,query=ui.dictionaryQuery||'';
  baseDictionary();
  if(query){dictionaryRequest++;state.dictionaryResults=results;document.getElementById('lookupInput').value=query;renderDictionaryEntry(index);}
  if(ui.translationDraft){
    transDirection=ui.translationDraft.direction;document.getElementById('translateInput').value=ui.translationDraft.text;document.getElementById('translateOutput').textContent=ui.translationDraft.output;setLanguageLabels();updateTranslationCount();
  }
};
function setLanguageLabels(){
  const en=transDirection==='en';
  document.getElementById('sourceLabel').textContent=en?'Tiếng Anh':'Tiếng Việt';document.getElementById('targetLabel').textContent=en?'Tiếng Việt':'Tiếng Anh';
  for(const [pane,english] of [['source',en],['target',!en]]){const flag=document.querySelector('.translate-'+pane+' .language-flag');flag.className='language-flag flag-'+(english?'en':'vi');flag.textContent=english?'EN':'VN';}
}
function rememberTranslation(){
  const input=document.getElementById('translateInput');if(input)ui.translationDraft={text:input.value,output:document.getElementById('translateOutput').textContent,direction:transDirection};
}
scheduleTranslation = function(){
  clearTimeout(translationTimer);translationRequest++;rememberTranslation();
  const input=document.getElementById('translateInput');
  if(!input?.value.trim()){document.getElementById('translateOutput').textContent='Bản dịch sẽ xuất hiện tại đây.';rememberTranslation();return;}
  translationTimer=setTimeout(translateText,700);
};
clearTranslation = function(){
  clearTimeout(translationTimer);translationRequest++;document.getElementById('translateInput').value='';document.getElementById('translateOutput').textContent='Bản dịch sẽ xuất hiện tại đây.';updateTranslationCount();rememberTranslation();
};
translateText = async function(){
  const input=document.getElementById('translateInput'),output=document.getElementById('translateOutput'),text=input?.value.trim();if(!text)return;
  const request=++translationRequest,direction=transDirection;output.textContent='Đang dịch…';
  try{const result=await api('/api/translate',{method:'POST',body:JSON.stringify({text,source:direction,target:direction==='en'?'vi':'en'})});if(request===translationRequest&&output.isConnected){output.textContent=result.translatedText||'Không có kết quả.';rememberTranslation();}}
  catch(error){if(request===translationRequest&&output.isConnected){output.textContent='Không thể dịch lúc này. Hãy kiểm tra dịch vụ dịch local.';toast(error.message,true);}}
};
const baseGo=go;
const baseCloseModal=closeModal;
closeModal = function(){ui.pendingDictionarySave=null;baseCloseModal();};
showDictionaryAdd = function(index){const item=state.dictionaryResults[index];if(!item)return;ui.pendingDictionarySave=item.english;showWordModal(0,{...item,examples:[],synonyms:[],antonyms:[],topicId:state.topics[0]?.id||''});};
const baseSaveWord=saveWord;
saveWord = async function(event,id){
  const pending=!id&&ui.pendingDictionarySave;
  await baseSaveWord(event,id);
  if(pending&&modal.hidden){
    ui.pendingDictionarySave=null;
    const created=state.words.find(w=>w.english.toLowerCase()===pending.toLowerCase());
    if(created){await toggleSaved(created.id,true);if(state.view==='dictionary')await lookup(pending);}
  }
};
go = function(name){if(ui.busy)return toast('Đang lưu thao tác, vui lòng đợi một chút.');rememberTranslation();clearTimeout(translationTimer);translationRequest++;dictionaryRequest++;if(name==='vocabulary')state.vocabTab='topics';baseGo(name);window.scrollTo(0,0);};
const baseRefresh=refreshData;
refreshData = async function(rerender=true){await baseRefresh(rerender);await loadActivity();};
// Refresh daily counters when the tab regains focus or crosses local midnight.
let renderedDay=localDay();
setInterval(()=>{if(localDay()!==renderedDay){renderedDay=localDay();loadActivity();}},30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadActivity();});
loadActivity();
