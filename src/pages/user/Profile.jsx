import React, { useEffect, useState } from 'react'
import api from '../../lib/api'
import { useToast } from '../../components/Toast'
import { useAuth } from '../../lib/AuthContext'

export default function Profile() {
  const { notify }        = useToast()
  const { token, refreshProfile } = useAuth()

  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [editing,  setEditing]  = useState(false)
  const [isKycComplete, setIsKycComplete] = useState(false)

  const EMPTY = { businessName:'', gstin:'', pan:'', addressLine1:'', addressLine2:'', city:'', state:'', pincode:'' }
  const [kyc,   setKyc]   = useState(EMPTY)   // saved / server state
  const [draft, setDraft] = useState(EMPTY)   // in-flight edits

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        const { data } = await api.get('/api/user/me')
        const filled = { ...EMPTY, ...(data.kyc || {}) }
        setIsKycComplete(!!data.isKycComplete)
        setKyc(filled)
        setDraft(filled)
        if (!data.isKycComplete) setEditing(true)   // auto-open edit for new users
      } finally { setLoading(false) }
    })()
  }, [token])

  const startEdit  = () => { setDraft({ ...kyc }); setEditing(true) }
  const cancelEdit = () => { setDraft({ ...kyc }); setEditing(false) }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/api/user/kyc', draft)
      setIsKycComplete(data.isKycComplete)
      setKyc({ ...draft })
      notify(data.isKycComplete ? 'KYC completed successfully!' : 'KYC details updated', 'success')
      refreshProfile()
      setEditing(false)
    } catch (err) {
      notify(err?.response?.data?.error || 'Failed to save KYC', 'error')
    } finally { setSaving(false) }
  }

  /* ─── LOADING ─── */
  if (loading) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&display=swap');
        .pf-loader{font-family:'DM Sans',sans-serif;background:#f5f3ff;min-height:100vh;
          display:flex;align-items:center;justify-content:center;}
        .pf-spin{width:38px;height:38px;border:3px solid rgba(139,92,246,0.15);
          border-top-color:#7c3aed;border-radius:50%;animation:pfs .8s linear infinite;}
        @keyframes pfs{to{transform:rotate(360deg)}}
      `}</style>
      <div className="pf-loader"><div className="pf-spin" /></div>
    </>
  )

  /* ─── MAIN ─── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        /* ── base ── */
        .pf-root{
          font-family:'DM Sans',system-ui,sans-serif;
          background:#f5f3ff; min-height:100vh; color:#1e1b2e;
          position:relative; overflow-x:hidden;
          padding-bottom:env(safe-area-inset-bottom,0px);
        }
        .pf-root::before{
          content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
          background-image:
            linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px);
          background-size:60px 60px;
        }
        .pf-blob{
          position:fixed; top:-180px; left:50%; transform:translateX(-50%);
          width:800px; height:500px; border-radius:50%; pointer-events:none; z-index:0;
          background:radial-gradient(ellipse,rgba(139,92,246,0.08),transparent 65%);
        }
        .pf-wrap{
          max-width:860px; margin:0 auto;
          padding:36px 16px 80px; position:relative; z-index:1;
        }
        @media(min-width:600px){.pf-wrap{padding:48px 28px 80px;}}

        /* ── page header ── */
        .pf-page-hd{
          display:flex; align-items:flex-start; justify-content:space-between;
          flex-wrap:wrap; gap:14px; margin-bottom:28px;
          animation:pfUp .6s ease both;
        }
        .pf-eyebrow{
          display:inline-flex; align-items:center; gap:7px;
          padding:5px 14px; border-radius:100px;
          background:rgba(139,92,246,0.1); border:1px solid rgba(139,92,246,0.22);
          color:#7c3aed; font-size:9px; font-weight:700; letter-spacing:.22em; text-transform:uppercase;
          margin-bottom:10px;
        }
        .pf-edot{
          width:5px; height:5px; border-radius:50%;
          background:#7c3aed; box-shadow:0 0 5px rgba(124,58,237,.5);
          animation:pfpulse 2s ease infinite;
        }
        @keyframes pfpulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
        .pf-h1{
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(34px,5vw,52px);
          color:#1e1b2e; letter-spacing:.02em; line-height:1; margin-bottom:6px;
        }
        .pf-h1 span{color:#7c3aed;}
        .pf-sub{font-size:13px; color:#6b7280; font-weight:400;}

        /* kyc status pill */
        .pf-kpill{
          display:inline-flex; align-items:center; gap:7px;
          padding:8px 16px; border-radius:100px;
          font-size:11px; font-weight:700; letter-spacing:.04em; white-space:nowrap;
        }
        .pf-kpill.ok{background:rgba(5,150,105,.1);border:1px solid rgba(5,150,105,.22);color:#059669;}
        .pf-kpill.pend{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);color:#d97706;}
        .pf-kdot{width:6px;height:6px;border-radius:50%;animation:pfpulse 2s ease infinite;}
        .ok   .pf-kdot{background:#059669;box-shadow:0 0 5px #059669;}
        .pend .pf-kdot{background:#d97706;box-shadow:0 0 5px #d97706;}

        /* ── card ── */
        .pf-card{
          background:white; border:1px solid rgba(139,92,246,0.14);
          border-radius:24px; overflow:hidden;
          box-shadow:0 4px 32px rgba(139,92,246,.07);
          position:relative;
          animation:pfUp .6s .1s ease both;
        }
        .pf-card::before{
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,transparent 10%,#7c3aed 50%,transparent 90%);
        }

        /* card header bar */
        .pf-bar{
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:10px;
          padding:20px 24px 18px;
          border-bottom:1px solid rgba(139,92,246,.08);
        }
        @media(max-width:480px){.pf-bar{padding:16px 18px 14px;}}
        .pf-bar-label{
          font-size:9px; font-weight:700; letter-spacing:.2em;
          text-transform:uppercase; color:#9ca3af;
        }

        /* edit button */
        .pf-edit-btn{
          display:inline-flex; align-items:center; gap:7px;
          padding:8px 18px; border-radius:10px;
          background:rgba(139,92,246,.08); border:1px solid rgba(139,92,246,.2);
          color:#7c3aed; font-size:11px; font-weight:700;
          letter-spacing:.1em; text-transform:uppercase;
          cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif;
        }
        .pf-edit-btn:hover{background:rgba(139,92,246,.14);border-color:rgba(124,58,237,.4);transform:translateY(-1px);}

        /* ── VIEW MODE ── */
        .pf-view-wrap{padding:24px;}
        @media(max-width:480px){.pf-view-wrap{padding:18px;}}

        /* KYC incomplete banner inside card */
        .pf-warn{
          display:flex; align-items:center; gap:12px;
          background:rgba(245,158,11,.07); border:1px solid rgba(245,158,11,.2);
          border-radius:14px; padding:14px 18px; margin-bottom:24px;
        }
        .pf-warn-ico{
          width:34px; height:34px; border-radius:9px; flex-shrink:0;
          background:rgba(245,158,11,.14);
          display:flex; align-items:center; justify-content:center; font-size:17px;
        }
        .pf-warn-txt{font-size:13px;color:#92400e;font-weight:500;line-height:1.5;}
        .pf-warn-txt b{font-weight:700;display:block;margin-bottom:2px;}

        /* view grid — 2 col on tablet+ */
        .pf-vgrid{
          display:grid; grid-template-columns:1fr;
          border:1px solid rgba(139,92,246,.08); border-radius:16px; overflow:hidden;
        }
        @media(min-width:560px){.pf-vgrid{grid-template-columns:1fr 1fr;}}

        .pf-vfield{
          padding:16px 20px;
          border-bottom:1px solid rgba(139,92,246,.08);
          transition:background .2s;
        }
        .pf-vfield:hover{background:#faf8ff;}
        .pf-vfield.span2{grid-column:1/-1;}

        /* remove bottom border from last row */
        @media(min-width:560px){
          .pf-vfield:nth-last-child(1),
          .pf-vfield:nth-last-child(2):not(.span2){border-bottom:none;}
        }
        @media(max-width:559px){
          .pf-vfield:last-child{border-bottom:none;}
        }

        .pf-vlabel{
          font-size:9px; font-weight:700; letter-spacing:.2em;
          text-transform:uppercase; color:#9ca3af; margin-bottom:5px;
        }
        .pf-vval{font-size:15px;font-weight:600;color:#1e1b2e;line-height:1.4;}
        .pf-vval.mt{font-size:13px;color:#c4b5fd;font-weight:400;font-style:italic;}

        /* ── EDIT MODE ── */
        .pf-form-wrap{padding:24px;}
        @media(max-width:480px){.pf-form-wrap{padding:18px;}}

        .pf-fgrid{
          display:grid; grid-template-columns:1fr; gap:16px;
        }
        @media(min-width:560px){.pf-fgrid{grid-template-columns:1fr 1fr;}}

        .pf-field{display:flex;flex-direction:column;gap:6px;}
        .pf-field.span2{grid-column:1/-1;}

        .pf-flabel{
          font-size:9px; font-weight:700; letter-spacing:.2em;
          text-transform:uppercase; color:#6b7280; padding-left:2px;
        }
        .pf-flabel em{color:#7c3aed;font-style:normal;}

        .pf-finput{
          width:100%; box-sizing:border-box;
          background:#f9f7ff; border:1px solid rgba(139,92,246,.18);
          border-radius:12px; padding:13px 16px;
          font-size:14px; font-weight:600; color:#1e1b2e;
          outline:none; font-family:'DM Sans',sans-serif; transition:all .2s;
        }
        .pf-finput::placeholder{color:#c4b5fd;font-weight:400;}
        .pf-finput:focus{
          border-color:rgba(124,58,237,.5); background:white;
          box-shadow:0 0 0 3px rgba(124,58,237,.08);
        }

        /* form footer */
        .pf-ffoot{
          display:flex; align-items:center; justify-content:flex-end;
          gap:10px; flex-wrap:wrap;
          padding:18px 24px 22px;
          border-top:1px solid rgba(139,92,246,.08);
        }
        @media(max-width:480px){
          .pf-ffoot{padding:14px 18px 18px; flex-direction:column-reverse;}
          .pf-ffoot > *{width:100%; justify-content:center;}
        }

        .pf-cancel{
          display:inline-flex; align-items:center; gap:6px;
          padding:11px 22px; border-radius:11px;
          background:white; border:1px solid rgba(139,92,246,.2);
          color:#6b7280; font-size:11px; font-weight:700;
          text-transform:uppercase; letter-spacing:.12em;
          cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif;
        }
        .pf-cancel:hover{border-color:rgba(124,58,237,.35);color:#7c3aed;}

        .pf-save{
          display:inline-flex; align-items:center; gap:8px;
          padding:11px 28px; border-radius:11px;
          background:#7c3aed; color:white; border:none;
          font-size:11px; font-weight:700;
          text-transform:uppercase; letter-spacing:.14em;
          cursor:pointer; transition:all .25s; font-family:'DM Sans',sans-serif;
          box-shadow:0 6px 20px rgba(124,58,237,.28);
          position:relative; overflow:hidden;
        }
        .pf-save::before{
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,.12),transparent);
          opacity:0; transition:opacity .2s;
        }
        .pf-save:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 28px rgba(124,58,237,.4);}
        .pf-save:hover:not(:disabled)::before{opacity:1;}
        .pf-save:active:not(:disabled){transform:scale(.97);}
        .pf-save:disabled{opacity:.5;cursor:not-allowed;}

        .pf-spin2{
          width:13px; height:13px;
          border:2px solid rgba(255,255,255,.3); border-top-color:white;
          border-radius:50%; animation:pfs2 .7s linear infinite;
        }
        @keyframes pfs2{to{transform:rotate(360deg)}}

        @keyframes pfUp{
          from{opacity:0;transform:translateY(18px);}
          to  {opacity:1;transform:translateY(0);}
        }
      `}</style>

      <div className="pf-root">
        <div className="pf-blob" />
        <div className="pf-wrap">

          {/* ── PAGE HEADER ── */}
          <div className="pf-page-hd">
            <div>
              <div className="pf-eyebrow"><span className="pf-edot" /> My Account</div>
              <h1 className="pf-h1">Business <span>Profile</span></h1>
              <p className="pf-sub">Manage your KYC details to unlock wholesale ordering.</p>
            </div>
            <div className={`pf-kpill ${isKycComplete ? 'ok' : 'pend'}`}>
              <span className="pf-kdot" />
              {isKycComplete ? 'KYC Verified' : 'KYC Pending'}
            </div>
          </div>

          {/* ── CARD ── */}
          <div className="pf-card">

            {/* bar */}
            <div className="pf-bar">
              <span className="pf-bar-label">
                {editing ? 'Edit KYC Details' : 'KYC Information'}
              </span>
              {!editing && (
                <button className="pf-edit-btn" onClick={startEdit}>
                  <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                  Edit Details
                </button>
              )}
            </div>

            {/* ── VIEW ── */}
            {!editing && (
              <div className="pf-view-wrap">
                {!isKycComplete && (
                  <div className="pf-warn">
                    <div className="pf-warn-ico">⚠️</div>
                    <div className="pf-warn-txt">
                      <b>KYC Incomplete</b>
                      Fill in your business details below to start placing wholesale orders.
                    </div>
                  </div>
                )}
                <div className="pf-vgrid">
                  <VF label="Business Name"  val={kyc.businessName} />
                  <VF label="GSTIN"          val={kyc.gstin} />
                  <VF label="PAN"            val={kyc.pan} />
                  <VF label="Pincode"        val={kyc.pincode} />
                  <VF label="City"           val={kyc.city} />
                  <VF label="State"          val={kyc.state} />
                  <VF label="Address Line 1" val={kyc.addressLine1} span2 />
                  <VF label="Address Line 2" val={kyc.addressLine2} span2 optional />
                </div>
              </div>
            )}

            {/* ── EDIT ── */}
            {editing && (
              <form onSubmit={save}>
                <div className="pf-form-wrap">
                  <div className="pf-fgrid">
                    <EF label="Business Name"  val={draft.businessName}  set={v=>setDraft({...draft,businessName:v})}  req />
                    <EF label="GSTIN"          val={draft.gstin}         set={v=>setDraft({...draft,gstin:v})}          req />
                    <EF label="PAN"            val={draft.pan}           set={v=>setDraft({...draft,pan:v})}            req />
                    <EF label="Pincode"        val={draft.pincode}       set={v=>setDraft({...draft,pincode:v})}        req />
                    <EF label="City"           val={draft.city}          set={v=>setDraft({...draft,city:v})}           req />
                    <EF label="State"          val={draft.state}         set={v=>setDraft({...draft,state:v})}          req />
                    <EF label="Address Line 1" val={draft.addressLine1}  set={v=>setDraft({...draft,addressLine1:v})}   req span2 />
                    <EF label="Address Line 2" val={draft.addressLine2}  set={v=>setDraft({...draft,addressLine2:v})}   span2 />
                  </div>
                </div>

                <div className="pf-ffoot">
                  {isKycComplete && (
                    <button type="button" className="pf-cancel" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="pf-save" disabled={saving}>
                    {saving
                      ? <><div className="pf-spin2" /> Saving…</>
                      : <>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                          </svg>
                          Save KYC
                        </>
                    }
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </>
  )
}

/* ── view field ── */
function VF({ label, val, span2, optional }) {
  return (
    <div className={`pf-vfield${span2 ? ' span2' : ''}`}>
      <div className="pf-vlabel">{label}</div>
      {val
        ? <div className="pf-vval">{val}</div>
        : <div className="pf-vval mt">{optional ? 'Not provided' : '—'}</div>
      }
    </div>
  )
}

/* ── edit field ── */
function EF({ label, val, set, req, span2 }) {
  return (
    <div className={`pf-field${span2 ? ' span2' : ''}`}>
      <label className="pf-flabel">
        {label}{req && <em> *</em>}
      </label>
      <input
        className="pf-finput"
        value={val || ''}
        onChange={e => set(e.target.value)}
        required={req}
        placeholder={`Enter ${label.toLowerCase()}…`}
      />
    </div>
  )
}