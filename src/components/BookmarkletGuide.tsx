import { useState } from "react";
import { Copy, Check, Info, ShieldCheck, Zap, AlertCircle, Puzzle, Download, Globe } from "lucide-react";

export default function BookmarkletGuide() {
  const [activeTab, setActiveTab] = useState<"userscript" | "extension">("userscript");
  const [copiedUserscript, setCopiedUserscript] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [copiedExtensionJs, setCopiedExtensionJs] = useState(false);

  const fullUserscriptCode = `// ==UserScript==
// @name         ⚡ e-Kinerja SINERGI V2 Auto-Fill Helper
// @namespace    eKinerjaWorkspace
// @version      1.3
// @description  Asisten otomatis penginputan e-Kinerja / SINERGI V2 BKPSDM Sumenep menggunakan data AI
// @author       e-Kinerja AI Workspace
// @match        *://bkpsdm.sumenepkab.go.id/*
// @match        *://*.sumenepkab.go.id/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';
  
  console.log('⚡ SINERGI V2 Helper: Script dari Tampermonkey berhasil dimuat dan sedang berjalan!');

  // Fungsi pengecekan periodik agar tombol asisten tetap ada (kebal dari reset halaman SPA / React router)
  function initAssistant() {
    if (!document.body) {
      console.log('⚡ Menunggu document.body siap...');
      return;
    }

    // Jika tombol pintas atau widget asisten sudah ada, tidak perlu buat baru
    if (document.getElementById('sinergi-helper-toggle-btn') || document.getElementById('sinergi-auto-input-widget')) {
      return;
    }
    
    console.log('⚡ Membuat tombol asisten...');

    // 1. Buat Tombol Bulat Melayang (Floating Toggle Button)
    const toggleBtn = document.createElement('div');
    toggleBtn.id = 'sinergi-helper-toggle-btn';
    toggleBtn.style.cssText = 'position:fixed;bottom:25px;right:25px;width:56px;height:56px;background:linear-gradient(135deg, #6366f1, #ec4899);color:white;border-radius:50%;box-shadow:0 8px 24px rgba(99,102,241,0.4);z-index:999999;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:24px;transition:all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);user-select:none;border:2px solid rgba(255,255,255,0.2);';
    toggleBtn.innerHTML = '⚡';
    toggleBtn.title = 'Buka Asisten Pengisian SINERGI V2';

    // Efek Animasi Hover
    toggleBtn.addEventListener('mouseenter', function() {
      toggleBtn.style.transform = 'scale(1.15) rotate(15deg)';
      toggleBtn.style.boxShadow = '0 12px 28px rgba(99,102,241,0.6)';
    });
    toggleBtn.addEventListener('mouseleave', function() {
      toggleBtn.style.transform = 'scale(1.0) rotate(0deg)';
      toggleBtn.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)';
    });

    // Ketika diklik, tampilkan / sembunyikan widget asisten utama
    toggleBtn.onclick = function() {
      const widget = document.getElementById('sinergi-auto-input-widget');
      if (!widget) {
        createWidget();
      } else {
        widget.style.display = widget.style.display === 'none' ? 'flex' : 'none';
      }
    };

    document.body.appendChild(toggleBtn);
  }

  function createWidget() {
    if (document.getElementById('sinergi-auto-input-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'sinergi-auto-input-widget';
    widget.style.cssText = 'position:fixed;bottom:90px;right:25px;width:360px;max-height:75vh;background:#0f111a;border:1.5px solid rgba(255,255,255,0.15);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.6);z-index:999999;font-family:sans-serif;color:#e2e8f0;display:flex;flex-direction:column;overflow:hidden;transition:all 0.3s ease;backdrop-filter:blur(10px);';

    // Widget Header
    const header = document.createElement('div');
    header.style.cssText = 'background:linear-gradient(90deg, #131722, #1e2230);padding:14px 18px;border-bottom:1.5px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;cursor:move;';
    header.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><span style="color:#6366f1;font-weight:900;font-size:14px;letter-spacing:0.5px;">⚡ SINERGI AI HELPER</span></div><button id="sinergi-widget-close" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:20px;margin-left:auto;line-height:1;transition:color 0.2s;">&times;</button>';
    widget.appendChild(header);

    // Widget Body
    const body = document.createElement('div');
    body.style.cssText = 'padding:16px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:12px;font-size:12px;';
    body.innerHTML = \'<div style="margin-bottom:12px;display:flex;flex-direction:column;gap:8px;"><label style="font-weight:bold;display:block;color:#a5b4fc;font-size:12px;">Unggah File Payload Kinerja:</label><div style="display:flex;flex-direction:column;gap:6px;"><button id="sinergi-btn-upload-trigger" style="width:100%;background:linear-gradient(135deg, #6366f1, #ec4899);color:white;border:none;border-radius:8px;padding:10px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;box-shadow:0 4px 12px rgba(99,102,241,0.2);">📁 Pilih & Unggah File Payload (.json)</button><input type="file" id="sinergi-file-input" accept=".json" style="display:none;" /></div><div id="sinergi-file-name" style="color:#34d399;font-weight:bold;font-size:11px;text-align:center;display:none;background:rgba(52,211,153,0.1);padding:6px;border-radius:6px;border:1px solid rgba(52,211,153,0.15);"></div><details style="margin-top:4px;border-top:1px solid rgba(255,255,255,0.08);padding-top:6px;"><summary style="cursor:pointer;color:#64748b;font-weight:bold;font-size:11px;user-select:none;">Atau Tempel Teks Manual</summary><div style="margin-top:6px;display:flex;flex-direction:column;gap:6px;"><textarea id="sinergi-data-input" placeholder="Tempel JSON atau Payload e-Kinerja di sini..." style="width:100%;height:60px;background:#1e2230;color:white;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:8px;box-sizing:border-box;font-family:monospace;font-size:11px;resize:none;outline:none;"></textarea><button id="sinergi-btn-load" style="width:100%;background:#334155;color:white;border:none;border-radius:6px;padding:6px;font-weight:bold;cursor:pointer;">Muat Manual</button></div></details></div><div id="sinergi-report-list-container" style="display:none;border-top:1px dashed rgba(255,255,255,0.1);padding-top:12px;"><div style="font-weight:bold;margin-bottom:8px;color:#a5b4fc;display:flex;justify-content:space-between;align-items:center;"><span>Pilih Laporan Hari Ini:</span><span id="sinergi-count" style="background:linear-gradient(135deg, #6366f1, #ec4899);color:white;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:bold;">0</span></div><div id="sinergi-report-items" style="display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto;padding-right:4px;"></div></div><div id="sinergi-fill-status" style="padding:10px;border-radius:8px;background:rgba(16,185,129,0.1);color:#34d399;font-weight:bold;display:none;text-align:center;border:1px solid rgba(16,185,129,0.2);">🎉 Laporan berhasil diisi! Periksa & simpan.</div>\';
    widget.appendChild(body);
    document.body.appendChild(widget);

    // Style elements hover / focus on target
    const ta = document.getElementById(\'sinergi-data-input\');
    if (ta) {
      ta.onfocus = function() { ta.style.borderColor = \'#6366f1\'; };
      ta.onblur = function() { ta.style.borderColor = \'rgba(255,255,255,0.1)\'; };
    }

    // Close button click
    document.getElementById(\'sinergi-widget-close\').onclick = function() {
      widget.style.display = \'none\';
    };

    // Make Widget Draggable
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    header.addEventListener(\'mousedown\', function(e) {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      if (e.target === header || header.contains(e.target)) {
        isDragging = true;
      }
    });

    document.addEventListener(\'mousemove\', function(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        widget.style.transform = "translate(" + currentX + "px, " + currentY + "px)";
      }
    });

    document.addEventListener(\'mouseup\', function() {
      isDragging = false;
    });

    // Upload Logic & Event
    const fileInput = document.getElementById(\'sinergi-file-input\');
    const uploadTrigger = document.getElementById(\'sinergi-btn-upload-trigger\');
    const fileNameDisplay = document.getElementById(\'sinergi-file-name\');

    const loadBtn = document.getElementById(\'sinergi-btn-load\');
    const txtArea = document.getElementById(\'sinergi-data-input\');
    const listContainer = document.getElementById(\'sinergi-report-list-container\');
    const itemsContainer = document.getElementById(\'sinergi-report-items\');
    const countBadge = document.getElementById(\'sinergi-count\');

    if (uploadTrigger && fileInput) {
      uploadTrigger.onclick = function() {
        fileInput.click();
      };

      fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (fileNameDisplay) {
          fileNameDisplay.textContent = \'📄 \' + file.name;
          fileNameDisplay.style.display = \'block\';
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
        alert(\'Silakan tempel data kinerja terlebih dahulu!\');
        return;
      }
      processPayload(rawVal);
    };

    function processPayload(rawVal) {
      rawVal = rawVal.trim();
      let reports = [];
      try {
        if (rawVal.startsWith(\'[\') || rawVal.startsWith(\'{\')) {
          const parsed = JSON.parse(rawVal);
          reports = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          alert(\'Format data tidak valid! Harus berupa JSON valid.\');
          return;
        }
      } catch(err) {
        alert(\'Gagal membaca data! Pastikan data/file terformat dengan benar (JSON).\');
        return;
      }

      if (reports.length === 0) {
        alert(\'Tidak ada laporan kinerja yang ditemukan.\');
        return;
      }

      // Populate List
      itemsContainer.innerHTML = \'\';
      reports.forEach(function(report, index) {
        const item = document.createElement(\'div\');
        item.style.cssText = \'background:#1a1d29;border:1.5px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px;cursor:pointer;transition:all 0.2s;display:flex;flex-direction:column;gap:4px;margin-bottom:6px;\';
        
        item.addEventListener(\'mouseenter\', function() {
          item.style.borderColor = \'#6366f1\';
          item.style.background = \'#222533\';
        });
        item.addEventListener(\'mouseleave\', function() {
          item.style.borderColor = \'rgba(255,255,255,0.08)\';
          item.style.background = \'#1a1d29\';
        });

        let dateFormatted = report.tanggal;
        try {
          const d = new Date(report.tanggal);
          const options = { day: \'numeric\', month: \'short\', year: \'numeric\' };
          dateFormatted = d.toLocaleDateString(\'id-ID\', options);
        } catch(e) {}

        item.innerHTML = \'<div style="display:flex;justify-content:space-between;align-items:center;font-weight:bold;"><span style="color:#a5b4fc;">\' + dateFormatted + \'</span><span style="color:#94a3b8;font-size:10px;background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:6px;">\' + report.waktuMulai + \' - \' + report.waktuSelesai + \'</span></div><div style="font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:white;margin-top:2px;">\' + report.uraianTugas + \'</div><div style="color:#94a3b8;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">\' + report.deskripsiPekerjaan + \'</div>\';

        item.onclick = function() {
          fillForm(report);
        };

        itemsContainer.appendChild(item);
      });

      countBadge.textContent = reports.length;
      listContainer.style.display = \'block\';
    }

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
              const jq = window.$ || window.jQuery;
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
            const el = document.querySelector(selector + '[name*="' + kw + '"], ' + selector + '[id*="' + kw + '"], ' + selector + '[placeholder*="' + kw + '"]');
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

        // 2. Fill Start & End Times
        let startInput = findFormInputElement(['mulai', 'start', 'jam_mulai', 'jam_start', 'waktu_mulai', 'jam mulai', 'waktu mulai'], 'input');
        let endInput = findFormInputElement(['selesai', 'end', 'jam_selesai', 'jam_end', 'waktu_selesai', 'jam selesai', 'waktu selesai'], 'input');
        
        if (startInput) {
          const isTimeInput = startInput.type === 'time';
          setElementValue(startInput, isTimeInput ? report.waktuMulai.replace('.', ':') : report.waktuMulai.replace(':', '.'));
          console.log('⚡ Mengisi input Mulai dengan:', report.waktuMulai);
        } else {
          const startInputs = Array.from(document.querySelectorAll('input[name*="mulai"], input[id*="mulai"], input[placeholder*="Mulai"], input[placeholder*="07.30"], input[placeholder*="07:30"]'));
          for (const input of startInputs) {
            const isTimeInput = input.type === 'time';
            setElementValue(input, isTimeInput ? report.waktuMulai.replace('.', ':') : report.waktuMulai.replace(':', '.'));
          }
        }

        if (endInput) {
          const isTimeInput = endInput.type === 'time';
          setElementValue(endInput, isTimeInput ? report.waktuSelesai.replace('.', ':') : report.waktuSelesai.replace(':', '.'));
          console.log('⚡ Mengisi input Selesai dengan:', report.waktuSelesai);
        } else {
          const endInputs = Array.from(document.querySelectorAll('input[name*="selesai"], input[id*="selesai"], input[placeholder*="Selesai"], input[placeholder*="15.30"], input[placeholder*="15:30"]'));
          for (const input of endInputs) {
            const isTimeInput = input.type === 'time';
            setElementValue(input, isTimeInput ? report.waktuSelesai.replace('.', ':') : report.waktuSelesai.replace(':', '.'));
          }
        }

        // 3. Select Uraian Tugas (Dropdown & Custom Dropdown Support)
        const selectElements = Array.from(document.querySelectorAll('select[name*="tugas"], select[id*="tugas"], select[name*="uraian"], select'));
        let selectedDropdown = false;
        
        for (const select of selectElements) {
          if (select) {
            const options = Array.from(select.options);
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
          const isHelperWidget = (el) => !!el.closest('#sinergi-auto-input-widget');

          // 1. Look for label "Uraian Tugas" and click corresponding dropdown next to it
          const labels = Array.from(document.querySelectorAll('label, div, span, p')).filter(el => !isHelperWidget(el));
          for (const label of labels) {
            const text = (label.textContent || '').trim().toLowerCase();
            if (text === 'uraian tugas' || text === 'uraian tugas:' || text.includes('uraian tugas')) {
              console.log('⚡ Menemukan label/elemen Uraian Tugas:', label);
              const parent = label.parentElement;
              if (parent) {
                const trigger = parent.querySelector('[role="combobox"], [role="button"], button, .vs__dropdown-toggle, .select2-selection, [class*="select"], [class*="dropdown"], [class*="toggle"]');
                if (trigger) {
                  console.log('⚡ Menemukan pemicu dropdown dari label parent:', trigger);
                  triggerClickEvents(trigger);
                  return true;
                }
                
                const clickableDivs = Array.from(parent.querySelectorAll('div, button, span')).filter(el => !isHelperWidget(el));
                for (const div of clickableDivs) {
                  const divText = (div.textContent || '').trim();
                  if (divText.includes('Pilih Uraian Tugas') || divText.includes('-- Pilih') || div.getAttribute('role') === 'combobox' || div.classList.contains('vs__dropdown-toggle')) {
                    console.log('⚡ Menemukan pemicu dropdown div dari parent:', div);
                    triggerClickEvents(div);
                    return true;
                  }
                }

                // Fallback sibling click: click any sibling elements of the label that might be the custom select box
                const children = Array.from(parent.children);
                for (const child of children) {
                  if (child !== label && child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
                    console.log('⚡ Mengklik sibling dari label Uraian Tugas:', child.tagName, child.className);
                    triggerClickEvents(child);
                    
                    const nestedClickable = child.querySelector('div, button, span, [role="button"], [class*="select"], [class*="dropdown"]');
                    if (nestedClickable) {
                      console.log('⚡ Mengklik nested clickable di sibling:', nestedClickable.tagName);
                      triggerClickEvents(nestedClickable);
                    }
                    return true;
                  }
                }
              }
            }
          }

          // 2. Fallback search for text "-- Pilih Uraian Tugas --" or "Pilih Uraian"
          const allElements = Array.from(document.querySelectorAll('button, div, span, p, a, [role="combobox"], input')).filter(el => !isHelperWidget(el));
          const triggers = allElements.filter(el => {
            const text = (el.textContent || '').trim();
            return text.includes('Pilih Uraian Tugas') || text.includes('-- Pilih Uraian Tugas --') || text === 'Pilih Uraian' || el.classList.contains('vs__search');
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
          const isHelperWidget = (el) => !!el.closest('#sinergi-auto-input-widget');
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
          const isHelperWidget = (el) => !!el.closest('#sinergi-auto-input-widget');
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

          const isHelperWidget = (el) => !!el.closest('#sinergi-auto-input-widget');
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
        let descInput = findFormInputElement(['deskripsi', 'uraian kegiatan', 'pekerjaan', 'detail kegiatan'], 'textarea');
        let hasilInput = findFormInputElement(['hasil', 'output', 'bukti fisik'], 'textarea');
        
        if (descInput && descInput !== hasilInput) {
          setElementValue(descInput, report.deskripsiPekerjaan);
          console.log('⚡ Mengisi Deskripsi dengan:', report.deskripsiPekerjaan);
        }
        if (hasilInput && descInput !== hasilInput) {
          setElementValue(hasilInput, report.hasilPekerjaan);
          console.log('⚡ Mengisi Hasil dengan:', report.hasilPekerjaan);
        }

        if (!descInput || !hasilInput || descInput === hasilInput) {
          const textareas = Array.from(document.querySelectorAll('textarea'));
          if (textareas.length >= 2) {
            setElementValue(textareas[0], report.deskripsiPekerjaan);
            setElementValue(textareas[1], report.hasilPekerjaan);
          } else {
            const descInputs = Array.from(document.querySelectorAll('textarea[name*="deskripsi"], textarea[id*="deskripsi"], textarea[name*="pekerjaan"], textarea[id*="pekerjaan"], textarea[placeholder*="deskripsi"]'));
            for (const input of descInputs) {
              setElementValue(input, report.deskripsiPekerjaan);
            }

            const hasilInputs = Array.from(document.querySelectorAll('textarea[name*="hasil"], textarea[id*="hasil"], textarea[placeholder*="hasil"]'));
            for (const input of hasilInputs) {
              setElementValue(input, report.hasilPekerjaan);
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

        // Tampilkan Banner Sukses
        const statusBanner = document.getElementById('sinergi-fill-status');
        if (statusBanner) {
          statusBanner.style.display = 'block';
          setTimeout(function() {
            statusBanner.style.display = 'none';
          }, 5000);
        }

      } catch (e) {
        alert('Gagal mengisi form otomatis: ' + e.message);
      }
    }
  }

  // Interval periodik untuk selalu memastikan asisten melayang aktif
  setInterval(initAssistant, 1500);
})();`;

  const handleCopyUserscript = async () => {
    try {
      await navigator.clipboard.writeText(fullUserscriptCode);
      setCopiedUserscript(true);
      setTimeout(() => setCopiedUserscript(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin Userscript:", err);
    }
  };

  const manifestJsonCode = `{
  "manifest_version": 3,
  "name": "Helper SINERGI V2 e-Kinerja",
  "version": "1.0",
  "description": "Ekstensi Chrome untuk Pengisian Otomatis SINERGI V2 BKPSDM Kabupaten Sumenep",
  "permissions": ["activeTab"],
  "content_scripts": [
    {
      "matches": [
        "*://bkpsdm.sumenepkab.go.id/*",
        "*://*.sumenepkab.go.id/*"
      ],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ]
}`;

  const handleDownloadFile = (content: string, filename: string, contentType: string) => {
    try {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal mengunduh file:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-white">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900/35 to-pink-900/15 border border-white/25 rounded-3xl p-6 relative overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-5 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20">
              <Zap className="w-3 h-3 text-yellow-300 animate-pulse" /> Fitur Premium Otomatisasi
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Otomatisasi Penginputan SINERGI V2
            </h2>
            <p className="text-sm text-white/90 max-w-xl leading-relaxed font-medium">
              Lewati proses pengisian formulir manual satu per satu di website BKPSDM Sumenep. 
              Gunakan asisten <strong className="text-white">Tampermonkey Userscript</strong> atau pasang <strong className="text-white">Ekstensi Chrome Mandiri</strong>!
            </p>
          </div>

          {/* Modern Tabs Selector */}
          <div className="flex flex-col sm:flex-row flex-wrap md:flex-nowrap bg-white/10 p-1.5 rounded-2xl border border-white/15 shadow-inner backdrop-blur-md gap-1 w-full lg:w-fit self-start">
            <button
              onClick={() => setActiveTab("userscript")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "userscript"
                  ? "bg-white text-indigo-900 shadow-lg"
                  : "text-white/80 hover:bg-white/15 hover:text-white"
              }`}
            >
              <Puzzle className="w-3.5 h-3.5" /> 🐒 1. Tampermonkey
            </button>
            <button
              onClick={() => setActiveTab("extension")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "extension"
                  ? "bg-white text-indigo-900 shadow-lg"
                  : "text-white/80 hover:bg-white/15 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> 🧩 2. Chrome Extension (Rekomendasi)
            </button>
          </div>
        </div>
      </div>

      {activeTab === "userscript" && (
        <>
          {/* Userscript Section */}
          <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/15 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Puzzle className="text-yellow-300 w-5 h-5 animate-pulse" />🐒 Tampermonkey Userscript (Otomatis & Stabil)
                </h3>
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  Metode paling modern & stabil! Script asisten otomatis akan **muncul dengan sendirinya** sebagai tombol mengambang saat Anda membuka situs e-Kinerja BKPSDM Sumenep. Sangat cocok untuk pengguna PC dan Android (via browser Kiwibrowser/Firefox).
                </p>
              </div>
              <button
                onClick={handleCopyUserscript}
                className="inline-flex items-center gap-2 px-6 py-4 bg-white hover:bg-white/95 text-indigo-700 font-extrabold rounded-xl shadow-lg border border-white/25 transition-transform hover:-translate-y-0.5 cursor-pointer shrink-0"
              >
                {copiedUserscript ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-600" />
                    Berhasil Disalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 text-indigo-600" />
                    Salin Kode Userscript
                  </>
                )}
              </button>
            </div>

            {/* Tampermonkey Setup Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-5 space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center font-black text-lg text-white shadow-inner">
                  1
                </div>
                <h3 className="font-extrabold text-white">Pasang Ekstensi Browser</h3>
                <p className="text-xs text-white/85 leading-relaxed font-medium">
                  Pasang ekstensi **Tampermonkey** atau **Violentmonkey** di browser Anda.
                  <span className="block mt-2 text-[11px] text-white/70 italic">
                    * Untuk HP Android, gunakan aplikasi **Kiwi Browser** atau **Firefox Nightly** agar bisa memasang ekstensi Tampermonkey dari web store.
                  </span>
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-5 space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center font-black text-lg text-white shadow-inner">
                  2
                </div>
                <h3 className="font-extrabold text-white">Buat Script Baru</h3>
                <p className="text-xs text-white/85 leading-relaxed font-medium">
                  Klik ikon Tampermonkey di kanan atas browser, pilih **"Dashboard / Dasbor"**, lalu klik ikon **"+" (Tambah Script Baru)**. Hapus semua baris teks default yang ada di editor tersebut.
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl p-5 space-y-3 shadow-lg">
                <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center font-black text-lg text-white shadow-inner">
                  3
                </div>
                <h3 className="font-extrabold text-white">Tempel & Simpan</h3>
                <p className="text-xs text-white/85 leading-relaxed font-medium">
                  Tempel (Paste) kode Userscript yang telah Anda salin ke editor tersebut, lalu simpan dengan menekan tombol menu **File &gt; Save** atau tombol pintas <kbd className="px-1.5 py-0.5 bg-white/20 border border-white/25 rounded text-[10px] text-white">Ctrl + S</kbd>. Selesai!
                </p>
              </div>
            </div>

            {/* Raw Userscript Code block */}
            <div className="space-y-2">
              <span className="text-[11px] text-white/90 font-bold block uppercase tracking-wider">Preview Kode Userscript Tampermonkey Anda:</span>
              <div className="relative rounded-2xl bg-slate-900/75 border border-white/25 p-4 font-mono text-[11px] overflow-x-auto max-h-64 text-slate-100 select-all scrollbar-thin">
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={handleCopyUserscript}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/15 px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedUserscript ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-300" /> Berhasil!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Salin Kode
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap break-all pr-12">{fullUserscriptCode}</pre>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "extension" && (
        <>
          {/* Extension Section */}
          <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-white/15 pb-4 space-y-2">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Puzzle className="text-yellow-300 w-5 h-5 animate-pulse" />
                Ekstensi Google Chrome Mandiri (Tanpa Tampermonkey)
              </h3>
              <p className="text-xs text-white/90 leading-relaxed font-medium">
                Sangat Bisa! Anda dapat membuat ekstensi (Chrome Extension) mandiri untuk browser Anda sendiri. 
                Ini adalah cara paling rapi, profesional, dan permanen. Anda tidak memerlukan ekstensi pihak ketiga seperti Tampermonkey.
                Cukup unduh dua file di bawah ini, simpan di satu folder, lalu pasang langsung ke browser Anda!
              </p>
            </div>

            {/* Step-by-Step Installation Guide */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-5 space-y-3 shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center font-black text-lg text-white shadow-inner">
                    1
                  </div>
                  <h3 className="font-extrabold text-white text-xs">Buat Folder Baru</h3>
                  <p className="text-[11px] text-white/85 leading-relaxed font-medium">
                    Buat sebuah folder baru di komputer/laptop Anda, beri nama bebas (misalnya: <strong className="text-white">"SinergiHelperExtension"</strong>).
                  </p>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-5 space-y-3 shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center font-black text-lg text-white shadow-inner">
                    2
                  </div>
                  <h3 className="font-extrabold text-white text-xs">Unduh manifest.json</h3>
                  <p className="text-[11px] text-white/85 leading-relaxed font-medium">
                    Unduh file manifes ekstensi dan simpan ke dalam folder yang baru saja Anda buat di atas.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => handleDownloadFile(manifestJsonCode, "manifest.json", "application/json")}
                    className="w-full bg-white hover:bg-white/95 text-indigo-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh manifest.json
                  </button>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-5 space-y-3 shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center font-black text-lg text-white shadow-inner">
                    3
                  </div>
                  <h3 className="font-extrabold text-white text-xs">Unduh content.js</h3>
                  <p className="text-[11px] text-white/85 leading-relaxed font-medium">
                    Unduh file script asisten dan simpan juga ke dalam folder yang sama berdampingan dengan file manifest tadi.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => handleDownloadFile(fullUserscriptCode, "content.js", "application/javascript")}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-indigo-500 shadow-md cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh content.js
                  </button>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl p-5 space-y-3 shadow-lg flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center font-black text-lg text-white shadow-inner">
                    4
                  </div>
                  <h3 className="font-extrabold text-white text-xs">Pasang di Chrome</h3>
                  <p className="text-[11px] text-white/85 leading-relaxed font-medium">
                    Buka <strong className="text-white">chrome://extensions</strong>, aktifkan <strong className="text-white">Developer mode</strong>, klik <strong className="text-white">Load unpacked</strong>, dan pilih folder Anda!
                  </p>
                </div>
              </div>
            </div>

            {/* Developer Mode Loading Details */}
            <div className="bg-white/10 rounded-2xl p-5 border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-300" /> Panduan Detail Memasang ke Browser Anda:
              </h4>
              <ol className="list-decimal list-inside text-xs text-white/80 space-y-2 pl-1 font-medium leading-relaxed">
                <li>Pastikan kedua file (<strong className="text-indigo-200 font-bold">manifest.json</strong> dan <strong className="text-indigo-200 font-bold">content.js</strong>) disimpan di dalam folder yang sama di laptop/komputer Anda.</li>
                <li>Buka browser Google Chrome (atau Edge / Opera / Brave).</li>
                <li>Masuk ke halaman ekstensi dengan mengetik <strong className="text-white underline font-mono select-all">chrome://extensions</strong> di kolom URL lalu tekan Enter.</li>
                <li>Di sudut kanan atas halaman tersebut, aktifkan tombol geser <strong className="text-white font-bold">"Developer mode" (Mode Pengembang)</strong>.</li>
                <li>Di sudut kiri atas, klik tombol baru yang muncul yaitu <strong className="text-white font-bold bg-white/20 border border-white/20 px-2.5 py-1 rounded-lg">"Load unpacked" (Muat ekstensi tidak dikemas)</strong>.</li>
                <li>Pilih folder tempat Anda menyimpan kedua file tersebut, lalu klik <strong className="text-white">Select Folder / Open</strong>.</li>
                <li>Selesai! Sekarang buka website e-Kinerja BKPSDM Sumenep. Ekstensi Anda akan langsung mendeteksi halaman tersebut secara otomatis dan memunculkan tombol asisten <strong className="text-yellow-300">⚡</strong> di pojok kanan bawah!</li>
              </ol>
            </div>

            {/* Code Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manifest Preview */}
              <div className="space-y-2">
                <span className="text-[11px] text-white/90 font-bold block uppercase tracking-wider">File 1: manifest.json</span>
                <div className="relative rounded-2xl bg-slate-900/75 border border-white/25 p-4 font-mono text-[11px] overflow-x-auto h-52 text-slate-100 select-all scrollbar-thin">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(manifestJsonCode);
                        setCopiedManifest(true);
                        setTimeout(() => setCopiedManifest(false), 2000);
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/15 px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedManifest ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-300" /> Disalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Salin
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="whitespace-pre">{manifestJsonCode}</pre>
                </div>
              </div>

              {/* Content Script Preview */}
              <div className="space-y-2">
                <span className="text-[11px] text-white/90 font-bold block uppercase tracking-wider">File 2: content.js</span>
                <div className="relative rounded-2xl bg-slate-900/75 border border-white/25 p-4 font-mono text-[11px] overflow-x-auto h-52 text-slate-100 select-all scrollbar-thin">
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(fullUserscriptCode);
                        setCopiedExtensionJs(true);
                        setTimeout(() => setCopiedExtensionJs(false), 2000);
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/15 px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedExtensionJs ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-300" /> Disalin!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Salin
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap break-all pr-12">{fullUserscriptCode}</pre>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Security Warning & Best Practice */}
      <div className="flex gap-3 bg-white/15 border border-white/25 rounded-2xl p-4">
        <ShieldCheck className="w-6 h-6 text-white shrink-0 animate-pulse" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white">Aman & Sesuai Aturan</h4>
          <p className="text-[11px] text-white/85 leading-relaxed font-medium">
            Sistem otomatisasi asisten lokal ini murni berjalan di sisi browser Anda (client-side). Tidak ada pengiriman data kredensial, username, sandi, atau data aktivitas Anda ke server pihak ketiga manapun. Script ini murni melakukan simulasi pengetikan data kustom secara kilat untuk menghemat hingga 95% waktu pengisian e-Kinerja harian Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
