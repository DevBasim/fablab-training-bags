(()=>{
const $=id=>document.getElementById(id),T=id=>$(id)?.value?.trim()||'',N=id=>{const v=T(id);return v===''?'':Number(v)};
function exportWorkbook(){try{if(typeof XLSX==='undefined')throw Error('مكتبة Excel غير محملة');
const wb=XLSX.utils.book_new(),R=Array.from({length:112},()=>Array(7).fill('')),M=[];
const put=(r,c,v)=>{if(v!==''&&v!==null&&v!==undefined)R[r-1][c-1]=String(v)};
const merge=(r,c1,c2)=>M.push({s:{r:r-1,c:c1-1},e:{r:r-1,c:c2-1}});
put(1,1,'قالب الحقيبة التدريبية - فاب لاب الأحساء');merge(1,1,7);
const section=(r,n)=>{put(r,1,n);merge(r,1,7)};
section(4,'بطاقة البرنامج التدريبي');put(5,1,'البيانات');put(5,6,'الحقل');merge(5,1,5);merge(5,6,7);
const fields=[['اسم البرنامج التدريبي',T('f_name')],['القسم',$('f_department')?.selectedOptions?.[0]?.text||''],['وصف البرنامج التدريبي',T('f_description')],['نوع البرنامج',T('f_program_type')],['المجال الأساسي',T('f_primary_field')],['المجالات المساندة',T('f_supporting_fields')],['الأجهزة والبرامج',T('f_devices_software')],['أهداف البرنامج',(window.state?.objectives||[]).map((o,i)=>(i+1)+'. '+o.text).join('\n')],['المستوى',T('f_level')],['نوع التطبيق العملي',T('f_practical')],['المدة',(N('f_days')||'')+' يوم / '+(N('f_hours')||'')+' ساعة'],['الفئة العمرية',(N('f_age_min')||'')+' - '+(N('f_age_max')||'')],['الفئة المستهدفة',T('f_target')],['عدد المشاركين',N('f_participants')],['تقسيم المشاركين',T('f_split')],['شروط الالتحاق',T('f_requirements')],['مُعدّ المحتوى العلمي',T('f_author')],['رقم الإصدار وتاريخ التحديث',T('f_version')],['تكلفة المستهلكات',N('f_consumables')],['تكلفة تأسيسية غير متكررة',N('f_setup')],['اعتبارات أخرى',T('f_other')]];
fields.forEach((x,i)=>{const r=6+i;put(r,1,x[1]);put(r,6,x[0]);merge(r,1,5);merge(r,6,7)});
section(27,'المخرجات وتسليماتها');['رقم','اسم المخرج','النوع','الوصف','الكمية','الملكية','القياس والتحقق'].forEach((x,i)=>put(28,i+1,x));
(window.state?.outputs||[]).forEach((o,i)=>{const r=29+i;[i+1,o.name,o.output_type,o.description,o.quantity,o.ownership,`ما الذي سنقيسه؟ ${o.measurement?.what_to_measure||''}\nالنتيجة المطلوبة: ${o.measurement?.required_result||''}\nطريقة التحقق: ${o.measurement?.verification_method||''}`].forEach((x,j)=>put(r,j+1,x))});
section(42,'قياس المخرجات');['رقم المخرج / الاسم','ما الذي سنقيسه؟','النتيجة المطلوبة','طريقة التحقق'].forEach((x,i)=>put(43,i+1,x));
(window.state?.outputs||[]).forEach((o,i)=>{const r=44+i;[`${i+1} - ${o.name||''}`,o.measurement?.what_to_measure||'',o.measurement?.required_result||'',o.measurement?.verification_method||''].forEach((x,j)=>put(r,j+1,x))});
section(51,'خطة تنفيذ البرنامج');['اليوم','ماذا سنتعلم؟','المحاور','الأهداف المرتبطة','المخرجات المرتبطة','التنفيذ والمدة','التحقق'].forEach((x,i)=>put(52,i+1,x));
(window.state?.days||[]).forEach((d,i)=>{const r=53+i;[d.day_no,d.what_to_learn,d.topics,(d.objective_ids||[]).map(x=>Number(x)+1).join(', '),(d.output_ids||[]).join(', '),d.execution_duration,d.verification].forEach((x,j)=>put(r,j+1,x))});
section(65,'الموارد البشرية');['المورد البشري','العدد','الخبرة أو الشروط المطلوبة','المهام'].forEach((x,i)=>put(66,i+1,x));
(window.state?.human||[]).forEach((h,i)=>[h.resource_type,h.quantity,h.requirements,h.responsibilities].forEach((x,j)=>put(67+i,j+1,x)));
section(70,'الاحتياجات المادية والتقنية');['الاحتياج','المواصفات','الوحدة','الكمية للفرد/المجموعة','الكمية الإجمالية','ملاحظات'].forEach((x,i)=>put(71,i+1,x));
(window.state?.material||[]).forEach((m,i)=>[m.item,m.specifications,m.unit,m.quantity_per_person_group,m.total_quantity,m.notes].forEach((x,j)=>put(72+i,j+1,x)));
section(79,'الجاهزية قبل التنفيذ');['الفئة','جاهز؟','ما يجب تجهيزه أو التحقق منه','المدة اللازمة قبل التنفيذ','ملاحظات'].forEach((x,i)=>put(80,i+1,x));
(window.state?.readiness||[]).forEach((r,i)=>[r.category,r.is_ready?'نعم':'لا',r.preparation_requirements,r.lead_time,r.notes].forEach((x,j)=>put(81+i,j+1,x)));
section(90,'المرفقات');['نوع المرفق','اسم الملف','ملاحظة'].forEach((x,i)=>put(91,i+1,x));
Object.keys(window.state?.attachments||{}).forEach((k,i)=>{const f=state.attachments[k];if(f)[k,f.name,'مرفق مع الحقيبة'].forEach((x,j)=>put(92+i,j+1,x))});
section(100,'المراجعة والاعتماد');['الحالة','ملاحظات المراجعة'].forEach((x,i)=>put(101,i+1,x));put(102,1,$('reviewStatus')?.selectedOptions?.[0]?.text||'');put(102,2,T('reviewComment'));
section(105,'قائمة التحقق');['☐','التأكد من اكتمال بيانات الحقيبة'],['☐','مراجعة الأهداف والمخرجات وخطة التنفيذ'],['☐','التأكد من الجاهزية والمرفقات']].forEach((x,i)=>{if(Array.isArray(x)){put(106+i,1,x[0]);put(106+i,2,x[1])}});
const ws=XLSX.utils.aoa_to_sheet(R);ws['!merges']=M;ws['!cols']=[{wch:24},{wch:24},{wch:24},{wch:24},{wch:24},{wch:26},{wch:38}];ws['!rows']=Array.from({length:112},(_,i)=>({hpt:i===0?30:22}));ws['!sheetViews']=[{rightToLeft:true}];
for(const a of Object.keys(ws)){if(a[0]==='!')continue;ws[a].s={alignment:{wrapText:true,vertical:'top'}}}
XLSX.utils.book_append_sheet(wb,ws,'قالب الحقيبة');const name=(T('f_name')||'الحقيبة التدريبية').replace(/[\\/:*?"<>|]/g,'-').slice(0,80);XLSX.writeFile(wb,name+'.xlsx');if($('exportStatus'))$('exportStatus').textContent='تم تصدير الحقيبة بنجاح.';if(typeof toast==='function')toast('تم تصدير ملف Excel بنجاح')}catch(e){console.error(e);if($('exportStatus'))$('exportStatus').textContent='تعذر التصدير: '+e.message;if(typeof toast==='function')toast('تعذر التصدير: '+e.message,'error')}}
function bind(){const b=$('exportExcel');if(b){b.onclick=exportWorkbook;b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation()},{capture:true})}}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();})();