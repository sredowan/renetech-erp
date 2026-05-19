const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/html2pdf-BmA5juoY.js","assets/index-CT9GHmV2.js","assets/index-_o7xUbc4.css"])))=>i.map(i=>d[i]);
import{_ as q}from"./index-CT9GHmV2.js";import{l as K}from"./logo-WQCnS321.js";const N=async()=>(await q(async()=>{const{default:t}=await import("./html2pdf-BmA5juoY.js").then(e=>e.h);return{default:t}},__vite__mapDeps([0,1,2]))).default,L=()=>({name:"Language Academy Bangladesh",address:"SEL SUFI SQUARE, Unit: 1104, Level: 11, Dhanmondi R/A, Dhaka 1209",phone:"+880 1913-373581",email:"info@languageacademy.com.bd",website:"languageacademy.com.bd"});let I=null;const P=()=>new Promise(t=>{if(I){t(I);return}const e=new Image;e.crossOrigin="anonymous",e.onload=()=>{const o=document.createElement("canvas");o.width=e.width,o.height=e.height,o.getContext("2d").drawImage(e,0,0),I=o.toDataURL("image/png"),t(I)},e.onerror=()=>t(""),e.src=K}),F=t=>{if(t===0)return"Zero Taka Only";const e=["","One ","Two ","Three ","Four ","Five ","Six ","Seven ","Eight ","Nine ","Ten ","Eleven ","Twelve ","Thirteen ","Fourteen ","Fifteen ","Sixteen ","Seventeen ","Eighteen ","Nineteen "],o=["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"],i=("000000000"+Math.floor(Math.abs(t))).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);if(!i)return String(t)+" Taka Only";let d="";return d+=i[1]!=0?(e[Number(i[1])]||o[i[1][0]]+" "+e[i[1][1]])+"Crore ":"",d+=i[2]!=0?(e[Number(i[2])]||o[i[2][0]]+" "+e[i[2][1]])+"Lakh ":"",d+=i[3]!=0?(e[Number(i[3])]||o[i[3][0]]+" "+e[i[3][1]])+"Thousand ":"",d+=i[4]!=0?(e[Number(i[4])]||o[i[4][0]]+" "+e[i[4][1]])+"Hundred ":"",d+=i[5]!=0?(d!==""?"and ":"")+(e[Number(i[5])]||o[i[5][0]]+" "+e[i[5][1]]):"",d.trim()+" Taka Only"},Q=async(t,e)=>{const o=L(),i=await P();return`
    <div style="margin-bottom:0; padding:0;">
      <!-- Top Accent Bar -->
      <div style="height:5px; background:linear-gradient(90deg, #275fa7, #7bc62e); border-radius:3px 3px 0 0;"></div>
      
      <!-- Header Row -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 24px 14px; background:#fafbfc; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:12px;">
          ${i?`<img src="${i}" style="height:44px;" />`:""}
          <div>
            <div style="font-size:17px; font-weight:800; color:#275fa7; letter-spacing:0.5px; font-family:'Outfit','Inter',sans-serif;">LANGUAGE ACADEMY BANGLADESH</div>
            <div style="font-size:9px; color:#64748b; margin-top:2px;">${o.address}</div>
            <div style="font-size:9px; color:#64748b;">Phone: ${o.phone} | ${o.email} | ${o.website}</div>
          </div>
        </div>
        ${t?`
        <div style="text-align:right;">
          <div style="font-size:15px; font-weight:700; color:#275fa7; border:2px solid #275fa7; padding:5px 18px; border-radius:6px; letter-spacing:1px; text-transform:uppercase;">${t}</div>
          ${e?`<div style="font-size:10px; color:#64748b; margin-top:6px;">${e}</div>`:""}
        </div>
        `:""}
      </div>
    </div>
  `},ot=(t,e,o,i,d)=>{const b=n=>`BDT ${Number(n||0).toLocaleString()}`,p=n=>n?new Date(n).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"-",c=["amount","due","debit","credit","balance"],a=o||((n,s)=>["amount","due","debit","credit","balance"].includes(n)?b(s):["date","due_date","start_date","expiry_date","enrollment_date"].includes(n)?p(s):s||"-"),x={};t.forEach(n=>{c.includes(n)&&(x[n]=e.reduce((s,m)=>s+Number(m[n]||0),0))});const u=e.length>0&&Object.keys(x).length>0,r="padding:10px 12px; font-size:10px; font-weight:700; color:#fff; text-align:left; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #1e4d8a; white-space:nowrap;",g="padding:10px 12px; font-size:10px; font-weight:700; color:#fff; text-align:right; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #1e4d8a; white-space:nowrap;",f=t.map(n=>`<th style="${c.includes(n)?g:r}">${n.replace(/_/g," ")}</th>`).join(""),v=e.map((n,s)=>{const m=s%2===0?"#ffffff":"#f8fafc",w=t.map(y=>`<td style="padding:9px 12px; font-size:11px; color:#334155; border-bottom:1px solid #eef2f6; ${c.includes(y)?"text-align:right; font-weight:600; font-variant-numeric:tabular-nums;":""} white-space:nowrap;">${a(y,n[y])}</td>`).join("");return`<tr style="background:${m};">${w}</tr>`}).join("");let l="";return u&&(l=`<tr>${t.map((s,m)=>m===0?`<td style="padding:10px 12px; font-size:12px; font-weight:800; color:#1e293b; border-top:2px solid #275fa7; background:#f0f7ff;">Total (${e.length} records)</td>`:c.includes(s)?`<td style="padding:10px 12px; font-size:12px; font-weight:800; color:#275fa7; text-align:right; border-top:2px solid #275fa7; background:#f0f7ff; font-variant-numeric:tabular-nums;">${b(x[s])}</td>`:'<td style="padding:10px 12px; border-top:2px solid #275fa7; background:#f0f7ff;"></td>').join("")}</tr>`),`
    <table style="width:100%; border-collapse:collapse; margin-top:0; border:1px solid #e2e8f0; border-radius:6px;">
      <thead>
        <tr style="background:linear-gradient(135deg, #275fa7 0%, #1e4d8a 100%);">${f}</tr>
      </thead>
      <tbody>${v}</tbody>
      ${l?`<tfoot>${l}</tfoot>`:""}
    </table>
  `},H=(t=["Created by","Received by","Approved by"])=>`
    <div style="display:flex; justify-content:space-between; margin-top:48px; padding-top:16px;">
      ${t.map(o=>`
    <div style="flex:1; text-align:center; padding:0 16px;">
      <div style="border-bottom:1px solid #334155; width:100%; margin-bottom:8px; height:40px;"></div>
      <div style="font-size:11px; font-weight:600; color:#334155;">${o}</div>
    </div>
  `).join("")}
    </div>
  `,j=(t,e=.04)=>t?`
    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:0; pointer-events:none;">
      <img src="${t}" style="width:280px; height:280px; opacity:${e}; object-fit:contain;" />
    </div>
  `:"",Z=async t=>{var n,s,m,w,y,$,z,S,A,D,_,C,B,E,k,T,G,O,R,U,M,V,W,Y;const e=L(),o=await P(),i=parseFloat(t.amount||0),d=F(Math.floor(i)),b=t.receipt_no||`RCP-${t.id}-${Date.now().toString().slice(-4)}`,p=t.paid_at?new Date(t.paid_at).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"}):new Date().toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"}),c=(t.method||"cash").toUpperCase(),h=((n=t.Branch)==null?void 0:n.name)||((s=t.branch)==null?void 0:s.name)||t.branch_name||"Head Office",a=t.source==="manual"||!t.enrollment_id&&t.invoice_id||((m=t.Invoice)==null?void 0:m.invoice_type)==="custom",x=a?((w=t.Invoice)==null?void 0:w.customer_name)||(($=(y=t.Invoice)==null?void 0:y.Customer)==null?void 0:$.name)||t.customer_name||"Customer":((A=(S=(z=t.Enrollment)==null?void 0:z.Student)==null?void 0:S.User)==null?void 0:A.name)||((C=(_=(D=t.Invoice)==null?void 0:D.Student)==null?void 0:_.User)==null?void 0:C.name)||t.student_name||"Student",u=a?"Name":"Student Name",r=a?(E=(B=t.Invoice)==null?void 0:B.Customer)!=null&&E.company?` (${t.Invoice.Customer.company})`:"":` <span style="color:#64748b; font-weight:500;">(STU-${((k=t.Enrollment)==null?void 0:k.student_id)||((T=t.Invoice)==null?void 0:T.student_id)||t.student_id||"-"})</span>`,g=a?"For":"Course Name",f=a?((O=(G=t.Invoice)==null?void 0:G.IncomeCategory)==null?void 0:O.name)||"Custom Income":((M=(U=(R=t.Enrollment)==null?void 0:R.Batch)==null?void 0:U.Course)==null?void 0:M.title)||t.course_name||"Tuition Fee",v=a?"":` <span style="color:#64748b; font-size:11px;">(Batch: ${((W=(V=t.Enrollment)==null?void 0:V.Batch)==null?void 0:W.code)||t.batch_code||"-"})</span>`,l=a?((Y=t.Invoice)==null?void 0:Y.notes)||t.transaction_ref||"Custom Income Payment":t.transaction_ref?`Ref: ${t.transaction_ref}`:"Tuition Fee Payment";return`
    <div style="width:100%; font-family:'Inter','Segoe UI',sans-serif; position:relative; overflow:hidden; background:#ffffff; padding:0;">
      
      <!-- Top Accent Bar -->
      <div style="height:4px; background:linear-gradient(90deg, #275fa7, #7bc62e);"></div>
      
      <!-- Header -->
      <div style="padding:20px 28px 14px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:12px;">
          ${o?`<img src="${o}" style="height:48px;" />`:""}
          <div>
            <div style="font-size:18px; font-weight:800; color:#275fa7; font-family:'Outfit',sans-serif;">LANGUAGE ACADEMY BANGLADESH</div>
            <div style="font-size:9px; color:#64748b;">${e.address}</div>
            <div style="font-size:9px; color:#64748b;">Phone: ${e.phone} | ${e.email} | ${e.website}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px; font-weight:800; color:#275fa7; letter-spacing:2px; border:2px solid #275fa7; padding:4px 14px; border-radius:6px;">MONEY RECEIPT</div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:18px 28px; position:relative;">
        ${j(o,.04)}

        <!-- Receipt Meta Row -->
        <div style="display:flex; justify-content:space-between; margin-bottom:18px; position:relative; z-index:1;">
          <div style="display:flex; gap:28px;">
            <div>
              <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Receipt No</div>
              <div style="font-size:13px; font-weight:700; color:#275fa7;">${b}</div>
            </div>
            <div>
              <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Date / Time</div>
              <div style="font-size:13px; font-weight:600;">${p}</div>
            </div>
            <div>
              <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Branch</div>
              <div style="font-size:13px; font-weight:600;">${h}</div>
            </div>
          </div>
        </div>

        <!-- Detail Table -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:18px; position:relative; z-index:1;">
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0; width:30%;">${u}</td>
            <td style="padding:10px 14px; font-size:13px; font-weight:700; color:#1e293b; border:1px solid #e2e8f0;">${x}${r}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">${g}</td>
            <td style="padding:10px 14px; font-size:13px; font-weight:600; color:#1e293b; border:1px solid #e2e8f0;">${f}${v}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Payment Method</td>
            <td style="padding:10px 14px; font-size:13px; font-weight:600; color:#1e293b; border:1px solid #e2e8f0;">${c}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Amount (BDT)</td>
            <td style="padding:10px 14px; font-size:20px; font-weight:800; color:#275fa7; border:1px solid #e2e8f0;">৳${i.toLocaleString()}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Amount in Words</td>
            <td style="padding:10px 14px; font-size:12px; font-weight:600; color:#475569; border:1px solid #e2e8f0; text-transform:uppercase;">${d}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Notes</td>
            <td style="padding:10px 14px; font-size:13px; color:#334155; border:1px solid #e2e8f0;">${l}</td>
          </tr>
        </table>

        <!-- Signatures -->
        ${H(["Created by","Received by","Approved by"])}
      </div>

      <!-- Bottom Accent Bar -->
      <div style="height:3px; background:linear-gradient(90deg, #7bc62e, #275fa7); margin-top:8px;"></div>
    </div>
  `},it=async t=>{const e=await Z(t),o=document.createElement("div");o.innerHTML=e,o.style.background="white";const i={margin:[6,6,6,6],filename:`Receipt-${t.receipt_no||t.id}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff"},jsPDF:{unit:"mm",format:"a5",orientation:"landscape"}};await(await N())().set(i).from(o).save()},J=async t=>{var n,s,m,w,y,$,z,S,A,D,_,C,B,E,k,T;const e=L(),o=await P(),i=parseFloat(t.amount||0),d=parseFloat(t.paid||0),b=i-d,p=F(Math.floor(i)),c=t.issued_at?new Date(t.issued_at).toLocaleDateString("en-GB",{dateStyle:"medium"}):new Date().toLocaleDateString("en-GB",{dateStyle:"medium"}),h=t.due_date?new Date(t.due_date).toLocaleDateString("en-GB",{dateStyle:"medium"}):"N/A",a=t.invoice_type==="custom",x=a?t.customer_name||((n=t.Customer)==null?void 0:n.name)||"Customer":((m=(s=t.Student)==null?void 0:s.User)==null?void 0:m.name)||(($=(y=(w=t.Enrollment)==null?void 0:w.Student)==null?void 0:y.User)==null?void 0:$.name)||"Student",u=a&&(t.customer_company||((z=t.Customer)==null?void 0:z.company))||"",r=a&&(t.customer_phone||((S=t.Customer)==null?void 0:S.phone))||"",g=a?t.customer_email||((A=t.Customer)==null?void 0:A.email)||"":((_=(D=t.Student)==null?void 0:D.User)==null?void 0:_.email)||"",f=a&&(t.customer_address||((C=t.Customer)==null?void 0:C.address))||"",v=a?((B=t.IncomeCategory)==null?void 0:B.name)||"Custom Income":((T=(k=(E=t.Enrollment)==null?void 0:E.Batch)==null?void 0:k.Course)==null?void 0:T.title)||"Tuition Fee",l={paid:"#10b981",pending:"#f59e0b",overdue:"#ef4444",partial:"#3b82f6",draft:"#64748b"}[t.status]||"#64748b";return`
    <div style="width:100%; font-family:'Inter','Segoe UI',sans-serif; position:relative; overflow:hidden; background:#ffffff; padding:0;">
      
      <!-- Top Accent Bar -->
      <div style="height:4px; background:linear-gradient(90deg, #275fa7, #7bc62e);"></div>
      
      <!-- Header -->
      <div style="padding:24px 32px 16px; display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:14px;">
          ${o?`<img src="${o}" style="height:52px;" />`:""}
          <div>
            <div style="font-size:20px; font-weight:800; color:#275fa7; font-family:'Outfit',sans-serif;">LANGUAGE ACADEMY BANGLADESH</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">${e.address}</div>
            <div style="font-size:10px; color:#64748b;">Phone: ${e.phone} | ${e.email}</div>
            <div style="font-size:10px; color:#64748b;">Web: ${e.website}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:20px; font-weight:800; color:#275fa7; letter-spacing:3px; border:2px solid #275fa7; padding:6px 18px; border-radius:6px;">INVOICE</div>
          <div style="margin-top:10px; font-size:12px; color:#64748b;">Invoice #: <strong style="color:#1e293b;">${t.invoice_no||"N/A"}</strong></div>
          <div style="font-size:12px; color:#64748b;">Date: <strong style="color:#1e293b;">${c}</strong></div>
          <div style="font-size:12px; color:#64748b;">Due: <strong style="color:#1e293b;">${h}</strong></div>
          <div style="margin-top:6px;"><span style="padding:4px 12px; border-radius:12px; font-size:11px; font-weight:700; background:${l}20; color:${l}; text-transform:uppercase;">${t.status}</span></div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:24px 32px; position:relative;">
        ${j(o,.03)}

        <!-- Bill To -->
        <div style="margin-bottom:24px; position:relative; z-index:1;">
          <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:6px; font-weight:700;">Bill To</div>
          <div style="font-size:15px; font-weight:700; color:#1e293b;">${x}</div>
          ${u?`<div style="font-size:12px; color:#475569;">${u}</div>`:""}
          ${r?`<div style="font-size:12px; color:#64748b;">📱 ${r}</div>`:""}
          ${g?`<div style="font-size:12px; color:#64748b;">✉ ${g}</div>`:""}
          ${f?`<div style="font-size:12px; color:#64748b;">📍 ${f}</div>`:""}
        </div>

        <!-- Items Table -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px; position:relative; z-index:1;">
          <thead>
            <tr style="background:#275fa7;">
              <th style="padding:10px 14px; font-size:10px; font-weight:700; color:#fff; text-align:left; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #1e4d8a;">#</th>
              <th style="padding:10px 14px; font-size:10px; font-weight:700; color:#fff; text-align:left; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #1e4d8a;">Description</th>
              <th style="padding:10px 14px; font-size:10px; font-weight:700; color:#fff; text-align:right; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #1e4d8a;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#f8fafc;">
              <td style="padding:12px 14px; font-size:12px; border:1px solid #e2e8f0;">1</td>
              <td style="padding:12px 14px; font-size:13px; font-weight:600; color:#1e293b; border:1px solid #e2e8f0;">
                ${v}
                ${t.notes?`<div style="font-size:11px; color:#64748b; margin-top:4px;">${t.notes}</div>`:""}
              </td>
              <td style="padding:12px 14px; font-size:14px; font-weight:700; color:#1e293b; border:1px solid #e2e8f0; text-align:right;">৳${i.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals -->
        <div style="display:flex; justify-content:flex-end; position:relative; z-index:1;">
          <table style="width:260px; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 14px; font-size:12px; font-weight:600; color:#64748b; border:1px solid #e2e8f0;">Subtotal</td>
              <td style="padding:8px 14px; font-size:13px; font-weight:600; text-align:right; border:1px solid #e2e8f0;">৳${i.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding:8px 14px; font-size:12px; font-weight:600; color:#10b981; border:1px solid #e2e8f0;">Paid</td>
              <td style="padding:8px 14px; font-size:13px; font-weight:600; text-align:right; color:#10b981; border:1px solid #e2e8f0;">৳${d.toLocaleString()}</td>
            </tr>
            <tr style="background:#f0f9ff;">
              <td style="padding:10px 14px; font-size:13px; font-weight:800; color:#275fa7; border:1px solid #e2e8f0;">Balance Due</td>
              <td style="padding:10px 14px; font-size:16px; font-weight:800; text-align:right; color:#275fa7; border:1px solid #e2e8f0;">৳${b.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Amount in Words -->
        <div style="margin-top:16px; padding:10px 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; position:relative; z-index:1;">
          <span style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; font-weight:700;">Amount in Words: </span>
          <span style="font-size:12px; font-weight:600; color:#475569; text-transform:uppercase;">${p}</span>
        </div>

        <!-- Signatures -->
        ${H(["Prepared by","Received by","Authorized by"])}
      </div>

      <!-- Footer -->
      <div style="padding:10px 32px; border-top:1px solid #e2e8f0; text-align:center;">
        <div style="font-size:10px; color:#94a3b8;">Thank you for your business · ${e.name} · ${e.website}</div>
      </div>
      
      <!-- Bottom Accent Bar -->
      <div style="height:3px; background:linear-gradient(90deg, #7bc62e, #275fa7);"></div>
    </div>
  `},nt=async t=>{const e=await J(t),o=document.createElement("div");o.innerHTML=e,o.style.background="white";const i={margin:[8,8,8,8],filename:`Invoice-${t.invoice_no||t.id}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff"},jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}};await(await N())().set(i).from(o).save()},X=async t=>{var u,r;const e=L(),o=await P(),i=parseFloat(t.amount||0),d=F(Math.floor(i)),b=`VCH-${t.id}-${Date.now().toString().slice(-4)}`,p=t.date?new Date(t.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}),c=((u=t.Branch)==null?void 0:u.name)||((r=t.branch)==null?void 0:r.name)||t.branch_name||"Head Office",h=t.category||"Office Expense",a=(t.payment_method||"cash").replace(/_/g," ").toUpperCase(),x=t.description||"Office Expense";return`
    <div style="width:100%; font-family:'Inter','Segoe UI',sans-serif; position:relative; overflow:hidden; background:#ffffff; padding:0;">
      
      <!-- Top Accent Bar -->
      <div style="height:4px; background:linear-gradient(90deg, #275fa7, #7bc62e);"></div>
      
      <!-- Header -->
      <div style="padding:20px 28px 14px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:12px;">
          ${o?`<img src="${o}" style="height:48px;" />`:""}
          <div>
            <div style="font-size:18px; font-weight:800; color:#275fa7; font-family:'Outfit',sans-serif;">LANGUAGE ACADEMY BANGLADESH</div>
            <div style="font-size:9px; color:#64748b;">${e.address}</div>
            <div style="font-size:9px; color:#64748b;">Phone: ${e.phone} | ${e.email} | ${e.website}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:16px; font-weight:800; color:#275fa7; letter-spacing:2px; border:2px solid #275fa7; padding:4px 14px; border-radius:6px;">MONEY VOUCHER</div>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:18px 28px; position:relative;">
        ${j(o,.04)}

        <!-- Voucher Meta Row -->
        <div style="display:flex; justify-content:space-between; margin-bottom:18px; position:relative; z-index:1;">
          <div style="display:flex; gap:28px;">
            <div>
              <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Voucher No</div>
              <div style="font-size:13px; font-weight:700; color:#275fa7;">${b}</div>
            </div>
            <div>
              <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Date</div>
              <div style="font-size:13px; font-weight:600;">${p}</div>
            </div>
            <div>
              <div style="font-size:10px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Branch</div>
              <div style="font-size:13px; font-weight:600;">${c}</div>
            </div>
          </div>
        </div>

        <!-- Detail Table -->
        <table style="width:100%; border-collapse:collapse; margin-bottom:18px; position:relative; z-index:1;">
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0; width:30%;">Payee</td>
            <td style="padding:10px 14px; font-size:13px; font-weight:600; color:#1e293b; border:1px solid #e2e8f0;">${h}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Payment Method</td>
            <td style="padding:10px 14px; font-size:13px; font-weight:600; color:#1e293b; border:1px solid #e2e8f0;">${a}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Amount (BDT)</td>
            <td style="padding:10px 14px; font-size:20px; font-weight:800; color:#275fa7; border:1px solid #e2e8f0;">৳${i.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Amount in Words</td>
            <td style="padding:10px 14px; font-size:12px; font-weight:600; color:#475569; border:1px solid #e2e8f0; text-transform:uppercase;">${d}</td>
          </tr>
          <tr style="background:#f8fafc;">
            <td style="padding:10px 14px; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; border:1px solid #e2e8f0;">Reason / Description</td>
            <td style="padding:10px 14px; font-size:13px; color:#334155; border:1px solid #e2e8f0;">${x}</td>
          </tr>
        </table>

        <!-- Signatures -->
        ${H(["Created by","Checked by","Approved by"])}
      </div>

      <!-- Bottom Accent Bar -->
      <div style="height:3px; background:linear-gradient(90deg, #7bc62e, #275fa7); margin-top:8px;"></div>
    </div>
  `},rt=async t=>{const e=await X(t),o=document.createElement("div");o.innerHTML=e,o.style.background="white";const i={margin:[6,6,6,6],filename:`Voucher-${t.id}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff"},jsPDF:{unit:"mm",format:"a5",orientation:"landscape"}};await(await N())().set(i).from(o).save()},at=async(t,e)=>{const o=L(),i=e!=null&&e.from&&(e!=null&&e.to)?`Period: ${e.from} to ${e.to}`:`Generated: ${new Date().toLocaleDateString("en-GB",{dateStyle:"medium"})}`,d=await Q("Expense Report",i),b=t.reduce((r,g)=>r+(g.status==="deleted"?0:parseFloat(g.amount||0)),0),p="padding:10px 12px; font-size:10px; font-weight:700; color:#fff; text-transform:uppercase; letter-spacing:0.5px; border-bottom:2px solid #1e4d8a; white-space:nowrap;",c=t.map((r,g)=>{const f=r.status==="deleted",v=f?"line-through":"none",l=f?"#94a3b8":"#334155";return`
    <tr style="background:${g%2===0?"#ffffff":"#f8fafc"};">
      <td style="padding:9px 12px; border-bottom:1px solid #eef2f6; font-size:11px; color:${l}; white-space:nowrap;">${r.date?new Date(r.date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"-"}</td>
      <td style="padding:9px 12px; border-bottom:1px solid #eef2f6; font-size:11px; color:${l};">
        <span style="text-decoration:${v}">${r.description||"-"}</span>
        ${f?`<div style="font-size:9px; color:#ef4444; margin-top:2px;">Reversed: ${r.deletion_reason||"N/A"}</div>`:""}
      </td>
      <td style="padding:9px 12px; border-bottom:1px solid #eef2f6; font-size:11px; color:${l};">${r.category||"-"}</td>
      <td style="padding:9px 12px; border-bottom:1px solid #eef2f6; font-size:11px; text-align:right; font-weight:600; text-decoration:${v}; color:${l}; font-variant-numeric:tabular-nums;">৳${parseFloat(r.amount).toLocaleString()}</td>
      <td style="padding:9px 12px; border-bottom:1px solid #eef2f6; font-size:11px; color:${l}; text-transform:capitalize;">${(r.payment_method||"").replace(/_/g," ")}</td>
      <td style="padding:9px 12px; border-bottom:1px solid #eef2f6; font-size:11px; color:${f?"#ef4444":"#10b981"}; font-weight:600; text-transform:uppercase;">${f?"REVERSED":r.status}</td>
    </tr>`}).join(""),h=`
    <div style="font-family:'Inter','Segoe UI',sans-serif; background:#fff; color:#1e293b; padding:0;">
      ${d}
      <div style="padding:18px 24px 24px;">
        <table style="width:100%; border-collapse:collapse; border:1px solid #e2e8f0;">
          <thead>
            <tr style="background:linear-gradient(135deg, #275fa7 0%, #1e4d8a 100%);">
              <th style="${p} text-align:left;">Date</th>
              <th style="${p} text-align:left;">Description</th>
              <th style="${p} text-align:left;">Category</th>
              <th style="${p} text-align:right;">Amount</th>
              <th style="${p} text-align:left;">Method</th>
              <th style="${p} text-align:left;">Status</th>
            </tr>
          </thead>
          <tbody>${c}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:10px 12px; font-size:12px; font-weight:800; color:#1e293b; text-align:right; border-top:2px solid #275fa7; background:#f0f7ff;">Total (${t.filter(r=>r.status!=="deleted").length} active records)</td>
              <td style="padding:10px 12px; font-size:13px; font-weight:800; color:#275fa7; text-align:right; border-top:2px solid #275fa7; background:#f0f7ff; font-variant-numeric:tabular-nums;">৳${b.toLocaleString()}</td>
              <td colspan="2" style="border-top:2px solid #275fa7; background:#f0f7ff;"></td>
            </tr>
          </tfoot>
        </table>

        <!-- Footer -->
        <div style="margin-top:28px; padding-top:10px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:9px; color:#94a3b8;">Generated on ${new Date().toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"})}</div>
          <div style="font-size:9px; color:#94a3b8;">${o.name} Finance System · ${o.website}</div>
        </div>
      </div>
      <!-- Bottom Accent Bar -->
      <div style="height:4px; background:linear-gradient(90deg, #7bc62e, #275fa7); border-radius:0 0 3px 3px;"></div>
    </div>
  `,a=document.createElement("div");a.innerHTML=h,a.style.background="white";const x={margin:[8,8,8,8],filename:`Expense-Report-${new Date().toISOString().split("T")[0]}.pdf`,image:{type:"jpeg",quality:.98},html2canvas:{scale:2,useCORS:!0,backgroundColor:"#ffffff"},jsPDF:{unit:"mm",format:"a4",orientation:"landscape"}};await(await N())().set(x).from(a).save()};export{at as a,rt as b,Q as c,nt as d,ot as e,it as f,L as g,Z as h};
