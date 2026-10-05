import { useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { Alert, Card, Field, PageHeader, Tabs, btnGhost, btnPrimary, fileToDataUrl, inputCls } from "../../components/ui";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(user.name); const [p, setP] = useState({ certificates: [], gallery: [], ...user.profile });
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const [cert, setCert] = useState({ title: "", image: "" }); const [cat, setCat] = useState("General"); const [newCat, setNewCat] = useState("");
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const persist = async (profile = p) => { setErr(""); try { setUser(await api("/doctor/profile", { method: "PUT", body: { name, profile } })); setMsg("Saved."); } catch (e) { setErr(e.message); } };
  const addCert = async () => { if (!cert.title || !cert.image) return setErr("Add a title and an image."); const np = { ...p, certificates: [...p.certificates, { id: Date.now(), ...cert }] }; setP(np); setCert({ title: "", image: "" }); persist(np); };
  const addPhotos = async (e) => { const imgs = await Promise.all([...e.target.files].map((f) => fileToDataUrl(f, 1000))); const np = { ...p, gallery: [...p.gallery, ...imgs.map((image, i) => ({ id: Date.now() + i, category: cat, image }))] }; setP(np); persist(np); e.target.value = ""; };
  const del = (k, id) => { const np = { ...p, [k]: p[k].filter((x) => x.id !== id) }; setP(np); persist(np); };
  const cats = [...new Set(["General", ...p.gallery.map((g) => g.category)])];
  return (
    <>
      <PageHeader title="Profile" subtitle="Update your public profile and professional information." />
      <Tabs tabs={[["profile", "Profile"], ["certificates", "Certificates"], ["gallery", "Gallery"]]} value={tab} onChange={(t) => { setTab(t); setMsg(""); setErr(""); }} />
      {tab === "profile" && <div className="max-w-3xl space-y-4"><Card><h2 className="mb-4 font-semibold">Personal Information</h2><div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls()} /></Field>
        <Field label="Phone" hint="Verified number"><input value={user.phone} disabled className={`${inputCls()} opacity-60`} /></Field>
        <Field label="Email" hint="Verified email"><input value={user.email} disabled className={`${inputCls()} opacity-60`} /></Field>
        <Field label="Location"><input value={p.location || ""} onChange={set("location")} className={inputCls()} /></Field></div></Card>
        <Card><h2 className="mb-4 font-semibold">Professional Information</h2><div className="grid gap-4 sm:grid-cols-2">
        <Field label="Specialization"><input value={user.specialization} disabled className={`${inputCls()} opacity-60`} /></Field>
        <Field label="PMDC number"><input value={user.pmdc} disabled className={`${inputCls()} opacity-60`} /></Field>
        <Field label="Education"><input value={p.education || ""} onChange={set("education")} placeholder="MBBS, FCPS" className={inputCls()} /></Field>
        <Field label="Years of experience"><input value={p.experience || ""} onChange={set("experience")} className={inputCls()} /></Field>
        <Field label="Current workplace"><input value={p.workplace || ""} onChange={set("workplace")} className={inputCls()} /></Field>
        <Field label="Consultation fee (PKR)"><input type="number" min="0" value={p.fee || ""} onChange={set("fee")} className={inputCls()} /></Field>
        <div className="sm:col-span-2"><Field label="Biography"><textarea rows={4} value={p.bio || ""} onChange={set("bio")} className={inputCls()} /></Field></div></div></Card>
        <button onClick={() => persist()} className={btnPrimary}>Save Profile</button></div>}
      {tab === "certificates" && <div className="max-w-3xl space-y-4"><Card><h2 className="mb-3 font-semibold">Add certificate / award</h2><div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input value={cert.title} onChange={(e) => setCert({ ...cert, title: e.target.value })} placeholder="Title, e.g. FCPS Surgery" className={inputCls()} />
        <label className={`${btnGhost} cursor-pointer`}><Upload size={15} />{cert.image ? "Image ready" : "Image"}<input type="file" accept="image/*" className="hidden" onChange={async (e) => e.target.files[0] && setCert({ ...cert, image: await fileToDataUrl(e.target.files[0], 1200) })} /></label>
        <button onClick={addCert} className={btnPrimary}>Add</button></div></Card>
        <div className="grid gap-3 sm:grid-cols-2">{p.certificates.map((c) => <Card key={c.id}><img src={c.image} alt={c.title} className="h-36 w-full rounded-lg object-cover" /><div className="mt-2 flex items-center justify-between"><p className="text-sm font-medium">{c.title}</p><button onClick={() => del("certificates", c.id)} aria-label="Delete" className="text-red-500"><Trash2 size={16} /></button></div></Card>)}</div></div>}
      {tab === "gallery" && <div className="space-y-4"><Card><div className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium">Category<select value={cat} onChange={(e) => setCat(e.target.value)} className={`${inputCls()} mt-1.5`}>{cats.map((c) => <option key={c}>{c}</option>)}</select></label>
        <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category" className={`${inputCls()} max-w-[180px]`} /><button onClick={() => { if (newCat.trim()) { setCat(newCat.trim()); setP({ ...p, gallery: [...p.gallery, { id: Date.now(), category: newCat.trim(), image: "" }] }); setNewCat(""); } }} className={btnGhost}>Create</button>
        <label className={`${btnPrimary} cursor-pointer`}><Upload size={15} />Upload images<input type="file" accept="image/*" multiple className="hidden" onChange={addPhotos} /></label></div></Card>
        {cats.map((c) => { const items = p.gallery.filter((g) => g.category === c && g.image); return items.length ? <div key={c}><h3 className="mb-2 font-semibold">{c}</h3><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{items.map((g) => <div key={g.id} className="group relative"><img src={g.image} alt="" className="aspect-square w-full rounded-lg object-cover" /><button onClick={() => del("gallery", g.id)} aria-label="Delete" className="absolute right-1.5 top-1.5 rounded-md bg-black/60 p-1.5 text-white"><Trash2 size={14} /></button></div>)}</div></div> : null; })}</div>}
      <div className="mt-3"><Alert tone="green">{msg}</Alert><Alert>{err}</Alert></div>
    </>
  );
}
