(() => {
  const $ = (s) => document.querySelector(s);
  const fmt = (v) => Number.isFinite(v) ? v.toLocaleString() : "N/D";
  const asNum = (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(String(v).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  };
  const toDate = (v) => (v instanceof Date && !isNaN(v)) ? v : (isNaN(new Date(v)) ? null : new Date(v));
  const qOf = (d) => d ? `Q${Math.floor(d.getMonth()/3)+1}` : "N/A";
  const sum = (arr,k) => arr.reduce((a,x)=>a+(x[k]||0),0);
  const groupBy = (arr,key) => arr.reduce((m,x)=>((m[x[key]||"N/A"]=(m[x[key]||"N/A"]||[])).push(x),m),{});
  const uniq = (arr) => Array.from(new Set(arr));

  let workbook = null;
  let raw = [];
  let rows = [];
  let cols = null;
  const charts = { openClosed:null, topOwners:null, winRate:null };

  const filter = { quarter: "all", owner: "all" };
  const dataView = () => rows.filter(r => {
    const qOk = filter.quarter === "all" ? true : (r.Quarter === filter.quarter);
    const oOk = filter.owner   === "all" ? true : ((r.Owner||"") === filter.owner);
    return qOk && oOk;
  });

  const chatWin = $("#chatWindow");
  const chatInput = $("#chatInput");
  const chatSend  = $("#chatSend");
  const insightsBox = $("#insights");
  const sheetPicker = $("#sheetPicker");
  const sheetSelect = $("#sheetSelect");

  const filterQuarter = $("#filterQuarter");
  const filterOwner   = $("#filterOwner");
  const resetFilters  = $("#btnResetFilters");

  const btnXLSX = $("#btnExportXLSX");
  const btnCSV  = $("#btnExportCSV");

  const liveReq = $("#liveReq");
  const liveReqSummary = $("#liveReqSummary");

  if (window.Chart) {
    Chart.defaults.color = '#dfe7ff';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.15)';
    Chart.defaults.font.size = 11;
  }
  function markHasChart(canvas){
    const box = canvas && canvas.closest('.chart-box');
    if (box) box.classList.add('has-chart');
    if (canvas) { canvas.style.width = '100%'; canvas.style.height = '100%'; }
  }

  function detectCols(sample){
    const keys = Object.keys(sample || {});
    const f = (rxs) => keys.find(k => rxs.some(rx => rx.test(k))) || null;
    return {
      owner:   f([/^Owner$/i]),
      account: f([/^Account$/i]),
      topic:   f([/^Topic$/i]),
      opp:     f([/Opportunity\s*Number/i, /^Id$/i]),
      status:  f([/^Status$/i]),
      stage:   f([/Sales\s*Stage/i]),
      prob:    f([/Probability/i]),
      tcv:     f([/^TCV(\s|_)?CHF$/i, /^TCV$/i, /TCV/i]),
      gp:      f([/REVENUE\s*GP\s*CHF/i, /\bGP\b/i]),
      close:   f([/Close\s*Date/i]),
      create:  f([/Creation\s*Date/i]),
      lob:     f([/Business\s*Type/i, /Linea\s*Negocio/i]),
    };
  }

  function normalize(){
    rows = raw.map((r,i) => {
      const Owner  = String(cols.owner ? r[cols.owner] : r.Owner || "N/A");
      const Account= String(cols.account ? r[cols.account] : r.Account || "N/A");
      const Topic  = String(cols.topic ? r[cols.topic] : r.Topic || `Opp ${i+1}`);
      const OppNum = String(cols.opp ? r[cols.opp] : r["Opportunity Number"] || `row_${i+1}`);
      const Status = String(cols.status ? r[cols.status] : r.Status || "").trim();
      const Stage  = String(cols.stage ? r[cols.stage] : r["Sales Stage"] || "").trim();
      const Prob   = asNum(cols.prob ? r[cols.prob] : r["Probability in %"]);
      const TCV    = asNum(cols.tcv  ? r[cols.tcv]  : r["TCV CHF"]);
      const GP     = asNum(cols.gp   ? r[cols.gp]   : r["REVENUE GP CHF"]);
      const CloseD = toDate(cols.close ? r[cols.close]: r["Close Date"]);
      const CreateD= toDate(cols.create? r[cols.create]: r["Creation Date"]);
      const LOB    = String(cols.lob ? r[cols.lob] : r["Business Type"] || "N/A");
      return { Opportunity: OppNum, Topic, Account, Owner, BusinessType: LOB,
               Status, SalesStage: Stage, Probability: Prob, TCV, GP,
               CreationDate: CreateD, CloseDate: CloseD, Quarter: qOf(CloseD) };
    });
  }

  const isWon  = r => /won|ganad/i.test(r.Status)  || /closed\s*won|ganad/i.test(r.SalesStage);
  const isLost = r => /lost|perdid/i.test(r.Status) || /closed\s*lost|perdid/i.test(r.SalesStage);
  const isOpen = r => !isWon(r) && !isLost(r);

  function renderKPIs(){
    const data = dataView();
    const open = data.filter(isOpen).length;
    const won  = data.filter(isWon).length;
    const lost = data.filter(isLost).length;
    const closed = won + lost;
    const wr = closed ? Math.round((won/closed)*100) : null;
    const gpTotal = sum(data,"GP");

    setKPI("openCount", open);
    setKPI("closedCount", closed);
    setKPI("winRate", wr===null ? "N/D" : `${wr}%`);
    setKPI("gpTotal", fmt(gpTotal));

  }
  function setKPI(key, v){
    const el = document.querySelector(`[data-kpi="${key}"]`);
    if (el) el.textContent = (typeof v === "number") ? fmt(v) : v;
  }

  function renderTable(){
    const tb = $("#dataTable tbody");
    if (!tb) return;
    const data = dataView();
    if (!data.length){
      tb.innerHTML = `<tr class="placeholder-row"><td colspan="11">Sin resultados con los filtros.</td></tr>`;
      return;
    }
    const cells = r => [
      r.Opportunity, r.Account, r.Owner, r.SalesStage, r.Status,
      (r.Probability ?? "").toString(),
      fmt(r.TCV), fmt(r.GP),
      r.CreationDate ? r.CreationDate.toISOString().slice(0,10) : "",
      r.CloseDate    ? r.CloseDate.toISOString().slice(0,10)    : "",
      r.Quarter
    ];
    tb.innerHTML = data.map(r => `<tr>${cells(r).map(v=>`<td>${v??""}</td>`).join("")}</tr>`).join("");
  }

  const insights = [];
  function addInsight(s){ insights.push(s); }
  function buildInsights(){
    insights.length = 0;
    const data = dataView();
    const today = new Date();

    const soonLow = data.filter(r => r.CloseDate && ((r.CloseDate - today)/(1000*60*60*24) <= 30) && (r.Probability||0) <= 25);
    if (soonLow.length) addInsight(`${soonLow.length} opps cierran ≤30 días con prob ≤25%.`);

    const noOwner = data.filter(r => !r.Owner || r.Owner==="N/A").length;
    const noAcct  = data.filter(r => !r.Account || r.Account==="N/A").length;
    if (noOwner) addInsight(`${noOwner} filas sin Owner — completar.`);
    if (noAcct)  addInsight(`${noAcct} filas sin Account — completar.`);

    const rank = Object.entries(groupBy(data,"Owner")).map(([k,v])=>({k, gp:sum(v,"GP")})).sort((a,b)=>b.gp-a.gp);
    if (rank.length>=3){
      const top3 = rank.slice(0,3).reduce((a,x)=>a+x.gp,0);
      const total = sum(data,"GP");
      const pct = total ? Math.round((top3/total)*100) : 0;
      if (pct>=50) addInsight(`Top 3 Owners concentran ${pct}% del GP.`);
    }

    const q3 = data.filter(r=>r.Quarter==="Q3").length;
    const q4 = data.filter(r=>r.Quarter==="Q4").length;
    if (q3 && q4 && q4>q3*1.5) addInsight(`Fuerte concentración en Q4 (Q3=${q3}, Q4=${q4}).`);
  }
  function renderInsights(){
    if (!insightsBox) return;
    insightsBox.innerHTML = insights.length ? insights.map(s=>`<li>${s}</li>`).join("") :
      `<li class="placeholder">Sin hallazgos por ahora.</li>`;
  }

  const destroy = (c) => { if (c) try{ c.destroy(); }catch(e){} };

  function renderCharts(){
    if (!window.Chart) return;
    const data = dataView();

    const open = data.filter(isOpen).length;
    const won  = data.filter(isWon).length;
    const lost = data.filter(isLost).length;
    destroy(charts.openClosed);
    charts.openClosed = new Chart($("#chartOpenClosed"), {
      type: "doughnut",
      data: { labels:["Open","Won","Lost"], datasets: [{ data:[open,won,lost] }] },
      options: {
        layout: { padding: 6 },
        plugins:{ legend:{ position:"bottom", labels:{ boxWidth: 12 } } },
        responsive:true, maintainAspectRatio:false
      }
    });
    markHasChart($("#chartOpenClosed"));

    const byOwner = groupBy(data,"Owner");
    const top = Object.entries(byOwner).map(([k,v])=>({owner:k||"N/A", gp:sum(v,"GP")}))
                 .sort((a,b)=>b.gp-a.gp).slice(0,10);
    destroy(charts.topOwners);
    charts.topOwners = new Chart($("#chartTopOwners"), {
      type: "bar",
      data: { labels: top.map(x=>x.owner), datasets:[{ data: top.map(x=>x.gp) }] },
      options: {
        layout: { padding: 6 },
        plugins:{ legend:{ display:false } },
        responsive:true, maintainAspectRatio:false,
        scales:{ x:{ ticks:{ autoSkip:false, maxRotation:40, minRotation:0 } },
                 y:{ grid:{ drawBorder:false } } }
      }
    });
    markHasChart($("#chartTopOwners"));

    const buckets = {};
    data.forEach(r => {
      const q = r.Quarter || "N/A";
      (buckets[q]=buckets[q]||{won:0, closed:0});
      if (isWon(r)) buckets[q].won++;
      if (isWon(r) || isLost(r)) buckets[q].closed++;
    });
    const labels = Object.keys(buckets).sort();
    const dVals = labels.map(l => buckets[l].closed ? Math.round((buckets[l].won/buckets[l].closed)*100) : 0);
    destroy(charts.winRate);
    charts.winRate = new Chart($("#chartWinRate"), {
      type: "bar",
      data: { labels, datasets:[{ data: dVals }] },
      options: {
        layout: { padding: 6 },
        plugins:{ legend:{ display:false } },
        responsive:true, maintainAspectRatio:false,
        scales:{ y:{ ticks:{ callback:v=>v+"%" }, suggestedMax:100 } }
      }
    });
    markHasChart($("#chartWinRate"));

    setTimeout(() => { Object.values(charts).forEach(c => { if (c) try{ c.resize(); }catch(e){} }); }, 0);
  }

  function chat(msg, who="bot"){
    const div = document.createElement("div");
    div.className = `chat-msg ${who}`;
    div.textContent = `${who==="me"?"Yo":"Bot"}: ${msg}`;
    chatWin.appendChild(div);
    chatWin.scrollTop = chatWin.scrollHeight;
  }

  function buildChips(enabled){
    const body = chatWin.closest(".card-body");
    let zone = body.querySelector(".quick-zone");
    if (!zone){
      zone = document.createElement("div");
      zone.className = "quick-zone";
      zone.style.marginBottom = "8px";
      body.insertBefore(zone, chatWin);
    }
    const items = [
      "Abiertas (global)","Abiertas Q3","Abiertas Q4",
      "GP (global)","GP Q3","GP Q4",
      "TCV (global)","TCV Q3","TCV Q4",
      "Win rate (global)","Win rate Q3","Win rate Q4",
      "Top Owners GP (global)","Top Owners GP Q3","Top Owners GP Q4",
      "Top Owners TCV (global)","Top Owners TCV Q3","Top Owners TCV Q4",
      "Prob mediana (global)","Prob mediana Q3","Prob mediana Q4"
    ];
    zone.innerHTML = "";
    items.forEach(t => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn btn-sm btn-outline-light me-2 mb-2";
      b.style.borderColor = "rgba(255,255,255,0.35)";
      b.style.color = "#e9edff";
      b.textContent = t;
      b.disabled = !enabled;
      b.addEventListener("click", () => enabled && answerPreset(t));
      zone.appendChild(b);
    });
    if (!enabled) chat("Carga un Excel para habilitar las tarjetas de consulta.");
  }

  function answerPreset(t){
    const qm = t.match(/Q([1-4])/i);
    const q = qm ? `Q${qm[1]}` : null;
    const base = dataView();
    const data = q ? base.filter(r=>r.Quarter===q) : base.slice();

    const open = data.filter(isOpen).length;
    const won  = data.filter(isWon).length;
    const lost = data.filter(isLost).length;
    const closed = won + lost;
    const wr = closed ? Math.round((won/closed)*100) : null;
    const total = (k) => data.reduce((a,x)=>a+(x[k]||0),0);

    if (/^Abiertas/.test(t)) return chat(`${q||"Global (con filtros)"} — Abiertas: ${fmt(open)}.`);
    if (/^GP/.test(t))       return chat(`${q||"Global (con filtros)"} — GP total: ${fmt(total("GP"))} CHF.`);
    if (/^TCV/.test(t))      return chat(`${q||"Global (con filtros)"} — TCV total: ${fmt(total("TCV"))} CHF.`);
    if (/^Win rate/.test(t)) return chat(`${q||"Global (con filtros)"} — Win rate: ${wr===null?"N/D":wr+"%"} .`);
    if (/^Top Owners GP/.test(t)) {
      const by = {};
      data.forEach(r => by[r.Owner]=(by[r.Owner]||0)+(r.GP||0));
      const txt = Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,5)
        .map(([k,v])=>`${k||"N/A"}: ${fmt(v)} CHF`).join(" | ");
      return chat(`${q||"Global (con filtros)"} — Top 5 Owners por GP → ${txt||"N/A"}.`);
    }
    if (/^Top Owners TCV/.test(t)) {
      const by = {};
      data.forEach(r => by[r.Owner]=(by[r.Owner]||0)+(r.TCV||0));
      const txt = Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,5)
        .map(([k,v])=>`${k||"N/A"}: ${fmt(v)} CHF`).join(" | ");
      return chat(`${q||"Global (con filtros)"} — Top 5 Owners por TCV → ${txt||"N/A"}.`);
    }
    if (/^Prob mediana/.test(t)) {
      const vals = data.map(r=>r.Probability).filter(x=>Number.isFinite(x)).sort((a,b)=>a-b);
      const med = !vals.length ? null : (vals.length%2 ? vals[(vals.length-1)/2] : (vals[vals.length/2-1]+vals[vals.length/2])/2);
      return chat(`${q||"Global (con filtros)"} — Probabilidad mediana: ${med===null?"N/D":med+"%"} .`);
    }
  }

  function looksLikePivot(ws){
    try{
      if (ws && Array.isArray(ws['!merges']) && ws['!merges'].length > 0) return true;
      const rowsArr = XLSX.utils.sheet_to_json(ws, { header: 1, range: 0, blankrows: false });
      const headers = Array.isArray(rowsArr) && rowsArr.length ? (rowsArr[0] || []) : [];
      const text = headers.map(h => (h||"").toString().toLowerCase());
      const pivotTokens = ["total", "grand total", "row labels", "column labels", "subtotal"];
      if (text.some(h => pivotTokens.some(tok => h.includes(tok)))) return true;
      const empties = text.filter(h => !h.trim()).length;
      const dupes = new Set(text.filter((h,i) => h && text.indexOf(h) !== i)).size;
      if (empties >= Math.max(2, Math.floor(text.length * 0.3))) return true;
      if (dupes   >= Math.max(2, Math.floor(text.length * 0.3))) return true;
      return false;
    }catch(e){ return false; }
  }

  function loadSheetByName(name){
    const ws = workbook.Sheets[name];
    if (!ws){ chat(`No encontré la hoja "${name}".`); return; }

    const isPivot = looksLikePivot(ws);
    raw = XLSX.utils.sheet_to_json(ws, { defval: "" });
    if (!raw.length){
      chat("No pude leer filas de la hoja seleccionada.");
      updateLiveReq({ xlsx:true, flat:!isPivot, headers:false, dates:false, prob:false, nums:false });
      return;
    }

    cols = detectCols(raw[0]);
    normalize();

    populateOwnerFilter();

    updateLiveReq(runValidations(isPivot));

    refreshAll();

    chatWin.innerHTML = "";
    chat(`Hoja "${name}" procesada. Usa las tarjetas y los filtros rápidos.`);
    buildChips(true);

    chatInput.disabled = false;
    chatSend.disabled  = false;

    [filterQuarter, filterOwner, resetFilters, btnXLSX, btnCSV].forEach(el => el && (el.disabled = false));
  }

  async function handleFile(file){
    try{
      const buf = await file.arrayBuffer();
      workbook = XLSX.read(buf, { type:"array", cellDates:true });

      const names = workbook.SheetNames || [];
      const isXlsx = /\.xlsx$/i.test(file.name);
      updateLiveReq({ xlsx:isXlsx, flat:null, headers:null, dates:null, prob:null, nums:null });

      if (!names.length){ chat("No encontré hojas en el libro."); return; }

      if (names.length > 1 && sheetPicker && sheetSelect){
        sheetPicker.classList.remove("d-none");
        sheetSelect.innerHTML = names.map(n => `<option value="${n}">${n}</option>`).join("");
      }else if (sheetPicker){ sheetPicker.classList.add("d-none"); }

      loadSheetByName(names[0]);

    }catch(e){
      console.error(e);
      chat("Error leyendo el Excel. Revisa que sea .xlsx válido.");
      updateLiveReq({ xlsx:false, flat:false, headers:false, dates:false, prob:false, nums:false });
    }
  }

  function refreshAll(){
    buildInsights();
    renderKPIs();
    renderTable();
    renderInsights();
    renderCharts();
  }

  function populateOwnerFilter(){
    if (!filterOwner) return;
    const owners = uniq(rows.map(r => r.Owner || "N/A")).sort((a,b)=> a.localeCompare(b, undefined, {sensitivity:"base"}));
    filterOwner.innerHTML = `<option value="all">Todos</option>` + owners.map(o => `<option value="${o}">${o}</option>`).join("");
    filterOwner.disabled = false;
    filterQuarter.disabled = false;
    resetFilters.disabled = false;
  }

  function runValidations(isPivot){
    const data = rows;
    const hasCols = {
      owner: !!cols?.owner || !!data[0]?.Owner,
      account: !!cols?.account || !!data[0]?.Account,
      tcv: !!cols?.tcv || !!data[0]?.["TCV CHF"] || !!data[0]?.TCV,
      gp: !!cols?.gp || !!data[0]?.["REVENUE GP CHF"] || !!data[0]?.GP,
      prob: !!cols?.prob || !!data[0]?.["Probability in %"] || !!data[0]?.Probability,
      stageOrStatus: !!cols?.stage || !!cols?.status || !!data[0]?.["Sales Stage"] || !!data[0]?.Status,
      close: !!cols?.close || !!data[0]?.["Close Date"]
    };
    const headersOk = hasCols.owner && hasCols.account && hasCols.tcv && hasCols.gp && hasCols.prob && hasCols.stageOrStatus && hasCols.close;

    const dateVals = data.map(r => r.CloseDate).filter(Boolean);
    const datesOkRatio = dateVals.length ? (dateVals.filter(d=> d instanceof Date && !isNaN(d)).length / dateVals.length) : 0;
    const datesState = datesOkRatio >= 0.7 ? "ok" : (datesOkRatio >= 0.4 ? "warn" : "bad");

    const pVals = data.map(r => r.Probability).filter(x => x !== null && x !== undefined);
    const pOkRatio = pVals.length ? (pVals.filter(x => x>=0 && x<=100).length / pVals.length) : 0;
    const probState = pOkRatio >= 0.85 ? "ok" : (pOkRatio >= 0.6 ? "warn" : "bad");

    const anyNums = data.some(r => Number.isFinite(r.TCV)) && data.some(r => Number.isFinite(r.GP));
    const numsState = anyNums ? "ok" : "warn";

    return {
      xlsx: true,
      flat: !isPivot,
      headers: headersOk,
      dates: datesState,
      prob: probState,
      nums: numsState
    };
  }

  function updateLiveReq(status){
    if (!liveReq) return;
    const setState = (key, val) => {
      const li = liveReq.querySelector(`li[data-key="${key}"]`);
      if (!li) return;
      li.classList.remove("ok","warn","bad");
      if (val === null) { li.classList.remove("ok","warn","bad"); return; }
      if (val === true) { li.classList.add("ok"); return; }
      if (val === false){ li.classList.add("bad"); return; }
      if (["ok","warn","bad"].includes(val)) li.classList.add(val);
    };

    setState("xlsx",   status.xlsx ?? null);
    setState("flat",   status.flat ?? null);
    setState("headers",status.headers ?? null);
    setState("dates",  status.dates ?? null);
    setState("prob",   status.prob ?? null);
    setState("nums",   status.nums ?? null);

    const states = ["xlsx","flat","headers","dates","prob","nums"].map(k => {
      const li = liveReq.querySelector(`li[data-key="${k}"]`);
      return li?.classList.contains("bad") ? "bad" : (li?.classList.contains("warn") ? "warn" : (li?.classList.contains("ok") ? "ok" : "idle"));
    });
    const bad = states.filter(s=>"bad"===s).length;
    const warn= states.filter(s=>"warn"===s).length;
    const ok  = states.filter(s=>"ok"===s).length;

    if (liveReqSummary){
      if (ok && !warn && !bad) { liveReqSummary.textContent = "Listo"; liveReqSummary.className = "badge bg-success"; }
      else if (bad)            { liveReqSummary.textContent = "Revisar"; liveReqSummary.className = "badge bg-danger"; }
      else if (warn)           { liveReqSummary.textContent = "Mejorable"; liveReqSummary.className = "badge bg-warning text-dark"; }
      else                     { liveReqSummary.textContent = "Pendiente"; liveReqSummary.className = "badge bg-secondary"; }
    }
  }

  function currentExportRows(){
    const data = dataView();
    return data.map(r => ({
      "Opportunity": r.Opportunity,
      "Topic": r.Topic,
      "Account": r.Account,
      "Owner": r.Owner,
      "Sales Stage": r.SalesStage,
      "Status": r.Status,
      "Probability %": Number.isFinite(r.Probability) ? r.Probability : null,
      "TCV CHF": Number.isFinite(r.TCV) ? r.TCV : null,
      "REVENUE GP CHF": Number.isFinite(r.GP) ? r.GP : null,
      "Creation Date": r.CreationDate ? r.CreationDate.toISOString().slice(0,10) : "",
      "Close Date": r.CloseDate ? r.CloseDate.toISOString().slice(0,10) : "",
      "Quarter": r.Quarter
    }));
  }

  function autosizeCols(ws, rows){
    const colNames = Object.keys(rows[0] || {});
    const widths = colNames.map(k => Math.max(
      String(k).length,
      ...rows.map(r => String(r[k] ?? "").length)
    ));
    ws['!cols'] = widths.map(w => ({ wch: Math.min(40, Math.max(10, Math.ceil(w*1.05))) }));
  }

  function downloadBlob(blob, filename){
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      document.body.removeChild(a);
    }, 0);
  }

  function exportXLSX(){
    const data = currentExportRows();
    if (!data.length) { chat("No hay filas para exportar."); return; }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data, { cellDates:false });
    autosizeCols(ws, data);
    XLSX.utils.book_append_sheet(wb, ws, "Oportunidades");
    const out = XLSX.write(wb, { bookType:"xlsx", type:"array" });
    const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
    downloadBlob(new Blob([out], {type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), `opps_filtrado_${stamp}.xlsx`);
    chat("Exportado XLSX con el conjunto filtrado.");
  }

  function exportCSV(){
    const data = currentExportRows();
    if (!data.length) { chat("No hay filas para exportar."); return; }
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
    downloadBlob(new Blob([csv], {type:"text/csv;charset=utf-8"}), `opps_filtrado_${stamp}.csv`);
    chat("Exportado CSV con el conjunto filtrado.");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const f = $("#fileInput");
    if (f) {
      f.addEventListener("change", () => f.files[0] && handleFile(f.files[0]));
    }
    buildChips(false);

    if (sheetSelect){
      sheetSelect.addEventListener("change", () => {
        const name = sheetSelect.value;
        if (workbook && name) loadSheetByName(name);
      });
    }

    if (chatSend) {
      chatSend.addEventListener("click", () => {
        const q = (chatInput.value||"").trim();
        if (!q) return;
        chat(q,"me");
        if (!rows.length) return chat("Primero carga un Excel.");
        if (/abiert/i.test(q)) return answerPreset("Abiertas (global)");
        if (/gp/i.test(q) && /q3/i.test(q)) return answerPreset("GP Q3");
        if (/gp/i.test(q) && /q4/i.test(q)) return answerPreset("GP Q4");
        if (/gp/i.test(q)) return answerPreset("GP (global)");
        if (/win/i.test(q)) return answerPreset("Win rate (global)");
        if (/top/i.test(q) && /gp/i.test(q)) return answerPreset("Top Owners GP (global)");
        if (/top/i.test(q) && /tcv/i.test(q)) return answerPreset("Top Owners TCV (global)");
        if (/prob.*med/i.test(q)) return answerPreset("Prob mediana (global)");
        chat("Usa las tarjetas: Abiertas, GP, TCV, Win rate, Top Owners GP/TCV, Prob mediana (con Q3/Q4).");
      });
    }

    if (filterQuarter){
      filterQuarter.addEventListener("change", () => {
        filter.quarter = filterQuarter.value || "all";
        refreshAll();
      });
    }
    if (filterOwner){
      filterOwner.addEventListener("change", () => {
        filter.owner = filterOwner.value || "all";
        refreshAll();
      });
    }
    if (resetFilters){
      resetFilters.addEventListener("click", () => {
        filter.quarter = "all";
        filter.owner = "all";
        if (filterQuarter) filterQuarter.value = "all";
        if (filterOwner)   filterOwner.value   = "all";
        refreshAll();
      });
    }

    if (btnXLSX) btnXLSX.addEventListener("click", exportXLSX);
    if (btnCSV)  btnCSV.addEventListener("click", exportCSV);
  });

  window.addEventListener('resize', () => {
    Object.values(charts).forEach(c => { if (c) try{ c.resize(); }catch(e){} });
  });
})();
