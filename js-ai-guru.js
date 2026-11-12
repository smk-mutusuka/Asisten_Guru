// ⚠️ GANTI DENGAN URL WEB APP APPS SCRIPT KAMU
var BACKEND_URL = 'https://script.google.com/macros/s/AKfycbyUAYG8PVKtXEOI-NrlmNMR_qk2oNm-0t2Ju0TSohz4-cbqnfUJtjaQyGOJm-Hqx9lh/exec';

// =============================================
// JEMBATAN BACKEND
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
// UI LOGIN & TAB (SUDAH DIPERBAIKI)
// =============================================
function switchLoginTab(role) {
  // Sembunyikan semua form & hapus status aktif
  document.getElementById('loginFormAdmin').classList.add('hidden');
  document.getElementById('loginFormGtk').classList.add('hidden');
  document.getElementById('tab-btn-admin').classList.remove('active');
  document.getElementById('tab-btn-gtk').classList.remove('active');

  // Tampilkan yang dipilih
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
  var u = document.getElementById('admin_user').value.trim();
  var p = document.getElementById('admin_pass').value;
  
  showLoading();
  google.script.run.withSuccessHandler(function(res) {
    hideLoading();
    if (res.status) {
      currentUser = { Nama_GTK: res.username, NBM: '-' };
      masukKeApp(res.username);
      initAIGuruPageAdmin();
    }
  }).withFailureHandler(function(err) {
    hideLoading(); Swal.fire({ icon: 'error', title: 'Login Admin Gagal', text: err.message });
  }).doLogin(u, p); // Memanggil fungsi Admin
}

function handleLoginGTK(e) {
  e.preventDefault();
  var nbm = document.getElementById('gtk_nbm').value.trim();
  var pass = document.getElementById('gtk_pass').value.trim();
  
  showLoading();
  google.script.run.withSuccessHandler(function(res) {
    hideLoading();
    if (res.status) {
      currentUser = res.gtk;
      masukKeApp(res.gtk.Nama_GTK);
      initAIGuruPage();
    }
  }).withFailureHandler(function(err) {
    hideLoading(); Swal.fire({ icon: 'error', title: 'Login GTK Gagal', text: err.message });
  }).doGtkLogin(nbm, pass); // Memanggil fungsi GTK
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

function showLoading() { document.getElementById('global-loader').classList.remove('hidden'); }
function hideLoading() { document.getElementById('global-loader').classList.add('hidden'); }

// =========================================================================
// ⬇️ KODE ASLI FORM AI GURU (Sesuai file awalmu)
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
  if (!currentUser || !currentUser.Nama_GTK) return { nama: "", nbm: "" };
  return { nama: currentUser.Nama_GTK || "", nbm: currentUser.NBM || "" };
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

function initAIGuruPage() { renderAIGuruPage(); }
function initAIGuruPageAdmin() { renderAIGuruPage(); }

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
    
    // PANEL PROTA
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

    // PANEL MODUL AJAR
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
            '<div class="form-group"><label>Dimensi Profil Lulusan (pilih 2-3)</label></div><div class="ai-checkbox-grid">' + dimensiCheckboxes + '</div>' +
            '<div class="form-group" style="margin-top:15px;"><label>Versi Modul</label><select id="ma_versi" class="form-control"><option value="ringkas">Ringkas</option><option value="lengkap" selected>Lengkap</option></select></div>' +
        '</div>' +
        buildActionButtons('modul_ajar') +
      '</div><div class="ai-output-container" id="ai-output-modul_ajar"></div></div>' +

    // PANEL SOAL
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

    // PANEL KOKURIKULER
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
            '<div class="tema-tabs"><button
