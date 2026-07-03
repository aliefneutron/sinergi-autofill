export const BOOKMARKLET_CODE = `javascript:(function(){
  // Ensure we are on the BKPSDM website or warn
  if (!window.location.host.includes('sumenepkab.go.id')) {
    alert('Buka halaman e-Kinerja/SINERGI BKPSDM Sumenep terlebih dahulu (bkpsdm.sumenepkab.go.id) sebelum menjalankan Bookmarklet ini!');
    return;
  }

  // Remove existing widget if any
  const existing = document.getElementById('sinergi-auto-input-widget');
  if (existing) {
    existing.remove();
  }

  // Create Widget Element
  const widget = document.createElement('div');
  widget.id = 'sinergi-auto-input-widget';
  widget.style.cssText = 'position:fixed;top:20px;right:20px;width:350px;max-height:85vh;background:#0f111a;border:2px solid #df3b4f;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.5);z-index:999999;font-family:sans-serif;color:#e2e8f0;display:flex;flex-direction:column;overflow:hidden;transition:all 0.3s ease;';

  // Widget Header
  const header = document.createElement('div');
  header.style.cssText = 'background:#131722;padding:12px 16px;border-bottom:1px solid #df3b4f;display:flex;justify-content:between;align-items:center;cursor:move;';
  header.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><span style="color:#df3b4f;font-weight:bold;font-size:14px;">⚡ SINERGI V2 Helper</span></div><button id="sinergi-widget-close" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;margin-left:auto;hover:color:white;">&times;</button>';
  widget.appendChild(header);  // Widget Body
  const body = document.createElement('div');
  body.style.cssText = 'padding:16px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:12px;font-size:12px;';
  body.innerHTML = \`
    <div style="margin-bottom:8px;display:flex;flex-direction:column;gap:8px;">
      <label style="font-weight:bold;display:block;color:#a5b4fc;font-size:12px;">Unggah File Payload Kinerja:</label>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <button id="sinergi-btn-upload-trigger" style="width:100%;background:#df3b4f;color:white;border:none;border-radius:8px;padding:10px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;box-shadow:0 4px 12px rgba(223,59,79,0.2);">
          📁 Unggah File Payload JSON
        </button>
        <input type="file" id="sinergi-file-input" accept=".json" style="display:none;" />
      </div>
      <div id="sinergi-file-name" style="color:#34d399;font-weight:bold;font-size:11px;text-align:center;display:none;background:rgba(52,211,153,0.1);padding:6px;border-radius:6px;border:1px solid rgba(52,211,153,0.15);"></div>


    </div>
    <div id="sinergi-auto-control-section" style="margin-bottom:10px;display:none;flex-direction:column;gap:6px;">
      <button id="sinergi-btn-start-auto" style="width:100%;background:#10b981;color:white;border:none;border-radius:8px;padding:10px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;box-shadow:0 4px 12px rgba(16,185,129,0.2);">
        🚀 Jalankan Otomatis
      </button>
      <button id="sinergi-btn-stop-auto" style="width:100%;background:#ef4444;color:white;border:none;border-radius:8px;padding:10px;font-weight:bold;cursor:pointer;display:none;align-items:center;justify-content:center;gap:6px;font-size:12px;box-shadow:0 4px 12px rgba(239,68,68,0.2);">
        🛑 Hentikan Otomatisasi Batch
      </button>
    </div>
    <div id="sinergi-report-list-container" style="display:none;border-top:1px dashed #334155;padding-top:12px;">
      <div style="font-weight:bold;margin-bottom:6px;color:#94a3b8;display:flex;justify-content:space-between;align-items:center;">
        <span>Pilih Laporan Hari Ini:</span>
        <span id="sinergi-count" style="background:#df3b4f;color:white;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:bold;">0</span>
      </div>
      <div id="sinergi-report-items" style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow-y:auto;padding-right:4px;"></div>
    </div>
    <div id="sinergi-fill-status" style="padding:10px;border-radius:8px;background:rgba(16,185,129,0.1);color:#34d399;font-weight:bold;display:none;text-align:center;border:1px solid rgba(16,185,129,0.2);">
      🎉 Laporan berhasil diisi! Periksa & simpan.
    </div>
  \`;
  widget.appendChild(body);
  document.body.appendChild(widget);

  // Inject custom animation styles for widget
  if (!document.getElementById('sinergi-helper-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'sinergi-helper-styles';
    styleEl.textContent = '@keyframes sinergi-pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } } .sinergi-anim-pulse { animation: sinergi-pulse 1.5s infinite ease-in-out; }';
    document.head.appendChild(styleEl);
  }

  // Append widget to document
  document.body.appendChild(widget);


  // Make Widget Draggable
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  header.addEventListener('mousedown', dragStart);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  function dragStart(e) {
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    if (e.target === header || header.contains(e.target)) {
      isDragging = true;
    }
  }

  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX;
      yOffset = currentY;
      widget.style.transform = "translate(" + currentX + "px, " + currentY + "px)";
    }
  }

  function dragEnd() {
    isDragging = false;
  }

  // Close Event
  document.getElementById('sinergi-widget-close').onclick = function() {
    widget.remove();
  };

  // Upload Logic & Event
  const fileInput = document.getElementById('sinergi-file-input');
  const uploadTrigger = document.getElementById('sinergi-btn-upload-trigger');
  const fileNameDisplay = document.getElementById('sinergi-file-name');

  const loadBtn = document.getElementById('sinergi-btn-load');
  const txtArea = document.getElementById('sinergi-data-input');
  const listContainer = document.getElementById('sinergi-report-list-container');
  const itemsContainer = document.getElementById('sinergi-report-items');
  const countBadge = document.getElementById('sinergi-count');
  let lastLoadedPayload = '';


  if (uploadTrigger && fileInput) {
    uploadTrigger.onclick = function() {
      fileInput.click();
    };

    fileInput.onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;

      if (fileNameDisplay) {
        fileNameDisplay.textContent = '📄 ' + file.name;
        fileNameDisplay.style.display = 'block';
      }

      const reader = new FileReader();
      reader.onload = function(evt) {
        const content = evt.target.result;
        const ta = document.getElementById('sinergi-data-input');
        if (ta) (ta as HTMLTextAreaElement).value = content as string;
        processPayload(content);
      };
      reader.readAsText(file);
    };
  }

  // Load Reports Event
  loadBtn.onclick = function() {
    const rawVal = txtArea.value.trim();
    if (!rawVal) {
      alert('Silakan tempel data kinerja terlebih dahulu!');
      return;
    }
    processPayload(rawVal);
  };

  // Start / Stop Auto Automation
  const controlSection = document.getElementById('sinergi-auto-control-section');
  const startAutoBtn = document.getElementById('sinergi-btn-start-auto');
  const stopAutoBtn = document.getElementById('sinergi-btn-stop-auto');

  if (startAutoBtn && stopAutoBtn) {
    startAutoBtn.onclick = function() {
      const rawVal = localStorage.getItem('sinergi_auto_reports_draft') || txtArea.value.trim();
      if (!rawVal) {
        alert('Silakan unggah payload JSON terlebih dahulu!');
        return;
      }
      
      let parsed;
      try {
        parsed = JSON.parse(rawVal);
      } catch(e) {
        alert('Data JSON tidak valid!');
        return;
      }
      
      const reports = Array.isArray(parsed) ? parsed : [parsed];
      localStorage.setItem('sinergi_auto_reports', JSON.stringify(reports));
      localStorage.setItem('sinergi_auto_index', '0');
      localStorage.setItem('sinergi_auto_active', 'true');
      
      startAutoBtn.style.display = 'none';
      stopAutoBtn.style.display = 'flex';
      
      // Run immediately
      checkAutoAutomation();
    };
    
    stopAutoBtn.onclick = function() {
      localStorage.setItem('sinergi_auto_active', 'false');
      startAutoBtn.style.display = 'flex';
      stopAutoBtn.style.display = 'none';
      
      const statusBanner = document.getElementById('sinergi-fill-status');
      if (statusBanner) {
        statusBanner.style.display = 'none';
      }
      
      // Re-draw list to clear status badges
      const rawReports = localStorage.getItem('sinergi_auto_reports');
      if (rawReports) processPayload(rawReports);
      
      console.log('🤖 Otomatisasi Batch dihentikan oleh pengguna.');
    };
  }

  function processPayload(rawVal) {
    rawVal = rawVal.trim();
    let reports = [];
    try {
      if (rawVal.startsWith('[') || rawVal.startsWith('{')) {

        const parsed = JSON.parse(rawVal);
        reports = Array.isArray(parsed) ? parsed : [parsed];
        localStorage.setItem('sinergi_auto_reports_draft', JSON.stringify(reports));
      } else {
        alert('Format data tidak valid! Harus berupa JSON valid.');
        return;
      }
    } catch(err) {
      alert('Gagal membaca data! Pastikan data/file terformat dengan benar (JSON).');
      return;
    }

    if (reports.length === 0) {
      alert('Tidak ada laporan kinerja yang ditemukan.');
      return;
    }

    // Populate List
    itemsContainer.innerHTML = '';
    reports.forEach((report, index) => {
      const item = document.createElement('div');
      item.style.cssText = 'background:#1e2230;border:1px solid #334155;border-radius:6px;padding:8px;cursor:pointer;transition:all 0.2s;display:flex;flex-direction:column;gap:3px;margin-bottom:6px;';
      
      item.addEventListener('mouseenter', function() {
        item.style.borderColor = '#df3b4f';
        item.style.background = '#25293c';
      });
      item.addEventListener('mouseleave', function() {
        item.style.borderColor = '#334155';
        item.style.background = '#1e2230';
      });

      // Formatting date label
      let dateFormatted = report.tanggal;
      try {
        const d = new Date(report.tanggal);
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        dateFormatted = d.toLocaleDateString('id-ID', options);
      } catch(e) {}

      const autoActive = localStorage.getItem('sinergi_auto_active') === 'true';
      const autoIndex = parseInt(localStorage.getItem('sinergi_auto_index') || '0', 10);
      
      let statusBadge = '';
      if (autoActive) {
        if (index < autoIndex) {
          statusBadge = '<span style="color:#10b981;font-size:10px;font-weight:bold;margin-left:auto;">✅ Selesai</span>';
        } else if (index === autoIndex) {
          statusBadge = '<span class="sinergi-anim-pulse" style="color:#f59e0b;font-size:10px;font-weight:bold;margin-left:auto;">⏳ Proses</span>';
        } else {
          statusBadge = '<span style="color:#64748b;font-size:10px;font-weight:bold;margin-left:auto;">Antrean</span>';
        }
      }

      item.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:bold;">
          <span style="color:#df3b4f;">\${dateFormatted}</span>
          <div style="display:flex;align-items:center;gap:6px;">
            \${statusBadge}
            <span style="color:#94a3b8;font-size:10px;">\${report.waktuMulai} - \${report.waktuSelesai}</span>
          </div>
        </div>
        <div style="font-weight:semibold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:white;margin-top:2px;">\${report.uraianTugas}</div>
        <div style="color:#94a3b8;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${report.deskripsiPekerjaan}</div>
      \`;

      item.onclick = function() {
        fillForm(report);
        setTimeout(function() {
          clickSubmitButton();
        }, 12000);
      };
      
      itemsContainer.appendChild(item);
    });

    countBadge.textContent = reports.length;
    listContainer.style.display = 'block';

    // Show auto control buttons
    if (controlSection) {
      controlSection.style.display = 'flex';
      const autoActive = localStorage.getItem('sinergi_auto_active') === 'true';
      if (autoActive) {
        startAutoBtn.style.display = 'none';
        stopAutoBtn.style.display = 'flex';
      } else {
        startAutoBtn.style.display = 'flex';
        stopAutoBtn.style.display = 'none';
      }
    }
  }


  // Fill Form Logic
  function fillForm(report) {
    try {
      // Helper to set values in a way that React/Vue state recognizes and triggers jQuery/Select2 change
      function setElementValue(element, value) {
        if (!element) return;
        try {
          let prototype;
          if (element.tagName === 'INPUT') {
            prototype = window.HTMLInputElement.prototype;
          } else if (element.tagName === 'TEXTAREA') {
            prototype = window.HTMLTextAreaElement.prototype;
          } else if (element.tagName === 'SELECT') {
            prototype = window.HTMLSelectElement.prototype;
          }
          
          if (prototype) {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
            if (descriptor && descriptor.set) {
              descriptor.set.call(element, value);
            } else {
              element.value = value;
            }
          } else {
            element.value = value;
          }
          
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));

          // Trigger jQuery & Select2 Events if available
          try {
            const jq = (window).$ || (window).jQuery;
            if (jq) {
              jq(element).trigger('change');
              jq(element).trigger('select2:select');
              jq(element).trigger('change.select2');
            }
          } catch (jqErr) {
            console.error('Gagal memicu event jQuery:', jqErr);
          }
        } catch (e) {
          console.error('Gagal setElementValue:', e);
          element.value = value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      // Intelligent element finder based on labels / surrounding text (excluding massive container divs)
      function findFormInputElement(keywords, selector = 'input') {
        // Direct attribute match first - most specific and reliable!
        for (const kw of keywords) {
          const el = document.querySelector(selector + '[name*="' + kw + '" i], ' + selector + '[id*="' + kw + '" i], ' + selector + '[placeholder*="' + kw + '" i]');
          if (el) return el;
        }

        // Try to find label elements first (specifically <label>)
        const labels = Array.from(document.querySelectorAll('label'));
        for (const label of labels) {
          const text = (label.textContent || '').trim().toLowerCase();
          if (keywords.some(kw => text === kw || text === kw + ':' || text.includes(kw))) {
            const forId = label.getAttribute('for');
            if (forId) {
              const el = document.getElementById(forId);
              if (el) return el;
            }
            // Check descendants
            const found = label.querySelector(selector);
            if (found) return found;
            // Check parent/sibling
            if (label.parentElement) {
              const foundSib = label.parentElement.querySelector(selector);
              if (foundSib) return foundSib;
            }
          }
        }

        // Try other small elements with text length < 100 to avoid giant container divs matching
        const smallElements = Array.from(document.querySelectorAll('span, th, td, p, h1, h2, h3, h4, h5, h6'));
        for (const el of smallElements) {
          const text = (el.textContent || '').trim().toLowerCase();
          if (text.length < 100 && keywords.some(kw => text === kw || text === kw + ':' || text.includes(kw))) {
            // Find input in descendants
            const found = el.querySelector(selector);
            if (found) return found;
            // Find input in siblings / nearest ancestor
            let parent = el.parentElement;
            for (let i = 0; i < 3; i++) {
              if (!parent) break;
              const foundInParent = parent.querySelector(selector);
              if (foundInParent) return foundInParent;
              parent = parent.parentElement;
            }
          }
        }

        return null;
      }

      // 1. Fill Tanggal Pelaksanaan
      let dateInput = findFormInputElement(['tanggal', 'date', 'pelaksanaan'], 'input');
      let filledDate = false;
      if (dateInput) {
        setElementValue(dateInput, report.tanggal);
        filledDate = true;
        console.log('⚡ Mengisi input Tanggal dengan:', report.tanggal);
      } else {
        const dateInputs = Array.from(document.querySelectorAll('input[type="date"], input[name*="tanggal"], input[id*="tanggal"], input[placeholder*="Tanggal"], input[class*="datepicker"]'));
        for (const input of dateInputs) {
          if (input) {
            setElementValue(input, report.tanggal);
            filledDate = true;
          }
        }
      }
      
      if (!filledDate) {
        const datepickerInput = document.querySelector('.datepicker-input, input[placeholder*="Pilih tanggal"]');
        if (datepickerInput) {
          setElementValue(datepickerInput, report.tanggal);
        }
      }

      // Helper: force-close any open time picker popup
      function forceCloseAllPopups() {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }

      // 2. Fill Start & End Times - SINERGI V2 specific: button#wkt1 / button#wkt2 + hidden input
      function fillSinergiTimePicker(inputId: string, timeValue: string, keywords: string[] = []) {
        const timeWithColon = timeValue.includes('.') ? timeValue.replace('.', ':') : timeValue;
        const [targetJam, targetMenit] = timeWithColon.split(':');
        
        let el = document.getElementById(inputId);
        if (!el) {
          el = document.querySelector(`input[name="${inputId}"], input[id*="${inputId}"]`) || 
               findFormInputElement([inputId, ...keywords], 'input') ||
               findFormInputElement([inputId, ...keywords], 'button');
        }
        
        if (!el) {
          console.log('⚡ Element not found for', inputId);
          return;
        }

        if (el.tagName === 'INPUT') {
          setElementValue(el, timeWithColon);
          console.log('⚡ Set value for native input', inputId, timeWithColon);
          return;
        }
        
        const btn = el as HTMLButtonElement;

        function getOpenPopup(): Element | null {
          const container = btn.parentElement;
          let popup: Element | null = container ? container.querySelector('div.absolute') : null;
          // Validate it's a real time picker (>=20 buttons and >=2 flex-col columns)
          if (popup && popup.querySelectorAll('button').length >= 20 && popup.querySelectorAll('div.flex-col').length >= 2) return popup;
          popup = null;
          const popups = document.querySelectorAll('div.absolute, div[role="dialog"]');
          for (const p of Array.from(popups)) {
            if (p.querySelectorAll('div.flex-col').length >= 2 && p.querySelectorAll('button').length >= 20) {
              popup = p; break;
            }
          }
          return popup;
        }

        function findMatchInList(btns: Element[], target: string): Element | undefined {
          let m = btns.find(b => (b.textContent || '').trim() === target);
          if (!m) m = btns.find(b => parseInt((b.textContent || '').trim(), 10) === parseInt(target, 10));
          return m;
        }
        
        // 1. Open the popup
        triggerClickEvents(btn);
        
        // 2. Wait for popup to render, then click JAM
        setTimeout(() => {
          const popup = getOpenPopup();
          if (!popup) { console.log('⚡ Popup not found for', inputId); return; }

          const columns = popup.querySelectorAll('div.flex-col, .overflow-y-auto');
          let jamBtns: Element[] = [];
          if (columns.length >= 2) {
            jamBtns = Array.from(columns[0].querySelectorAll('button, li, div.cursor-pointer'));
          } else {
            jamBtns = Array.from(popup.querySelectorAll('button, li, div.cursor-pointer'));
          }

          const jamMatch = findMatchInList(jamBtns, targetJam);
          if (jamMatch) {
            jamMatch.scrollIntoView({ block: 'center' });
            setTimeout(() => {
              triggerClickEvents(jamMatch);
              console.log('⚡ Klik JAM ' + targetJam + ' untuk ' + inputId);
              
              // 3. Re-query popup AFTER clicking JAM then click MENIT
              setTimeout(() => {
                const popup2 = getOpenPopup();
                if (!popup2) { console.log('⚡ Popup hilang setelah klik JAM untuk', inputId); return; }

                // Find overflow-y-auto column with most buttons = menit column (60 items per diagnostic)
                const overflowCols = Array.from(popup2.querySelectorAll('.overflow-y-auto'));
                overflowCols.sort((a, b) => b.querySelectorAll('button').length - a.querySelectorAll('button').length);
                const menitColEl = overflowCols[0] || popup2;

                console.log('⚡ Menit col: ' + menitColEl.querySelectorAll('button').length + ' buttons');

                const allMenitBtns = Array.from(menitColEl.querySelectorAll('button'));
                const menitMatch = allMenitBtns.find(b => {
                  const txt = (b.textContent || '').trim();
                  return txt === targetMenit || parseInt(txt, 10) === parseInt(targetMenit, 10);
                });

                if (menitMatch) {
                  const btnOffsetTop = (menitMatch as HTMLElement).offsetTop;
                  const scrollTarget = Math.max(0, btnOffsetTop - ((menitColEl as HTMLElement).clientHeight / 2));
                  (menitColEl as HTMLElement).scrollTop = scrollTarget;
                  console.log('⚡ Scroll menit ke offsetTop=' + btnOffsetTop + ' scrollTarget=' + scrollTarget);
                  setTimeout(() => {
                    triggerClickEvents(menitMatch);
                    console.log('⚡ Klik MENIT ' + targetMenit + ' untuk ' + inputId);
                    setTimeout(() => forceCloseAllPopups(), 400);
                  }, 300);
                } else {
                  console.log('⚡ Menit ' + targetMenit + ' tidak ditemukan, total: ' + allMenitBtns.length);
                  setTimeout(() => forceCloseAllPopups(), 400);
                }
            }, 150);
          } else {
            console.log('⚡ Jam ' + targetJam + ' tidak ditemukan untuk', inputId);
          }
        }, 700);
      }

        // wkt1 starts at 1000ms, finishes ~2800ms. wkt2 starts at 4300ms (safe margin after close)
        setTimeout(() => fillSinergiTimePicker('wkt1', report.waktuMulai, ['mulai', 'start']), 1000);
        setTimeout(() => {
          forceCloseAllPopups();
          setTimeout(() => fillSinergiTimePicker('wkt2', report.waktuSelesai, ['selesai', 'end']), 300);
        }, 4000);

      // Generic fallback for other sites
      const startInput = findFormInputElement(['mulai', 'start', 'jam_mulai', 'waktu_mulai'], 'input');
      const endInput = findFormInputElement(['selesai', 'end', 'jam_selesai', 'waktu_selesai'], 'input');
      if (startInput && startInput.type !== 'hidden') {
        setElementValue(startInput, report.waktuMulai.replace(':', '.'));
      }
      if (endInput && endInput.type !== 'hidden') {
        setElementValue(endInput, report.waktuSelesai.replace(':', '.'));
      }

      // 3. Select Uraian Tugas
      // 3a. SINERGI V2: Click trigger button first, then click matching <label> card
      function clickUraianTrigger() {
        const isHelperWidget = (el: Element) => !!el.closest('#sinergi-auto-input-widget');
        
        // Method 1: The radio container has a previousElementSibling with the trigger button
        const radioContainer = document.querySelector('.form-control.w-full.overflow-hidden');
        if (radioContainer && !isHelperWidget(radioContainer)) {
          const isOpen = radioContainer.clientHeight > 0;
          const triggerSection = radioContainer.previousElementSibling;
          if (triggerSection) {
            const triggerBtn = triggerSection.querySelector('button[type="button"]');
            if (triggerBtn && !isHelperWidget(triggerBtn)) {
              if (!isOpen) {
                console.log('⚡ Mengklik trigger Uraian Tugas (buka accordion):', (triggerBtn.textContent || '').substring(0, 40));
                (triggerBtn as HTMLElement).click();
                triggerBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
              } else {
                console.log('⚡ Accordion Uraian Tugas sudah terbuka.');
              }
              return true;
            }
          }
        }
        
        // Method 2: Find label with "Uraian Tugas" text and click its button
        const allLabels = Array.from(document.querySelectorAll('label span, span.label-text')).filter(el => !isHelperWidget(el));
        for (const lbl of allLabels) {
          const txt = (lbl.textContent || '').toLowerCase().trim();
          if (txt === 'uraian tugas' || txt.includes('uraian tugas')) {
            const section = lbl.closest('.form-control, div');
            if (section) {
              const btn = section.querySelector('button[type="button"]');
              if (btn && !isHelperWidget(btn)) {
                (btn as HTMLElement).click();
                btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                console.log('⚡ Trigger Uraian Tugas diklik via label text');
                return true;
              }
            }
          }
        }
        return false;
      }

      function isAccordionOpen() {
        const radioContainer = document.querySelector('.form-control.w-full.overflow-hidden');
        return radioContainer ? radioContainer.clientHeight > 0 : false;
      }
      
      function fillUraianTugasRadio() {
        const isHelperWidget = (el: Element) => !!el.closest('#sinergi-auto-input-widget');
        const targetText = (report.uraianTugas || '').toLowerCase().trim();
        const detailText = (report.detailItemPekerjaan || '').toLowerCase().trim();

        // Only try to fill if accordion is open
        if (!isAccordionOpen()) {
          console.log('⚡ Accordion belum terbuka, coba buka dulu...');
          clickUraianTrigger();
          return false;
        }

        const radios = Array.from(document.querySelectorAll('input[type="radio"]')).filter(r => !isHelperWidget(r));
        
        for (const radio of radios as HTMLInputElement[]) {
          // Get the parent <label> card element (the whole clickable card)
          const labelCard = radio.closest('label');
          const labelText = (labelCard ? labelCard.textContent : radio.parentElement?.textContent) || '';
          const lt = labelText.toLowerCase().trim();
          const matchMain = targetText.length > 5 && lt.includes(targetText.substring(0, Math.min(targetText.length, 20)));
          const matchDetail = detailText.length > 5 && lt.includes(detailText.substring(0, Math.min(detailText.length, 20)));
          
          if (matchMain || matchDetail) {
            // Click the LABEL CARD while accordion is open - React will detect this
            if (labelCard) {
              labelCard.click();
              labelCard.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            }
            radio.click();
            radio.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            radio.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('⚡ Dipilih radio uraian tugas (accordion open):', lt.substring(0, 60));
            return true;
          }
        }
        return false;
      }

      // Uraian tugas AFTER time pickers done (~6500ms). wkt1=1000ms, wkt2=4300ms, wkt2 done ~6500ms.
      setTimeout(() => {
        clickUraianTrigger();
        setTimeout(fillUraianTugasRadio, 500);
        setTimeout(fillUraianTugasRadio, 1200);
        setTimeout(fillUraianTugasRadio, 2500);
      }, 7000);

      // 3b. Native <select> dropdown fallback
      const selectElements = Array.from(document.querySelectorAll('select[name*="tugas"], select[id*="tugas"], select[name*="uraian"], select'));
      let selectedDropdown = false;
      
      for (const select of selectElements) {
        if (select) {
          const options = Array.from((select as HTMLSelectElement).options);
          const matchedOption = options.find(opt => {
            const optText = opt.text.toLowerCase().trim();
            const targetText = report.uraianTugas.toLowerCase().trim();
            return optText.includes(targetText) || targetText.includes(optText) ||
                   (targetText.length > 12 && optText.includes(targetText.substring(0, 12))) ||
                   (optText.length > 12 && targetText.includes(optText.substring(0, 12)));
          });

          if (matchedOption) {
            setElementValue(select, matchedOption.value);
            selectedDropdown = true;
            console.log('⚡ Mengisi dropdown Select Uraian dengan:', matchedOption.text);
          }
        }
      }

      // Helper to dispatch standard mouse/pointer events to open custom widgets
      function triggerClickEvents(el) {
        if (!el) return;
        try {
          el.focus();
          el.click();
          
          // Dispatch mousedown and mouseup
          el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
          el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
          el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          
          // Dispatch pointer events for modern web frameworks
          el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
          el.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
          
          // If there is an inner input (like search box in vue-select/select2), focus and click it
          const innerInput = el.querySelector('input');
          if (innerInput) {
            innerInput.focus();
            innerInput.click();
            innerInput.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            innerInput.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
        } catch (err) {
          console.error('Gagal triggerClickEvents:', err);
        }
      }

      function clickUraianDropdownTrigger() {
        const isHelperWidget = (el: Element) => !!el.closest('#sinergi-auto-input-widget');

        // 1. Look for label "Uraian Tugas" and click corresponding dropdown next to it
        const labels = Array.from(document.querySelectorAll('label, div, span, p, th, td')).filter(el => !isHelperWidget(el));
        for (const label of labels) {
          const text = (label.textContent || '').trim().toLowerCase();
          if (text.length < 50 && (text === 'uraian tugas' || text === 'uraian tugas:' || text.includes('uraian tugas') || text.includes('tugas jabatan') || text.includes('kegiatan tugas'))) {
            console.log('⚡ Menemukan label/elemen Uraian Tugas:', label);
            
            let currentParent = label.parentElement;
            // Traverse up to 4 levels
            for (let i = 0; i < 4; i++) {
              if (!currentParent) break;
              
              const trigger = currentParent.querySelector('.select2-selection, .vs__dropdown-toggle, [role="combobox"]');
              if (trigger) {
                console.log('⚡ Menemukan pemicu dropdown dari label parent:', trigger);
                triggerClickEvents(trigger);
                return true;
              }
              
              const clickableDivs = Array.from(currentParent.querySelectorAll('div, button, span')).filter(el => !isHelperWidget(el));
              for (const div of clickableDivs) {
                const divText = (div.textContent || '').trim();
                if (divText.includes('Pilih Uraian Tugas') || divText.includes('-- Pilih') || divText.includes('Pilih Kegiatan') || divText.includes('Pilih Tugas')) {
                  console.log('⚡ Menemukan pemicu dropdown div dari parent:', div);
                  triggerClickEvents(div);
                  return true;
                }
              }
              
              currentParent = currentParent.parentElement;
            }
          }
        }

        // 2. Fallback search for text "-- Pilih Uraian Tugas --" or "Pilih Uraian"
        const allElements = Array.from(document.querySelectorAll('button, div, span, p, a, [role="combobox"], input')).filter(el => !isHelperWidget(el));
        const triggers = allElements.filter(el => {
          const text = (el.textContent || '').trim();
          return text.includes('Pilih Uraian Tugas') || text.includes('-- Pilih Uraian Tugas --') || text === 'Pilih Uraian' || text.includes('Pilih Kegiatan') || text.includes('-- Pilih Kegiatan') || el.classList.contains('vs__search');
        });
        
        if (triggers.length > 0) {
          triggers.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
          const bestTrigger = triggers[0];
          console.log('⚡ Menemukan pemicu custom dropdown Uraian Tugas via teks:', bestTrigger);
          triggerClickEvents(bestTrigger);
          return true;
        }
        return false;
      }

      function isDropdownOpen() {
        const isHelperWidget = (el: Element) => !!el.closest('#sinergi-auto-input-widget');
        const openIndicators = document.querySelectorAll('.vs--open, .select2-container--open, [aria-expanded="true"]');
        if (openIndicators.length > 0) return true;
        
        const options = Array.from(document.querySelectorAll('.vs__dropdown-option, .select2-results__option, [role="option"], li')).filter(el => !isHelperWidget(el));
        const targetText = report.uraianTugas.toLowerCase().trim();
        const hasOptions = options.some(el => {
          const text = (el.textContent || '').toLowerCase().trim();
          return text.includes(targetText) || targetText.includes(text);
        });
        return hasOptions;
      }

      function ensureDropdownOpen() {
        if (isDropdownOpen()) {
          console.log('⚡ Dropdown sudah terbuka.');
          return true;
        }
        return clickUraianDropdownTrigger();
      }

      function clickUraianOption() {
        const isHelperWidget = (el: Element) => !!el.closest('#sinergi-auto-input-widget');
        const targetText = report.uraianTugas.toLowerCase().trim();
        
        const elements = Array.from(document.querySelectorAll('li, div, span, p, a, [role="option"], .select2-results__option, .vs__dropdown-option')).filter(el => !isHelperWidget(el));
        const candidates = elements.filter(el => {
          const tag = el.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'INPUT') return false;
          const text = (el.textContent || '').toLowerCase().trim();
          if (!text || text.length > 250) return false;
          
          return text.includes(targetText) || 
                 (targetText.length > 15 && text.includes(targetText.substring(0, 15)));
        });
        
        if (candidates.length > 0) {
          candidates.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
          const matched = candidates[0];
          console.log('⚡ Berhasil menemukan opsi Uraian Tugas:', matched.textContent?.trim());
          triggerClickEvents(matched);
          return true;
        }
        return false;
      }

      // Dropdown flow AFTER time pickers done
      setTimeout(() => {
        ensureDropdownOpen();
        setTimeout(ensureDropdownOpen, 300);
        setTimeout(ensureDropdownOpen, 600);
        setTimeout(clickUraianOption, 400);
        setTimeout(clickUraianOption, 900);
        setTimeout(clickUraianOption, 1800);
      }, 7000);

      // 3b. Match and Click "Detail Item Pekerjaan" (e.g. Perjalanan dinas luar daerah / dalam daerah)
      function clickDetailItem() {
        if (!report.detailItemPekerjaan) return false;
        const targetText = report.detailItemPekerjaan.toLowerCase().trim();
        console.log('⚡ Mencari detail item pekerjaan: ' + targetText);

        const isHelperWidget = (el: Element) => !!el.closest('#sinergi-auto-input-widget');
        const elements = Array.from(document.querySelectorAll('div, label, span, p, button, input[type="radio"]')).filter(el => !isHelperWidget(el));
        
        // 1st Pass: Radio buttons
        for (const el of elements) {
          if (el.tagName === 'INPUT' && el.type === 'radio') {
            const id = el.id;
            let labelText = '';
            if (id) {
              const labelEl = document.querySelector('label[for="' + id + '"]');
              if (labelEl) labelText = labelEl.textContent || '';
            }
            if (!labelText && el.parentElement) {
              labelText = el.parentElement.textContent || '';
            }
            if (labelText) {
              const lt = labelText.toLowerCase().trim();
              if (lt.includes(targetText) || targetText.includes(lt)) {
                triggerClickEvents(el);
                console.log('⚡ Mengklik radio button sub-item via triggerClickEvents:', labelText);
                
                // Also trigger click on parent container
                if (el.parentElement) {
                  triggerClickEvents(el.parentElement);
                }
                return true;
              }
            }
          }
        }

        // 2nd Pass: Clickable cards or divs
        const candidates = elements.filter(el => {
          const tag = el.tagName;
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'INPUT') return false;
          const elText = (el.textContent || '').toLowerCase().trim();
          if (!elText || elText.length > 150) return false;
          return elText.includes(targetText);
        });

        if (candidates.length > 0) {
          candidates.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
          const bestCandidate = candidates[0];
          console.log('⚡ Mengklik sub-item kandidat terbaik:', bestCandidate.textContent?.trim());
          
          triggerClickEvents(bestCandidate);
          
          // Click closest clickable container button/label/card/li if it exists, instead of loop-clicking all parents
          const container = bestCandidate.closest('button, [role="button"], [role="radio"], [role="checkbox"], label, li, .card');
          if (container && container !== bestCandidate) {
            console.log('⚡ Mengklik container terdekat dari sub-item:', container.tagName, container.className);
            triggerClickEvents(container);
          }
          return true;
        }
        return false;
      }

      function fillDetailItem() {
        if (!report.detailItemPekerjaan) return;
        
        // 1. Try clicking radio button / card / list options
        clickDetailItem();
        
        // 2. Try selecting from dropdowns
        const selectElements = Array.from(document.querySelectorAll('select'));
        for (const select of selectElements) {
          const options = Array.from(select.options);
          const matchedOption = options.find(opt => {
            const optText = opt.text.toLowerCase().trim();
            const targetText = report.detailItemPekerjaan.toLowerCase().trim();
            return optText.includes(targetText) || targetText.includes(optText) ||
                   (targetText.length > 10 && optText.includes(targetText.substring(0, 10))) ||
                   (optText.length > 10 && targetText.includes(optText.substring(0, 10)));
          });

          if (matchedOption) {
            setElementValue(select, matchedOption.value);
            console.log('⚡ Mengisi dropdown Detail Pekerjaan dengan:', matchedOption.text);
          }
        }
      }

      if (report.detailItemPekerjaan) {
        // Delay AFTER time pickers and uraian tugas done
        setTimeout(fillDetailItem, 8000);
        setTimeout(fillDetailItem, 9000);
        setTimeout(fillDetailItem, 10000);
      }

      // Handle custom select2 dropdown if Sinergi V2 uses it
      if (!selectedDropdown) {
        const select2Container = document.querySelector('.select2-container');
        if (select2Container) {
          console.log('Select2 container found. Matching option text: ' + report.uraianTugas);
        }
      }

      // 4. Fill Deskripsi Pekerjaan & Hasil Pekerjaan
      // SINERGI V2: keterangan = narasi/deskripsi, hasil = hasil pekerjaan
      const keteranganEl = document.querySelector('textarea[name="keterangan"]') as HTMLTextAreaElement;
      const hasilEl = document.querySelector('textarea[name="hasil"]') as HTMLTextAreaElement;
      
      if (keteranganEl) {
        setElementValue(keteranganEl, report.deskripsiPekerjaan);
        console.log('⚡ Mengisi keterangan (SINERGI V2):', report.deskripsiPekerjaan?.substring(0, 30));
      }
      if (hasilEl) {
        setElementValue(hasilEl, report.hasilPekerjaan);
        console.log('⚡ Mengisi hasil (SINERGI V2):', report.hasilPekerjaan?.substring(0, 30));
      }

      // Generic fallback for other sites
      if (!keteranganEl || !hasilEl) {
        let descInput = findFormInputElement(['deskripsi', 'uraian kegiatan', 'pekerjaan', 'detail kegiatan', 'narasi'], 'textarea');
        let hasilInput = findFormInputElement(['hasil', 'output', 'bukti fisik'], 'textarea');
        
        if (descInput && descInput !== hasilInput) {
          setElementValue(descInput, report.deskripsiPekerjaan);
        }
        if (hasilInput && descInput !== hasilInput) {
          setElementValue(hasilInput, report.hasilPekerjaan);
        }

        if (!descInput || !hasilInput || descInput === hasilInput) {
          const textareas = Array.from(document.querySelectorAll('textarea'));
          if (textareas.length >= 2) {
            setElementValue(textareas[0], report.deskripsiPekerjaan);
            setElementValue(textareas[1], report.hasilPekerjaan);
          }
        }
      }

      // 5. Auto-upload Bukti Dukung (Supporting Document) if available
      if (report.buktiDukungBase64 && report.buktiDukungName) {
        try {
          const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')).filter(input => !input.closest('#sinergi-auto-input-widget'));
          if (fileInputs.length > 0) {
            const base64Str = report.buktiDukungBase64;
            const filename = report.buktiDukungName;
            
            let mime = 'application/octet-stream';
            if (filename.endsWith('.pdf')) {
              mime = 'application/pdf';
            } else if (filename.endsWith('.png')) {
              mime = 'image/png';
            } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
              mime = 'image/jpeg';
            }
            
            let base64Data = base64Str;
            if (base64Str.includes(',')) {
              const arr = base64Str.split(',');
              const match = arr[0].match(/:(.*?);/);
              if (match) mime = match[1];
              base64Data = arr[1];
            }
            
            const bstr = atob(base64Data);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const file = new File([u8arr], filename, { type: mime });
            
            fileInputs.forEach(fileInput => {
              try {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                
                fileInput.dispatchEvent(new Event('change', { bubbles: true }));
              } catch (fileInputErr) {
                console.error('Gagal memproses salah satu file input:', fileInputErr);
              }
            });
            console.log('⚡ Bukti dukung "' + filename + '" otomatis diunggah!');
          }
        } catch(fileErr) {
          console.error('Gagal mengunggah bukti dukung otomatis:', fileErr);
        }
      }

      // Show Status Banner
      const statusBanner = document.getElementById('sinergi-fill-status');
      if (statusBanner) {
        statusBanner.style.display = 'block';
        setTimeout(() => {
          statusBanner.style.display = 'none';
        }, 5000);
      }

    } catch (e) {
      alert('Terjadi kesalahan saat mengisi form otomatis: ' + e.message);
    }
  }

  function clickSubmitButton() {
    const isHelperWidget = (el) => !!el.closest('#sinergi-auto-input-widget');
    
    // 1. Look for button with type="submit"
    const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).find(btn => !isHelperWidget(btn));
    if (submitBtn) {
      console.log('🤖 Otomatisasi: Mengklik button[type="submit"]...');
      (submitBtn as HTMLElement).click();
      return true;
    }
    
    // 2. Look for button containing text "simpan" or "kirim"
    const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]')).filter(el => !isHelperWidget(el));
    for (const btn of buttons) {
      const txt = (btn.textContent || (btn as HTMLInputElement).value || '').toLowerCase().trim();
      if (txt === 'simpan' || txt === 'kirim' || txt === 'save' || txt === 'submit' || txt.includes('simpan laporan') || txt.includes('kirim laporan')) {
        console.log('🤖 Otomatisasi: Mengklik tombol simpan via teks:', txt);
        (btn as HTMLElement).click();
        return true;
      }
    }
    return false;
  }

  function checkAutoAutomation() {
    const autoActive = localStorage.getItem('sinergi_auto_active') === 'true';
    if (!autoActive) return;

    const rawReports = localStorage.getItem('sinergi_auto_reports');
    if (!rawReports) {
      localStorage.setItem('sinergi_auto_active', 'false');
      return;
    }

    let reports = [];
    try {
      reports = JSON.parse(rawReports);
    } catch(e) {
      localStorage.setItem('sinergi_auto_active', 'false');
      return;
    }

    const currentIndex = parseInt(localStorage.getItem('sinergi_auto_index') || '0', 10);
    if (currentIndex >= reports.length) {
      localStorage.setItem('sinergi_auto_active', 'false');
      localStorage.removeItem('sinergi_auto_reports');
      localStorage.removeItem('sinergi_auto_index');
      
      const startBtn = document.getElementById('sinergi-btn-start-auto');
      const stopBtn = document.getElementById('sinergi-btn-stop-auto');
      if (startBtn) startBtn.style.display = 'flex';
      if (stopBtn) stopBtn.style.display = 'none';
      
      const statusBanner = document.getElementById('sinergi-fill-status');
      if (statusBanner) {
        statusBanner.innerHTML = '🎉 Semua laporan (' + reports.length + ' item) telah berhasil diinput!';
        statusBanner.style.display = 'block';
        statusBanner.style.background = 'rgba(16,185,129,0.1)';
        statusBanner.style.color = '#34d399';
        statusBanner.style.border = '1px solid rgba(16,185,129,0.2)';
      }
      alert('🎉 Semua laporan (' + reports.length + ' item) telah selesai diinput!');
      
      // Re-draw list to clear status badges
      processPayload(rawReports);
      return;
    }

    const isFormPagePath = window.location.pathname.includes('/create') || 
                           window.location.pathname.includes('/tambah') || 
                           window.location.pathname.includes('/input');

    if (isFormPagePath || !!(document.getElementById('wkt1') || document.querySelector('input[name="wkt1"]'))) {
      const statusBanner = document.getElementById('sinergi-fill-status');
      if (statusBanner) {
        statusBanner.innerHTML = '🤖 <strong>Otomatisasi Batch:</strong> Menunggu halaman siap...';
        statusBanner.style.display = 'block';
        statusBanner.style.background = 'rgba(245,158,11,0.1)';
        statusBanner.style.color = '#f59e0b';
        statusBanner.style.border = '1px solid rgba(245,158,11,0.15)';
      }

      let attempts = 0;
      const waitInterval = setInterval(function() {
        attempts++;
        if (localStorage.getItem('sinergi_auto_active') !== 'true') {
          clearInterval(waitInterval);
          return;
        }

        const isReady = !!(document.getElementById('wkt1') || document.querySelector('input[name="wkt1"]')) || document.querySelector('input[type="date"]');
        if (isReady || attempts > 20) { // Wait up to 10 seconds for React components to mount
          clearInterval(waitInterval);
          
          if (statusBanner) {
            statusBanner.innerHTML = '🤖 <strong>Otomatisasi Batch:</strong> Menginput laporan ke-' + (currentIndex + 1) + ' dari ' + reports.length + '... Mohon tunggu.';
          }
          
          // Beri jeda 1.5 detik ekstra agar React selesai memasang event listener (hydration)
          setTimeout(function() {
            if (localStorage.getItem('sinergi_auto_active') !== 'true') return;
            
            console.log('🤖 Otomatisasi Batch: Mensimulasikan klik pada daftar laporan ke-' + (currentIndex + 1) + ' dari ' + reports.length);
            
            // Seperti saran user, kita trigger klik langsung pada elemen daftar di asisten
            const listItems = document.getElementById('sinergi-report-items');
            if (listItems && listItems.children[currentIndex]) {
              (listItems.children[currentIndex] as HTMLElement).click();
            } else {
              fillForm(reports[currentIndex]);
            }

            setTimeout(function() {
              if (localStorage.getItem('sinergi_auto_active') !== 'true') return;
              
              console.log('🤖 Otomatisasi Batch: Menyimpan data...');
              localStorage.setItem('sinergi_auto_index', (currentIndex + 1).toString());
              
              const submitted = clickSubmitButton();
              if (!submitted) {
                console.error('🤖 Gagal mensubmit secara otomatis. Mencoba submit form fallback...');
                const form = document.querySelector('form');
                if (form) form.submit();
              }
            }, 12000);
          }, 1500);
        }
      }, 500);
    } else {
      console.log('🤖 Otomatisasi Batch: Mencari tombol "+ Tambah Laporan"...');
      const statusBanner = document.getElementById('sinergi-fill-status');
      if (statusBanner) {
        statusBanner.innerHTML = '🤖 <strong>Otomatisasi Batch:</strong> Mengalihkan ke Halaman Tambah Laporan...';
        statusBanner.style.display = 'block';
        statusBanner.style.background = 'rgba(99,102,241,0.1)';
        statusBanner.style.color = '#a5b4fc';
        statusBanner.style.border = '1px solid rgba(99,102,241,0.15)';
      }

      setTimeout(function() {
        if (localStorage.getItem('sinergi_auto_active') !== 'true') return;

        const tambahBtn = Array.from(document.querySelectorAll('a, button')).find(el => {
          if (el.closest('#sinergi-auto-input-widget')) return false;
          if (el.closest('form')) return false; // Exclude form buttons like +Tambah Bukti
          const txt = (el.textContent || '').toLowerCase().trim();
          return txt === 'tambah' || txt.includes('tambah laporan') || txt.includes('tambah pekerjaan') || txt.includes('tambah aktivitas') || txt === '+ tambah';
        });

        if (tambahBtn) {
          console.log('🤖 Otomatisasi Batch: Mengklik tombol Tambah.');
          (tambahBtn as HTMLElement).click();
          tambahBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        } else {
          const currentUrl = window.location.href;
          if (currentUrl.includes('/pekerjaan')) {
            const baseUrl = currentUrl.split('/pekerjaan')[0];
            console.log('🤖 Otomatisasi Batch: Mengalihkan via URL redirect ke create page.');
            window.location.href = baseUrl + '/pekerjaan/create';
          }
        }
      }, 2500);
    }
  }


  // Auto-confirm SweetAlert/Swal dialogs if batch automation is active
  setInterval(function() {
    if (localStorage.getItem('sinergi_auto_active') !== 'true') return;
    
    const swalConfirm = document.querySelector('.swal2-confirm, .swal-button--confirm');
    if (swalConfirm) {
      console.log('🤖 Mengkonfirmasi dialog SweetAlert otomatis...');
      (swalConfirm as HTMLElement).click();
    }
    
    const dialogButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
      if (btn.closest('#sinergi-auto-input-widget')) return false;
      if (btn.closest('form')) return false; // Exclude form buttons like +Tambah Bukti
      const txt = (btn.textContent || '').toLowerCase().trim();
      return txt === 'ya' || txt === 'yakin' || txt === 'ya, simpan' || txt === 'ya, kirim' || txt === 'setuju' || txt.includes('proses');
    });
    
    dialogButtons.forEach(btn => {
      (btn as HTMLElement).click();
    });
  }, 1200);

  // Interval periodik untuk selalu memastikan asisten melayang aktif
  const autoActiveOnLoad = localStorage.getItem('sinergi_auto_active') === 'true';
  if (autoActiveOnLoad) {
    createWidget();
    const rawReports = localStorage.getItem('sinergi_auto_reports');
    if (rawReports) {
      const widget = document.getElementById('sinergi-auto-input-widget');
      if (widget) widget.style.display = 'flex';
      setTimeout(function() {
        const textArea = document.getElementById('sinergi-data-input');
        if (textArea) {
          (textArea as HTMLTextAreaElement).value = rawReports;
        }
        processPayload(rawReports);
        checkAutoAutomation();
      }, 1000);
    }
  } else {
    // Normal bootstrap toggle button checking
    const toggleBtnInterval = setInterval(function() {
      // Remove checking if auto active takes over
      if (localStorage.getItem('sinergi_auto_active') === 'true') {
        clearInterval(toggleBtnInterval);
        return;
      }
      
      if (!document.body) return;
      if (document.getElementById('sinergi-helper-toggle-btn') || document.getElementById('sinergi-auto-input-widget')) {
        return;
      }
      
      const toggleBtn = document.createElement('div');
      toggleBtn.id = 'sinergi-helper-toggle-btn';
      toggleBtn.style.cssText = 'position:fixed;bottom:25px;right:25px;width:56px;height:56px;background:#df3b4f;color:white;border-radius:50%;box-shadow:0 8px 24px rgba(223,59,79,0.4);z-index:999999;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:24px;transition:all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);user-select:none;border:2px solid rgba(255,255,255,0.2);';
      toggleBtn.innerHTML = '⚡';
      toggleBtn.title = 'Buka Asisten Pengisian SINERGI V2';
      
      toggleBtn.addEventListener('mouseenter', function() {
        toggleBtn.style.transform = 'scale(1.15) rotate(15deg)';
        toggleBtn.style.boxShadow = '0 12px 28px rgba(223,59,79,0.6)';
      });
      toggleBtn.addEventListener('mouseleave', function() {
        toggleBtn.style.transform = 'scale(1.0) rotate(0deg)';
        toggleBtn.style.boxShadow = '0 8px 24px rgba(223,59,79,0.4)';
      });
      
      toggleBtn.onclick = function() {
        const widget = document.getElementById('sinergi-auto-input-widget');
        if (!widget) {
          createWidget();
        } else {
          widget.style.display = widget.style.display === 'none' ? 'flex' : 'none';
        }
      };
      
      document.body.appendChild(toggleBtn);
    }, 2000);
  }
})();`;
