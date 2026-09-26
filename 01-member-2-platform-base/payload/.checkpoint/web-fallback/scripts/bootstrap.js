document.addEventListener('click',event=>{const nav=event.target.closest('[data-view]');if(nav){if(nav.dataset.view==='vocabulary'){state.studyTopicId='';state.vocabTab='topics'}go(nav.dataset.view)}if(event.target.closest('[data-close-modal]'))closeModal()});
document.getElementById('globalSearch').addEventListener('keydown',event=>{if(event.key==='Enter'){const q=event.target.value.trim();go('dictionary');setTimeout(()=>lookup(q),0)}});
document.getElementById('importFile').addEventListener('change',event=>{importData(event.target.files[0]);event.target.value=''})
window.addEventListener('hashchange',()=>{const name=location.hash.slice(1);if(name&&name!==state.view)go(name)});
state.view=location.hash.slice(1)||'dashboard';hydrate();

