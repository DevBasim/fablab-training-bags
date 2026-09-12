(()=>{
  const $=id=>document.getElementById(id);
  let saveTimer=null;
  const scheduleSave=()=>{
    clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>{
      const b=$('saveBag');
      const editor=$('page-editor');
      if(b && editor && !editor.classList.contains('hidden')) b.click();
    },900);
  };
  const bindAutoSave=()=>{
    document.addEventListener('input',e=>{if(e.target.closest('#page-editor'))scheduleSave();},true);
    document.addEventListener('change',e=>{if(e.target.closest('#page-editor'))scheduleSave();},true);
    document.addEventListener('click',e=>{if(e.target.closest('#addObjective,#addOutput,#addDay,#addHuman,#addMaterial,.danger'))scheduleSave();},true);
    setInterval(()=>{
      const editor=$('page-editor'),b=$('saveBag');
      if(editor&&b&&!editor.classList.contains('hidden'))b.click();
    },5000);
  };
  const exportWorkbook=()=>{
    try{
      if(typeof XLSX==='undefined')throw new Error('مكتبة Excel غير محملة.');
      const rows=[]; const text=id=>{const e=$(id);return e?e.value.trim():''}; const num=id=>{const v=text(id);return v===''?'':Number(v)};
      const add=(title,value)=>{rows.push([title]);rows.push([value==null?'':String(value)]);rows.push([])};
      rows.push(['قالب الحقيبة التدريبية - فاب لاب الأحساء']);rows.push([]);
      add('اسم البرنامج التدريبي',text('f_name'));add('القسم',$('f_department')?.selectedOptions?.[0]?.text||'');add('وصف البرنامج التدريبي',text('f_description'));add('نوع البرنامج',text('f_program_type'));add('المجال الأساسي',text('f_primary_field'));add('المجالات المساندة',text('f_supporting_fields'));add('الأجهزة والبرامج',text('f_devices_software'));add('أهداف البرنامج',(window.state?.objectives||[]).map((o,i)=>(i+1)+'. '+o.text).join('\n'));add('المستوى',text('f_level'));add('نوع التطبيق العملي',text('f_practical'));add('المدة',(num('f_days')||'')+' يوم / '+(num('f_hours')||'')+' ساعة');add('الفئة العمرية',(num('f_age_min')||'')+' - '+(num('f_age_max')||''));add('الفئة المستهدفة',text('f_target'));add('عدد المشاركين',num('f_participants'));add('تقسيم المشاركين',text('f_split'));add('شروط الالتحاق',text('f_requirements'));add('مُعدّ المحتوى العلمي',text('f_author'));add('رقم الإصدار وتاريخ التحديث',text('f_version'));add('تكلفة المستهلكات',num('f_consumables'));add('تكلفة تأسيسية غير متكررة',num('f_setup'));add('اعتبارات أخرى',text('f_other'));
      const s=window.state||{};rows.push(['المخرجات وتسليماتها'],['المخرج','النوع','الوصف','الكمية','الملكية','ما الذي سنقيسه؟','النتيجة المطلوبة','طريقة التحقق']);(s.outputs||[]).forEach(o=>rows.push([o.name,o.output_type,o.description,o.quantity,o.ownership,o.measurement?.what_to_measure||'',o.measurement?.required_result||'',o.measurement?.verification_method||'']));rows.push([],['خطة التنفيذ'],['اليوم','ماذا سنتعلم؟','المحاور','الأهداف المرتبطة','المخرجات المرتبطة','التنفيذ والمدة','التحقق']);(s.days||[]).forEach(d=>rows.push([d.day_no,d.what_to_learn,d.topics,(d.objective_ids||[]).map(x=>Number(x)+1).join(', '),(d.output_ids||[]).join(', '),d.execution_duration,d.verification]));rows.push([],['الموارد البشرية'],['المورد','العدد','الخبرة أو الشروط المطلوبة','المهام']);(s.human||[]).forEach(h=>rows.push([h.resource_type,h.quantity,h.requirements,h.responsibilities]));rows.push([],['الاحتياجات المادية والتقنية'],['الاحتياج','المواصفات','الوحدة','الكمية للفرد/المجموعة','الكمية الإجمالية','ملاحظات']);(s.material||[]).forEach(m=>rows.push([m.item,m.specifications,m.unit,m.quantity_per_person_group,m.total_quantity,m.notes]));rows.push([],['الجاهزية قبل التنفيذ'],['الفئة','جاهز؟','ما يجب تجهيزه أو التحقق منه','المدة اللازمة قبل التنفيذ','ملاحظات']);(s.readiness||[]).forEach(r=>rows.push([r.category,r.is_ready?'نعم':'لا',r.preparation_requirements,r.lead_time,r.notes]));rows.push([],['المرفقات'],['نوع المرفق','اسم الملف']);Object.keys(s.attachments||{}).forEach(k=>{const f=s.attachments[k];if(f)rows.push([k,f.name])});
      const ws=XLSX.utils.aoa_to_sheet(rows);ws['!cols']=[{wch:32},{wch:28},{wch:42},{wch:18},{wch:18},{wch:30},{wch:30},{wch:32}];ws['!rtl']=true;const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'قالب الحقيبة');XLSX.writeFile(wb,(text('f_name')||'الحقيبة التدريبية').replace(/[\\/:*?"<>|]/g,'-').slice(0,80)+'.xlsx');
    }catch(err){console.error(err);const status=$('exportStatus');if(status)status.textContent='تعذر التصدير: '+(err?.message||err);}
  };
  const bind=()=>{const b=$('exportExcel');if(b)b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();exportWorkbook();},true)};
  const start=()=>{bindAutoSave();bind()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
