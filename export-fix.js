(()=>{
  const $=id=>document.getElementById(id);
  let saveTimer=null;
  let silentUntil=0;

  const hideToast=()=>{
    const t=$('toast');
    if(t){t.textContent='';t.className='toast';}
  };
  const silentSave=()=>{
    const b=$('saveBag'),ed=$('page-editor');
    if(!b||!ed||ed.classList.contains('hidden'))return;
    silentUntil=Date.now()+3500;
    hideToast();
    b.click();
    hideToast();
    setTimeout(hideToast,50);
    setTimeout(hideToast,500);
    setTimeout(hideToast,1500);
    setTimeout(hideToast,3000);
  };
  const scheduleSave=()=>{
    clearTimeout(saveTimer);
    saveTimer=setTimeout(silentSave,900);
  };

  const bindAutoSave=()=>{
    document.addEventListener('input',e=>{if(e.target.closest('#page-editor'))scheduleSave();},true);
    document.addEventListener('change',e=>{if(e.target.closest('#page-editor'))scheduleSave();},true);
    document.addEventListener('click',e=>{
      if(e.target.closest('#addObjective,#addOutput,#addDay,#addHuman,#addMaterial,.danger'))scheduleSave();
    },true);
    setInterval(silentSave,5000);

    const t=$('toast');
    if(t){
      const observer=new MutationObserver(()=>{if(Date.now()<silentUntil)hideToast();});
      observer.observe(t,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
    }
  };

  const clean=s=>String(s??'').replace(/\s+/g,' ').trim();
  const controlValue=c=>{
    if(!c)return '';
    if(c.tagName==='SELECT')return Array.from(c.selectedOptions).map(o=>clean(o.textContent)).join(', ');
    if(c.type==='checkbox')return c.checked?'نعم':'لا';
    if(c.type==='file')return c.files?.[0]?.name||'';
    return c.value??'';
  };
  const labelTitle=label=>{
    const clone=label.cloneNode(true);
    clone.querySelectorAll('input,textarea,select,button').forEach(x=>x.remove());
    return clean(clone.textContent);
  };

  const exportWorkbook=()=>{
    try{
      if(typeof XLSX==='undefined')throw new Error('مكتبة Excel غير محملة.');
      const ed=$('page-editor');
      if(!ed)throw new Error('محرر الحقيبة غير موجود.');

      const rows=[['قالب الحقيبة التدريبية - فاب لاب الأحساء'],[]];
      const add=(title,value)=>{const v=String(value??'').trim();if(v)rows.push([title,v]);};

      // كل الحقول الأساسية في النموذج.
      const basicSeen=new Set();
      ed.querySelectorAll('label').forEach(label=>{
        if(label.closest('.repeat-item,.readiness-item,.attachment-card,#objectivesList'))return;
        const c=label.querySelector('input,textarea,select');
        const title=labelTitle(label);
        if(c&&title){add(title,controlValue(c));basicSeen.add(c);}
      });

      // الأهداف.
      const objectives=ed.querySelector('#objectivesList');
      if(objectives){
        const items=objectives.querySelectorAll('.objective-row');
        if(items.length){
          rows.push([],['الأهداف']);
          items.forEach((r,i)=>{const v=clean(r.querySelector('span')?.textContent);if(v)rows.push(['الهدف '+(i+1),v]);});
        }
      }

      // جميع الأقسام المتكررة مع كل الحقول داخل كل عنصر.
      const section=(title,selector)=>{
        const root=ed.querySelector(selector);if(!root)return;
        const items=root.querySelectorAll(':scope > .repeat-item, :scope > .readiness-item');
        if(!items.length)return;
        rows.push([], [title]);
        items.forEach((item,i)=>{
          rows.push([title+' '+(i+1)]);
          item.querySelectorAll('label').forEach(label=>{
            const c=label.querySelector('input,textarea,select');
            const t=labelTitle(label);
            if(c&&t)add(t,controlValue(c));
          });
          item.querySelectorAll('input[type="checkbox"]').forEach(c=>{
            const parent=c.parentElement;
            const text=clean(parent?.textContent||'');
            if(text)add(text,c.checked?'نعم':'لا');
          });
          rows.push([]);
        });
      };
      section('المخرجات وتسليماتها','#outputsList');
      section('خطة التنفيذ','#daysList');
      section('الموارد البشرية','#humanList');
      section('الاحتياجات المادية والتقنية','#materialList');
      section('الجاهزية قبل التنفيذ','#readinessList');

      // المرفقات.
      const attachments=ed.querySelector('#attachmentList');
      if(attachments){
        const cards=attachments.querySelectorAll('.attachment-card');
        if(cards.length){
          rows.push([],['المرفقات']);
          cards.forEach(card=>{
            const name=clean(card.querySelector('h4')?.textContent);
            const file=clean(card.querySelector('.file-name')?.textContent);
            if(name)rows.push([name,file]);
          });
        }
      }

      // حماية إضافية: أي control مكتوب لم يلتقطه القسم السابق يضاف تلقائياً.
      const seenTitles=new Set();
      rows.forEach(r=>{if(r[0])seenTitles.add(clean(r[0]));});
      ed.querySelectorAll('input,textarea,select').forEach(c=>{
        if(c.type==='file'||c.closest('.repeat-item,.readiness-item,.attachment-card,#objectivesList'))return;
        const value=controlValue(c);if(!clean(value))return;
        const label=c.closest('label');
        const title=label?labelTitle(label):clean(c.getAttribute('aria-label')||c.placeholder||c.name||c.id);
        if(title&&!seenTitles.has(title)){rows.push([title,String(value)]);seenTitles.add(title);}
      });

      const ws=XLSX.utils.aoa_to_sheet(rows);
      ws['!cols']=[{wch:42},{wch:75}];
      ws['!rtl']=true;
      Object.keys(ws).forEach(k=>{
        if(k[0]==='!')return;
        ws[k].s={alignment:{wrapText:true,vertical:'top',horizontal:'right'}};
      });
      const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'قالب الحقيبة');
      const name=clean($('f_name')?.value)||'الحقيبة التدريبية';
      XLSX.writeFile(wb,name.replace(/[\\/:*?"<>|]/g,'-').slice(0,80)+'.xlsx');
      const status=$('exportStatus');if(status)status.textContent='تم تصدير جميع البيانات المدخلة.';
    }catch(err){
      console.error(err);
      const status=$('exportStatus');if(status)status.textContent='تعذر التصدير: '+(err?.message||err);
    }
  };

  const bind=()=>{
    const b=$('exportExcel');
    if(b)b.addEventListener('click',e=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      exportWorkbook();
    },true);
  };

  const start=()=>{bindAutoSave();bind();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
