(()=>{
  const $=id=>document.getElementById(id);
  const mobileStyle=document.createElement('style');
  mobileStyle.textContent=`@media (hover:none) and (pointer:coarse){html,body{width:100%!important;max-width:100%!important;overflow-x:hidden!important}.app-shell{padding-bottom:76px!important}.sidebar{position:fixed!important;z-index:100!important;left:0!important;right:0!important;top:auto!important;bottom:0!important;width:100%!important;height:68px!important;padding:6px 8px!important;background:#111827!important;border-top:1px solid #283245!important;border-radius:18px 18px 0 0!important;display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important}.sidebar-brand{display:none!important}.sidebar nav{width:100%!important;display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:4px!important;align-items:stretch!important}.nav-item{min-width:0!important;width:auto!important;height:54px!important;padding:5px 2px!important;margin:0!important;border-radius:12px!important;font-size:10px!important;text-align:center!important;display:flex!important;align-items:center!important;justify-content:center!important;color:#aeb7c8!important;white-space:nowrap!important}.nav-item:before{display:none!important}.nav-item.active{background:#202a3c!important;color:#fff!important}.sidebar-bottom{margin:0!important;padding:0!important;border:0!important;display:block!important}.sidebar-bottom span{display:none!important}.logout{position:absolute!important;right:4px!important;top:-58px!important;width:44px!important;height:44px!important;border-radius:12px!important;background:#202a3c!important;color:#c8cfdd!important;font-size:0!important;padding:0!important}.logout:after{content:'↪'!important;font-size:18px!important}.main-content{margin:0!important;width:100%!important;min-width:0!important;padding:16px 12px 90px!important}.topbar{margin-bottom:15px!important}.topbar h2{font-size:22px!important}.topbar .primary{display:none!important}.hero{display:block!important;width:100%!important;padding:20px 17px!important;border-radius:18px!important}.hero h3{font-size:21px!important;line-height:1.55!important}.hero p{font-size:12px!important;line-height:1.9!important}.hero .primary{width:100%!important}.hero-stat{display:none!important}.stats-grid{grid-template-columns:1fr 1fr!important;gap:9px!important}.stat-card{padding:14px!important}.stat-card strong{font-size:22px!important}.section-card{padding:15px!important;border-radius:15px!important}.section-head,.section-title{align-items:flex-start!important;flex-direction:column!important;gap:10px!important}.section-head button,.section-title button{width:100%!important}.editor-layout{display:block!important}.section-nav{position:sticky!important;top:8px!important;z-index:20!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:5px!important;padding:7px!important;margin-bottom:12px!important}.section-tab{height:44px!important;padding:6px 8px!important;font-size:11px!important;margin:0!important;justify-content:flex-start!important}.section-tab b{width:25px!important;height:25px!important}.editor-head{align-items:stretch!important;flex-direction:column!important}.editor-actions{width:100%!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important}.editor-actions .progress-pill{grid-column:1/-1!important;text-align:center!important}.editor-actions button{width:100%!important}.form-grid,.item-grid,.readiness-grid,.attachment-grid{grid-template-columns:1fr!important}.form-grid .full,.item-grid .full{grid-column:auto!important}.inline-add{grid-template-columns:1fr!important}.inline-add button{width:100%!important}.repeat-item{padding:12px!important}.bag-row{align-items:flex-start!important;flex-direction:column!important;padding:12px!important}.bag-meta{width:100%!important;justify-content:space-between!important;gap:8px!important;flex-wrap:wrap!important}.progress-mini{width:80px!important}.export-card{padding:30px 12px!important}.export-card .primary{width:100%!important}.auth-card{max-width:calc(100vw - 32px)!important;padding:28px 20px!important}}`;
  document.head.appendChild(mobileStyle);
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
      ws['!cols']=[{wch:42},{wch:75}];ws['!rtl']=true;
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