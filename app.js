const CONFIG = {
  SUPABASE_URL: 'https://kuuwmzqbzgzfetbpnlsl.supabase.co',
  SUPABASE_KEY: 'PASTE_SUPABASE_PUBLISHABLE_KEY_HERE'
};

const $ = (id) => document.getElementById(id);
let db = null;
let currentUser = null;
let signUpMode = false;

function toast(message, type='ok') {
  const el = $('toast');
  el.textContent = message;
  el.className = `toast show ${type}`;
  setTimeout(() => el.className = 'toast', 2600);
}
function showAuthMessage(message, error=false) {
  $('authMessage').textContent = message;
  $('authMessage').style.color = error ? '#c04b4b' : '#4f7b5c';
}
function setAuthMode() {
  $('authSubmit').textContent = signUpMode ? 'إنشاء الحساب' : 'تسجيل الدخول';
  $('toggleAuth').textContent = signUpMode ? 'لديك حساب؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب';
  showAuthMessage('');
}
function setPage(page) {
  document.querySelectorAll('.page').forEach(x => x.classList.add('hidden'));
  $(`page-${page}`).classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(x => x.classList.toggle('active', x.dataset.page === page));
  $('pageTitle').textContent = ({dashboard:'الرئيسية',bags:'حقائبي',create:'إنشاء حقيبة',manager:'إدارة الحقائب'})[page] || 'الرئيسية';
  if (page === 'bags') loadBags();
  if (page === 'manager') loadManagerBags();
}

document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => setPage(btn.dataset.page)));
document.querySelectorAll('[data-page-jump]').forEach(btn => btn.addEventListener('click', () => setPage(btn.dataset.pageJump)));
$('newBagTop').addEventListener('click', () => setPage('create'));
$('startBag').addEventListener('click', () => setPage('create'));
$('newBagList').addEventListener('click', () => setPage('create'));
$('cancelCreate').addEventListener('click', () => setPage('dashboard'));
$('toggleAuth').addEventListener('click', () => { signUpMode = !signUpMode; setAuthMode(); });

async function init() {
  if (!window.supabase) return showAuthMessage('تعذر تحميل مكتبة الاتصال.', true);
  if (CONFIG.SUPABASE_KEY.includes('PASTE_')) {
    showAuthMessage('واجهة الموقع جاهزة. بقي ربط مفتاح Supabase في ملف الإعدادات.', true);
    return;
  }
  db = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
  const { data } = await db.auth.getSession();
  if (data.session) await boot(data.session.user);
}

$('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!db) return showAuthMessage('لم يتم ربط Supabase بعد.', true);
  const email = $('email').value.trim();
  const password = $('password').value;
  $('authSubmit').disabled = true;
  try {
    const result = signUpMode
      ? await db.auth.signUp({ email, password })
      : await db.auth.signInWithPassword({ email, password });
    if (result.error) throw result.error;
    if (signUpMode && !result.data.session) showAuthMessage('تم إنشاء الحساب. افتح رسالة تأكيد البريد ثم سجّل الدخول.');
    else await boot(result.data.user);
  } catch (err) { showAuthMessage(err.message || 'حدث خطأ غير متوقع', true); }
  finally { $('authSubmit').disabled = false; }
});

$('logoutBtn').addEventListener('click', async () => {
  if (db) await db.auth.signOut();
  location.reload();
});

async function boot(user) {
  currentUser = user;
  $('authView').classList.add('hidden');
  $('appView').classList.remove('hidden');
  $('userName').textContent = user.email || 'المستخدم';
  await loadProfile(user);
  await loadDepartments();
  await loadBags();
  setPage('dashboard');
}

async function loadProfile(user) {
  const { data } = await db.from('profiles').select('full_name,role').eq('id', user.id).maybeSingle();
  if (data?.full_name) $('userName').textContent = data.full_name;
  if (data?.role === 'project_manager') document.querySelector('.manager-only').classList.remove('hidden');
}
async function loadDepartments() {
  const select = $('department');
  const { data, error } = await db.from('departments').select('id,name').eq('is_active', true).order('name');
  if (error) return toast('تعذر تحميل الأقسام', 'error');
  select.innerHTML = '<option value="">اختر القسم</option>' + (data || []).map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('');
}
async function loadBags() {
  const { data, error } = await db.from('training_bags').select('id,name,status,completion_percent,updated_at').order('updated_at',{ascending:false});
  if (error) return;
  const bags = data || [];
  renderBags($('allBags'), bags);
  renderBags($('recentBags'), bags.slice(0,5));
  $('bagCount').textContent = bags.length;
  $('draftCount').textContent = bags.filter(b=>b.status==='draft').length;
  $('reviewCount').textContent = bags.filter(b=>b.status==='review').length;
  $('doneCount').textContent = bags.filter(b=>Number(b.completion_percent||0)>=100).length;
  $('avgProgress').textContent = `${bags.length ? Math.round(bags.reduce((s,b)=>s+Number(b.completion_percent||0),0)/bags.length) : 0}%`;
}
async function loadManagerBags() {
  const { data, error } = await db.from('training_bags').select('id,name,status,completion_percent,updated_at').order('updated_at',{ascending:false});
  if (error) return $('managerBags').textContent = 'تعذر تحميل الحقائب.';
  renderBags($('managerBags'), data || []);
}
function renderBags(container,bags) {
  if (!bags.length) { container.className='bag-list empty'; container.textContent='لا توجد حقائب حتى الآن.'; return; }
  container.className='bag-list';
  container.innerHTML=bags.map(b=>`<div class="bag-row"><div class="bag-info"><strong>${escapeHtml(b.name)}</strong><span>آخر تحديث: ${formatDate(b.updated_at)}</span></div><div class="bag-meta"><span class="badge">${statusText(b.status)}</span><div><div class="progress-mini"><span style="width:${Math.min(100,Number(b.completion_percent||0))}%"></span></div><small>${Math.round(Number(b.completion_percent||0))}%</small></div></div></div>`).join('');
}
$('bagForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  if (!db || !currentUser) return toast('لم يتم الاتصال بقاعدة البيانات.', 'error');
  const payload={name:$('bagName').value.trim(),department_id:$('department').value,owner_id:currentUser.id,status:$('status').value,completion_percent:0};
  if(!payload.name||!payload.department_id) return toast('عبّ البيانات المطلوبة أولاً','error');
  const {error}=await db.from('training_bags').insert(payload);
  if(error) return toast(error.message||'تعذر حفظ الحقيبة','error');
  $('bagForm').reset(); toast('تم حفظ الحقيبة بنجاح'); await loadBags(); setPage('bags');
});
function statusText(status){return status==='review'?'قيد المراجعة':status==='completed'?'مكتملة':'مسودة';}
function formatDate(v){try{return new Intl.DateTimeFormat('ar-SA',{dateStyle:'medium'}).format(new Date(v));}catch{return '';}}
function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

init();
