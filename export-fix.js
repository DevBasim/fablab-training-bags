(()=>{
  const $=id=>document.getElementById(id);
  let saveTimer=null;
  let silentUntil=0;
  const silenceToast=()=>{const e=$('toast');if(e){e.textContent='';e.className='toast';}};
  const originalToast=window.toast;
  if(typeof originalToast==='function')window.toast=(m,type='ok')=>{if(Date.now()<silentUntil){silenceToast();return;}return originalToast(m,type);};
  const silentSave=()=>{const b=$('saveBag'),ed=$('page-editor');if(!b||!ed||ed.classList.contains('hidden'))return;silentUntil=Date.now()+10000;b.click();silenceToast();setTimeout(silenceToast,50);setTimeout(silenceToast,300);setTimeout(silenceToast,1000);};
  const scheduleSave=()=>{clearTimeout(saveTimer);saveTimer=setTimeout(silentSave,900);};
  const bindAutoSave=()=>{
    document.addEventListener('input',e=>{if(e.target.closest('#page-editor'))scheduleSave();},true);
    document.addEventListener('change',e=>{if(e.target.closest('#page-editor'))scheduleSave();},true);
    document.addEventListener('click',e=>{if(e.target.closest('#addObjective,#addOutput,#addDay,#addHuman,#addMaterial,.danger'))scheduleSave();},true);
    setInterval(silentSave,5000);
  };
  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  const valueOf=c=>{if(!c)return '';if(c.tagName==='SELECT')return Array.from(c.selectedOptions).map(o=>clean(o.textContent)).join(', ');if(c.type==='checkbox')return c.checked?'نعم':'';if(c.type==='file')return c.files?.[0]?.name||'';return c.value??'';};
  const labelTitle=label=>{const clone=label.cloneNode(true);clone.querySelectorAll('input,textarea,select,button').forEach(x=>x.remove());return clean(clone.textContent);};
  const exportWorkbook=()=>{
    try{
      if(typeof XLSX==='undefined')throw new Error('مكتبة Excel غير محملة.');
      const ed=$('page-editor');if(!ed)throw new Error('محرر الحقيبة غير موجود.');
      const rows=[['قالب الحقيبة التدريبية - فاب لاب الأحساء'],[]];
      const add=(title,value)=>{if(clean(value)!=='')rows.push([title,String(value)]);};
      ed.querySelectorAll('label').forEach(label=>{const c=label.querySelector('input,textarea,select');const t=labelTitle(label);if(c&&t)add(t,valueOf(c));});
      let appState={};try{appState=(typeof state!=='undefined'&&state)||{};}catch(_){appState={};}
      if(Array.isArray(appState.objectives)&&appState.objectives.length){rows.push([],['الأهداف']);appState.objectives.forEach((o,i)=>{if(clean(o?.text))rows.push([`الهدف ${i+1}`,clean(o.text)]);});}
      const section=(title,items)=>{
        if(!Array.isArray(items)||!items.length)return;
        rows.push([],[title]);
        items.forEach((item,i)=>{
          rows.push([`${title} ${i+1}`]);
          Object.entries(item||{}).forEach(([key,val])=>{
            if(['id','bag_id','created_at','updated_at'].includes(key))return;
            if(key==='is_ready'){
              if(val===true)rows.push(['الجاهزية','نعم']);
              return;
            }
            if(key==='measurement'&&val&&typeof val==='object'){Object.entries(val).forEach(([mk,mv])=>{if(clean(mv))rows.push([mk,clean(mv)]);});return;}
            if(Array.isArray(val)){if(val.length)rows.push([key,val.map(x=>typeof x==='object'?JSON.stringify(x):x).join(', ')]);return;}
            if(val!==null&&val!==undefined&&val!==false&&clean(val)!=='')rows.push([key,typeof val==='object'?JSON.stringify(val):String(val)]);
          });
          rows.push([]);
        });
      };
      section('المخرجات وتسليماتها',appState.outputs);
      section('خطة التنفيذ',appState.days);
      section('الموارد البشرية',appState.human);
      section('الاحتياجات المادية والتقنية',appState.material);
      section('الجاهزية قبل التنفيذ',appState.readiness);
      const attachmentEntries=Object.entries(appState.attachments||{}).filter(([,f])=>f);
      if(attachmentEntries.length){rows.push([],['المرفقات']);attachmentEntries.forEach(([key,f])=>rows.push([key,f?.name||String(f)]));}
      const ws=XLSX.utils.aoa_to_sheet(rows);
      ws['!cols']=[{wch:42},{wch:75}];
      ws['!rtl']=true;
      Object.keys(ws).forEach(k=>{if(k[0]!=='!')ws[k].s={alignment:{wrapText:true,vertical:'top',horizontal:'right'}};});
      const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'قالب الحقيبة');
      const safeName=clean($('f_name')?.value||'الحقيبة التدريبية').replace(/[\\/:*?"<>|]/g,'-').slice(0,80);
      const data=XLSX.write(wb,{bookType:'xlsx',type:'array'});
      const blob=new Blob([data],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=safeName+'.xlsx';a.style.display='none';document.body.appendChild(a);a.click();
      setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},1000);
      const status=$('exportStatus');if(status)status.textContent='تم تصدير جميع البيانات المدخلة.';
    }catch(err){console.error(err);const status=$('exportStatus');if(status)status.textContent='تعذر التصدير: '+(err?.message||err);}
  };
  const bind=()=>{const b=$('exportExcel');if(b)b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();exportWorkbook();},true);};
  const start=()=>{bindAutoSave();bind();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();