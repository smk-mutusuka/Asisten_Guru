// ⚠️ GANTI URL INI DENGAN URL WEB APP DARI TAHAP 1
var BACKEND_URL = 'MASUKKAN_URL_WEB_APP_KAMU_DISINI';
var FETCH_TIMEOUT_MS = 120000; // 120 detik (2 menit) biar tidak timeout

var currentUser = null;
var lastResult = null;
var lastFitur = null;

// =============================================
// FUNGSI PANGGIL BACKEND (Fetch API)
// =============================================
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
    if (res.success) {
      if (onSuccess) onSuccess(res.data);
    } else {
      if (onFailure) onFailure(new Error(res.error));
    }
  })
  .catch(err => {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') err = new Error('Koneksi Timeout. AI terlalu lama merespons atau server mati.');
    if (onFailure) onFailure(err);
  });
}

// =============================================
// LOGIN & LOGOUT
// =============================================
function handleLogin(e) {
  e.preventDefault();
  var nbm = document.getElementById('login_nbm').value.trim();
  var pass = document.getElementById('login_password').value.trim();
  
  showLoading();
  callBackend('doGtkLogin', [nbm, pass], function(res) {
    hideLoading();
    if (res.status && res.role === 'Guru') {
      currentUser = res.gtk;
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Selamat datang, ' + res.gtk.Nama_GTK, timer: 1500, showConfirmButton: false });
      
      document.getElementById('login-page').classList.add('hidden');
      document.getElementById('app-layout').classList.remove('hidden');
      document.getElementById('user-name').textContent = res.gtk.Nama_GTK;
      
      autoFillNamaGuru(res.gtk);
    }
  }, function(err) {
    hideLoading();
    Swal.fire({ icon: 'error', title: 'Login Gagal', text: err.message });
  });
}

function logout() {
  currentUser = null;
  document.getElementById('login-page').classList.remove('hidden');
  document.getElementById('app-layout').classList.add('hidden');
  document.getElementById('loginForm').reset();
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
  var params = {};
  
  // Kumpulkan data dari form sesuai tab
  if (fitur === 'prota') {
    params = {
      namaGuru: currentUser.Nama_GTK,
      nipGuru: currentUser.NBM,
      mapel: document.getElementById('pt_mapel').value,
      kelas: document.getElementById('pt_kelas').value,
      mingguEfektif: document.getElementById('pt_minggu').value,
      jpPerMinggu: document.getElementById('pt_jp').value,
      sekolah: "SMK Muhammadiyah 1 Surakarta",
      tahunAjaran: "2026/2027",
      semester: ["Ganjil"]
    };
    if (!params.mapel) return Swal.fire('Error', 'Isi Mata Pelajaran dulu!', 'warning');
  } 
  else if (fitur === 'modul_ajar') {
    params = {
      namaGuru: currentUser.Nama_GTK,
      nipGuru: currentUser.NBM,
      mapel: document.getElementById('ma_mapel').value,
      materi: document.getElementById('ma_materi').value,
      jumlahPertemuan: document.getElementById('ma_pertemuan').value,
      sekolah: "SMK Muhammadiyah 1 Surakarta"
    };
    if (!params.mapel || !params.materi) return Swal.fire('Error', 'Isi Mapel dan Materi dulu!', 'warning');
  }
  else if (fitur === 'soal') {
    params = {
      namaGuru: currentUser.Nama_GTK,
      nipGuru: currentUser.NBM,
      mapel: document.getElementById('so_mapel').value,
      materi: document.getElementById('so_materi').value,
      jumlahPG: document.getElementById('so_pg').value,
      jumlahEsai: document.getElementById('so_esai').value,
      jumlahIsian: 0,
      levelKognitif: ["C3", "C4"],
      propMudah: 30, propSedang: 50, propSulit: 20,
      opsiPG: 4,
      sekolah: "SMK Muhammadiyah 1 Surakarta"
    };
    if (!params.mapel || !params.materi) return Swal.fire('Error', 'Isi Mapel dan Materi dulu!', 'warning');
  }
  else if (fitur === 'kokurikuler') {
    params = {
      namaGuru: currentUser.Nama_GTK,
      tema: document.getElementById('kk_tema').value,
      topik: document.getElementById('kk_topik').value,
      kelas: "XI",
      sekolah: "SMK Muhammadiyah 1 Surakarta"
    };
    if (!params.topik) return Swal.fire('Error', 'Isi Topik Projek dulu!', 'warning');
  }

  lastFitur = fitur;
  var outputCont = document.getElementById('output-' + fitur);
  
  // Tampilkan Loading
  outputCont.innerHTML = `
    <div class="loading-box">
      <i class="fas fa-spinner"></i>
      <h3>AI sedang bekerja...</h3>
      <p>Proses ini memakan waktu 30-90 detik. Mohon jangan tutup halaman.</p>
    </div>
  `;

  // Panggil Backend
  callBackend('aiGuruGenerate', [fitur, params], function(result) {
    lastResult = result;
    renderOutput(fitur, result);
  }, function(err) {
    outputCont.innerHTML = `<div class="card" style="background:#fee2e2;color:#991b1b;padding:20px;">
      <h3><i class="fas fa-exclamation-triangle"></i> Gagal</h3>
      <p>${err.message}</p>
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
    cont.innerHTML = `<div class="card" style="background:#fee2e2;color:#991b1b;padding:20px;">
      <h3>Gagal</h3><p>${result.message || 'Terjadi kesalahan'}</p>
    </div>`;
    return;
  }

  var htmlContent = result.html || result.htmlProta || result.htmlPromes;
  
  cont.innerHTML = `
    <div class="output-card">
      <div class="output-header">
        <div style="font-weight:800; color:var(--primary-dark);"><i class="fas fa-check-circle"></i> Berhasil Dibuat</div>
        <div>
          <button class="btn btn-primary btn-sm" onclick="downloadWord()"><i class="fas fa-download"></i> Download Word</button>
        </div>
      </div>
      <div class="output-preview">
        ${htmlContent}
      </div>
    </div>
  `;
}

// =============================================
// DOWNLOAD WORD
// =============================================
function downloadWord() {
  if (!lastResult) return;
  
  var htmlContent = lastResult.html || lastResult.htmlProta;
  if (!htmlContent) return Swal.fire('Error', 'Dokumen kosong', 'error');

  var docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Dokumen AI</title>
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 12pt; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid black; padding: 5px; }
      th { background: #eee; text-align: center; }
    </style>
    </head><body>${htmlContent}</body></html>
  `;

  var blob = htmlDocx.asBlob(docHtml);
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'Dokumen_AI_' + lastFitur + '.docx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  Swal.fire({ icon: 'success', title: 'Berhasil', text: 'File Word sedang diunduh', timer: 1500, showConfirmButton: false });
}

// =============================================
// HELPER: LOADER
// =============================================
function showLoading() { document.getElementById('global-loader').classList.remove('hidden'); }
function hideLoading() { document.getElementById('global-loader').classList.add('hidden'); }
