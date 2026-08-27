"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Power, RefreshCw } from "lucide-react";

type Mode = "contact" | "alert" | "template";

const config = {
  contact: { title: "Public Contact Information", endpoint: "/api/admin/contact", fields: ["labelEn","labelUr","value","kind","sortOrder"] },
  alert: { title: "Quick Alerts", endpoint: "/api/admin/quick-alerts", fields: ["titleEn","titleUr","messageEn","messageUr","priority","displayMode","startsAt","endsAt","isActive"] },
  template: { title: "Response Templates", endpoint: "/api/admin/templates", fields: ["name","category","bodyEn","bodyUr"] },
} as const;

export default function AdminCollectionPage({ mode }: { mode: Mode }) {
  const c = config[mode];
  const [rows,setRows]=useState<any[]>([]);
  const [editing,setEditing]=useState<any|null>(null);
  const [saving,setSaving]=useState(false);
  const load=()=>fetch(c.endpoint).then(r=>r.json()).then(d=>setRows(d.contacts||d.alerts||d.templates||[]));
  useEffect(()=>{load()},[]);
  const empty=mode==="contact"?{labelEn:"",labelUr:"",value:"",kind:"phone",sortOrder:0}:mode==="alert"?{titleEn:"",titleUr:"",messageEn:"",messageUr:"",priority:"urgent",displayMode:"banner",isActive:false}: {name:"",category:"",bodyEn:"",bodyUr:""};
  async function save(){
    setSaving(true);
    try{
      const res=await fetch(c.endpoint,{method:editing?.id?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(editing)});
      if(!res.ok) throw new Error();
      setEditing(null); await load();
    } finally {setSaving(false)}
  }
  async function disable(id:string){await fetch(`${c.endpoint}?id=${id}`,{method:"DELETE"});await load();}
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-black text-slate-900">{c.title}</h1><p className="text-sm text-slate-500">Manage this operational data without editing source code.</p></div>
      <div className="flex gap-2"><button onClick={()=>load()} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2"><RefreshCw size={16}/>Refresh</button><button onClick={()=>setEditing(empty)} className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-4 py-2 font-bold text-white"><Plus size={16}/>Create</button></div>
    </div>
    {editing && <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        {c.fields.map((f)=> <label key={f} className="text-sm font-semibold text-slate-700">{f}
          {f==="messageEn"||f==="messageUr"||f==="bodyEn"||f==="bodyUr" ? <textarea value={editing[f]??""} onChange={e=>setEditing({...editing,[f]:e.target.value})} className="mt-1 min-h-28 w-full rounded-xl border p-3"/> :
          f==="isActive" ? <input type="checkbox" checked={Boolean(editing[f])} onChange={e=>setEditing({...editing,[f]:e.target.checked})} className="ml-2 h-4 w-4"/> :
          <input type={f==="startsAt"||f==="endsAt"?"datetime-local":"text"} value={editing[f]??""} onChange={e=>setEditing({...editing,[f]:e.target.value})} className="mt-1 w-full rounded-xl border p-3"/>}
        </label>)}
      </div>
      <div className="mt-4 flex gap-2"><button disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-green-800 px-5 py-3 font-bold text-white"><Save size={16}/>{saving?"Saving…":"Save"}</button><button onClick={()=>setEditing(null)} className="rounded-xl bg-slate-100 px-5 py-3">Cancel</button></div>
    </div>}
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="divide-y">{rows.length===0?<div className="p-10 text-center text-slate-500">No records yet.</div>:rows.map(r=><div key={r.id} className="flex flex-wrap items-center gap-4 p-4">
        <div className="min-w-0 flex-1"><p className="font-bold">{r.labelEn||r.titleEn||r.name}</p><p className="truncate text-sm text-slate-500">{r.value||r.messageEn||r.bodyEn}</p></div>
        <button onClick={()=>setEditing({...r})} className="rounded-xl bg-slate-100 px-3 py-2 text-sm">Edit</button>
        <button onClick={()=>disable(r.id)} className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"><Power size={14}/>Disable</button>
      </div>)}</div>
    </div>
  </div>
}
