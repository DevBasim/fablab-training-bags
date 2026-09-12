from pathlib import Path
import re
p=Path('index.html');s=p.read_text(encoding='utf-8')
auth='''<section id="authView" class="auth-shell"><div class="auth-card"><div class="brand-mark">FL</div><span class="eyebrow">فاب لاب الأحساء</span><h1>نظام الحقائب التدريبية</h1><p class="muted">اكتب بريدك الإلكتروني للدخول مباشرة إلى النظام.</p><form id="authForm"><label>البريد الإلكتروني<input id="email" type="email" required placeholder="name@fablab.sa" autocomplete="email"></label><button class="primary wide" id="authSubmit">دخول للنظام</button></form><button class="link-btn" id="managerLoginToggle" type="button">دخول مديرة المشاريع</button><form id="managerAuthForm" class="hidden" style="margin-top:14px"><label>البريد الإلكتروني<input id="managerEmail" type="email" placeholder="إيميل المديرة"></label><label>كلمة المرور<input id="managerPassword" type="password" placeholder="كلمة المرور"></label><button class="secondary wide" type="submit">دخول الإدارة</button></form><div id="authMessage" class="form-message"></div></div></section>'''
s=re.sub(r'<section id="authView".*?</section>',auth,s,count=1,flags=re.S)
needle="document.getElementById('authForm').onsubmit=async e=>{"
insert="""document.getElementById('managerLoginToggle').onclick=()=>document.getElementById('managerAuthForm').classList.toggle('hidden');
document.getElementById('managerAuthForm').onsubmit=async e=>{e.preventDefault();try{const r=await db.auth.signInWithPassword({email:document.getElementById('managerEmail').value.trim(),password:document.getElementById('managerPassword').value});if(r.error)throw r.error;await boot(r.data.user)}catch(err){authMsg(err.message||'بيانات دخول الإدارة غير صحيحة',true)}};
"""
if needle not in s:raise SystemExit('login hook not found')
s=s.replace(needle,insert+needle,1)
p.write_text(s,encoding='utf-8')
