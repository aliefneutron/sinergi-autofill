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
          📁 Pilih & Unggah File Payload (.json)
        </button>
        <input type="file" id="sinergi-file-input" accept=".json" style="display:none;" />
      </div>
      <div id="sinergi-file-name" style="color:#34d399;font-weight:bold;font-size:11px;text-align:center;display:none;background:rgba(52,211,153,0.1);padding:6px;border-radius:6px;border:1px solid rgba(52,211,153,0.15);"></div>

      <details style="margin-top:4px;border-top:1px solid rgba(255,255,255,0.08);padding-top:6px;">
        <summary style="cursor:pointer;color:#64748b;font-weight:bold;font-size:11px;user-select:none;">Atau Tempel Teks Manual</summary>
        <div style="margin-top:6px;display:flex;flex-direction:column;gap:6px;">
          <textarea id="sinergi-data-input" placeholder="Tempel JSON atau Payload e-Kinerja di sini..." style="width:100%;height:60px;background:#1e2230;color:white;border:1px solid #334155;border-radius:6px;padding:8px;box-sizing:border-box;font-family:monospace;font-size:11px;resize:none;outline:none;"></textarea>
          <button id="sinergi-btn-load" style="width:100%;background:#334155;color:white;border:none;border-radius:6px;padding:6px;font-weight:bold;cursor:pointer;">Muat Manual</button>
        </div>
      </details>
    </div>
    <div id="sinergi-report-list-container" style="display:none;border-top:1px dashed #334155;padding-top:12px;">
      <div style="font-weight:bold;margin-bottom:6px;color:#94a3b8;display:flex;justify-content:space-between;align-items:center;">
        <span>Pilih Laporan Hari Ini:</span>
        <span id="sinergi-count" style="background:#df3b4f;color:white;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:bold;">0</span>
      </div>
      <div id="sinergi-report-items" style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow-y:auto;padding-right:4px;"></div>
    </div>
    <div id="sinergi-fill-status" style="padding:8px;border-radius:6px;background:#1e2230;color:#10b981;font-weight:bold;display:none;text-align:center;">
      Laporan berhasil diisi! Silakan periksa & kirim.
    </div>
  \`;
  widget.appendChild(body);

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

  function processPayload(rawVal) {
    rawVal = rawVal.trim();
    let reports = [];
    try {
      if (rawVal.startsWith('[') || rawVal.startsWith('{')) {
        const parsed = JSON.parse(rawVal);
        reports = Array.isArray(parsed) ? parsed : [parsed];
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

      item.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:bold;">
          <span style="color:#df3b4f;">\${dateFormatted}</span>
          <span style="color:#94a3b8;font-size:10px;">\${report.waktuMulai} - \${report.waktuSelesai}</span>
        </div>
        <div style="font-weight:semibold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:white;margin-top:2px;">\${report.uraianTugas}</div>
        <div style="color:#94a3b8;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\${report.deskripsiPekerjaan}</div>
      \`;

      item.onclick = function() {
        fillForm(report);
      };

      itemsContainer.appendChild(item);
    });

    countBadge.textContent = reports.length;
    listContainer.style.display = 'block';
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

      // 2. Fill Start & End Times - SINERGI V2 specific: button#wkt1 / button#wkt2 + hidden input
      function fillSinergiTimePicker(btnId: string, timeValue: string) {
        const timeWithDot = timeValue.includes(':') ? timeValue.replace(':', '.') : timeValue;
        const timeWithColon = timeValue.includes('.') ? timeValue.replace('.', ':') : timeValue;

        // 1. Set hidden input value directly
        const hiddenInput = document.querySelector('input[name="' + btnId + '"]') as HTMLInputElement;
        if (hiddenInput) {
          const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          if (desc && desc.set) desc.set.call(hiddenInput, timeWithDot);
          else hiddenInput.value = timeWithDot;
          hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
          hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('⚡ Set hidden time input ' + btnId + ':', timeWithDot);
        }

        // 2. Update the visual display button span
        const btn = document.getElementById(btnId) as HTMLButtonElement;
        if (btn) {
          const span = btn.querySelector('span');
          if (span) {
            span.textContent = timeWithColon;
            span.className = 'font-bold text-base-content';
          }

          // 3. Click button to open popup, then select the matching time option
          btn.click();
          btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

          setTimeout(function() {
            const isHelperWidget = (el: Element) => !!el.closest('#sinergi-auto-input-widget');
            const allEls = Array.from(document.querySelectorAll('button, li, span[class], div[class]'))
              .filter(el => !isHelperWidget(el) && el !== btn);
            
            const match = allEls.find(el => {
              if (el.children.length > 3) return false;
              const text = (el.textContent || '').trim();
              return text === timeWithColon || text === timeWithDot;
            });
            
            if (match) {
              (match as HTMLElement).click();
              match.dispatchEvent(new MouseEvent('click', { bubbles: true }));
              console.log('⚡ Clicked time option in popup:', match.textContent);
            } else {
              // Close popup by clicking outside
              document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }
          }, 500);
        }
      }

      fillSinergiTimePicker('wkt1', report.waktuMulai);
      setTimeout(() => fillSinergiTimePicker('wkt2', report.waktuSelesai), 900);

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
      // 3a. SINERGI V2: Radio button matching (idpekerjaandtl)
      function fillUraianTugasRadio() {
        const targetText = (report.uraianTugas || '').toLowerCase().trim();
        const detailText = (report.detailItemPekerjaan || '').toLowerCase().trim();
        const radios = Array.from(document.querySelectorAll('input[type="radio"]')).filter(r => !r.closest('#sinergi-auto-input-widget'));
        
        for (const radio of radios as HTMLInputElement[]) {
          let labelText = '';
          if (radio.id) {
            const lbl = document.querySelector('label[for="' + radio.id + '"]');
            if (lbl) labelText = lbl.textContent || '';
          }
          if (!labelText && radio.parentElement) {
            labelText = radio.parentElement.textContent || '';
          }
          const lt = labelText.toLowerCase().trim();
          const matchMain = targetText.length > 5 && lt.includes(targetText.substring(0, Math.min(targetText.length, 20)));
          const matchDetail = detailText.length > 5 && lt.includes(detailText.substring(0, Math.min(detailText.length, 20)));
          
          if (matchMain || matchDetail) {
            radio.click();
            radio.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            radio.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('⚡ Dipilih radio uraian tugas:', labelText.substring(0, 60));
            return true;
          }
        }
        return false;
      }

      fillUraianTugasRadio();
      setTimeout(fillUraianTugasRadio, 500);
      setTimeout(fillUraianTugasRadio, 1500);

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

      // Trigger custom dropdown click flow multiple times to ensure robust opening and selection
      ensureDropdownOpen();
      setTimeout(ensureDropdownOpen, 300);
      setTimeout(ensureDropdownOpen, 600);

      setTimeout(clickUraianOption, 400);
      setTimeout(clickUraianOption, 800);
      setTimeout(clickUraianOption, 1500);
      setTimeout(clickUraianOption, 2500);
      setTimeout(clickUraianOption, 4000);

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
        setTimeout(fillDetailItem, 300);
        setTimeout(fillDetailItem, 800);
        setTimeout(fillDetailItem, 1500);
        setTimeout(fillDetailItem, 2500);
        setTimeout(fillDetailItem, 3500);
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
})();`;
