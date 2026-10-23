const KEY="onboardingTrackerV1";
const tasks=[["equipmentStatus","Equipment"],["accountStatus","Account setup"],["softwareStatus","Software"],["orientationStatus","Orientation"]];
const samples=[
{id:"ONB-1001",name:"Alex Morgan",department:"Customer Support",joiningDate:"2026-10-20",equipmentStatus:"Completed",accountStatus:"In Progress",softwareStatus:"Pending",orientationStatus:"Pending",technician:"IT Support Team",notes:"Fictional sample. Confirm approved software list."},
{id:"ONB-1002",name:"Jamie Taylor",department:"Finance",joiningDate:"2026-10-27",equipmentStatus:"In Progress",accountStatus:"Pending",softwareStatus:"Pending",orientationStatus:"Pending",technician:"Service Desk",notes:"Fictional sample. Device allocation is being checked."},
{id:"ONB-1003",name:"Sam Lee",department:"Human Resources",joiningDate:"2026-10-15",equipmentStatus:"Completed",accountStatus:"Completed",softwareStatus:"Completed",orientationStatus:"Completed",technician:"IT Support Team",notes:"Fictional sample. Checklist completed."}];
const $=id=>document.getElementById(id), form=$("employeeForm"), body=$("recordsBody");
let records=read();
function read(){try{const s=localStorage.getItem(KEY);return s?JSON.parse(s):samples}catch{return samples}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(records))}catch{alert("Browser storage is unavailable. Try another browser.")}}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function progress(r){return Math.round(tasks.filter(([k])=>r[k]==="Completed").length/tasks.length*100)}
function status(r){const s=tasks.map(([k])=>r[k]);if(s.every(x=>x==="Completed"))return"Completed";if(s.some(x=>x!=="Pending"))return"In Progress";return"Pending"}
function badge(s){return `<span class="status ${s.replace(" ","-")}">${esc(s)}</span>`}
function render(){
 const q=$("searchInput").value.trim().toLowerCase(), f=$("filterStatus").value;
 const visible=records.filter(r=>`${r.name} ${r.department} ${r.technician}`.toLowerCase().includes(q)&&(f==="All"||status(r)===f));
 body.innerHTML=visible.map(r=>{const p=progress(r);return `<tr><td>${esc(r.name)}<br><small>${esc(r.id)}</small></td><td>${esc(r.department)}</td><td>${esc(r.joiningDate)}</td><td>${badge(r.equipmentStatus)}</td><td>${badge(r.accountStatus)}</td><td>${badge(r.softwareStatus)}</td><td>${badge(r.orientationStatus)}</td><td><div class="progress">${p}% • ${status(r)}<div class="track"><div class="fill" style="width:${p}%"></div></div></div></td><td><div class="rowactions"><button data-action="edit" data-id="${esc(r.id)}">Edit</button><button class="delete" data-action="delete" data-id="${esc(r.id)}">Delete</button></div></td></tr>`}).join("");
 $("emptyState").hidden=visible.length>0;
 $("totalCount").textContent=records.length;
 $("completedCount").textContent=records.reduce((n,r)=>n+tasks.filter(([k])=>r[k]==="Completed").length,0);
 $("pendingCount").textContent=records.reduce((n,r)=>n+tasks.filter(([k])=>r[k]==="Pending").length,0);
 $("progressCount").textContent=records.reduce((n,r)=>n+tasks.filter(([k])=>r[k]==="In Progress").length,0);
}
function clearForm(){form.reset();$("recordId").value="";$("saveBtn").textContent="Add employee";$("cancelEditBtn").hidden=true}
function makeId(){return "ONB-"+(records.reduce((m,r)=>Math.max(m,Number(r.id.replace("ONB-",""))||1000),1000)+1)}
form.addEventListener("submit",e=>{e.preventDefault();const id=$("recordId").value;const r={id:id||makeId(),name:$("employeeName").value.trim(),department:$("department").value,joiningDate:$("joiningDate").value,equipmentStatus:$("equipmentStatus").value,accountStatus:$("accountStatus").value,softwareStatus:$("softwareStatus").value,orientationStatus:$("orientationStatus").value,technician:$("technician").value.trim(),notes:$("notes").value.trim()};
if(!r.name||!r.department||!r.joiningDate)return;if(id)records=records.map(x=>x.id===id?r:x);else records.unshift(r);save();clearForm();render()});
$("cancelEditBtn").addEventListener("click",clearForm);$("resetBtn").addEventListener("click",()=>setTimeout(clearForm,0));
body.addEventListener("click",e=>{const b=e.target.closest("button[data-action]");if(!b)return;const r=records.find(x=>x.id===b.dataset.id);if(!r)return;
if(b.dataset.action==="delete"){if(confirm("Delete this fictional onboarding record?")){records=records.filter(x=>x.id!==r.id);save();render();if($("recordId").value===r.id)clearForm()}return}
$("recordId").value=r.id;$("employeeName").value=r.name;$("department").value=r.department;$("joiningDate").value=r.joiningDate;
for(const [k] of tasks)$(k).value=r[k];$("technician").value=r.technician||"";$("notes").value=r.notes||"";$("saveBtn").textContent="Save changes";$("cancelEditBtn").hidden=false;form.scrollIntoView({behavior:"smooth",block:"start"});
});
$("searchInput").addEventListener("input",render);$("filterStatus").addEventListener("change",render);
$("exportBtn").addEventListener("click",()=>{const headers=["ID","Employee","Department","Joining Date","Equipment","Account Setup","Software","Orientation","Overall Status","Progress Percent","Technician","Notes"];
const rows=records.map(r=>[r.id,r.name,r.department,r.joiningDate,r.equipmentStatus,r.accountStatus,r.softwareStatus,r.orientationStatus,status(r),progress(r),r.technician||"",r.notes||""]);
const csv=[headers,...rows].map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
const url=URL.createObjectURL(new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download="it-onboarding-tracker-report.csv";a.click();URL.revokeObjectURL(url)});
render();
