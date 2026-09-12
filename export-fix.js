(()=>{
  const $=id=>document.getElementById(id);
  const text=id=>{const e=$(id);return e?e.value.trim():''};
  const num=id=>{const v=text(id);return v===''?'':Number(v)};
  const setCell=(ws,r,c,v)=>{if(v!==''&&v!==null&&v!==undefined)ws[XLSX.utils.encode_cell({r,c})]=({v:String(v),t:'s'});};
  const exportWorkbook=()=>{
    try{
      if(typeof XLSX==='undefined')throw new Error('مكتبة Excel غير محملة.');
      const fd=typeof formData==='function'?formData():{};
      const wb=XLSX.utils.book_new();
      const rows=[];
      rows.push(['قالب الحقيبة التدريبية - فاب لاب الأحساء']);
      rows.push([]);
      rows.push(['بيانات البرنامج','','','','','','']);
      rows.push(['الحقل','البيانات']);
      const fields=[
        ['اسم البرنامج التدريبي',text('f_name')],['القسم',$('f_department')?.selectedOptions?.[0]?.text||''],['وصف البرنامج التدريبي',text('f_description')],
        ['نوع البرنامج',text('f_program_type')],['المجال الأساسي',text('f_primary_field')],['المجالات المساندة',text('f_supporting_fields')],['الأجهزة والبرامج',text('f_devices_software')],
        ['أهداف البرنامج',state.objectives.map((o,i)=>(i+1)+'. '+o.text).join('\n')],['المستوى',text('f_level')],['نوع التطبيق العملي',text('f_practical')],
        ['المدة',(num('f_days')||'')+' يوم / '+(num('f_hours')||'')+' ساعة'],['الفئة العمرية',(num('f_age_min')||'')+' - '+(num('f_age_max')||'')],['الفئة المستهدفة',text('f_target')],
        ['عدد المشاركين',num('f_participants')],['تقسيم المشاركين',text('f_split')],['شروط الالتحاق',text('f_requirements')],['مُعدّ المحتوى العلمي',text('f_author')],
        ['رقم الإصدار وتاريخ التحديث',text('f_version')],['تكلفة المستهلكات',num('f_consumables')],['تكلفة تأسيسية غير متكررة',num('f_setup')],['اعتبارات أخرى',text('f_other')]
      ];
      fields.forEach(x=>rows.push(x));
      rows.push([]);rows.push(['المخرجات وتسليماتها']);
      rows.push(['رقم','اسم المخرج','النوع','الوصف','الكمية','الملكية','ما الذي سنقيسه؟','النتيجة المطلوبة','طريقة التحقق']);
      state.outputs.forEach((o,i)=>rows.push([i+1,o.name,o.output_type,o.description,o.quantity,o.ownership,o.measurement?.what_to_measure||'',o.measurement?.required_result||'',o.measurement?.verification_method||'']));
      rows.push([]);rows.push(['خطة التنفيذ']);
      rows.push(['اليوم','ماذا سنتعلم؟','المحاور','الأهداف المرتبطة','المخرجات المرتبطة','التنفيذ والمدة','التحقق']);
      state.days.forEach(d=>rows.push([d.day_no,d.what_to_learn,d.topics,(d.objective_ids||[]).map(x=>Number(x)+1).join(', '),(d.output_ids||[]).join(', '),d.execution_duration,d.verification]));
      rows.push([]);rows.push(['الموارد البشرية']);
      rows.push(['المورد','العدد','الخبرة أو الشروط المطلوبة','المهام']);
      state.human.forEach(h=>rows.push([h.resource_type,h.quantity,h.requirements,h.responsibilities]));
      rows.push([]);rows.push(['الاحتياجات المادية والتقنية']);
      rows.push(['الاحتياج','المواصفات','الوحدة','الكمية للفرد/المجموعة','الكمية الإجمالية','ملاحظات']);
      state.material.forEach(m=>rows.push([m.item,m.specifications,m.unit,m.quantity_per_person_group,m.total_quantity,m.notes]));
      rows.push([]);rows.push(['الجاهزية قبل التنفيذ']);
      rows.push(['الفئة','جاهز؟','ما يجب تجهيزه أو التحقق منه','المدة اللازمة قبل التنفيذ','ملاحظات']);
      state.readiness.forEach(r=>rows.push([r.category,r.is_ready?'نعم':'لا',r.preparation_requirements,r.lead_time,r.notes]));
      rows.push([]);rows.push(['المرفقات']);
      rows.push(['نوع المرفق','اسم الملف','ملاحظة']);
      Object.keys(state.attachments||{}).forEach(k=>{const f=state.attachments[k];if(f)rows.push([k,f.name,'الملف مرفق في الحقيبة التدريبية']);});
      const ws=XLSX.utils.aoa_to_sheet(rows);
      ws['!cols']=[{wch:18},{wch:28},{wch:24},{wch:38},{wch:16},{wch:18},{wch:28},{wch:28},{wch:30}];
      ws['!merges']=[{s:{r:0,c:0},e:{r:0,c:8}},{s:{r:2,c:0},e:{r:2,c:8}}];
      for(const cell of Object.keys(ws)){if(cell[0]==='!')continue;const c=ws[cell];c.alignment={wrapText:true,vertical:'top'};}
      if(ws.A1)ws.A1.s={font:{bold:true,sz:16},alignment:{horizontal:'center',vertical:'center'}};
      const safeName=(text('f_name')||'الحقيبة التدريبية').replace(/[\\/:*?"<>|]/g,'-').slice(0,80);
      XLSX.writeFile(wb,safeName+'.xlsx');
      const status=$('exportStatus');if(status)status.textContent='تم تصدير الحقيبة بنجاح.';
      if(typeof toast==='function')toast('تم تصدير ملف Excel بنجاح');
    }catch(err){console.error(err);const status=$('exportStatus');if(status)status.textContent='تعذر التصدير: '+(err?.message||err);if(typeof toast==='function')toast('تعذر التصدير: '+(err?.message||err),'error');}
  };
  const bind=()=>{const b=$('exportExcel');if(b){b.onclick=exportWorkbook;b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation()},{capture:true});}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
