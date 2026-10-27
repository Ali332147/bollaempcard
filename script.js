const sampleEmployees = [
 {id:'3309',name:'Jaber Ali',initials:'JA',role:'Store Associate',store:'Bolla Store 01',phone:'(555) 010-3309',email:'jaber.ali@example.com',member:'Team Member',yearJoined:'2022',picture:''},
 {id:'1048',name:'Amina Rahman',initials:'AR',role:'Customer Service',store:'Bolla Store 02',phone:'(555) 010-1048',email:'amina.rahman@example.com',member:'Team Member',yearJoined:'2023',picture:''},
 {id:'2176',name:'Daniel Brooks',initials:'DB',role:'Shift Supervisor',store:'Bolla Store 03',phone:'(555) 010-2176',email:'daniel.brooks@example.com',member:'Supervisor',yearJoined:'2021',picture:''},
 {id:'5621',name:'Sara Ahmed',initials:'SA',role:'Cashier',store:'Bolla Store 01',phone:'(555) 010-5621',email:'',member:'Team Member',yearJoined:'2024',picture:''},
 {id:'4830',name:'Michael Torres',initials:'MT',role:'Stock Associate',store:'Bolla Store 04',phone:'(555) 010-4830',email:'michael.torres@example.com',member:'Team Member',yearJoined:'2022',picture:''},
 {id:'6914',name:'Nadia Chowdhury',initials:'NC',role:'Department Lead',store:'Bolla Store 02',phone:'(555) 010-6914',email:'nadia.chowdhury@example.com',member:'Manager',yearJoined:'2020',picture:''}
];

const STORAGE_KEY = 'bollaEmployeeProfiles_v2';
function loadEmployees(){
 try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved){ const parsed=JSON.parse(saved); if(Array.isArray(parsed)) return parsed; }
 } catch(err) { console.warn('Could not load saved employee profiles', err); }
 return sampleEmployees;
}
let employees = loadEmployees();
function saveEmployees(){
 try { localStorage.setItem(STORAGE_KEY, JSON.stringify(employees)); }
 catch(err) { alert('Could not save profiles in this browser. Try a smaller photo or clear some browser storage.'); }
}
let selectedEmployee=null, pendingPicture='';
const cards=document.getElementById('cards'), addModal=document.getElementById('modal'), accessModal=document.getElementById('accessModal'), detail=document.getElementById('detail');
const form=document.getElementById('employeeForm'), fileInput=document.getElementById('employeePicture');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initialsFor=name=>name.trim().split(/\s+/).slice(0,2).map(s=>s[0]?.toUpperCase()||'').join('')||'EM';
const todayISO=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const normalizeJoinDate=value=>{const v=String(value||'').trim();if(/^\d{4}$/.test(v))return `${v}-01-01`;if(/^\d{2}\/\d{2}\/\d{4}$/.test(v)){const [m,d,y]=v.split('/');return `${y}-${m}-${d}`;}return /^\d{4}-\d{2}-\d{2}$/.test(v)?v:todayISO();};
const displayJoinDate=value=>{const iso=normalizeJoinDate(value);const [y,m,d]=iso.split('-');return `${m}/${d}/${y}`;};
function photoMarkup(e){return e.picture?`<div class="card-photo"><img src="${e.picture}" alt="${esc(e.name)}"></div>`:`<div class="card-photo"><span class="photo-initials">${esc(e.initials)}</span></div>`;}
function render(list=employees){
 cards.innerHTML='';
 if(!list.length){cards.innerHTML='<div class="empty">No matching employees. Try another search.</div>';return;}
 list.forEach((e,i)=>{
  const card=document.createElement('article');card.className='employee-card';card.dataset.employeeId=String(e.id);card.style.animationDelay=(i*45)+'ms';
  card.innerHTML=`<div class="card-head">${photoMarkup(e)}<div class="name-area"><h3>${esc(e.name)}</h3><p>${esc(e.member)}</p></div><span class="id-chip">ID • ${esc(e.id)}</span></div><div class="card-rule"></div><div class="info-row"><span>Store Name</span><strong class="masked">${esc(e.store)}</strong></div><div class="info-row"><span>Joined</span><strong class="masked">${esc(displayJoinDate(e.yearJoined))}</strong></div><div class="card-bottom"><span class="status-pill"><span></span> ACTIVE</span><button class="view-btn" type="button">View profile <span>↗</span></button></div>`;
  card.querySelector('.view-btn').addEventListener('click',ev=>{ev.stopPropagation();openAccess(e);});
  card.addEventListener('click',()=>openAccess(e));cards.appendChild(card);
 });
}
function openAccess(e){selectedEmployee=e;document.getElementById('password').value='';document.getElementById('error').textContent='';accessModal.classList.add('open');accessModal.setAttribute('aria-hidden','false');}
function closeAccess(){accessModal.classList.remove('open');accessModal.setAttribute('aria-hidden','true');}
function closeAdd(){addModal.classList.remove('open');addModal.setAttribute('aria-hidden','true');}
document.getElementById('addCardBtn').addEventListener('click',openAddForm);
document.getElementById('close').addEventListener('click',closeAdd);
document.getElementById('cancelAdd').addEventListener('click',closeAdd);
addModal.addEventListener('click',e=>{if(e.target===addModal)closeAdd();});
document.getElementById('accessClose').addEventListener('click',closeAccess);
accessModal.addEventListener('click',e=>{if(e.target===accessModal)closeAccess();});
document.getElementById('unlockForm').addEventListener('submit',e=>{
 e.preventDefault();
 if(document.getElementById('password').value==='2695'){
  closeAccess();
  if(selectedEmployee){
   const openedCard = Array.from(cards.querySelectorAll('.employee-card')).find(card => card.dataset.employeeId === String(selectedEmployee.id));
   if(openedCard) openedCard.classList.add('password-unlocked');
  }
  showDetails(selectedEmployee);
}
 else document.getElementById('error').textContent='Incorrect password. Please try again.';
});
function showDetails(e){
 if(!e)return;
 const av=document.getElementById('detailAvatar');
 av.innerHTML=e.picture?`<img src="${e.picture}" alt="${esc(e.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`:esc(e.initials);
 document.getElementById('detailName').textContent=e.name;document.getElementById('detailRole').textContent=e.member;
 const rows=[['Employee ID',e.id],['Store Name',e.store],['Phone',e.phone],['Email',e.email||'Not provided'],['Member',e.member],['Joined',displayJoinDate(e.yearJoined)]];
 document.getElementById('detailGrid').innerHTML=rows.map(r=>`<div class="detail-item"><span>${esc(r[0])}</span><strong>${esc(r[1])}</strong></div>`).join('');
 detail.classList.add('open');detail.setAttribute('aria-hidden','false');
}
function closeDetail(){detail.classList.remove('open');detail.setAttribute('aria-hidden','true');}
document.getElementById('detailClose').addEventListener('click',closeDetail);detail.addEventListener('click',e=>{if(e.target===detail)closeDetail();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeAdd();closeAccess();closeDetail();}});
document.getElementById('search').addEventListener('input',e=>{
 const q=e.target.value.trim().toLowerCase();render(employees.filter(x=>[x.name,x.id,x.store,x.phone,x.email,x.member].some(v=>String(v||'').toLowerCase().includes(q))));
});
function resetForm(){
 form.reset();pendingPicture='';document.getElementById('yearJoined').value=todayISO();document.getElementById('formError').textContent='';
 document.getElementById('photoPreviewImg').hidden=true;document.getElementById('photoPreviewImg').removeAttribute('src');document.querySelector('.photo-placeholder').hidden=false;
}
function openAddForm(){editingEmployeeId=null;resetForm();document.getElementById('modalTitle').textContent='Add Employee Card';const sb=form.querySelector('button[type="submit"]');if(sb)sb.textContent='＋ Add Employee Card';addModal.classList.add('open');addModal.setAttribute('aria-hidden','false');setTimeout(()=>document.getElementById('fullName').focus(),50);}
fileInput.addEventListener('change',()=>{
 const file=fileInput.files&&fileInput.files[0];if(!file)return;
 if(!['image/jpeg','image/png','image/webp'].includes(file.type)){document.getElementById('formError').textContent='Please upload a JPG, PNG or WEBP image.';fileInput.value='';return;}
 if(file.size>4*1024*1024){document.getElementById('formError').textContent='Picture must be 4 MB or smaller.';fileInput.value='';return;}
 const reader=new FileReader();reader.onload=()=>{pendingPicture=String(reader.result);const img=document.getElementById('photoPreviewImg');img.src=pendingPicture;img.hidden=false;document.querySelector('.photo-placeholder').hidden=true;document.getElementById('formError').textContent='';};reader.readAsDataURL(file);
});
form.addEventListener('submit',e=>{
 e.preventDefault();
 const name=document.getElementById('fullName').value.trim(),id=document.getElementById('empId').value.trim(),store=document.getElementById('storeName').value.trim(),phone=document.getElementById('phone').value.trim(),email=document.getElementById('email').value.trim(),member=document.getElementById('member').value,error=document.getElementById('formError');
 if(!name||!id||!store||!phone||!member){error.textContent='Please complete all required fields.';return;}
 if(editingEmployeeId !== null){
  const duplicateId=employees.some(x=>String(x.id).trim().toLowerCase()===id.trim().toLowerCase() && String(x.id)!==editingEmployeeId);
  if(duplicateId){error.textContent='This Employee ID already exists. Please use a unique ID.';return;}
  const duplicateName=employees.some(x=>String(x.name).trim().toLowerCase()===name.trim().toLowerCase() && String(x.id)!==editingEmployeeId);
  if(duplicateName){error.textContent='This employee name already exists. Please use a unique name.';return;}
  const index=employees.findIndex(x=>String(x.id)===editingEmployeeId);
  if(index<0){error.textContent='Employee could not be found.';return;}
  const old=employees[index];
  employees[index]={...old,id,name,initials:initialsFor(name),role:member,store,phone,email,member,yearJoined:normalizeJoinDate(document.getElementById('yearJoined').value),picture:pendingPicture};
  saveEmployees();
  selectedEmployee=employees[index];
  editingEmployeeId=null;
  document.getElementById('search').value='';
  render(employees);closeAdd();resetForm();
  document.getElementById('modalTitle').textContent='Add Employee Card';
  const sb=form.querySelector('button[type="submit"]');if(sb)sb.textContent='＋ Add Employee Card';
  showDetails(selectedEmployee);
  return;
 }

 if(employees.some(x=>String(x.id).trim().toLowerCase()===id.trim().toLowerCase())){error.textContent='This Employee ID already exists. Please use a unique ID.';return;}
  if(employees.some(x=>String(x.name).trim().toLowerCase()===name.trim().toLowerCase())){error.textContent='This employee name already exists. Please use a unique name.';return;}
 employees.push({id,name,initials:initialsFor(name),role:member,store,phone,email,member,yearJoined:normalizeJoinDate(document.getElementById('yearJoined').value),picture:pendingPicture});
  saveEmployees();
 document.getElementById('search').value='';render(employees);closeAdd();resetForm();
});
document.getElementById('yearJoined').value=todayISO();
render();


/* Edit employee profile after successful password verification */
let editingEmployeeId = null;
const editEmployeeBtn = document.getElementById('editEmployeeBtn');
if (editEmployeeBtn) {
 editEmployeeBtn.addEventListener('click', () => {
  if (!selectedEmployee) return;
  editingEmployeeId = String(selectedEmployee.id);
  const emp = selectedEmployee;
  document.getElementById('fullName').value = emp.name || '';
  document.getElementById('empId').value = emp.id || '';
  document.getElementById('storeName').value = emp.store || '';
  document.getElementById('phone').value = emp.phone || '';
  document.getElementById('email').value = emp.email || '';
  document.getElementById('member').value = emp.member || '';
  document.getElementById('yearJoined').value = normalizeJoinDate(emp.yearJoined);
  pendingPicture = emp.picture || '';
  const img = document.getElementById('photoPreviewImg');
  const placeholder = document.querySelector('.photo-placeholder');
  if (pendingPicture) { img.src=pendingPicture; img.hidden=false; if(placeholder)placeholder.hidden=true; }
  else { img.hidden=true; img.removeAttribute('src'); if(placeholder)placeholder.hidden=false; }
  closeDetail();
  document.getElementById('modalTitle').textContent='Edit Employee Card';
  const submitBtn=form.querySelector('button[type="submit"]');
  if(submitBtn)submitBtn.textContent='Save Changes';
  addModal.classList.add('open'); addModal.setAttribute('aria-hidden','false');
  document.getElementById('formError').textContent='';
 });
}


/* Delete employee profile with explicit confirmation */
const deleteEmployeeBtn = document.getElementById('deleteEmployeeBtn');
if (deleteEmployeeBtn) {
 deleteEmployeeBtn.addEventListener('click', () => {
  if (!selectedEmployee) return;
  const employeeName = selectedEmployee.name || 'this employee';
  if (!window.confirm(`Delete ${employeeName}'s employee card? This cannot be undone.`)) return;
  employees = employees.filter(emp => String(emp.id) !== String(selectedEmployee.id));
  saveEmployees();
  selectedEmployee = null;
  closeDetail();
  document.getElementById('search').value = '';
  render(employees);
 });
}
