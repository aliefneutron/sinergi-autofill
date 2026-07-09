import { useState } from "react";
import { Copy, Check, Info, ShieldCheck, Zap, AlertCircle, Puzzle, Download, Globe } from "lucide-react";

export default function ExtensionGuide() {
  const [activeTab, setActiveTab] = useState<"userscript" | "extension">("userscript");
  const [copiedUserscript, setCopiedUserscript] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [copiedExtensionJs, setCopiedExtensionJs] = useState(false);

  const fullUserscriptCode = `// ==UserScript==
// @name         ⚡ e-Kinerja SINERGI V2 Auto-Fill Helper
// @namespace    eKinerjaWorkspace
// @version      1.4
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

    // Make Toggle Button Draggable
    let isBtnDragging = false;
    let btnDragMoved = false;
    let btnInitialX = 0;
    let btnInitialY = 0;
    let btnStartLeft = 0;
    let btnStartTop = 0;

    function makeBtnAbsolute() {
      if (toggleBtn.style.right !== 'auto' || toggleBtn.style.bottom !== 'auto') {
        const rect = toggleBtn.getBoundingClientRect();
        toggleBtn.style.right = 'auto';
        toggleBtn.style.bottom = 'auto';
        toggleBtn.style.left = rect.left + 'px';
        toggleBtn.style.top = rect.top + 'px';
      }
    }

    toggleBtn.addEventListener('mousedown', function(e) {
      makeBtnAbsolute();
      btnInitialX = e.clientX;
      btnInitialY = e.clientY;
      const rect = toggleBtn.getBoundingClientRect();
      btnStartLeft = rect.left;
      btnStartTop = rect.top;
      isBtnDragging = true;
      btnDragMoved = false;
      toggleBtn.style.transition = 'none';
    });

    toggleBtn.addEventListener('touchstart', function(e) {
      makeBtnAbsolute();
      btnInitialX = e.touches[0].clientX;
      btnInitialY = e.touches[0].clientY;
      const rect = toggleBtn.getBoundingClientRect();
      btnStartLeft = rect.left;
      btnStartTop = rect.top;
      isBtnDragging = true;
      btnDragMoved = false;
      toggleBtn.style.transition = 'none';
    }, {passive: false});

    document.addEventListener('mousemove', function(e) {
      if (!isBtnDragging) return;
      btnDragMoved = true;
      e.preventDefault();
      const dx = e.clientX - btnInitialX;
      const dy = e.clientY - btnInitialY;
      toggleBtn.style.left = (btnStartLeft + dx) + 'px';
      toggleBtn.style.top = (btnStartTop + dy) + 'px';
    });

    document.addEventListener('touchmove', function(e) {
      if (!isBtnDragging) return;
      btnDragMoved = true;
      e.preventDefault();
      const dx = e.touches[0].clientX - btnInitialX;
      const dy = e.touches[0].clientY - btnInitialY;
      toggleBtn.style.left = (btnStartLeft + dx) + 'px';
      toggleBtn.style.top = (btnStartTop + dy) + 'px';
    }, {passive: false});

    document.addEventListener('mouseup', function() { 
      if (isBtnDragging) {
        toggleBtn.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        setTimeout(function() { isBtnDragging = false; }, 50);
      }
    });
    
    document.addEventListener('touchend', function() { 
      if (isBtnDragging) {
        toggleBtn.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        setTimeout(function() { isBtnDragging = false; }, 50);
      }
    });

    // Ketika diklik, tampilkan / sembunyikan widget asisten utama
    toggleBtn.onclick = function(e) {
      if (btnDragMoved) {
        e.preventDefault();
        e.stopPropagation();
        btnDragMoved = false;
        return;
      }
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
    widget.style.cssText = 'position:fixed;bottom:90px;right:25px;width:360px;max-width:calc(100vw - 32px);max-height:75vh;background:rgba(15, 17, 26, 0.4);border:1.5px solid rgba(255,255,255,0.15);border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.6);z-index:999999;font-family:sans-serif;color:#e2e8f0;display:flex;flex-direction:column;overflow:hidden;transition:opacity 0.3s ease;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);';

    // Widget Header - dengan tombol resize +/-
    const header = document.createElement('div');
    header.style.cssText = 'background:rgba(19, 23, 34, 0.5);padding:10px 14px;border-bottom:1.5px solid rgba(255,255,255,0.1);display:flex;justify-content:space-between;align-items:center;cursor:move;flex-shrink:0;';
    header.innerHTML = '<div style="display:flex;align-items:center;gap:6px;"><span style="color:#6366f1;font-weight:900;font-size:13px;letter-spacing:0.5px;">⚡ SINERGI AUTOFILL</span></div><div style="margin-left:auto;display:flex;align-items:center;gap:6px;"><button id="sinergi-btn-smaller" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#94a3b8;cursor:pointer;font-size:11px;border-radius:4px;padding:2px 6px;line-height:1;" title="Perkecil Widget">−</button><button id="sinergi-btn-larger" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#94a3b8;cursor:pointer;font-size:11px;border-radius:4px;padding:2px 6px;line-height:1;" title="Perbesar Widget">+</button><button id="sinergi-widget-minimize" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#94a3b8;cursor:pointer;font-size:10px;border-radius:4px;padding:2px 5px;line-height:1;" title="Sembunyikan isi">▼</button><button id="sinergi-widget-close" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:18px;line-height:1;transition:color 0.2s;padding:0 2px;" title="Tutup">&times;</button></div>';
    widget.appendChild(header);

    // Widget Body
    const body = document.createElement('div');
    body.style.cssText = 'padding:16px;overflow-y:auto;flex:1;display:flex;flex-direction:column;gap:12px;font-size:12px;min-height:0;';
    body.innerHTML = '<div style="margin-bottom:12px;display:flex;flex-direction:column;gap:8px;"><label style="font-weight:bold;display:block;color:#a5b4fc;font-size:12px;">Unggah File Payload Kinerja:</label><div style="display:flex;flex-direction:column;gap:6px;"><button id="sinergi-btn-upload-trigger" style="width:100%;background:linear-gradient(135deg, #6366f1, #ec4899);color:white;border:none;border-radius:8px;padding:10px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;box-shadow:0 4px 12px rgba(99,102,241,0.2);">📁 Unggah File Payload JSON</button><input type="file" id="sinergi-file-input" accept=".json" style="display:none;" /></div><div id="sinergi-file-name" style="color:#34d399;font-weight:bold;font-size:11px;text-align:center;display:none;background:rgba(52,211,153,0.1);padding:6px;border-radius:6px;border:1px solid rgba(52,211,153,0.15);"></div></div><div id="sinergi-auto-control-section" style="margin-bottom:12px;display:none;flex-direction:column;gap:8px;"><button id="sinergi-btn-start-auto" style="width:100%;background:linear-gradient(135deg, #10b981, #059669);color:white;border:none;border-radius:8px;padding:10px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;box-shadow:0 4px 12px rgba(16,185,129,0.2);">🚀 Jalankan Otomatis</button><button id="sinergi-btn-stop-auto" style="width:100%;background:linear-gradient(135deg, #ef4444, #dc2626);color:white;border:none;border-radius:8px;padding:10px;font-weight:bold;cursor:pointer;display:none;align-items:center;justify-content:center;gap:6px;font-size:12px;box-shadow:0 4px 12px rgba(239,68,68,0.2);">🛑 Hentikan Otomatisasi Batch</button></div><div id="sinergi-report-list-container" style="display:none;border-top:1px dashed rgba(255,255,255,0.1);padding-top:12px;"><div style="font-weight:bold;margin-bottom:8px;color:#a5b4fc;display:flex;justify-content:space-between;align-items:center;"><span>Pilih Laporan Hari Ini:</span><div style="display:flex;gap:6px;align-items:center;"><button id="sinergi-btn-clear-all" style="background:rgba(239,68,68,0.2);color:#ef4444;border:none;border-radius:6px;padding:2px 8px;font-size:10px;cursor:pointer;font-weight:bold;" title="Bersihkan Daftar">Bersihkan</button><span id="sinergi-count" style="background:linear-gradient(135deg, #6366f1, #ec4899);color:white;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:bold;">0</span></div></div><div id="sinergi-report-items" style="display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto;padding-right:4px;"></div></div><div id="sinergi-fill-status" style="padding:10px;border-radius:8px;background:rgba(16,185,129,0.1);color:#34d399;font-weight:bold;display:none;text-align:center;border:1px solid rgba(16,185,129,0.2);">🎉 Laporan berhasil diisi! Periksa & simpan.</div>';
    widget.appendChild(body);
    document.body.appendChild(widget);

    // Inject custom animation styles for widget
    if (!document.getElementById('sinergi-helper-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'sinergi-helper-styles';
      styleEl.textContent = '@keyframes sinergi-pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } } .sinergi-anim-pulse { animation: sinergi-pulse 1.5s infinite ease-in-out; } @media (max-width: 480px) { #sinergi-auto-input-widget { width: calc(100vw - 32px) !important; right: 16px !important; bottom: 16px !important; max-height: 85vh !important; } }';
      document.head.appendChild(styleEl);
    }

    // Style elements hover / focus on target
    const ta = document.getElementById(\'sinergi-data-input\');
    if (ta) {
      ta.onfocus = function() { ta.style.borderColor = '#6366f1'; };
      ta.onblur = function() { ta.style.borderColor = 'rgba(255,255,255,0.1)'; };
    }

    // Close button click
    document.getElementById('sinergi-widget-close').onclick = function() {
      widget.style.display = 'none';
    };

    // Step-based resize buttons (+/-)  — reliable on all browsers & mobile
    let currentWidgetW = 360;
    let currentWidgetH = 0; // 0 = height auto (max-height driven)
    const STEP = 60;
    const smallerBtn = document.getElementById('sinergi-btn-smaller');
    const largerBtn = document.getElementById('sinergi-btn-larger');
    function applyWidgetSize() {
      widget.style.width = Math.max(280, Math.min(currentWidgetW, window.innerWidth - 20)) + 'px';
      if (currentWidgetH > 0) {
        widget.style.height = Math.max(200, Math.min(currentWidgetH, window.innerHeight - 20)) + 'px';
        widget.style.maxHeight = 'none';
      } else {
        widget.style.height = '';
        widget.style.maxHeight = '75vh';
      }
    }
    if (smallerBtn) smallerBtn.onclick = function(e) {
      e.stopPropagation();
      if (currentWidgetH === 0) currentWidgetH = widget.offsetHeight;
      currentWidgetW -= STEP;
      currentWidgetH -= STEP;
      applyWidgetSize();
    };
    if (largerBtn) largerBtn.onclick = function(e) {
      e.stopPropagation();
      if (currentWidgetH === 0) currentWidgetH = widget.offsetHeight;
      currentWidgetW += STEP;
      currentWidgetH += STEP;
      applyWidgetSize();
    };

    // Make Widget Draggable
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;
    let lastLoadedPayload = '';

    function makeAbsolute() {
      if (widget.style.right !== 'auto' || widget.style.bottom !== 'auto') {
        const rect = widget.getBoundingClientRect();
        widget.style.right = 'auto';
        widget.style.bottom = 'auto';
        widget.style.left = rect.left + 'px';
        widget.style.top = rect.top + 'px';
        widget.style.transform = 'none';
        xOffset = 0; yOffset = 0; currentX = 0; currentY = 0;
      }
    }

    header.addEventListener('mousedown', function(e) {
      if (e.target.tagName === 'BUTTON') return;
      makeAbsolute();
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      isDragging = true;
      widget.style.transition = 'none';
    });
    header.addEventListener('touchstart', function(e) {
      if (e.target.tagName === 'BUTTON') return;
      makeAbsolute();
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
      isDragging = true;
      widget.style.transition = 'none';
    }, {passive: false});

    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      xOffset = currentX; yOffset = currentY;
      widget.style.transform = 'translate(' + currentX + 'px,' + currentY + 'px)';
    });
    document.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      e.preventDefault();
      currentX = e.touches[0].clientX - initialX;
      currentY = e.touches[0].clientY - initialY;
      xOffset = currentX; yOffset = currentY;
      widget.style.transform = 'translate(' + currentX + 'px,' + currentY + 'px)';
    }, {passive: false});
    document.addEventListener('mouseup', function() { isDragging = false; });
    document.addEventListener('touchend', function() { isDragging = false; });

    // Minimize & Maximize Logic
    const minimizeBtn = document.getElementById('sinergi-widget-minimize');
    const maximizeBtn = document.getElementById('sinergi-widget-maximize');
    let isMinimized = false;
    let isMaximized = false;
    let preMaxWidth = widget.style.maxWidth;
    let preMaxHeight = widget.style.maxHeight;

    if (minimizeBtn) {
      minimizeBtn.onclick = function(e) {
        e.stopPropagation();
        isMinimized = !isMinimized;
        if (isMinimized) {
          body.style.display = 'none';
          widget.style.height = 'auto';
          widget.style.resize = 'none';
        } else {
          body.style.display = 'flex';
          widget.style.height = isMaximized ? '100vh' : 'auto';
          widget.style.resize = 'both';
        }
      };
    }

    if (maximizeBtn) {
      maximizeBtn.onclick = function(e) {
        e.stopPropagation();
        isMaximized = !isMaximized;
        if (isMaximized) {
          widget.style.width = '100vw';
          widget.style.height = '100vh';
          widget.style.maxWidth = '100vw';
          widget.style.maxHeight = '100vh';
          widget.style.bottom = '0';
          widget.style.right = '0';
          widget.style.borderRadius = '0';
          widget.style.transform = 'translate(0px, 0px)';
          xOffset = 0; yOffset = 0;
          if (isMinimized) {
            isMinimized = false;
            body.style.display = 'flex';
          }
        } else {
          widget.style.width = '360px';
          widget.style.height = 'auto';
          widget.style.maxWidth = 'calc(100vw - 32px)';
          widget.style.maxHeight = '75vh';
          widget.style.bottom = '90px';
          widget.style.right = '25px';
          widget.style.borderRadius = '16px';
        }
      };
    }

    // Upload Logic & Event
    const fileInput = document.getElementById('sinergi-file-input');
    const uploadTrigger = document.getElementById('sinergi-btn-upload-trigger');
    const fileNameDisplay = document.getElementById('sinergi-file-name');

    const loadBtn = document.getElementById('sinergi-btn-load');
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
          const ta = document.getElementById('sinergi-data-input');
          if (ta) ta.value = content;
          localStorage.removeItem('sinergi_auto_results');
          processPayload(content);
        };
        reader.readAsText(file);
      };
    }

    // Load Reports Event
    if (loadBtn && txtArea) {
      loadBtn.onclick = function() {
        const rawVal = txtArea.value.trim();
        if (!rawVal) {
          alert('Silakan tempel data kinerja terlebih dahulu!');
          return;
        }
        localStorage.removeItem('sinergi_auto_results');
        processPayload(rawVal);
      };
    }

    // Start / Stop Auto Automation
    const controlSection = document.getElementById('sinergi-auto-control-section');
    const startAutoBtn = document.getElementById('sinergi-btn-start-auto');
    const stopAutoBtn = document.getElementById('sinergi-btn-stop-auto');

    if (startAutoBtn && stopAutoBtn) {
      startAutoBtn.onclick = function() {
        const rawVal = localStorage.getItem('sinergi_auto_reports_draft') || (txtArea ? txtArea.value.trim() : '');
        if (!rawVal || rawVal === '[]') {
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
        
        try {
          localStorage.setItem('sinergi_auto_reports', JSON.stringify(reports));
          localStorage.setItem('sinergi_auto_index', '0');
          localStorage.setItem('sinergi_auto_active', 'true');
          
          // Initialize results tracking array
          const initialResults = new Array(reports.length).fill('null');
          localStorage.setItem('sinergi_auto_results', JSON.stringify(initialResults));
        } catch (e) {
          alert('Memori penyimpanan browser penuh (QuotaExceededError). Gagal menyimpan ' + reports.length + ' laporan.\\n\\nSolusi: Jika Anda melampirkan gambar/file Bukti Dukung yang besar, ukuran payload JSON akan membengkak. Cobalah membagi laporan menjadi jumlah yang lebih sedikit (misal: per 3 hari).');
          return;
        }
        
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

    const clearAllBtn = document.getElementById('sinergi-btn-clear-all');
    if (clearAllBtn) {
      clearAllBtn.onclick = function() {
        if (confirm('Yakin ingin membersihkan semua daftar laporan?')) {
          localStorage.removeItem('sinergi_auto_reports_draft');
          if (localStorage.getItem('sinergi_auto_active') === 'true') {
             localStorage.removeItem('sinergi_auto_reports');
          }
          localStorage.removeItem('sinergi_auto_results');
          const ta = document.getElementById('sinergi-data-input');
          if (ta) ta.value = '';
          const nameDisp = document.getElementById('sinergi-file-name');
          if (nameDisp) nameDisp.style.display = 'none';
          processPayload('[]');
        }
      };
    }

    function processPayload(rawVal) {
      const listContainer = document.getElementById('sinergi-report-list-container');
      const itemsContainer = document.getElementById('sinergi-report-items');
      const countBadge = document.getElementById('sinergi-count');
      const controlSection = document.getElementById('sinergi-auto-control-section');
      const startAutoBtn = document.getElementById('sinergi-btn-start-auto');
      const stopAutoBtn = document.getElementById('sinergi-btn-stop-auto');

      rawVal = (rawVal || '').trim();
      let reports = [];
      try {
        if (rawVal.startsWith('[')) {
          const parsed = JSON.parse(rawVal);
          reports = Array.isArray(parsed) ? parsed : [parsed];
          try {
            localStorage.setItem('sinergi_auto_reports_draft', JSON.stringify(reports));
          } catch(e) {
            alert('Penyimpanan lokal penuh! JSON ini terlalu besar karena mengandung gambar/dokumen Base64 yang banyak. Mohon kurangi jumlah daftar laporannya.');
            return;
          }
        } else if (rawVal.startsWith('{')) {
          const parsed = JSON.parse(rawVal);
          reports = Array.isArray(parsed) ? parsed : [parsed];
          try {
            localStorage.setItem('sinergi_auto_reports_draft', JSON.stringify(reports));
          } catch(e) {}
        } else {
          alert('Format data tidak valid! Harus berupa JSON valid.');
          return;
        }
      } catch(err) {
        alert('Gagal membaca data! Pastikan data/file terformat dengan benar (JSON).');
        return;
      }

      if (reports.length === 0) {
        itemsContainer.innerHTML = '';
        if (controlSection) controlSection.style.display = 'none';
        listContainer.style.display = 'none';
        countBadge.textContent = '0';
        return;
      }

      // Populate List
      itemsContainer.innerHTML = '';
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
          const options = { day: 'numeric', month: 'short', year: 'numeric' };
          dateFormatted = d.toLocaleDateString('id-ID', options);
        } catch(e) {}

        const autoActive = localStorage.getItem('sinergi_auto_active') === 'true';
        const autoIndex = parseInt(localStorage.getItem('sinergi_auto_index') || '0', 10);
        
        let statusBadge = '';
        let results = [];
        try {
          results = JSON.parse(localStorage.getItem('sinergi_auto_results') || '[]');
        } catch(e) {}
        
        const status = results[index] || 'null';
        const manualActiveIndex = parseInt(localStorage.getItem('sinergi_manual_active_index') || '-1', 10);
        
        if (status === 'success') {
          statusBadge = '<span style="color:#10b981;font-size:10px;font-weight:bold;margin-left:auto;">✅ Berhasil</span>';
        } else if (status === 'error') {
          statusBadge = '<span style="color:#ef4444;font-size:10px;font-weight:bold;margin-left:auto;">❌ Gagal</span>';
        } else if (index === manualActiveIndex) {
          statusBadge = '<span class="sinergi-anim-pulse" style="color:#f59e0b;font-size:10px;font-weight:bold;margin-left:auto;">⏳ Proses</span>';
        } else if (autoActive) {
          if (index === autoIndex) {
            statusBadge = '<span class="sinergi-anim-pulse" style="color:#f59e0b;font-size:10px;font-weight:bold;margin-left:auto;">⏳ Proses</span>';
          } else if (index < autoIndex) {
             statusBadge = '<span style="color:#10b981;font-size:10px;font-weight:bold;margin-left:auto;">✅ Selesai</span>';
          } else {
            statusBadge = '<span style="color:#64748b;font-size:10px;font-weight:bold;margin-left:auto;">Antrean</span>';
          }
        }

        item.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;font-weight:bold;"><span style="color:#a5b4fc;">' + dateFormatted + '</span><div style="display:flex;align-items:center;gap:6px;">' + statusBadge + '<span style="color:#94a3b8;font-size:10px;background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:6px;">' + report.waktuMulai + ' - ' + report.waktuSelesai + '</span><button class="sinergi-btn-delete-item" data-index="' + index + '" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:bold;padding:0 4px;font-size:12px;display:flex;align-items:center;" title="Hapus Laporan">✕</button></div></div><div style="font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:white;margin-top:2px;"><span style="color:#fbbf24;margin-right:6px;">' + (index + 1) + '.</span>' + report.uraianTugas + '</div><div style="color:#94a3b8;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + report.deskripsiPekerjaan + '</div>';

        item.onclick = function(e) {
          const deleteBtn = e.target.closest('.sinergi-btn-delete-item');
          if (deleteBtn) {
            const idx = parseInt(deleteBtn.getAttribute('data-index'), 10);
            reports.splice(idx, 1);
            const strReports = JSON.stringify(reports);
            localStorage.setItem('sinergi_auto_reports_draft', strReports);
            if (localStorage.getItem('sinergi_auto_active') === 'true') {
              localStorage.setItem('sinergi_auto_reports', strReports);
            }
            processPayload(strReports);
            return;
          }

          fillForm(report);
          
          localStorage.setItem('sinergi_manual_active_index', index.toString());
          processPayload(localStorage.getItem('sinergi_auto_reports_draft'));
          
          const markManualResult = function(status) {
            let res = [];
            try { res = JSON.parse(localStorage.getItem('sinergi_auto_results') || '[]'); } catch(e) {}
            while(res.length <= index) res.push('null');
            res[index] = status;
            localStorage.setItem('sinergi_auto_results', JSON.stringify(res));
            localStorage.setItem('sinergi_manual_active_index', '-1');
            
            const statusBanner = document.getElementById('sinergi-fill-status');
            if (statusBanner) {
              statusBanner.style.display = 'block';
              if (status === 'success') {
                statusBanner.textContent = '🎉 Laporan manual berhasil dikirim!';
                statusBanner.style.color = '#34d399';
                statusBanner.style.background = 'rgba(16,185,129,0.1)';
                statusBanner.style.borderColor = 'rgba(16,185,129,0.2)';
              } else {
                statusBanner.textContent = '❌ Laporan manual gagal diproses!';
                statusBanner.style.color = '#ef4444';
                statusBanner.style.background = 'rgba(239,68,68,0.1)';
                statusBanner.style.borderColor = 'rgba(239,68,68,0.2)';
              }
              setTimeout(function() { statusBanner.style.display = 'none'; }, 5000);
            }
            processPayload(localStorage.getItem('sinergi_auto_reports_draft'));
          };

          // Tunggu uraian tugas terpilih dulu, baru submit
          let submitAttempts = 0;
          const submitPoller = setInterval(function() {
            submitAttempts++;
            // Cek apakah ada radio button yang sudah terpilih (uraian tugas dipilih)
            const selectedRadio = document.querySelector('input[type="radio"]:checked:not(#sinergi-auto-input-widget input)');
            const maxWait = submitAttempts >= 28; // max 14 detik (28 x 500ms)
            if (selectedRadio || maxWait) {
              clearInterval(submitPoller);
              if (selectedRadio) {
                console.log('\\u26a1 Uraian tugas terpilih, submit dalam 1.5 detik...');
                setTimeout(function() { 
                  clickSubmitButton(); 
                  markManualResult('success');
                }, 1500);
              } else {
                console.log('\\u26a1 Timeout tunggu uraian tugas, gagal proses...');
                markManualResult('error');
              }
            }
          }, 500);
        };

        itemsContainer.appendChild(item);
      });

      countBadge.textContent = reports.length;
      listContainer.style.display = \'block\';

      // Show auto control buttons
      if (controlSection) {
        controlSection.style.display = \'flex\';
        const autoActive = localStorage.getItem(\'sinergi_auto_active\') === \'true\';
        if (autoActive) {
          startAutoBtn.style.display = \'none\';
          stopAutoBtn.style.display = \'flex\';
        } else {
          startAutoBtn.style.display = \'flex\';
          stopAutoBtn.style.display = \'none\';
        }
      }
    }
    
    window.sinergiProcessPayload = processPayload;

    function fillForm(report) {
      try {
        function getDurationMinutes(mulai, selesai) {
          if (!mulai || !selesai) return null;
          try {
            const parseTime = (t) => {
              const parts = String(t).replace('.', ':').split(':');
              if (parts.length >= 2) return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
              return 0;
            };
            const start = parseTime(mulai);
            const end = parseTime(selesai);
            if (end > start) return end - start;
          } catch(e) {}
          return null;
        }
        const calcMins = getDurationMinutes(report.waktuMulai, report.waktuSelesai);
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
        const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
        document.dispatchEvent(escEvent);
        document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }

      // 2. Fill Start & End Times - SINERGI V2 specific: button#wkt1 / button#wkt2 + hidden input
      function fillSinergiTimePicker(inputId, timeValue, keywords = []) {
        const timeWithColon = timeValue.includes('.') ? timeValue.replace('.', ':') : timeValue;
        const [targetJam, targetMenit] = timeWithColon.split(':');
        
        let el = document.getElementById(inputId);
        if (!el) {
          el = document.querySelector('input[name="' + inputId + '"], input[id*="' + inputId + '"]') || 
               findFormInputElement([inputId, ...keywords], 'input') ||
               findFormInputElement([inputId, ...keywords], 'button');
        }
        
        if (!el) {
          console.log('\u26a1 Element not found for', inputId);
          return;
        }

        if (el.tagName === 'INPUT') {
          setElementValue(el, timeWithColon);
          console.log('\u26a1 Set value for native input', inputId, timeWithColon);
          return;
        }
        
        const btn = el;
        
        function getOpenPopup() {
          const container = btn.parentElement;
          let popup = container ? container.querySelector('div.absolute') : null;
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

        function findMatchInList(btns, target) {
          let m = btns.find(b => (b.textContent || '').trim() === target);
          if (!m) m = btns.find(b => parseInt((b.textContent || '').trim(), 10) === parseInt(target, 10));
          return m;
        }
        
        // 1. Open the popup by clicking the main button
        triggerClickEvents(btn);
        
        // 2. Wait for popup to render, then click JAM
        setTimeout(() => {
          const popup = getOpenPopup();
          if (!popup) { console.log('\u26a1 Popup not found for', inputId); return; }

          const columns = popup.querySelectorAll('div.flex-col, .overflow-y-auto');
          let jamBtns = [];
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
              console.log('\u26a1 Klik JAM ' + targetJam + ' untuk ' + inputId);
              
              // 3. After clicking JAM, re-query popup (it may re-render) and click MENIT
              setTimeout(() => {
                const popup2 = getOpenPopup();
                if (!popup2) { console.log('\u26a1 Popup hilang setelah klik JAM untuk', inputId); return; }

                // Diagnostic confirmed: popup has 4 columns [flex-col(24), overflow-y-auto(24), flex-col(60), overflow-y-auto(60)]
                // Button '30' IS in the DOM. We just need the right column and correct scrollTop.
                
                // Find the overflow-y-auto column with most buttons = menit column (60 items)
                const overflowCols = Array.from(popup2.querySelectorAll('.overflow-y-auto'));
                overflowCols.sort((a, b) => b.querySelectorAll('button').length - a.querySelectorAll('button').length);
                const menitColEl = overflowCols[0] || popup2;
                
                console.log('\u26a1 Menit col found: ' + menitColEl.querySelectorAll('button').length + ' buttons, scrollHeight=' + menitColEl.scrollHeight);

                const allMenitBtns = Array.from(menitColEl.querySelectorAll('button'));
                const menitMatch = allMenitBtns.find(b => {
                  const txt = (b.textContent || '').trim();
                  return txt === targetMenit || parseInt(txt, 10) === parseInt(targetMenit, 10);
                });

                if (menitMatch) {
                  // Use offsetTop for precise positioning (scrollIntoView may fail if parent has overflow:hidden)
                  const btnOffsetTop = menitMatch.offsetTop;
                  const scrollTarget = Math.max(0, btnOffsetTop - (menitColEl.clientHeight / 2));
                  menitColEl.scrollTop = scrollTarget;
                  console.log('\u26a1 Scroll menit ke offsetTop=' + btnOffsetTop + ' scrollTarget=' + scrollTarget);
                  
                  setTimeout(() => {
                    triggerClickEvents(menitMatch);
                    console.log('\u26a1 Klik MENIT ' + targetMenit + ' untuk ' + inputId);
                    setTimeout(() => forceCloseAllPopups(), 400);
                  }, 300);
                } else {
                  console.log('\u26a1 Menit ' + targetMenit + ' tidak ditemukan, total menit btns: ' + allMenitBtns.length);
                  setTimeout(() => forceCloseAllPopups(), 400);
                }
              }, 500); // wait 500ms for popup to re-render after JAM click
            }, 150);
          } else {
            console.log('\u26a1 Jam ' + targetJam + ' tidak ditemukan untuk', inputId);
          }
        }, 700);
      }

        // Add delay before opening time pickers to prevent text-input re-renders from destroying the popup
        // wkt1 starts at 1000ms, finishes ~2800ms total. wkt2 starts at 4000ms (safe margin).
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
          const isHelperWidget = (el) => !!el.closest('#sinergi-auto-input-widget');
          
          // Method 1: The radio container has a previousElementSibling with the trigger button
          const radioContainer = document.querySelector('.form-control.w-full.overflow-hidden');
          if (radioContainer && !isHelperWidget(radioContainer)) {
            // Only click trigger if accordion is still collapsed (clientHeight == 0)
            const isOpen = radioContainer.clientHeight > 0;
            const triggerSection = radioContainer.previousElementSibling;
            if (triggerSection) {
              const triggerBtn = triggerSection.querySelector('button[type="button"]');
              if (triggerBtn && !isHelperWidget(triggerBtn)) {
                if (!isOpen) {
                  console.log('\u26a1 Mengklik trigger Uraian Tugas (buka accordion):', (triggerBtn.textContent || '').substring(0, 40));
                  triggerBtn.click();
                  triggerBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                } else {
                  console.log('\u26a1 Accordion Uraian Tugas sudah terbuka.');
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
              const section = lbl.closest('.form-control') || lbl.closest('div');
              if (section) {
                const btn = section.querySelector('button[type="button"]');
                if (btn && !isHelperWidget(btn)) {
                  btn.click();
                  btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                  console.log('\u26a1 Trigger Uraian Tugas diklik via label text');
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
          const isHelperWidget = (el) => !!el.closest('#sinergi-auto-input-widget');
          const targetText = (report.uraianTugas || '').toLowerCase().trim();
          const detailText = (report.detailItemPekerjaan || '').toLowerCase().trim();

          // Only try to fill if accordion is open
          if (!isAccordionOpen()) {
            console.log('\\u26a1 Accordion belum terbuka, coba buka dulu...');
            clickUraianTrigger();
            return false;
          }

          const radios = Array.from(document.querySelectorAll('input[type="radio"]')).filter(r => !isHelperWidget(r));
          const cleanTarget = targetText.replace(/\\s+/g, ' ');
          const cleanDetail = detailText.replace(/\\s+/g, ' ');

          // Helper: extract minutes from label full text (catches numbers in nested spans)
          function extractMinsFromLabelText(text) {
            const t = (text || '').toLowerCase();
            let m = t.match(/(?:norma|waktu|menit)\\s*[:\\-]?\\s*(\\d+)/) || t.match(/(\\d+)\\s*menit/) || t.match(/(\\d+)\\s*min/);
            if (m) return parseInt(m[1], 10);
            // Look for isolated numbers that are valid minute values
            const validMins = [5,10,15,20,25,30,45,60,90,120];
            const nums = t.match(/\\b(\\d+)\\b/g);
            if (nums) {
              for (const n of nums) {
                const v = parseInt(n, 10);
                if (validMins.includes(v)) return v;
              }
            }
            return null;
          }

          const matchingRadios = [];

          for (const radio of radios) {
            const labelCard = radio.closest('label');
            const labelText = (labelCard ? labelCard.textContent : (radio.parentElement ? radio.parentElement.textContent : '')) || '';
            const lt = labelText.toLowerCase().replace(/\\s+/g, ' ').trim();
            
            let score = 0;

            const exactMain = cleanTarget.length > 5 && (lt.includes(cleanTarget) || cleanTarget.includes(lt));
            const exactDetail = cleanDetail.length > 5 && (lt.includes(cleanDetail) || cleanDetail.includes(lt));
            
            if (exactMain) score += 100;
            else if (cleanTarget.length > 5 && lt.includes(cleanTarget.substring(0, Math.min(cleanTarget.length, 25)))) score += 10;
            
            if (exactDetail) score += 100;
            else if (cleanDetail.length > 5 && lt.includes(cleanDetail.substring(0, Math.min(cleanDetail.length, 25)))) score += 10;
            
            if (score > 0) {
              const ltMins = extractMinsFromLabelText(lt);

              if (calcMins !== null && ltMins !== null) {
                if (Math.abs(calcMins - ltMins) <= 5) {
                  score += 200; // Very strong bonus for exact minute match
                  console.log('\\u26a1 Menit cocok: label=' + ltMins + ' target=' + calcMins);
                } else {
                  score -= 200; // Very strong penalty prevents wrong selection
                  console.log('\\u26a1 Menit TIDAK cocok: label=' + ltMins + ' target=' + calcMins);
                }
              }
              matchingRadios.push({ radio, labelCard, lt, score, value: parseInt(radio.value || '0', 10), ltMins });
            }
          }

          if (matchingRadios.length === 0) return false;

          // Sort by score; if tied, use radio value as tie-breaker:
          // Higher value = more minutes (confirmed: 4466=60min > 4465=45min)
          matchingRadios.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (calcMins !== null) {
              return calcMins >= 30 ? b.value - a.value : a.value - b.value;
            }
            return b.value - a.value;
          });

          const best = matchingRadios[0];
          console.log('\\u26a1 Kandidat terpilih (score=' + best.score + ', value=' + best.value + ', ltMins=' + best.ltMins + ', calcMins=' + calcMins + '):', best.lt.substring(0, 80));

          if (best && best.score > 0) {
            if (best.labelCard) {
              best.labelCard.click();
              best.labelCard.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            }
            best.radio.click();
            best.radio.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            best.radio.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('\\u26a1 Dipilih radio uraian tugas (score: ' + best.score + '):', best.lt.substring(0, 60));
            return true;
          }
          return false;
        }

        // Step 1: Open the Uraian Tugas accordion AFTER time pickers are done (wkt2 finishes ~6500ms)
        // Guard: only run until success to prevent flip-flop
        let uraianFilled = false;
        function tryFillUraian() {
          if (uraianFilled) return;
          const result = fillUraianTugasRadio();
          if (result) {
            uraianFilled = true;
            console.log('\\u26a1 Uraian tugas berhasil diisi, tidak akan diulang lagi.');
          }
        }
        setTimeout(() => {
          clickUraianTrigger();
          setTimeout(tryFillUraian, 500);
          setTimeout(tryFillUraian, 1200);
          setTimeout(tryFillUraian, 2500);
          setTimeout(tryFillUraian, 4000);
        }, 7000);

        // 3b. Native <select> dropdown fallback
        const selectElements = Array.from(document.querySelectorAll('select[name*="tugas" i], select[id*="tugas" i], select[name*="uraian" i], select'));
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

        // Trigger custom dropdown AFTER time pickers done
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
          console.log('\\u26a1 Mencari detail item pekerjaan: ' + targetText);

          const isHelperWidget = (el) => !!el.closest('#sinergi-auto-input-widget');
          const elements = Array.from(document.querySelectorAll('div, label, span, p, button, input[type="radio"]')).filter(el => !isHelperWidget(el));
          
          let bestEl = null;
          let bestScore = 0;
          let bestLabelText = "";

          // 1st Pass: Radio buttons
          for (const el of elements) {
            if (el.tagName === 'INPUT' && el.type === 'radio') {
              const id = el.id;
              let labelText = '';
              if (id) {
                const labelEl = document.querySelector('label[for="' + id + '"]');
                if (labelEl) labelText = labelEl.textContent || '';
              }
              const labelCard = el.closest('label');
              if (!labelText && labelCard) labelText = labelCard.textContent || '';
              if (!labelText && el.parentElement) labelText = el.parentElement.textContent || '';
              
              if (labelText) {
                const lt = labelText.toLowerCase().replace(/\\s+/g, ' ').trim();
                const cleanTarget = targetText.replace(/\\s+/g, ' ');
                
                let score = 0;
                if (cleanTarget.length > 5 && (lt.includes(cleanTarget) || cleanTarget.includes(lt))) score += 100;
                else if (cleanTarget.length > 5 && lt.includes(cleanTarget.substring(0, Math.min(cleanTarget.length, 25)))) score += 10;
                
                if (score > 0) {
                  let targetMins = null;
                  let combinedTarget = cleanTarget + " " + (report.uraianTugas || "").toLowerCase();
                  let targetMatch = combinedTarget.match(/(?:norma|waktu|menit)\s*[:\-]?\s*(\d+)/) || combinedTarget.match(/(\d+)\s*menit/);
                  if (targetMatch) {
                    targetMins = parseInt(targetMatch[1], 10);
                  } else if (calcMins) {
                    targetMins = calcMins;
                  }
                  
                  let ltMins = null;
                  let ltMatch = lt.match(/(?:norma|waktu|menit)\s*[:\-]?\s*(\d+)/) || lt.match(/(\d+)\s*menit/);
                  if (ltMatch) ltMins = parseInt(ltMatch[1], 10);

                  if (targetMins !== null && ltMins !== null) {
                    if (Math.abs(targetMins - ltMins) <= 5) score += 50;
                    else score -= 50;
                  } else if (targetMins !== null && ltMins === null) {
                    score -= 5;
                  }
                }
                
                // Tie breaker: if scores are equal, prefer the one with a higher absolute match length or one that is already checked
                if (score > bestScore || (score === bestScore && score > 0 && el.checked)) {
                  bestScore = score;
                  bestEl = el;
                  bestLabelText = lt;
                }
              }
            }
          }

          if (bestEl && bestScore > 0) {
            triggerClickEvents(bestEl);
            console.log('\\u26a1 Mengklik radio button sub-item (score: ' + bestScore + '):', bestLabelText.substring(0, 60));
            const labelCard = bestEl.closest('label');
            if (labelCard) triggerClickEvents(labelCard);
            else if (bestEl.parentElement) triggerClickEvents(bestEl.parentElement);
            return true;
          }

          // 2nd Pass: Clickable cards or divs
          bestEl = null;
          bestScore = 0;
          bestLabelText = "";

          const candidates = elements.filter(el => {
            const tag = el.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'INPUT') return false;
            const elText = (el.textContent || '').toLowerCase().replace(/\\s+/g, ' ').trim();
            if (!elText || elText.length > 150) return false;
            return true;
          });

          for (const el of candidates) {
             const elText = (el.textContent || '').toLowerCase().replace(/\\s+/g, ' ').trim();
             const cleanTarget = targetText.replace(/\\s+/g, ' ');
             
             let score = 0;
             if (cleanTarget.length > 5 && (elText.includes(cleanTarget) || cleanTarget.includes(elText))) score += 100;
             else if (cleanTarget.length > 5 && elText.includes(cleanTarget.substring(0, Math.min(cleanTarget.length, 25)))) score += 10;
             
             if (score > 0) {
                let targetMins = null;
                let combinedTarget = cleanTarget + " " + (report.uraianTugas || "").toLowerCase();
                let targetMatch = combinedTarget.match(/(?:norma|waktu|menit)\s*[:\-]?\s*(\d+)/) || combinedTarget.match(/(\d+)\s*menit/);
                if (targetMatch) {
                  targetMins = parseInt(targetMatch[1], 10);
                } else if (calcMins) {
                  targetMins = calcMins;
                }
                
                let ltMins = null;
                let ltMatch = elText.match(/(?:norma|waktu|menit)\s*[:\-]?\s*(\\d+)/) || elText.match(/(\\d+)\\s*menit/);
                if (ltMatch) ltMins = parseInt(ltMatch[1], 10);

                if (targetMins !== null && ltMins !== null) {
                  if (Math.abs(targetMins - ltMins) <= 5) score += 50;
                  else score -= 50;
                }
             }
             
             if (score > bestScore) {
               bestScore = score;
               bestEl = el;
               bestLabelText = elText;
             }
          }

          if (bestEl && bestScore > 0) {
            console.log('\\u26a1 Mengklik sub-item kandidat terbaik (score: ' + bestScore + '):', bestLabelText.substring(0, 60));
            triggerClickEvents(bestEl);
            const container = bestEl.closest('button, [role="button"], [role="radio"], [role="checkbox"], label, li, .card');
            if (container && container !== bestEl) {
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
          // Guard: only run detail item until success, AFTER uraian tugas is done
          let detailFilled = false;
          function tryFillDetail() {
            // Skip if uraian not yet settled, or already done
            if (detailFilled) return;
            const result = fillDetailItem();
            if (result) {
              detailFilled = true;
              console.log('\\u26a1 Detail item berhasil diisi, tidak akan diulang lagi.');
            }
          }
          setTimeout(tryFillDetail, 12000);
          setTimeout(tryFillDetail, 14000);
        }

        // Handle custom select2 dropdown if Sinergi V2 uses it
        if (!selectedDropdown) {
          const select2Container = document.querySelector('.select2-container');
          if (select2Container) {
            console.log('Select2 container found. Matching option text: ' + report.uraianTugas);
          }
        }

        // 4. Wait for Uraian Tugas to be selected before filling Deskripsi, Hasil, and Bukti Dukung
        // Ini memastikan urutan input berurutan persis seperti aslinya
        let finishAttempts = 0;
        const finishPoller = setInterval(function() {
          finishAttempts++;
          const selectedRadio = document.querySelector('input[type="radio"]:checked:not(#sinergi-auto-input-widget input)');
          const maxWait = finishAttempts >= 28; // max 14 detik
          
          if (selectedRadio || maxWait) {
            clearInterval(finishPoller);
            
            // Beri jeda 500ms agar DOM stabil setelah radio terpilih
            setTimeout(function() {
              // 4a. Fill Deskripsi Pekerjaan & Hasil Pekerjaan
              const keteranganEl = document.querySelector('textarea[name="keterangan"]');
              const hasilEl = document.querySelector('textarea[name="hasil"]');
              
              if (keteranganEl) {
                setElementValue(keteranganEl, report.deskripsiPekerjaan);
                console.log('⚡ Mengisi keterangan (SINERGI V2):', report.deskripsiPekerjaan ? report.deskripsiPekerjaan.substring(0,30) : '');
              }
              if (hasilEl) {
                setElementValue(hasilEl, report.hasilPekerjaan);
                console.log('⚡ Mengisi hasil (SINERGI V2):', report.hasilPekerjaan ? report.hasilPekerjaan.substring(0,30) : '');
              }

              if (!keteranganEl || !hasilEl) {
                let descInput = findFormInputElement(['deskripsi', 'uraian kegiatan', 'pekerjaan', 'detail kegiatan', 'narasi'], 'textarea');
                let hasilInput = findFormInputElement(['hasil', 'output', 'bukti fisik'], 'textarea');
                
                if (descInput && descInput !== hasilInput) setElementValue(descInput, report.deskripsiPekerjaan);
                if (hasilInput && descInput !== hasilInput) setElementValue(hasilInput, report.hasilPekerjaan);

                if (!descInput || !hasilInput || descInput === hasilInput) {
                  const textareas = Array.from(document.querySelectorAll('textarea'));
                  if (textareas.length >= 2) {
                    setElementValue(textareas[0], report.deskripsiPekerjaan);
                    setElementValue(textareas[1], report.hasilPekerjaan);
                  }
                }
              }

              // 5. Auto-upload Bukti Dukung
              if (report.buktiDukungBase64 && report.buktiDukungName) {
                try {
                  const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')).filter(input => !input.closest('#sinergi-auto-input-widget'));
                  if (fileInputs.length > 0) {
                    const base64Str = report.buktiDukungBase64;
                    const filename = report.buktiDukungName;
                    
                    let mime = 'application/octet-stream';
                    if (filename.endsWith('.pdf')) mime = 'application/pdf';
                    else if (filename.endsWith('.png')) mime = 'image/png';
                    else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) mime = 'image/jpeg';
                    
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
                    while (n--) u8arr[n] = bstr.charCodeAt(n);
                    
                    const file = new File([u8arr], filename, { type: mime });
                    
                    fileInputs.forEach(fileInput => {
                      try {
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        fileInput.files = dataTransfer.files;
                        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                      } catch (err) {}
                    });
                    console.log('⚡ Bukti dukung "' + filename + '" otomatis diunggah!');
                  }
                } catch(fileErr) {}
              }

              // Tampilkan Banner Sukses (selesai pengisian, tinggal tunggu poller submit)
              const statusBanner = document.getElementById('sinergi-fill-status');
              if (statusBanner) {
                statusBanner.style.display = 'block';
                setTimeout(() => statusBanner.style.display = 'none', 5000);
              }
            }, 500);
          }
        }, 500);

      } catch (e) {
        alert('Gagal mengisi form otomatis: ' + e.message);
      }
    }
  }

  function clickSubmitButton() {
    const isHelperWidget = (el) => !!el.closest('#sinergi-auto-input-widget');
    
    // 1. Look for button with type="submit"
    const submitBtn = Array.from(document.querySelectorAll('button[type="submit"]')).find(btn => !isHelperWidget(btn));
    if (submitBtn) {
      console.log('🤖 Otomatisasi: Mengklik button[type="submit"]...');
      submitBtn.click();
      return true;
    }
    
    // 2. Look for button containing text "simpan" or "kirim"
    const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]')).filter(el => !isHelperWidget(el));
    for (const btn of buttons) {
      const txt = (btn.textContent || btn.value || '').toLowerCase().trim();
      if (txt === 'simpan' || txt === 'kirim' || txt === 'save' || txt === 'submit' || txt.includes('simpan laporan') || txt.includes('kirim laporan')) {
        console.log('🤖 Otomatisasi: Mengklik tombol simpan via teks:', txt);
        btn.click();
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
      
      let successes = 0;
      let errors = 0;
      try {
        const results = JSON.parse(localStorage.getItem('sinergi_auto_results') || '[]');
        successes = results.filter(r => r === 'success').length;
        errors = results.filter(r => r === 'error').length;
      } catch(e) {}

      const statusBanner = document.getElementById('sinergi-fill-status');
      if (statusBanner) {
        statusBanner.innerHTML = '🎉 Semua laporan (' + reports.length + ' item) selesai! <br> ✅ Berhasil: ' + successes + ' &nbsp; ❌ Gagal: ' + errors;
        statusBanner.style.display = 'block';
        statusBanner.style.background = 'rgba(16,185,129,0.1)';
        statusBanner.style.color = '#34d399';
        statusBanner.style.border = '1px solid rgba(16,185,129,0.2)';
      }
      alert('🎉 Otomatisasi Selesai!\\nBerhasil: ' + successes + '\\nGagal: ' + errors);
      
      // Re-draw list to clear status badges
      if (typeof window.sinergiProcessPayload === 'function') {
        window.sinergiProcessPayload(rawReports);
      }
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
              listItems.children[currentIndex].click();
            } else {
              fillForm(reports[currentIndex]);
            }

            // Setelah form diisi, poll sampai uraian terpilih, lalu submit
            let batchSubmitAttempts = 0;
            const batchSubmitPoller = setInterval(function() {
              batchSubmitAttempts++;
              if (localStorage.getItem('sinergi_auto_active') !== 'true') {
                clearInterval(batchSubmitPoller); return;
              }
              const selectedRadio = document.querySelector('input[type="radio"]:checked:not(#sinergi-auto-input-widget input)');
              const maxWait = batchSubmitAttempts >= 36; // max 18 detik (36 x 500ms)
              if (selectedRadio || maxWait) {
                clearInterval(batchSubmitPoller);

                const performSubmitAndNext = () => {
                  const submitted = clickSubmitButton();
                  if (!submitted) {
                    const form = document.querySelector('form');
                    if (form) form.submit();
                  }
                  
                  // Wait for success/error notification (10 seconds timeout)
                  let waitTime = 0;
                  const notifInterval = setInterval(function() {
                    waitTime += 500;
                    if (localStorage.getItem('sinergi_auto_active') !== 'true') {
                      clearInterval(notifInterval);
                      return;
                    }
                    
                    const bodyText = document.body.innerText.toLowerCase();
                    const isSuccess = bodyText.includes('berhasil dikirim') || bodyText.includes('berhasil disimpan') || document.querySelector('.swal2-success');
                    const isError = bodyText.includes('gagal') || bodyText.includes('error') || document.querySelector('.swal2-error');
                    
                    if (isSuccess || isError || waitTime >= 10000) {
                      clearInterval(notifInterval);
                      console.log('🤖 Hasil submit:', isSuccess ? 'Sukses' : (isError ? 'Gagal' : 'Timeout'));
                      
                      let results = [];
                      try {
                        results = JSON.parse(localStorage.getItem('sinergi_auto_results') || '[]');
                      } catch(e) {}
                      
                      results[currentIndex] = isSuccess ? 'success' : 'error';
                      localStorage.setItem('sinergi_auto_results', JSON.stringify(results));
                      localStorage.setItem('sinergi_auto_index', (currentIndex + 1).toString());
                      
                      // Re-draw list to show badge update
                      const rawReports = localStorage.getItem('sinergi_auto_reports');
                      if (rawReports && typeof window.sinergiProcessPayload === 'function') {
                        window.sinergiProcessPayload(rawReports);
                      }
                      
                      // Navigate to Tambah Laporan page for the next item
                      const tambahBtn = Array.from(document.querySelectorAll('a, button')).find(el => {
                        if (el.closest('#sinergi-auto-input-widget') || el.closest('form')) return false;
                        const txt = (el.textContent || '').toLowerCase().trim();
                        return txt === 'tambah' || txt.includes('tambah laporan') || txt.includes('tambah pekerjaan') || txt === '+ tambah';
                      });

                      if (tambahBtn) {
                        console.log('🤖 Klik tombol Tambah Laporan untuk antrean berikutnya.');
                        if (tambahBtn.tagName.toLowerCase() === 'a' && tambahBtn.getAttribute('href')) {
                          window.location.href = tambahBtn.getAttribute('href');
                        } else {
                          tambahBtn.click();
                          tambahBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                        }
                      } else {
                        const currentUrl = window.location.href;
                        if (currentUrl.includes('/pekerjaan')) {
                          const baseUrl = currentUrl.split('/pekerjaan')[0];
                          window.location.href = baseUrl + '/pekerjaan/input/';
                        }
                      }
                      
                      // Trigger next step
                      setTimeout(checkAutoAutomation, 2000);
                    }
                  }, 500);
                };

                if (selectedRadio) {
                  console.log('\u26a1 Batch: Uraian tugas terpilih, submit dalam 1.5 detik...');
                  setTimeout(function() {
                    if (localStorage.getItem('sinergi_auto_active') !== 'true') return;
                    console.log('\u26a1 Batch: Menyimpan data...');
                    performSubmitAndNext();
                  }, 1500);
                } else {
                  console.log('\u26a1 Batch: Timeout tunggu uraian, submit sekarang...');
                  performSubmitAndNext();
                }
              }
            }, 500);

          }, 1500); // end of hydration setTimeout
        } // end of isReady if
      }, 500); // end of waitInterval
    } else { // if not isFormPagePath
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
          if (tambahBtn.tagName.toLowerCase() === 'a' && tambahBtn.getAttribute('href')) {
            window.location.href = tambahBtn.getAttribute('href');
          } else {
            tambahBtn.click();
            tambahBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          }
        } else {
          console.log('🤖 Otomatisasi Batch: Tidak menemukan tombol tambah. Mencoba fallback ke /pekerjaan/input/');
          const currentUrl = window.location.href;
          if (currentUrl.includes('/pekerjaan')) {
            const baseUrl = currentUrl.split('/pekerjaan')[0];
            window.location.href = baseUrl + '/pekerjaan/input/';
          } else {
            alert('Tombol Tambah Laporan tidak ditemukan! Harap buka halaman Riwayat Pekerjaan terlebih dahulu sebelum menekan Jalankan Otomatis.');
            localStorage.setItem('sinergi_auto_active', 'false');
            const startBtn = document.getElementById('sinergi-btn-start-auto');
            const stopBtn = document.getElementById('sinergi-btn-stop-auto');
            if (startBtn) startBtn.style.display = 'flex';
            if (stopBtn) stopBtn.style.display = 'none';
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
      swalConfirm.click();
    }
    
    const dialogButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
      if (btn.closest('#sinergi-auto-input-widget')) return false;
      if (btn.closest('form')) return false; // Exclude form buttons like +Tambah Bukti
      const txt = (btn.textContent || '').toLowerCase().trim();
      return txt === 'ya' || txt === 'yakin' || txt === 'ya, simpan' || txt === 'ya, kirim' || txt === 'setuju' || txt.includes('proses');
    });
    
    // Close Widget Event
    const closeBtn = document.getElementById('sinergi-widget-close');
    if (closeBtn) closeBtn.onclick = function() {
      widget.style.display = 'none';
    };
    
    dialogButtons.forEach(btn => {
      btn.click();
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
          textArea.value = rawReports;
        }
        if (typeof window.sinergiProcessPayload === 'function') {
          window.sinergiProcessPayload(rawReports);
        }
        checkAutoAutomation();
      }, 1000);
    }
  } else {
    initAssistant(); // Panggil langsung agar tombol muncul segera
    setInterval(initAssistant, 2000); // Cek periodik untuk SPA navigation
  }
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
  "version": "1.1",
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
                className="inline-flex items-center gap-2 px-6 py-4 bg-white hover:bg-white/95 text-[var(--theme-text)] font-extrabold rounded-xl shadow-lg border border-white/25 transition-transform hover:-translate-y-0.5 cursor-pointer shrink-0"
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
                    className="w-full bg-white hover:bg-white/95 text-[var(--theme-text)] py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
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
