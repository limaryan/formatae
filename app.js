const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let sourceFiles=[], results=[], format='image/png', ext='png';
const files=$('#files'),drop=$('#drop'),items=$('#items'),queue=$('#queue'),convert=$('#convert');
$('#pick').onclick=()=>files.click(); files.onchange=e=>addFiles(e.target.files);
['dragenter','dragover'].forEach(x=>drop.addEventListener(x,e=>{e.preventDefault();drop.classList.add('drag')}));
['dragleave','drop'].forEach(x=>drop.addEventListener(x,e=>{e.preventDefault();drop.classList.remove('drag')}));
drop.addEventListener('drop',e=>addFiles(e.dataTransfer.files));
function addFiles(list){const valid=[...list].filter(f=>f.type.startsWith('image/'));sourceFiles.push(...valid);results=[];render();}
function size(n){if(n<1024)return n+' B';if(n<1048576)return(n/1024).toFixed(1)+' KB';return(n/1048576).toFixed(2)+' MB'}
function render(){queue.classList.toggle('hidden',!sourceFiles.length);convert.disabled=!sourceFiles.length;$('#downloadAll').classList.add('hidden');items.innerHTML='';sourceFiles.forEach((f,i)=>{const d=document.createElement('div');d.className='item';const url=URL.createObjectURL(f);d.innerHTML=`<img class="thumb" src="${url}"><div class="meta"><b>${escapeHtml(f.name)}</b><small>${size(f.size)}</small><div class="status" id="s${i}">Pronto para converter</div></div><button class="link" data-rm="${i}">Remover</button>`;items.appendChild(d)});$$('[data-rm]').forEach(b=>b.onclick=()=>{sourceFiles.splice(+b.dataset.rm,1);render()})}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
$$('.fmt').forEach(b=>b.onclick=()=>{$$('.fmt').forEach(x=>x.classList.remove('active'));b.classList.add('active');format=b.dataset.format;ext=b.dataset.ext;$('#qualityRow').classList.toggle('hidden',format==='image/png')});
$('#quality').oninput=e=>$('#qval').textContent=e.target.value+'%';
$('#resize').onchange=e=>$('#resizeBox').classList.toggle('hidden',!e.target.checked);
$('#clear').onclick=()=>{sourceFiles=[];results=[];files.value='';render()};
function loadImage(file){return new Promise((res,rej)=>{const img=new Image();const u=URL.createObjectURL(file);img.onload=()=>{URL.revokeObjectURL(u);res(img)};img.onerror=rej;img.src=u})}
async function process(file){const img=await loadImage(file);let w=img.naturalWidth,h=img.naturalHeight;if($('#resize').checked){const tw=parseInt($('#width').value),th=parseInt($('#height').value),ratio=$('#ratio').checked;if(ratio){if(tw&&!th){h=Math.round(h*tw/w);w=tw}else if(th&&!tw){w=Math.round(w*th/h);h=th}else if(tw&&th){const r=Math.min(tw/w,th/h);w=Math.round(w*r);h=Math.round(h*r)}}else{w=tw||w;h=th||h}}const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');if(format==='image/jpeg'){ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h)}ctx.drawImage(img,0,0,w,h);const q=+$('#quality').value/100;const blob=await new Promise(r=>c.toBlob(r,format,q));const base=file.name.replace(/\.[^.]+$/,'');return{blob,name:`${base}.${ext}`,w,h}}
convert.onclick=async()=>{convert.disabled=true;convert.textContent='Convertendo...';results=[];for(let i=0;i<sourceFiles.length;i++){const s=$(`#s${i}`);s.textContent='Convertendo...';try{const r=await process(sourceFiles[i]);results.push(r);s.innerHTML=`Concluído • ${r.w}×${r.h} • ${size(r.blob.size)} <button class="download" data-dl="${results.length-1}">Baixar</button>`}catch(e){s.textContent='Erro ao converter'} }$$('[data-dl]').forEach(b=>b.onclick=()=>download(results[+b.dataset.dl]));$('#downloadAll').classList.toggle('hidden',results.length<2);convert.disabled=false;convert.textContent='Converter imagens'};
function download(r){const a=document.createElement('a');a.href=URL.createObjectURL(r.blob);a.download=r.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$('#downloadAll').onclick=()=>results.forEach((r,i)=>setTimeout(()=>download(r),i*250));
