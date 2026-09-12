(()=>{
  const $=id=>document.getElementById(id);
  const val=id=>{const e=$(id);return e?(e.value??'').toString().trim():''};
  function build(){
    if(typeof XLSX==='undefined'){alert('مكتبة Excel لم تُحمّل. أعد فتح الصفحة.');return;}
    const rows=[['قالب الحقيبة التدريبية - فاب لاب الأحساء'],[]];
    const add=(title,value)=>{rows.push([title,value??'']);};
    const dept=$('f_department')?.selectedOptions?.[0]?.text||'';
    add('اسم البرنامج التدريبي',val('f_name')); add('القسم',dept); add('وصف البرنامج التدريبي',val('f_description')); add('نوع البرنامج',val('f_program_type')); add('المجال الأساسي',val('f_primary_field')); add('المجالات المساندة',val('f_supporting_fields')); add('الأجهزة والبرامج',val('f_devices_software'));
    const objectives=(window.state?.objectives||[]).map((o,i)=>(i+1)+'. '+(o.text||'')).join('\n'); add('أهداف البرنامج',objectives); add('المستوى',val('f_level')); add('نوع التطبيق العملي',val('f_practical')); add('المدة',(val('f_days')?val('f_days')+' يوم':'')+(val('f_hours')?' / '+val('f_hours')+' ساعة':'')); add('الفئة العمرية',(val('f_age_min')||'')+(val('f_age_max')?' - '+val('f_age_max'):'')); add('الفئة المستهدفة',val('f_target')); add('عدد المشاركين',val('f_participants')); add('تقسيم المشاركين',val('f_split')); add('شروط الالتحاق',val('f_requirements')); add('مُعدّ المحتوى العلمي',val('f_author')); add('رقم الإصدار وتاريخ التحديث',val('f_version')); add('تكلفة المستهلكات',val('f_consumables')); add('تكلفة تأسيسية غير متكررة',val('f_setup')); add('اعتبارات أخرى',val('f_other'));
    rows.push([],['المخرجات وتسليماتها'],['المخرج','النوع','الوصف','الكمية','الملكية','ما الذي سنقيسه؟','النتيجة المطلوبة','طريقة التحقق']);
    (window.state?.outputs||[]).forEach(o=>rows.push([o.name||'',o.output_type||'',o.description||'',o.quantity??'',o.ownership||'',o.measurement?.what_to_measure||'',o.measurement?.required_result||'',o.measurement?.verification_method||'']));
    rows.push([],['خطة التنفيذ'],['اليوم','ماذا سنتعلم؟','المحاور','الأهداف المرتبطة','المخرجات المرتبطة','التنفيذ والمدة','التحقق']);
    (window.state?.days||[]).forEach(d=>rows.push([d.day_no??'',d.what_to_learn||'',d.topics||'',(d.objective_ids||[]).map(x=>Number(x)+1).join(', '),(d.output_ids||[]).join(', '),d.execution_duration||'',d.verification||'']));
    rows.push([],['الموارد البشرية'],['المورد','العدد','الخبرة أو الشروط المطلوبة','المهام']);
    (window.state?.human||[]).forEach(h=>rows.push([h.resource_type||'',h.quantity??'',h.requirements||'',h.responsibilities||'']));
    rows.push([],['الاحتياجات المادية والتقنية'],['الاحتياج','المواصفات','الوحدة','الكمية للفرد/المجموعة','الكمية الإجمالية','ملاحظات']);
    (window.state?.material||[]).forEach(m=>rows.push([m.item||'',m.specifications||'',m.unit||'',m.quantity_per_person_group??'',m.total_quantity??'',m.notes||'']));
    rows.push([],['الجاهزية قبل التنفيذ'],['الفئة','جاهز؟','ما يجب تجهيزه أو التحقق منه','المدة اللازمة قبل التنفيذ','ملاحظات']);
    (window.state?.readiness||[]).forEach(r=>rows.push([r.category||'',r.is_ready?'نعم':'لا',r.preparation_requirements||'',r.lead_time||'',r.notes||'']));
    rows.push([],['المرفقات'],['نوع المرفق','اسم الملف']);
    Object.values(window.state?.attachments||{}).forEach(f=>{if(f)rows.push([f.type||'',f.name||''])});
    const ws=XLSX.utils.aoa_to_sheet(rows); ws['!cols']=[{wch:34},{wch:32},{wch:42},{wch:18},{wch:20},{wch:32},{wch:32},{wch:32}];
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'قالب الحقيبة');
    const name=(val('f_name')||'الحقيبة التدريبية').replace(/[\\/:*?"<>|]/g,'-').slice(0,80);
    XLSX.writeFile(wb,name+'.xlsx');
    const s=$('exportStatus');if(s)s.textContent='تم تصدير ملف Excel بنجاح.';
  }
  function bind(){const b=$('exportExcel');if(!b)return; b.onclick=null; b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();try{build()}catch(err){console.error(err);alert('تعذر التصدير: '+(err.message||err));}},false);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind); else bind();
})();