"use client";
import { useEffect, useState } from "react";
export default function RolesPage(){
 const [data,setData]=useState<any>({permissions:[],rolePermissions:[],roles:[]}); const [role,setRole]=useState("district_admin"); const [selected,setSelected]=useState<string[]>([]); const [saved,setSaved]=useState(false);
 useEffect(()=>{fetch("/api/admin/roles").then(r=>r.json()).then(d=>{setData(d);setSelected(d.rolePermissions.filter((x:any)=>x.role===role).map((x:any)=>x.permissionId));})},[role]);
 const toggle=(id:string)=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);
 const save=async()=>{await fetch("/api/admin/roles",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({role,permissionIds:selected})});setSaved(true);setTimeout(()=>setSaved(false),1500);};
 const groups=Array.from(new Set(data.permissions.map((p:any)=>p.groupName)));
 return <div className="space-y-6"><div><h1 className="text-2xl font-black">Roles & Permissions</h1><p className="text-sm text-slate-500">Server-side RBAC configuration.</p></div>
 <div className="rounded-2xl border bg-white p-5"><label className="text-sm font-semibold">Role<select value={role} onChange={e=>setRole(e.target.value)} className="mt-1 w-full max-w-sm rounded-xl border p-3">{data.roles.filter((r:string)=>r!=="super_admin").map((r:string)=><option key={r}>{r}</option>)}</select></label>
 <div className="mt-6 grid gap-4 md:grid-cols-2">{groups.map((g:any)=><section key={g} className="rounded-2xl border p-4"><h2 className="font-bold">{g}</h2><div className="mt-3 space-y-2">{data.permissions.filter((p:any)=>p.groupName===g).map((p:any)=><label key={p.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50"><input type="checkbox" checked={selected.includes(p.id)} onChange={()=>toggle(p.id)}/><span className="text-sm">{p.label}</span></label>)}</div></section>)}</div>
 <button onClick={save} className="mt-5 rounded-xl bg-green-800 px-5 py-3 font-bold text-white">{saved?"Saved":"Save Permissions"}</button></div></div>
}