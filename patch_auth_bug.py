from pathlib import Path
p=Path('app.js')
s=p.read_text(encoding='utf-8')
old="$('toggleAuth').onclick=()=>{signUpMode=!signUpMode;$('authSubmit').textContent=signUpMode?'إنشاء الحساب':'تسجيل الدخول';$('toggleAuth').textContent=signUpMode?'لديك حساب؟ تسجيل الدخول':'ليس لديك حساب؟ إنشاء حساب';authMsg('')};\n$('authForm').onsubmit=async e=>{e.preventDefault();$('authSubmit').disabled=true;try{const email=val('email'),password=$('password').value;const r=signUpMode?await db.auth.signUp({email,password}):await db.auth.signInWithPassword({email,password});if(r.error)throw r.error;if(signUpMode&&!r.data.session)authMsg('تم إنشاء الحساب. تحقق من بريدك الإلكتروني ثم سجّل الدخول.');else await boot(r.data.user)}catch(err){authMsg(err.message||'حدث خطأ',true)}finally{$('authSubmit').disabled=false}};"
if old not in s: raise SystemExit('old auth block not found')
s=s.replace(old,"",1)
p.write_text(s,encoding='utf-8')
