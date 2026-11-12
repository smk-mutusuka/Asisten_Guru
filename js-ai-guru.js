// ⚠️ GANTI DENGAN URL WEB APP APPS SCRIPT KAMU
var BACKEND_URL = 'https://script.google.com/macros/s/AKfycbyUAYG8PVKtXEOI-NrlmNMR_qk2oNm-0t2Ju0TSohz4-cbqnfUJtjaQyGOJm-Hqx9lh/exec';

var currentUser = null;

// =============================================
// JEMBATAN BACKEND (Menggantikan google.script.run)
// =============================================
window.google = window.google || {};
window.google.script = window.google.script || {};
window.google.script.run = {
  withSuccessHandler: function(successCb) {
    return {
      withFailureHandler: function(failCb) {
        var chain = {};
        var allowedFuncs = ['doGtkLogin', 'doLogin', 'aiGuruGenerate'];
        allowedFuncs.forEach(function(fn) {
          chain[fn] = function() {
            var args = Array.prototype.slice.call(arguments);
            fetch(BACKEND_URL, {
              method: 'POST',
              body: JSON.stringify({ fn: fn, args: args })
            })
            .then(res => res.json())
            .then(res => {
              if (res.success) { if (successCb) successCb(res.data); }
              else { if (failCb) failCb(new Error(res.error)); }
            })
            .catch(err => { if (failCb) failCb(err); });
          };
        });
        return chain;
      }
    };
  }
};

// =============================================
// LOGIN & UI HANDLERS
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

function togglePassword(inputId, iconElement) {
  var input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text'; iconElement.classList.remove('fa-eye'); iconElement.classList.add('fa-eye-slash');
  } else {
    input.type = 'password'; iconElement.classList.remove('fa-eye-slash'); iconElement.classList.add('fa-eye');
  }
}

function handleLoginAdmin(e) {
  e.preventDefault();
  var u = document.getElementById('username').value.trim();
  var p = document.getElementById('password').value;
  showLoading();
  google.script.run.withSuccessHandler(function(res) {
    hideLoading();
    if (res.status) {
      currentUser = { Nama_GTK: res.username, NBM: '-' };
      masukKeApp(res.username);
      initAIGuruPageAdmin();
    }
  }).withFailureHandler(function(err) {
    hideLoading(); Swal.fire({ icon: 'error', title: 'Login Gagal', text: err.message });
  }).doLogin(u, p);
}

function handleLoginGTK(e) {
  e.preventDefault();
  var nbm = document.getElementById('nbm_login').value.trim();
  var pass = document.getElementById('password_gtk').value.trim();
  showLoading();
  google.script.run.withSuccessHandler(function(res) {
    hideLoading();
    if (res.status) {
      currentUser = res.gtk;
      masukKeApp(res.gtk.Nama_GTK);
      initAIGuruPage();
    }
  }).withFailureHandler(function(err) {
    hideLoading(); Swal.fire({ icon: 'error', title: 'Login Gagal', text: err.message });
  }).doGtkLogin(nbm, pass);
}

function masukKeApp(nama) {
  Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Selamat datang, ' + nama, timer: 1500, showConfirmButton: false });
  document.getElementById('login-page').classList.add('hidden');
  document.getElementById('app-layout').classList.remove('hidden');
  document.getElementById('user-name').textContent = nama;
}

function logout() {
  currentUser = null;
  document.getElementById('login-page').classList.remove('hidden');
  document.getElementById('app-layout').classList.add('hidden');
  document.getElementById('loginFormAdmin').reset();
  document.getElementById('loginFormGtk').reset();
  switchLoginTab('admin');
}

// Loader
function showLoading() { document.getElementById('global-loader').classList.remove('hidden'); }
function hideLoading() { document.getElementById('global-loader').classList.add('hidden'); }


// =========================================================================
// ⬇️ DI BAWAH INI ADALAH KODE ASLI KAMU (JS_AI_Guru.html.txt) TANPA DIUBAH ⬇️
// =========================================================================

var FE_SCHOOL_LOGO_URL = "https://lh3.googleusercontent.com/d/1d1xBvybSKr-I8d_LOYZwdEV1TlVgptfo";
var FE_SMK_JURUSAN = [
  { id: "TP",  nama: "Teknik Pemesinan",          singkat: "TP",  bidang: "Teknologi Manufaktur dan Rekayasa" },
  { id: "TPL", nama: "Teknik Pengelasan",         singkat: "TPL", bidang: "Teknologi Manufaktur dan Rekayasa" },
  { id: "TKR", nama: "Teknik Kendaraan Ringan",   singkat: "TKR", bidang: "Teknologi Manufaktur dan Rekayasa" },
  { id: "TSM", nama: "Teknik Sepeda Motor",       singkat: "TSM", bidang: "Teknologi Manufaktur dan Rekayasa" }
];
var FE_DIMENSI_LULUSAN = [
  { kode: "D1", nama: "Keimanan dan Ketakwaan terhadap Tuhan YME" },
  { kode: "D2", nama: "Kewargaan" },
  { kode: "D3", nama: "Penalaran Kritis" },
  { kode: "D4", nama: "Kreativitas" },
  { kode: "D5", nama: "Kolaborasi" },
  { kode: "D6", nama: "Kemandirian" },
  { kode: "D7", nama: "Kesehatan" },
  { kode: "D8", nama: "Komunikasi" }
];
var FE_MODEL_PEMBELAJARAN = [
  { id: "pjbl",      nama: "Project Based Learning (PjBL)" },
  { id: "pbl",       nama: "Problem Based Learning (PBL)" },
  { id: "cbl",       nama: "Case Based Learning (CBL)" },
  { id: "ps",        nama: "Problem Solving" },
  { id: "discovery", nama: "Discovery Learning" },
  { id: "inquiry",   nama: "Inquiry Learning" },
  { id: "ctl",       nama: "Contextual Teaching and Learning (CTL)" },
  { id: "coop",      nama: "Cooperative Learning" },
  { id: "diff",      nama: "Pembelajaran Berdiferensiasi" }
];
var FE_FASE_SMK = [
  { id: "E", nama: "Fase E (Kelas 10)" },
  { id: "F", nama: "Fase F (Kelas 11-12)" }
];
var TEMA_KOKURIKULER = [
  "Literasi dan Numerasi", "Kesehatan dan Gaya Hidup Sehat", "Lingkungan Hidup dan Keberlanjutan",
  "Kewirausahaan", "Kewargaan dan Kebhinekaan", "Digital Safety dan Literasi Digital",
  "Kreativitas dan Inovasi", "Kepemimpinan dan Kolaborasi", "Budaya dan Kearifan Lokal",
  "Pencegahan Perundungan dan Kekerasan", "Keselamatan dan Mitigasi Bencana", "Penguatan Karakter dan Etika Sosial"
];
var PENDEKATAN_BELAJAR = [
  { id: "deep",        nama: "Deep Learning (Mindful, Meaningful, Joyful)" },
  { id: "pjbl",        nama: "Project Based Learning (PjBL)" },
  { id: "inquiry",     nama: "Inquiry Based Learning" },
  { id: "pbl",         nama: "Problem Based Learning (PBL)" },
  { id: "experiential",nama: "Experiential Learning" },
  { id: "service",     nama: "Service Learning" }
];
var KONDISI_LINGKUNGAN = [
  "Lingkungan Kelas/Sekolah", "Lingkungan Alam Sekitar", "Lingkungan Masyarakat/Pasar",
  "Lingkungan Digital/Maya", "Lingkungan Rumah Murid", "Perpustakaan/Laboratorium", "Masjid/Musholla"
];
var MAPEL_INTEGRASI = [
  "PAI _ Budi Pekerti", "Pendidikan Pancasila", "Bahasa Indonesia", "Matematika", "IPAS", "IPA", "IPS",
  "Informatika", "Seni _ Budaya", "PJOK", "Bahasa Inggris", "KIK", "Muatan Lokal"
];

var aiGuruState = {
  activeTab: 'prota',
  lastResult: null,
  lastFitur: null,
  lastParams: null,
  isLoading: false,
  previewTab: 'prota',
  cpFileObject: null,
  cpFileName: '',
  cpFileSize: 0
};

function getGuruInfo() {
  if (!currentUser || !currentUser.gtk) return { nama: "", nbm: "" };
  return { nama: currentUser.gtk.Nama_GTK || "", nbm: currentUser.gtk.NBM || "" };
}

function autoFillGuruFields() {
  var guru = getGuruInfo();
  if (!guru.nama && !guru.nbm) return;
  var fields = [
    { nama: 'pt_namaGuru', nip: 'pt_nipGuru' },
    { nama: 'ma_namaGuru', nip: 'ma_nipGuru' },
    { nama: 'so_namaGuru', nip: 'so_nipGuru' },
    { nama: 'kk_namaGuru', nip: null }
  ];
  fields.forEach(function(f) {
    var elNama = document.getElementById(f.nama);
    if (elNama && guru.nama) elNama.value = guru.nama;
    if (f.nip) {
      var elNip = document.getElementById(f.nip);
      if (elNip && guru.nbm) elNip.value = guru.nbm;
    }
  });
}

function initAIGuruPage() {
  renderAIGuruPage();
}

function initAIGuruPageAdmin() {
  renderAIGuruPage();
  // Opsional: Sesuaikan jika admin mau form read-only, tapi defaultnya sama.
}

function renderAIGuruPage() {
  var container = document.getElementById('ai-guru-content');
  if (!container) return;

  var jurusanOptions = FE_SMK_JURUSAN.map(function(j) { return '<option value="' + j.id + '">' + j.nama + ' (' + j.singkat + ')</option>'; }).join('');
  var modelOptions = FE_MODEL_PEMBELAJARAN.map(function(m) { return '<option value="' + m.id + '">' + m.nama + '</option>'; }).join('');
  var faseOptions = FE_FASE_SMK.map(function(f) { return '<option value="' + f.id + '">' + f.nama + '</option>'; }).join('');
  var dimensiCheckboxes = FE_DIMENSI_LULUSAN.map(function(d) {
    return '<label class="ai-checkbox-item"><input type="checkbox" name="dimensi_' + d.kode + '" value="' + d.kode + '"><span><strong>' + d.kode + '</strong> — ' + d.nama + '</span></label>';
  }).join('');

  container.innerHTML = 
    '<div class="card ai-guru-intro"><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;"><div style="font-size:2.5em;">✨</div><div style="flex:1;min-width:220px;"><div style="font-size:18px;font-weight:800;">AI Assistant Guru</div><div style="font-size:12.5px;opacity:0.9;margin-top:2px;">Bantu buat Prota, Promes, Modul Ajar, Soal, dan Modul Kokurikuler dengan AI.</div></div></div></div>' +
    '<div class="ai-tabs">' +
      '<button type="button" class="ai-tab-btn active" data-tab="prota" onclick="switchAITab(\'prota\')"><i class="fas fa-calendar-alt"></i> Prota & Promes</button>' +
      '<button type="button" class="ai-tab-btn" data-tab="modul_ajar" onclick="switchAITab(\'modul_ajar\')"><i class="fas fa-book-open"></i> Modul Ajar</button>' +
      '<button type="button" class="ai-tab-btn" data-tab="soal" onclick="switchAITab(\'soal\')"><i class="fas fa-question-circle"></i> Buat Soal</button>' +
      '<button type="button" class="ai-tab-btn" data-tab="kokurikuler" onclick="switchAITab(\'kokurikuler\')"><i class="fas fa-users-cog"></i> Kokurikuler</button>' +
    '</div>' +
    
    // PANEL PROTA (PERSIS ASLI)
    '<div class="ai-panel" id="ai-panel-prota">' +
      buildPanelHeader('Prota & Promes', 'Buat Program Tahunan (Prota) dan Program Semester (Promes) sekaligus.', 'fa-calendar-alt') +
      '<div class="card ai-form-card">' +
        '<div class="ai-form-section"><div class="ai-form-section-title"><i class="fas fa-id-card"></i> A. Identitas</div><div class="ai-form-grid">' +
            '<div class="form-group"><label><i class="fas fa-user-tie"></i> Nama Guru</label><input type="text" id="pt_namaGuru" class="form-control" placeholder="Nama lengkap"></div>' +
            '<div class="form-group"><label><i class="fas fa-id-card"></i> NIP/NBM</label><input type="text" id="pt_nipGuru" class="form-control" placeholder="NIP atau NBM"></div>' +
            '<div class="form-group"><label><i class="fas fa-school"></i> Satuan Pendidikan</label><input type="text" id="pt_sekolah" class="form-control" value="SMK Muhammadiyah 1 Surakarta" placeholder="Nama sekolah"></div>' +
            '<div class="form-group"><label><i class="fas fa-book"></i> Mata Pelajaran</label><input type="text" id="pt_mapel" class="form-control" placeholder="Contoh: SMAW"></div>' +
            '<div class="form-group"><label><i class="fas fa-graduation-cap"></i> Jurusan</label><select id="pt_jurusan" class="form-control"><option value="">-- Pilih --</option>' + jurusanOptions + '</select></div>' +
            '<div class="form-group"><label><i class="fas fa-layer-group"></i> Fase</label><select id="pt_fase" class="form-control"><option value="">-- Pilih --</option>' + faseOptions + '</select></div>' +
            '<div class="form-group"><label><i class="fas fa-door-open"></i> Kelas</label><select id="pt_kelas" class="form-control"><option value="10">10</option><option value="11" selected>11</option><option value="12">12</option></select></div>' +
            '<div class="form-group"><label><i class="fas fa-calendar"></i> Tahun Ajaran</label><input type="text" id="pt_tahunAjaran" class="form-control" placeholder="2026/2027" value="2026/2027"></div>' +
            '<div class="form-group" style="grid-column: 1 / -1;"><label><i class="fas fa-calendar-alt"></i> Semester</label><div style="display:flex;gap:8px;flex-wrap:wrap;">' +
                '<label class="ai-checkbox-item" style="flex:1;min-width:140px;padding:10px 14px;cursor:pointer;"><input type="checkbox" id="pt_semesterGanjil" value="Ganjil" checked><span><strong>Ganjil</strong> (Juli - Desember)</span></label>' +
                '<label class="ai-checkbox-item" style="flex:1;min-width:140px;padding:10px 14px;cursor:pointer;"><input type="checkbox" id="pt_semesterGenap" value="Genap"><span><strong>Genap</strong> (Januari - Juni)</span></label>' +
            '</div></div>' +
        '</div></div>' +
        '<div class="ai-form-section"><div class="ai-form-section-title"><i class="fas fa-file-alt"></i> B. Bahan Baku (CP/TP)</div>' +
          '<div class="form-group"><label style="text-transform:none;letter-spacing:0;font-weight:600;font-size:13px;"><input type="checkbox" id="pt_punyaFile" onchange="toggleUploadCP()"> Punya file CP sendiri? Upload di sini</label></div>' +
          '<div id="pt_uploadContainer" style="display:none;"><div class="form-group"><div class="personal-file-upload" style="width:100%;"><label class="file-label" for="pt_fileCP" style="width:100%;justify-content:center;min-height:46px;font-size:13px;"><i class="fas fa-cloud-upload-alt" style="font-size:17px;"></i> Pilih File CP</label><input type="file" id="pt_fileCP" accept=".pdf,.docx,.doc" onchange="handleCPUpload(this)"><span class="file-name" id="pt_fileCP_name" style="margin-top:8px;display:block;text-align:center;font-size:12px;">Belum ada file dipilih</span></div></div></div>' +
          '<div class="form-group" style="margin-top:12px;"><label><i class="fas fa-list-check"></i> ATAU Paste Teks CP/TP</label><textarea id="pt_kdCp" class="form-control" rows="5" placeholder="Paste Capaian Pembelajaran..."></textarea></div>' +
        '</div>' +
        '<div class="ai-form-section"><div class="ai-form-section-title"><i class="fas fa-clock"></i> C. Modal Waktu</div><div class="ai-form-grid">' +
            '<div class="form-group"><label>Minggu Efektif per Semester</label><input type="number" id="pt_mingguEfektif" class="form-control" value="18" oninput="hitungTotalJP()"></div>' +
            '<div class="form-group"><label>JP per Minggu</label><input type="number" id="pt_jpPerMinggu" class="form-control" value="4" oninput="hitungTotalJP()"></div>' +
        '</div><div style="background:#ecfdf5;border:1px dashed var(--primary-border);border-radius:8px;padding:12px 16px;margin-top:8px;"><div id="pt_totalJPDisplay" style="font-size:12px;color:#065f46;margin-top:4px;">18 minggu × 4 JP = <strong>72 JP</strong> per semester | <strong>144 JP</strong> per tahun</div></div></div>' +
        buildActionButtonsProta() +
      '</div><div class="ai-output-container" id="ai-output-prota"></div></div>' +

    // PANEL MODUL AJAR (PERSIS ASLI)
    '<div class="ai-panel hidden" id="ai-panel-modul_ajar">' +
      buildPanelHeader('Modul Ajar SMK', 'Susun modul ajar lengkap sesuai Kurikulum Merdeka dengan K3LH & standar industri.', 'fa-book-open') +
      '<div class="card ai-form-card">' +
        '<div class="ai-form-section"><div class="ai-form-section-title"><i class="fas fa-info-circle"></i> Informasi Dasar</div><div class="ai-form-grid">' +
            '<div class="form-group"><label>Nama Guru</label><input type="text" id="ma_namaGuru" class="form-control" placeholder="Nama lengkap"></div>' +
            '<div class="form-group"><label>NIP/NBM</label><input type="text" id="ma_nipGuru" class="form-control" placeholder="NIP/NBM"></div>' +
            '<div class="form-group"><label>Tahun Pelajaran</label><input type="text" id="ma_tahunAjaran" class="form-control" value="2026/2027"></div>' +
            '<div class="form-group"><label>Jurusan</label><select id="ma_jurusan" class="form-control"><option value="">-- Pilih --</option>' + jurusanOptions + '</select></div>' +
            '<div class="form-group"><label>Fase</label><select id="ma_fase" class="form-control"><option value="">-- Pilih --</option>' + faseOptions + '</select></div>' +
            '<div class="form-group"><label>Kelas</label><select id="ma_kelas" class="form-control"><option value="10">10</option><option value="11">11</option><option value="12">12</option></select></div>' +
            '<div class="form-group"><label>Mata Pelajaran</label><input type="text" id="ma_mapel" class="form-control" placeholder="Contoh: Gambar Teknik Manufaktur"></div>' +
            '<div class="form-group"><label>Materi Pokok / Judul Modul</label><input type="text" id="ma_materi" class="form-control" placeholder="Contoh: Menggunakan Software AutoCAD"></div>' +
        '</div></div>' +
        '<div class="ai-form-section"><div class="ai-form-section-title"><i class="fas fa-list-ol"></i> Detail Pembelajaran</div><div class="ai-form-grid">' +
            '<div class="form-group"><label>Jumlah Pertemuan</label><input type="number" id="ma_jumlahPertemuan" class="form-control" value="3"></div>' +
            '<div class="form-group"><label>Alokasi per Pertemuan</label><input type="text" id="ma_alokasiPerPertemuan" class="form-control" value="3 x 45 menit"></div>' +
            '<div class="form-group"><label>Model Pembelajaran</label><select id="ma_modelPembelajaran" class="form-control"><option value="">-- Pilih Model --</option>' + modelOptions + '</select></div>' +
            '<div class="form-group"><label>Target Peserta Didik</label><input type="text" id="ma_targetPesertaDidik" class="form-control" value="Peserta didik reguler (28-32 siswa)"></div>' +
        '</div></div>' +
        '<div class="ai-form-section"><div class="ai-form-section-title"><i class="fas fa-bullseye"></i> Kompetensi & Tujuan</div>' +
            '<div class="form-group"><label>CP / Kompetensi Dasar</label><textarea id="ma_kdCp" class="form-control" rows="4" placeholder="Paste Capaian Pembelajaran..."></textarea></div>' +
            '<div class="form-group"><label>Kompetensi Awal (opsional)</label><textarea id="ma_kompetensiAwal" class="form-control" rows="2"></textarea></div>' +
            '<div class="form-group"><label>Tujuan Pembelajaran (opsional)</label><textarea id="ma_tujuan" class="form-control" rows="3"></textarea></div>' +
        '</div></div>' +
        '<div class="ai-form-section"><div class="ai-form-section-title"><i class="fas fa-tools"></i> Sarana & Dimensi Lulusan</div>' +
            '<div class="form-group"><label>Sarana & Prasarana (opsional)</label><textarea id="ma_saranaPrasarana" class="form-control" rows="2"></textarea></div>' +
            '<div class="form-group"><label>Dimensi Profil Lulusan (pilih 2-3)</label><div class="ai-checkbox-grid">' + dimensiCheckboxes + '</div>' +
            '<div class="form-group"><label>Versi Modul</label><select id="ma_versi" class="form-control"><option value="ringkas">Ringkas</option><option value="lengkap" selected>Lengkap</option></select></div>' +
        '</div>' +
        buildActionButtons('modul_ajar') +
      '</div><div class="ai-output-container" id="ai-output-modul_ajar"></div></div>' +

    // PANEL SOAL (PERSIS ASLI)
    '<div class="ai-panel hidden" id="ai-panel-soal">' +
      buildPanelHeader('Buat Soal Ujian', 'Buat paket soal lengkap dengan kunci, pembahasan, dan kisi-kisi.', 'fa-question-circle') +
      '<div class="card ai-form-card">' +
        '<div class="soal-form-section"><div class="soal-form-section-title"><i class="fas fa-id-card"></i> A. Identitas & Asesmen</div><div class="ai-form-grid">' +
            '<div class="form-group"><label>Nama Guru</label><input type="text" id="so_namaGuru" class="form-control" placeholder="Nama lengkap"></div>' +
            '<div class="form-group"><label>NIP/NBM</label><input type="text" id="so_nipGuru" class="form-control" placeholder="NIP/NBM"></div>' +
            '<div class="form-group"><label>Satuan Pendidikan</label><input type="text" id="so_sekolah" class="form-control" value="SMK Muhammadiyah 1 Surakarta"></div>' +
            '<div class="form-group"><label>Jurusan</label><select id="so_jurusan" class="form-control"><option value="">-- Pilih --</option>' + jurusanOptions + '</select></div>' +
            '<div class="form-group"><label>Mata Pelajaran</label><input type="text" id="so_mapel" class="form-control" placeholder="Contoh: Teknik Pemesinan Bubut"></div>' +
            '<div class="form-group"><label>Kelas</label><select id="so_kelas" class="form-control"><option value="X">X</option><option value="XI">XI</option><option value="XII">XII</option></select></div>' +
            '<div class="form-group"><label>Tahun Ajaran</label><input type="text" id="so_tahunAjaran" class="form-control" value="2026/2027"></div>' +
            '<div class="form-group"><label>Jenis Asesmen</label><select id="so_jenisAsesmen" class="form-control"><option value="Sumatif Harian">Sumatif Harian</option><option value="Sumatif Tengah Semester">STS</option><option value="Sumatif Akhir Semester">SAS</option></select></div>' +
            '<div class="form-group"><label>Alokasi Waktu</label><input type="text" id="so_alokasi" class="form-control" value="90 menit"></div>' +
        '</div></div>' +
        '<div class="soal-form-section"><div class="soal-form-section-title" style="display:flex;justify-content:space-between;align-items:center;">' +
            '<span><i class="fas fa-list-ol"></i> B. Komposisi Soal</span><span class="total-soal-badge"><i class="fas fa-calculator"></i> Total: <strong id="so_totalSoalDisplay">30</strong></span>' +
        '</div>' +
        '<div style="margin-bottom:10px;"><label style="text-transform:none;font-size:12.5px;font-weight:700;color:#334155;">Opsi Jawaban (PG):</label><select id="so_opsiPG" class="form-control" style="max-width:200px;margin-top:4px;"><option value="3">3 Opsi</option><option value="4" selected>4 Opsi</option><option value="5">5 Opsi</option></select></div>' +
        '<div class="tipe-soal-grid">' +
            '<div class="tipe-soal-card bg-pg"><div class="tipe-icon"><i class="fas fa-check-circle"></i></div><div class="tipe-label">Pilihan Ganda</div><input type="number" id="so_jumlahPG" value="20" min="0" max="30" oninput="hitungTotalSoal()"></div>' +
            '<div class="tipe-soal-card bg-isian"><div class="tipe-icon"><i class="fas fa-pen"></i></div><div class="tipe-label">Isian Singkat</div><input type="number" id="so_jumlahIsian" value="5" min="0" max="30" oninput="hitungTotalSoal()"></div>' +
            '<div class="tipe-soal-card bg-esai"><div class="tipe-icon"><i class="fas fa-file-alt"></i></div><div class="tipe-label">Esai / Uraian</div><input type="number" id="so_jumlahEsai" value="5" min="0" max="30" oninput="hitungTotalSoal()"></div>' +
        '</div>' +
        '<div id="so_totalWarning" style="font-size:11.5px;color:#991b1b;margin-top:8px;display:none;"><i class="fas fa-exclamation-triangle"></i> Total soal tidak boleh lebih dari 30.</div>' +
        '</div>' +
        '<div class="soal-form-section"><div class="soal-form-section-title"><i class="fas fa-signal"></i> C. Proporsi Tingkat Kesulitan</div><div class="proporsi-grid">' +
            '<div class="proporsi-item p-mudah"><div class="proporsi-label"><span>Mudah</span><span class="proporsi-value" id="so_valMudah">30%</span></div><input type="range" id="so_propMudah" min="0" max="100" value="30" oninput="updateProporsi()"></div>' +
            '<div class="proporsi-item p-sedang"><div class="proporsi-label"><span>Sedang</span><span class="proporsi-value" id="so_valSedang">50%</span></div><input type="range" id="so_propSedang" min="0" max="100" value="50" oninput="updateProporsi()"></div>' +
            '<div class="proporsi-item p-sulit"><div class="proporsi-label"><span>Sulit</span><span class="proporsi-value" id="so_valSulit">20%</span></div><input type="range" id="so_propSulit" min="0" max="100" value="20" oninput="updateProporsi()"></div>' +
        '</div><div id="so_proporsiWarning" class="proporsi-total-warning ok" style="margin-top:10px;"><i class="fas fa-check-circle"></i> Total: 100%</div></div>' +
        '<div class="soal-form-section"><div class="soal-form-section-title"><i class="fas fa-brain"></i> D. Level Kognitif</div><div class="kognitif-grid">' +
            '<label class="kognitif-chip"><input type="checkbox" id="so_kogC3" value="C3" checked><span class="kode">C3</span><span class="label">Menerapkan</span></label>' +
            '<label class="kognitif-chip"><input type="checkbox" id="so_kogC4" value="C4" checked><span class="kode">C4</span><span class="label">Menganalisis</span></label>' +
            '<label class="kognitif-chip"><input type="checkbox" id="so_kogC5" value="C5"><span class="kode">C5</span><span class="label">Mengevaluasi</span></label>' +
            '<label class="kognitif-chip"><input type="checkbox" id="so_kogC6" value="C6"><span class="kode">C6</span><span class="label">Mencipta</span></label>' +
        '</div><div id="so_hotsWarning" style="display:none;font-size:11.5px;color:#92400e;background:#fef3c7;padding:8px 12px;margin-top:10px;border-radius:8px;"><i class="fas fa-fire"></i> C5/C6 dipilih — proporsi Sulit min 30% (auto).</div></div>' +
        '<div class="soal-form-section"><div class="soal-form-section-title"><i class="fas fa-image"></i> E. Visual & Multimedia</div><div class="visual-grid">' +
            '<label class="visual-card"><input type="checkbox" id="so_pakaiIlustrasi"><div class="visual-info"><div class="visual-title"><i class="fas fa-palette"></i> Ilustrasi</div><div class="visual-desc">AI menyertakan prompt gambar.</div></div></label>' +
            '<label class="visual-card"><input type="checkbox" id="so_pakaiDiagram"><div class="visual-info"><div class="visual-title"><i class="fas fa-chart-bar"></i> Diagram/Grafik</div><div class="visual-desc">AI menyertakan prompt diagram.</div></div></label>' +
            '<label class="visual-card"><input type="checkbox" id="so_pakaiPetaKonsep"><div class="visual-info"><div class="visual-title"><i class="fas fa-project-diagram"></i> Peta Konsep</div><div class="visual-desc">AI menyertakan prompt peta konsep.</div></div></label>' +
        '</div></div>' +
        '<div class="soal-form-section"><div class="soal-form-section-title"><i class="fas fa-lightbulb"></i> F. Materi / Topik & CP</div>' +
            '<div class="form-group"><label>Materi / Topik Soal</label><input type="text" id="so_materi" class="form-control" placeholder="Contoh: Alat potong mesin bubut..."></div>' +
            '<div class="form-group" style="margin-bottom:0;"><label>CP / KD / Tujuan Pembelajaran</label><textarea id="so_kdCp" class="form-control" rows="4"></textarea></div>' +
        '</div>' +
        buildActionButtonsSoal() +
      '</div><div class="ai-output-container" id="ai-output-soal"></div></div>' +

    // PANEL KOKURIKULER (PERSIS ASLI)
    '<div class="ai-panel hidden" id="ai-panel-kokurikuler">' +
      buildPanelHeader('Modul Kokurikuler', 'Susun modul projek kokurikuler berbasis 8 Dimensi Lulusan.', 'fa-users-cog') +
      '<div class="card ai-form-card">' +
        '<div class="soal-form-section"><div class="soal-form-section-title"><i class="fas fa-id-card"></i> A. Identitas Umum</div><div class="ai-form-grid">' +
            '<div class="form-group"><label>Nama Penyusun</label><input type="text" id="kk_namaGuru" class="form-control" placeholder="Nama lengkap"></div>' +
            '<div class="form-group"><label>Instansi</label><input type="text" id="kk_sekolah" class="form-control" value="SMK Muhammadiyah 1 Surakarta" readonly></div>' +
            '<div class="form-group"><label>Jenjang / Kelas</label><select id="kk_kelas" class="form-control"><option value="X">Kelas X</option><option value="XI" selected>Kelas XI</option><option value="XII">Kelas XII</option></select></div>' +
            '<div class="form-group"><label>Tahun Ajaran</label><input type="text" id="kk_tahunAjaran" class="form-control" value="2026/2027"></div>' +
        '</div></div>' +
        '<div class="soal-form-section"><div class="soal-form-section-title"><i class="fas fa-palette"></i> B. Tema Kegiatan</div>' +
            '<div class="tema-tabs"><button type="button" class="tema-tab-btn active" onclick="switchTemaTab(\'resmi\', this)"><i class="fas fa-check-circle"></i> Tema Resmi</button><button type="button" class="tema-tab-btn" onclick="switchTemaTab(\'khusus\', this)"><i class="fas fa-pen"></i> Tema Khusus</button></div>' +
            '<div class="tema-panel active" id="tema-panel-resmi"><div class="tema-grid">' +
                TEMA_KOKURIKULER.map(function(t, idx) { return '<label class="tema-card"><input type="radio" name="kk_tema" value="' + t + '"' + (idx === 0 ? ' checked' : '') + '><span>' + t + '</span></label>'; }).join('') +
            '</div></div>' +
            '<div class="tema-panel" id="tema-panel-khusus"><div class="tema-khusus-input"><label>Tema Custom</label><input type="text" id="kk_temaKhusus" oninput="handleTemaKhususInput()" placeholder="Ketik tema bebas..."></div></div>' +
        '</div>' +
        '<div class="soal-form-section"><div class="soal-form-section-title" style="display:flex;justify-content:space-between;align-items:center;">' +
            '<span><i class="fas fa-bullseye"></i> C. Target Dimensi Lulusan (maks 3)</span><span class="dimensi-counter ok" id="kk_dimensiCounter">0 / 3</span>' +
        '</div><div class="ai-checkbox-grid">' +
            FE_DIMENSI_LULUSAN.map(function(d) { return '<label class="ai-checkbox-item"><input type="checkbox" name="kk_dimensi" value="' + d.kode + '" onchange="handleDimensiChange(this)"><span><strong>' + d.kode + '</strong> — ' + d.nama + '</span></label>'; }).join('') +
        '</div><div id="kk_dimensiWarning" style="display:none;font-size:11.5px;color:#991b1b;background:#fee2e2;padding:8px 12px;margin-top:10px;border-radius:8px;"><i class="fas fa-exclamation-triangle"></i> Maksimal 3 dimensi.</div></div>' +
        '<div class="soal-form-section"><div class="soal-form-section-title"><i class="fas fa-graduation-cap"></i> D. Metodologi Pembelajaran</div>' +
            '<div class="form-group"><label>Pendekatan Belajar</label><select id="kk_pendekatan" class="form-control">' +
                PENDEKATAN_BELAJAR.map(function(p) { return '<option value="' + p.nama + '"' + (p.id === 'deep' ? ' selected' : '') + '>' + p.nama + '</option>'; }).join('') +
            '</select></div>' +
            '<div class="ai-form-grid"><div class="form-group"><label>Alokasi Waktu (JP)</label><input type="text" id="kk_alokasi" class="form-control" value="36 JP"></div>' +
            '<div class="form-group"><label>Sesi Pertemuan</label><input type="text" id="kk_sesi" class="form-control" value="8 Sesi"></div></div>' +
            '<div class="form-group" style="margin-bottom:0;"><label>Kondisi Lingkungan</label><select id="kk_kondisiLingkungan" class="form-control">' +
                KONDISI_LINGKUNGAN.map(function(k) { return '<option value="' + k + '">' + k + '</option>'; }).join('') +
            '</select></div>' +
        '</div>' +
        '<div class="soal-form-section"><div class="soal-form-section-title"><i class="fas fa-layer-group"></i> E. Integrasi Mata Pelajaran</div>' +
            '<div class="mapel-chips-container" id="kk_mapelChips">' +
                MAPEL_INTEGRASI.map(function(m) { return '<label class="mapel-chip"><input type="checkbox" name="kk_mapel" value="' + m + '" onchange="handleMapelChange(this)"><span>' + m + '</span></label>'; }).join('') +
            '</div>' +
            '<div class="mapel-manual-input"><input type="text" id="kk_mapelManualInput" placeholder="Tambah mapel manual..." onkeypress="if(event.key===\'Enter\'){event.preventDefault();tambahMapelManual();}"><button type="button" onclick="tambahMapelManual()"><i class="fas fa-plus"></i></button></div>' +
            '<div class="mapel-tp-list" id="kk_mapelTPList"></div>' +
            '<div class="mapel-empty" id="kk_mapelEmpty"><i class="fas fa-info-circle"></i> Belum ada mapel terpilih.</div>' +
        '</div>' +
        '<div class="soal-form-section"><div class="soal-form-section-title"><i class="fas fa-lightbulb"></i> F. Topik Projek</div><div class="form-group" style="margin-bottom:0;"><label>Topik / Sub-Tema Spesifik</label><input type="text" id="kk_topik" class="form-control" placeholder="Contoh: Pengolahan Limbah Logam..."></div></div>' +
        '<div class="soal-form-section"><div class="soal-form-section-title"><i class="fas fa-align-left"></i> G. Deskripsi Singkat Projek</div><div class="form-group" style="margin-bottom:0;"><textarea id="kk_deskripsi" class="form-control" rows="3" placeholder="Kosongkan jika ingin AI kembangkan sendiri..."></textarea></div></div>' +
        buildActionButtons('kokurikuler') +
      '</div><div class="ai-output-container" id="ai-output-kokurikuler"></div></div>';

  autoFillGuruFields();
  restoreCPUploadFromState();
  attachKognitifListeners();
}

// =====================================================================
// SISA KODE DI BAWAH INI ADALAH FUNGSI ASLI DARI FILE KAMU
// (Fungsi render output, buildPanelHeader, buildActionButtons, dll)
// =====================================================================

function buildPanelHeader(title, subtitle, icon) {
  return '<div class="card ai-panel-header" style="background:#ecfdf5;border:1px solid #a7f3d0;padding:14px 18px;margin-bottom:14px;"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;"><div style="font-size:1.6em;color:var(--primary);"><i class="fas ' + icon + '"></i></div><div style="flex:1;min-width:200px;"><div style="font-size:14px;font-weight:800;color:var(--primary-dark);">' + title + '</div><div style="font-size:12px;color:#065f46;margin-top:2px;">' + subtitle + '</div></div></div></div>';
}
function buildActionButtons(fitur) {
  return '<div class="ai-form-actions"><button type="button" class="btn btn-primary ai-btn-generate" onclick="aiGuruSubmit(\'' + fitur + '\')"><i class="fas fa-magic"></i> Generate dengan AI</button><button type="button" class="btn btn-outline" onclick="aiGuruResetForm(\'' + fitur + '\')"><i class="fas fa-undo"></i> Reset Form</button></div>';
}
function buildActionButtonsProta() {
  return '<div class="ai-form-actions"><button type="button" class="btn btn-primary ai-btn-generate" onclick="aiGuruSubmit(\'prota\')"><i class="fas fa-magic"></i> Generate Prota & Promes dengan AI</button><button type="button" class="btn btn-outline" onclick="aiGuruResetForm(\'prota\')"><i class="fas fa-undo"></i> Reset Form</button></div>';
}
function buildActionButtonsSoal() {
  return '<div class="ai-form-actions"><button type="button" class="btn btn-primary ai-btn-generate" onclick="aiGuruSubmit(\'soal\')"><i class="fas fa-magic"></i> Buat Soal Otomatis</button><button type="button" class="btn btn-outline" onclick="aiGuruResetForm(\'soal\')"><i class="fas fa-undo"></i> Reset Form</button></div>';
}
function switchAITab(tabId) {
  aiGuruState.activeTab = tabId;
  document.querySelectorAll('.ai-tab-btn').forEach(function(btn) { btn.classList.toggle('active', btn.dataset.tab === tabId); });
  document.querySelectorAll('.ai-panel').forEach(function(panel) { panel.classList.add('hidden'); });
  var activePanel = document.getElementById('ai-panel-' + tabId);
  if (activePanel) activePanel.classList.remove('hidden');
}
function toggleUploadCP() {
  var checkbox = document.getElementById('pt_punyaFile');
  var container = document.getElementById('pt_uploadContainer');
  if (checkbox && container) container.style.display = checkbox.checked ? 'block' : 'none';
}
function handleCPUpload(input) {
  var nameSpan = document.getElementById('pt_fileCP_name');
  if (!nameSpan) return;
  if (input.files && input.files[0]) {
    var file = input.files[0];
    aiGuruState.cpFileObject = file; aiGuruState.cpFileName = file.name; aiGuruState.cpFileSize = file.size;
    nameSpan.textContent = '📎 ' + file.name;
  } else {
    aiGuruState.cpFileObject = null; aiGuruState.cpFileName = ''; aiGuruState.cpFileSize = 0;
    nameSpan.textContent = 'Belum ada file dipilih';
  }
}
function restoreCPUploadFromState() {
  if (!aiGuruState.cpFileName) return;
  var checkbox = document.getElementById('pt_punyaFile');
  var container = document.getElementById('pt_uploadContainer');
  var nameSpan = document.getElementById('pt_fileCP_name');
  if (checkbox) checkbox.checked = true;
  if (container) container.style.display = 'block';
  if (nameSpan) nameSpan.textContent = '📎 ' + aiGuruState.cpFileName;
}
function hitungTotalJP() {
  var mingguEl = document.getElementById('pt_mingguEfektif');
  var jpEl = document.getElementById('pt_jpPerMinggu');
  var displayEl = document.getElementById('pt_totalJPDisplay');
  if (!mingguEl || !jpEl || !displayEl) return;
  var minggu = parseInt(mingguEl.value, 10) || 0; var jp = parseInt(jpEl.value, 10) || 0;
  displayEl.innerHTML = minggu + ' minggu × ' + jp + ' JP = <strong>' + (minggu * jp) + ' JP</strong> per semester | <strong>' + (minggu * jp * 2) + ' JP</strong> per tahun';
}
function hitungTotalSoal() {
  var pg = parseInt(document.getElementById('so_jumlahPG').value, 10) || 0;
  var isian = parseInt(document.getElementById('so_jumlahIsian').value, 10) || 0;
  var esai = parseInt(document.getElementById('so_jumlahEsai').value, 10) || 0;
  var total = pg + isian + esai;
  document.getElementById('so_totalSoalDisplay').textContent = total;
  if (total > 30) { document.getElementById('so_totalWarning').style.display = 'block'; } else { document.getElementById('so_totalWarning').style.display = 'none'; }
}
function updateProporsi() {
  var mudah = parseInt(document.getElementById('so_propMudah').value, 10) || 0;
  var sedang = parseInt(document.getElementById('so_propSedang').value, 10) || 0;
  var sulit = parseInt(document.getElementById('so_propSulit').value, 10) || 0;
  var total = mudah + sedang + sulit;
  document.getElementById('so_valMudah').textContent = mudah + '%';
  document.getElementById('so_valSedang').textContent = sedang + '%';
  document.getElementById('so_valSulit').textContent = sulit + '%';
  var warn = document.getElementById('so_proporsiWarning');
  if (total === 100) { warn.className = 'proporsi-total-warning ok'; warn.innerHTML = '<i class="fas fa-check-circle"></i> Total: 100% — OK'; } 
  else { warn.className = 'proporsi-total-warning err'; warn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Total: ' + total + '% (auto 100%)'; }
}
function attachKognitifListeners() {
  ['so_kogC3','so_kogC4','so_kogC5','so_kogC6'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function() {
      var c5 = document.getElementById('so_kogC5').checked; var c6 = document.getElementById('so_kogC6').checked;
      document.getElementById('so_hotsWarning').style.display = (c5 || c6) ? 'block' : 'none';
    });
  });
}
function switchTemaTab(tab, btnEl) {
  document.querySelectorAll('.tema-tab-btn').forEach(function(b) { b.classList.remove('active'); }); btnEl.classList.add('active');
  document.getElementById('tema-panel-resmi').classList.toggle('active', tab === 'resmi');
  document.getElementById('tema-panel-khusus').classList.toggle('active', tab === 'khusus');
}
function handleTemaKhususInput() {
  var val = document.getElementById('kk_temaKhusus').value.trim();
  if (val.length > 0) { document.querySelectorAll('input[name="kk_tema"]').forEach(function(r) { r.checked = false; }); } 
  else { document.querySelector('input[name="kk_tema"]').checked = true; }
}
function handleDimensiChange(checkbox) {
  var checked = document.querySelectorAll('input[name="kk_dimensi"]:checked');
  if (checked.length > 3) { checkbox.checked = false; document.getElementById('kk_dimensiWarning').style.display = 'block'; setTimeout(function(){ document.getElementById('kk_dimensiWarning').style.display = 'none'; }, 3000); checked = document.querySelectorAll('input[name="kk_dimensi"]:checked'); }
  document.getElementById('kk_dimensiCounter').textContent = checked.length + ' / 3';
}
function handleMapelChange(checkbox) {
  var mapel = checkbox.value; var safeMapel = mapel.replace(/[^a-zA-Z0-9]/g, '_');
  var list = document.getElementById('kk_mapelTPList');
  if (checkbox.checked) {
    var card = document.createElement('div'); card.className = 'mapel-tp-card'; card.setAttribute('data-mapel', mapel); card.setAttribute('data-safe', safeMapel);
    card.innerHTML = '<div class="mapel-tp-header"><span class="mapel-tp-name"><i class="fas fa-book"></i> ' + escapeHtml(mapel) + '</span><button type="button" class="mapel-tp-remove" data-safe="' + safeMapel + '" onclick="this.parentNode.parentNode.remove(); document.querySelector(\'.mapel-chip input[value=\\\'' + mapel + '\\\']\').checked = false; updateMapelEmptyState();"><i class="fas fa-times"></i></button></div><div><label>Tujuan Pembelajaran</label><textarea name="kk_tp_' + safeMapel + '" data-mapel-original="' + mapel + '" data-safe="' + safeMapel + '"></textarea></div>';
    list.appendChild(card);
  } else {
    var existingCard = list.querySelector('[data-mapel="' + mapel + '"]'); if (existingCard) existingCard.remove();
  }
  updateMapelEmptyState();
}
function tambahMapelManual() {
  var input = document.getElementById('kk_mapelManualInput'); var val = (input.value || '').trim();
  if (!val) return;
  if (document.querySelector('.mapel-chip input[value="' + val + '"]')) return;
  var chip = document.createElement('label'); chip.className = 'mapel-chip'; chip.innerHTML = '<input type="checkbox" name="kk_mapel" value="' + val + '" checked onchange="handleMapelChange(this)"><span>' + val + '</span>';
  document.getElementById('kk_mapelChips').appendChild(chip);
  handleMapelChange(chip.querySelector('input')); input.value = '';
}
function updateMapelEmptyState() {
  var list = document.getElementById('kk_mapelTPList'); var emptyEl = document.getElementById('kk_mapelEmpty');
  emptyEl.style.display = list.querySelectorAll('.mapel-tp-card').length === 0 ? 'block' : 'none';
}

// GENERATE
function aiGuruSubmit(fitur) {
  if (aiGuruState.isLoading) aiGuruState.isLoading = false;
  var params = collectFormParams(fitur);
  if (!validateParams(fitur, params)) return;
  aiGuruState.isLoading = true; aiGuruState.lastFitur = fitur; aiGuruState.lastParams = params;
  var outputContainer = document.getElementById('ai-output-' + fitur);
  outputContainer.innerHTML = '<div class="card ai-loading-card"><div class="ai-loading-spinner"></div><div class="ai-loading-text"><i class="fas fa-magic"></i> AI sedang menyusun dokumen...</div><div class="ai-loading-subtext">Proses ini memakan waktu 60-90 detik.</div></div>';
  setFormButtonsDisabled(fitur, true);
  google.script.run.withSuccessHandler(function(result) { aiGuruState.isLoading = false; aiGuruState.lastResult = result; setFormButtonsDisabled(fitur, false); renderAIOutput(fitur, result); }).withFailureHandler(function(err) {
    aiGuruState.isLoading = false; setFormButtonsDisabled(fitur, false);
    outputContainer.innerHTML = '<div class="card" style="background:#fee2e2;padding:18px;"><div style="font-weight:800;color:#991b1b;"><i class="fas fa-exclamation-circle"></i> Error</div><div>' + err.message + '</div></div>';
  }).aiGuruGenerate(fitur, params);
}

function collectFormParams(fitur) {
  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function check(id) { var el = document.getElementById(id); return el ? el.checked : false; }
  if (fitur === 'prota') {
    var semesterList = []; if (check('pt_semesterGanjil')) semesterList.push('Ganjil'); if (check('pt_semesterGenap')) semesterList.push('Genap');
    return { namaGuru: val('pt_namaGuru'), nipGuru: val('pt_nipGuru'), sekolah: val('pt_sekolah'), mapel: val('pt_mapel'), jurusan: val('pt_jurusan'), fase: val('pt_fase'), kelas: val('pt_kelas'), tahunAjaran: val('pt_tahunAjaran'), semester: semesterList, kdCp: val('pt_kdCp'), cpFileName: aiGuruState.cpFileName, mingguEfektif: val('pt_mingguEfektif'), jpPerMinggu: val('pt_jpPerMinggu') };
  }
  if (fitur === 'modul_ajar') {
    var dimensiCheckedMA = []; document.querySelectorAll('#ai-panel-modul_ajar input[name^="dimensi_"]:checked').forEach(function(el) { dimensiCheckedMA.push(el.value); });
    return { namaGuru: val('ma_namaGuru'), nipGuru: val('ma_nipGuru'), tahunAjaran: val('ma_tahunAjaran'), jurusan: val('ma_jurusan'), fase: val('ma_fase'), kelas: val('ma_kelas'), mapel: val('ma_mapel'), materi: val('ma_materi'), jumlahPertemuan: val('ma_jumlahPertemuan'), alokasiPerPertemuan: val('ma_alokasiPerPertemuan'), modelPembelajaran: val('ma_modelPembelajaran'), targetPesertaDidik: val('ma_targetPesertaDidik'), kdCp: val('ma_kdCp'), kompetensiAwal: val('ma_kompetensiAwal'), tujuan: val('ma_tujuan'), saranaPrasarana: val('ma_saranaPrasarana'), dimensiLulusan: dimensiCheckedMA, versi: val('ma_versi') };
  }
  if (fitur === 'soal') {
    var levelKog = []; if (check('so_kogC3')) levelKog.push('C3'); if (check('so_kogC4')) levelKog.push('C4'); if (check('so_kogC5')) levelKog.push('C5'); if (check('so_kogC6')) levelKog.push('C6');
    return { namaGuru: val('so_namaGuru'), nipGuru: val('so_nipGuru'), sekolah: val('so_sekolah'), jurusan: val('so_jurusan'), mapel: val('so_mapel'), kelas: val('so_kelas'), tahunAjaran: val('so_tahunAjaran'), jenisAsesmen: val('so_jenisAsesmen'), alokasi: val('so_alokasi'), opsiPG: val('so_opsiPG'), jumlahPG: parseInt(val('so_jumlahPG')), jumlahIsian: parseInt(val('so_jumlahIsian')), jumlahEsai: parseInt(val('so_jumlahEsai')), totalSoal: parseInt(val('so_jumlahPG')) + parseInt(val('so_jumlahIsian')) + parseInt(val('so_jumlahEsai')), propMudah: val('so_propMudah'), propSedang: val('so_propSedang'), propSulit: val('so_propSulit'), levelKognitif: levelKog, pakaiIlustrasi: check('so_pakaiIlustrasi'), pakaiDiagram: check('so_pakaiDiagram'), pakaiPetaKonsep: check('so_pakaiPetaKonsep'), materi: val('so_materi'), kdCp: val('so_kdCp') };
  }
  if (fitur === 'kokurikuler') {
    var dimensiCheckedKK = []; document.querySelectorAll('#ai-panel-kokurikuler input[name="kk_dimensi"]:checked').forEach(function(el) { dimensiCheckedKK.push(el.value); });
    var temaResmi = ''; var radioChecked = document.querySelector('#ai-panel-kokurikuler input[name="kk_tema"]:checked'); if (radioChecked) temaResmi = radioChecked.value;
    var integrasiMapel = []; var mapelTP = {};
    document.querySelectorAll('#ai-panel-kokurikuler input[name="kk_mapel"]:checked').forEach(function(el) {
      var mapelName = el.value; var safeMapel = mapelName.replace(/[^a-zA-Z0-9]/g, '_'); integrasiMapel.push(mapelName);
      var tpTextarea = document.querySelector('#kk_mapelTPList textarea[data-safe="' + safeMapel + '"]'); mapelTP[mapelName] = tpTextarea ? tpTextarea.value.trim() : '';
    });
    return { namaGuru: val('kk_namaGuru'), sekolah: val('kk_sekolah'), kelas: val('kk_kelas'), tahunAjaran: val('kk_tahunAjaran'), tema: temaResmi, temaKhusus: val('kk_temaKhusus'), dimensi: dimensiCheckedKK, pendekatan: val('kk_pendekatan'), alokasi: val('kk_alokasi'), sesi: val('kk_sesi'), kondisiLingkungan: val('kk_kondisiLingkungan'), integrasiMapel: integrasiMapel, mapelTP: mapelTP, topik: val('kk_topik'), deskripsi: val('kk_deskripsi') };
  }
  return {};
}

function validateParams(fitur, params) {
  if (fitur === 'prota') { if (!params.mapel) { Swal.fire('Peringatan', 'Isi Mata Pelajaran!', 'warning'); return false; } }
  else if (fitur === 'modul_ajar') { if (!params.mapel || !params.materi) { Swal.fire('Peringatan', 'Isi Mapel & Materi!', 'warning'); return false; } }
  else if (fitur === 'soal') { if (!params.mapel || !params.materi) { Swal.fire('Peringatan', 'Isi Mapel & Materi!', 'warning'); return false; } }
  else if (fitur === 'kokurikuler') { if (!params.topik) { Swal.fire('Peringatan', 'Isi Topik Projek!', 'warning'); return false; } }
  return true;
}

function setFormButtonsDisabled(fitur, disabled) {
  var panel = document.getElementById('ai-panel-' + fitur); if (!panel) return;
  panel.querySelectorAll('.ai-form-actions button').forEach(function(b) { b.disabled = disabled; b.style.opacity = disabled ? '0.5' : '1'; });
}

function renderAIOutput(fitur, result) {
  var outputContainer = document.getElementById('ai-output-' + fitur); if (!outputContainer) return;
  if (!result) { outputContainer.innerHTML = '<div class="card" style="background:#fee2e2;padding:18px;">Response kosong.</div>'; return; }
  if (fitur === 'prota' && result.mode === 'ai') { renderProtaOutput(outputContainer, result); return; }
  if (fitur === 'soal' && result.mode === 'ai') { renderSoalOutput(outputContainer, result); return; }
  if (result.mode === 'ai' && result.html) {
    outputContainer.innerHTML = '<div class="card ai-result-card"><div class="ai-result-toolbar"><div class="ai-result-badge ai-badge-success"><i class="fas fa-check-circle"></i> Berhasil</div><div class="ai-result-actions"><button type="button" class="btn btn-primary btn-sm" onclick="aiGuruDownloadWord()"><i class="fas fa-download"></i> Download Word</button></div></div><div class="ai-result-preview" id="ai-result-preview">' + result.html + '</div></div>'; return;
  }
  outputContainer.innerHTML = '<div class="card" style="background:#fee2e2;padding:18px;"><div style="font-weight:800;color:#991b1b;">Gagal.</div><div>' + (result.message || '') + '</div></div>';
}

function renderProtaOutput(container, result) {
  var htmlProta = result.htmlProta || ''; var htmlPromes = result.htmlPromes || '';
  container.innerHTML = '<div class="card ai-result-card"><div class="ai-result-toolbar"><div class="ai-result-badge ai-badge-success"><i class="fas fa-check-circle"></i> Berhasil</div><div class="ai-result-actions"><button type="button" class="btn btn-primary btn-sm" onclick="aiGuruDownloadProta()"><i class="fas fa-download"></i> Download Prota</button><button type="button" class="btn btn-primary btn-sm" onclick="aiGuruDownloadPromes()"><i class="fas fa-download"></i> Download Promes</button></div></div><div class="preview-subtabs"><button type="button" class="preview-subtab-btn active" onclick="switchPreviewTab(\'prota\', this)">Prota</button><button type="button" class="preview-subtab-btn" onclick="switchPreviewTab(\'promes\', this)">Promes</button></div><div class="ai-result-preview" id="preview-prota">' + htmlProta + '</div><div class="ai-result-preview hidden" id="preview-promes">' + htmlPromes + '</div></div>';
}
function switchPreviewTab(tab, btn) {
  document.querySelectorAll('.preview-subtab-btn').forEach(function(b){ b.classList.remove('active'); }); btn.classList.add('active');
  document.getElementById('preview-prota').classList.toggle('hidden', tab !== 'prota'); document.getElementById('preview-promes').classList.toggle('hidden', tab !== 'promes');
}

function renderSoalOutput(container, result) {
  var html = result.html || '';
  container.innerHTML = '<div class="card ai-result-card"><div class="ai-result-toolbar"><div class="ai-result-badge ai-badge-success"><i class="fas fa-check-circle"></i> Berhasil</div><div class="ai-result-actions"><button type="button" class="btn btn-primary btn-sm" onclick="aiGuruDownloadWord()"><i class="fas fa-download"></i> Download Word</button></div></div><div class="ai-result-preview">' + html + '</div></div>';
}

// Download Word (Menggunakan htmlDocx)
function aiGuruDownloadWord() {
  if (!aiGuruState.lastResult || !aiGuruState.lastResult.html) return Swal.fire('Error','Dokumen kosong','error');
  var baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace(/\/$/, '');
  var headerLogo = '<div style="text-align:center; margin-bottom:20px;"><img src="' + baseUrl + '/logo.png" width="94" height="115" style="width:2.5cm;height:3.05cm;" /></div>';
  var docHtml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>body{font-family:"Times New Roman",serif;font-size:12pt;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid black;padding:5px;}</style></head><body>' + headerLogo + aiGuruState.lastResult.html + '</body></html>';
  var blob = htmlDocx.asBlob(docHtml); var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'Dokumen.docx'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
function aiGuruDownloadProta() {
  if (!aiGuruState.lastResult || !aiGuruState.lastResult.htmlProta) return;
  var baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace(/\/$/, '');
  var headerLogo = '<div style="text-align:center; margin-bottom:20px;"><img src="' + baseUrl + '/logo.png" width="94" height="115" style="width:2.5cm;height:3.05cm;" /></div>';
  var docHtml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>' + headerLogo + aiGuruState.lastResult.htmlProta + '</body></html>';
  var blob = htmlDocx.asBlob(docHtml); var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'Prota.docx'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}
function aiGuruDownloadPromes() {
  if (!aiGuruState.lastResult || !aiGuruState.lastResult.htmlPromes) return;
  var baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace(/\/$/, '');
  var headerLogo = '<div style="text-align:center; margin-bottom:20px;"><img src="' + baseUrl + '/logo.png" width="94" height="115" style="width:2.5cm;height:3.05cm;" /></div>';
  var docHtml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>' + headerLogo + aiGuruState.lastResult.htmlPromes + '</body></html>';
  var blob = htmlDocx.asBlob(docHtml); var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'Promes.docx'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function aiGuruResetForm(fitur) { if (!confirm('Reset form?')) return; location.reload(); }

/* ⭐ FIX: Memaksa checkbox agar rapi meskipun berada di dalam form-group */
.ai-checkbox-grid label.ai-checkbox-item {
    display: flex !important;
    align-items: center !important;
    margin-bottom: 0 !important;
    text-transform: none !important;
    letter-spacing: 0 !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    color: #334155 !important;
}
