(()=>{
  const $=id=>document.getElementById(id);
  let saveTimer=null;
  const scheduleSave=()=>{clearTimeout(saveTimer);saveTimer=setTimeout(()=>{const b=$('saveBag'),ed=$('page-editor');if(b&&ed&&!ed.classList.contains('hidden'))b.click()},900)};
  const bindAutoSave=()=>{
    document.addEventListener('input',e=>{if(e.target.closest('#page-editor'))scheduleSave()},true);
    document.addEventListener('change',e=>{if(e.target.closest('#page-editor'))scheduleSave()},true);
    document.addEventListener('click',e=>{if(e.target.closest('#addObjective,#addOutput,#addDay,#addHuman,#addMaterial,.danger'))scheduleSave()},true);
    setInterval(()=>{const ed=$('page-editor'),b=$('saveBag');if(ed&&b&&!ed.classList.contains('hidden'))b.click()},5000);
  };
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const controlValue=c=>{
    if(!c)return '';
    if(c.tagName==='SELECT')return Array.from(c.selectedOptions).map(o=>clean(o.textContent)).join(', ');
    if(c.type==='checkbox')return c.checked?'نعم':'لا';
    if(c.type==='file')return c.files?.[0]?.name||'';
    return c.value??'';
  };
  const labelTitle=label=>{const clone=label.cloneNode(true);clone.querySelectorAll('input,textarea,select').forEach(x=>x.remove());return clean(clone.textContent)};
  const exportWorkbook=()=>{
    try{
      if(typeof XLSX==='undefined')throw new Error('مكتبة Excel غير محملة.');
      const ed=$('page-editor');if(!ed)throw new Error('محرر الحقيبة غير موجود.');
      const rows=[['قالب الحقيبة التدريبية - فاب لاب الأحساء'],[]];
      const add=(title,value)=>{if(clean(value)!=='')rows.push([title,String(value)]);};
      // جميع الحقول الأساسية الظاهرة في المحرر
      ed.querySelectorAll(':scope > * label, .form-grid label').forEach(label=>{const c=label.querySelector('input,textarea,select');const t=labelTitle(label);if(t&&c)add(t,controlValue(c))});
      // الأهداف
      const objectives=ed.querySelector('#objectivesList');
      if(objectives){rows.push([],['الأهداف']);objectives.querySelectorAll('.objective-row').forEach(r=>{const n=clean(r.querySelector('b')?.textContent);const v=clean(r.querySelector('span')?.textContent);if(v)rows.push([n+'. الهدف',v])})}
      // الأقسام المتكررة: المخرجات، خطة التنفيذ، الموارد البشرية، المواد، الجاهزية
      const section=(title,selector)=>{
        const root=ed.querySelector(selector);if(!root)return;
        const items=root.querySelectorAll(':scope > .repeat-item, :scope > .readiness-item');if(!items.length)return;
        rows.push([], [title]);
        items.forEach((item,i)=>{
          rows.push([title+' '+(i+1)]);
          item.querySelectorAll('label').forEach(label=>{const c=label.querySelector('input,textarea,select');const t=labelTitle(label);if(t&&c)add(t,controlValue(c))});
          const checks=item.querySelectorAll('input[type="checkbox"]');checks.forEach(c=>{const parent=c.parentElement;if(parent&&!parent.querySelector('label'))add(clean(parent.textContent),c.checked?'نعم':'لا')});
          rows.push([]);
        });
      };
      section('المخرجات وتسليماتها','#outputsList');
      section('خطة التنفيذ','#daysList');
      section('الموارد البشرية','#humanList');
      section('الاحتياجات المادية والتقنية','#materialList');
      section('الجاهزية قبل التنفيذ','#readinessList');
      // المرفقات
      const attachments=ed.querySelector('#attachmentList');
      if(attachments){rows.push([],['المرفقات']);attachments.querySelectorAll('.attachment-card').forEach(card=>{const name=clean(card.querySelector('h4')?.textContent);const file=clean(card.querySelector('.file-name')?.textContent);if(name)rows.push([name,file])})}
      // أي حقول إضافية لم يتم التقاطها: نمر على كل control ونضيفه باسم الـ id/placeholder، حتى لا تضيع أي كتابة مستقبلية.
      const seen=new Set();rows.forEach(r=>{if(r[0])seen.add(clean(r[0]))});
      ed.querySelectorAll('input:not([type="file"]),textarea,select').forEach(c=>{
        if(c.closest('.repeat-item,.readiness-item,.attachment-card,#objectivesList'))return;
        const value=controlValue(c);if(!clean(value))return;
        const label=c.closest('label');const title=label?labelTitle(label):clean(c.getAttribute('aria-label')||c.placeholder||c.name||c.id);
        if(title&&!seen.has(title)){rows.push([title,String(value)]);seen.add(title)}
      });
      const ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=[{wch:38},{wch:70}];ws['!rtl']=true;
      Object.keys(ws).forEach(k=>{if(k[0]==='!')return;ws[k].s={alignment:{wrapText:true,vertical:'top',horizontal:'right'}}});
      const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'قالب الحقيبة');
      const name=clean($('f_name')?.value)||'الحقيبة التدريبية';
      XLSX.writeFile(wb,name.replace(/[\\/:*?"<>|]/g,'-').slice(0,80)+'.xlsx');
      const status=$('exportStatus');if(status)status.textContent='تم تصدير جميع البيانات المدخلة.';
    }catch(err){console.error(err);const status=$('exportStatus');if(status)status.textContent='تعذر التصدير: '+(err?.message||err)}
  };
  const bind=()=>{const b=$('exportExcel');if(b)b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();exportWorkbook()},true)};
  const start=()=>{bindAutoSave();bind()};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
