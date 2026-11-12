// ⚠️ MASUKKAN URL WEB APP KAMU DISINI
var BACKEND_URL = 'URL_WEB_APP_KAMU_DISINI'; 
var FETCH_TIMEOUT_MS = 120000; 

var currentUser = null;
var lastResult = null;
var lastFitur = null;

function callBackend(fnName, args, onSuccess, onFailure) {
  var controller = new AbortController();
  var timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  fetch(BACKEND_URL, {
    method: 'POST',
    body: JSON.stringify({ fn: fnName, args: args }),
    signal: controller.signal
  })
  .then(res => res.json())
  .then(res => {
    clearTimeout(timeoutId);
    if (res.success) { if (onSuccess) onSuccess(res.data); } 
    else { if (onFailure) onFailure(new Error(res.error)); }
  })
  .catch(err => {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') err = new Error('Koneksi Timeout. AI terlalu lama merespons.');
    if (onFailure) onFailure(err);
  });
}

// =============================================
// LOGIN HANDLERS
// =============================================
function switchLoginTab(role) {
  document.getElementById('tab-btn-admin').classList.remove('active');
  document.getElementById('tab-btn-gtk').classList.remove('active');
  document.getElementById('loginFormAdmin').classList.add('hidden');
  document.getElementById('loginFormGtk').classList.add('hidden');

  if (role === 'admin') {
    document.getElementById('tab-btn-admin').classList.add('active');
    document.getElementById('loginFormAdmin').classList.remove('hidden');
  } else {
    document.getElementById('tab-btn-gtk').classList.add('active');
    document.getElementById('loginFormGtk').classList.remove('hidden');
  }
}

function handleLoginAdmin(e) {
  e.preventDefault();
  var u = document.getElementById('username').value.trim();
  var p = document.getElementById('password').value;

  showLoading();
  callBackend('doLogin', [u, p], function(res) {
    hideLoading();
    if (res.status && (res.role === 'Admin' || res.role === 'AdminPKL')) {
      currentUser = { Nama_GTK: res.username, NBM: '-' }; // Dummy user untuk Admin
      masukKeApp("Admin");
    }
  }, function(err) {
    hideLoading();
    Swal.fire({ icon: 'error', title: 'Login Gagal', text: err.message });
  });
}

function handleLoginGTK(e) {
  e.preventDefault();
  var nbm = document.getElementById('nbm_login').value.trim();
  var pass = document.getElementById('password_gtk').value.trim();
  
  showLoading();
  callBackend('doGtkLogin', [nbm, pass], function(res) {
    hideLoading();
    if (res.status && res.role === 'Guru') {
      currentUser = res.gtk;
      masukKeApp(res.gtk.Nama_GTK);
      autoFillNamaGuru(res.gtk);
    }
  }, function(err) {
    hideLoading();
    Swal.fire({ icon: 'error', title: 'Login Gagal', text: err.message });
  });
}

function masukKeApp(namaTampil) {
  Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Selamat datang, ' + namaTampil, timer: 1500, showConfirmButton: false });
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('app-layout').classList.remove('hidden');
  document.getElementById('user-name').textContent = namaTampil;
}

function logout() {
  currentUser = null;
  document.getElementById('login-page').classList.remove('hidden');
  document.getElementById('app-layout').classList.add('hidden');
  document.getElementById('loginFormAdmin').reset();
  document.getElementById('loginFormGtk').reset();
  switchLoginTab('admin');
}

function autoFillNamaGuru(gtk) {
  var idsNama = ['pt_namaGuru', 'ma_namaGuru', 'so_namaGuru', 'kk_namaGuru'];
  var idsNip  = ['pt_nipGuru'];
  idsNama.forEach(id => { var el = document.getElementById(id); if(el) el.value = gtk.Nama_GTK; });
  idsNip.forEach(id => { var el = document.getElementById(id); if(el) el.value = gtk.NBM; });
}

// =============================================
// NAVIGASI TAB
// =============================================
function switchTab(tabId) {
  document.querySelectorAll('.ai-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.ai-tab-btn[data-tab="${tabId}"]`).classList.add('active');
  document.querySelectorAll('.ai-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('panel-' + tabId).classList.remove('hidden');
}

// =============================================
// GENERATE AI
// =============================================
function generateAI(fitur) {
  if (!currentUser) return Swal.fire('Error', 'Sesi habis, silakan login ulang.', 'error');
  
  var params = {};
  if (fitur === 'prota') {
    params = {
      namaGuru: currentUser.Nama_GTK, nipGuru: currentUser.NBM,
      mapel: document.getElementById('pt_mapel').value, kelas: document.getElementById('pt_kelas').value,
      mingguEfektif: document.getElementById('pt_minggu').value, jpPerMinggu: document.getElementById('pt_jp').value,
      sekolah: "SMK Muhammadiyah 1 Surakarta", tahunAjaran: "2026/2027", semester: ["Ganjil"]
    };
    if (!params.mapel) return Swal.fire('Error', 'Isi Mata Pelajaran dulu!', 'warning');
  } 
  else if (fitur === 'modul_ajar') {
    params = {
      namaGuru: currentUser.Nama_GTK, nipGuru: currentUser.NBM,
      mapel: document.getElementById('ma_mapel').value, materi: document.getElementById('ma_materi').value,
      jumlahPertemuan: document.getElementById('ma_pertemuan').value, sekolah: "SMK Muhammadiyah 1 Surakarta"
    };
    if (!params.mapel || !params.materi) return Swal.fire('Error', 'Isi Mapel dan Materi dulu!', 'warning');
  }
  else if (fitur === 'soal') {
    params = {
      namaGuru: currentUser.Nama_GTK, nipGuru: currentUser.NBM,
      mapel: document.getElementById('so_mapel').value, materi: document.getElementById('so_materi').value,
      jumlahPG: document.getElementById('so_pg').value, jumlahEsai: document.getElementById('so_esai').value, jumlahIsian: 0,
      levelKognitif: ["C3", "C4"], propMudah: 30, propSedang: 50, propSulit: 20, opsiPG: 4,
      sekolah: "SMK Muhammadiyah 1 Surakarta"
    };
    if (!params.mapel || !params.materi) return Swal.fire('Error', 'Isi Mapel dan Materi dulu!', 'warning');
  }
  else if (fitur === 'kokurikuler') {
    params = {
      namaGuru: currentUser.Nama_GTK, tema: document.getElementById('kk_tema').value,
      topik: document.getElementById('kk_topik').value, kelas: "XI", sekolah: "SMK Muhammadiyah 1 Surakarta"
    };
    if (!params.topik) return Swal.fire('Error', 'Isi Topik Projek dulu!', 'warning');
  }

  lastFitur = fitur;
  var outputCont = document.getElementById('output-' + fitur);
  outputCont.innerHTML = `<div class="loading-box"><i class="fas fa-spinner"></i><h3>AI sedang bekerja...</h3><p>Proses 30-90 detik. Jangan tutup halaman.</p></div>`;

  callBackend('aiGuruGenerate', [fitur, params], function(result) {
    lastResult = result;
    renderOutput(fitur, result);
  }, function(err) {
    outputCont.innerHTML = `<div class="card" style="background:#fee2e2;color:#991b1b;padding:20px;">
      <h3><i class="fas fa-exclamation-triangle"></i> Gagal</h3><p>${err.message}</p>
      <button class="btn btn-outline btn-sm" style="margin-top:10px;" onclick="generateAI('${fitur}')">Coba Lagi</button>
    </div>`;
  });
}

// =============================================
// RENDER HASIL
// =============================================
function renderOutput(fitur, result) {
  var cont = document.getElementById('output-' + fitur);
  if (!result.success) {
    cont.innerHTML = `<div class="card" style="background:#fee2e2;color:#991b1b;padding:20px;"><h3>Gagal</h3><p>${result.message || 'Terjadi kesalahan'}</p></div>`;
    return;
  }
  var htmlContent = result.html || result.htmlProta || result.htmlPromes;
  cont.innerHTML = `
    <div class="output-card">
      <div class="output-header">
        <div style="font-weight:800; color:var(--primary-dark);"><i class="fas fa-check-circle"></i> Berhasil Dibuat</div>
        <div><button class="btn btn-primary btn-sm" onclick="downloadWord()"><i class="fas fa-download"></i> Download Word</button></div>
      </div>
      <div class="output-preview">${htmlContent}</div>
    </div>
  `;
}

// =============================================
// DOWNLOAD WORD (DENGAN LOGO)
// =============================================
function downloadWord() {
  if (!lastResult) return;
  var htmlContent = lastResult.html || lastResult.htmlProta;
  if (!htmlContent) return Swal.fire('Error', 'Dokumen kosong', 'error');

  var baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace(/\/$/, '');
  var logoUrl = baseUrl + '/logo.png';
  var headerLogo = '<div style="text-align:center; margin-bottom:20px;"><img src="' + logoUrl + '" width="94" height="115" style="width:2.5cm;height:3.05cm;" /></div>';
  var finalHtml = headerLogo + htmlContent;

  var docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Dokumen AI</title>
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid black; padding: 5px; }
      th { background: #eee; text-align: center; }
      .identitas, .identitas td { border: none !important; padding: 0 5px 0 0; text-align: left; }
      .ttd, .ttd td { border: none !important; text-align: center; }
    </style>
    </head><body>${finalHtml}</body></html>
  `;

  var blob = htmlDocx.asBlob(docHtml);
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'Dokumen_AI_' + lastFitur + '.docx';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
  Swal.fire({ icon: 'success', title: 'Berhasil', text: 'File Word diunduh beserta Logo', timer: 1500, showConfirmButton: false });
}

function showLoading() { document.getElementById('global-loader').classList.remove('hidden'); }
function hideLoading() { document.getElementById('global-loader').classList.add('hidden'); }
