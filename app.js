// Compatibility loader: keep the tested application logic while adding real file persistence.
const LEGACY_APP='https://fablab-training-bags-37q8x6oau-fablab7.vercel.app/app.js';
const SUPABASE_URL='https://kuuwmzqbzgzfetbpnlsl.supabase.co';
const SUPABASE_KEY='sb_publishable_KLJ5ZpuhcXrGwnwTc7CFpw_Csqtd7UF';
const pendingFiles={};

function loadLegacyApp(){
  const script=document.createElement('script');
  script.src=LEGACY_APP;
  script.onload=installPatches;
  script.onerror=()=>{const el=document.getElementById('authMessage');if(el)el.textContent='تعذر تحميل مكونات النظام. حدّث الصفحة وحاول مرة أخرى.'};
  document.head.appendChild(script);
}

function installPatches(){
  if(typeof window.filePicked==='function'){
    const originalFilePicked=window.filePicked;
    window.filePicked=input=>{
      const key=input.dataset.attachment;
      if(input.files&&input.files[0]) pendingFiles[key]=input.files[0];
      return originalFilePicked(input);
    };
  }

  const saveButton=document.getElementById('saveBag');
  if(saveButton&&typeof window.saveBag==='function'){
    const originalSaveBag=window.saveBag;
    saveButton.onclick=async()=>{
      await originalSaveBag();
      await persistPendingFiles();
    };
  }
}

async function persistPendingFiles(){
  const keys=Object.keys(pendingFiles);
  if(!keys.length)return;
  try{
    const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
    const {data:{session}}=await client.auth.getSession();
    if(!session?.user)return;
    const programName=(document.getElementById('f_name')?.value||'').trim();
    if(!programName)return;
    const {data:bags,error:bagError}=await client.from('training_bags').select('id').eq('owner_id',session.user.id).eq('name',programName).order('updated_at',{ascending:false}).limit(1);
    if(bagError||!bags?.[0])throw bagError||new Error('لم يتم العثور على الحقيبة المحفوظة');
    const bagId=bags[0].id;
    const bucket='training-bag-files';
    for(const key of keys){
      const file=pendingFiles[key];
      const safeName=file.name.replace(/[^a-zA-Z0-9._-\u0600-\u06FF]/g,'_');
      const path=`${bagId}/${key}/${crypto.randomUUID()}-${safeName}`;
      const {error:uploadError}=await client.storage.from(bucket).upload(path,file,{contentType:file.type||'application/octet-stream',upsert:false});
      if(uploadError)throw uploadError;
      const {error:rowError}=await client.from('attachments').insert({bag_id:bagId,attachment_type:key,original_filename:file.name,storage_path:path,mime_type:file.type||null,file_size:file.size,uploaded_by:session.user.id});
      if(rowError)throw rowError;
    }
    Object.keys(pendingFiles).forEach(k=>delete pendingFiles[k]);
    if(typeof window.toast==='function')window.toast('تم حفظ المرفقات بنجاح');
  }catch(error){
    console.error(error);
    if(typeof window.toast==='function')window.toast('تم حفظ الحقيبة لكن تعذر رفع أحد المرفقات','error');
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadLegacyApp);else loadLegacyApp();
