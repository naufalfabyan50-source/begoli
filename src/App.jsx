// src/SetoranGmail.jsx

import React, { useState, useEffect, useCallback } from "react";
import { getUsers, createUser } from "./users.js";
import { getEmails, createEmailEntry, updateEmailStatus } from "./emails.js";
import { getSessions, createSession, updateSessionStatus } from "./sessions.js";
import { getPayments, createPayment, updatePaymentStatus } from "./payments.js";

// Daftar nama Indonesia asli untuk Generator Profile realistis
const ID_FIRST_NAMES = ["Budi", "Siti", "Agus", "Dewi", "Andi", "Sari", "Eko", "Mega", "Roni", "Lina", "Heri", "Yanti", "Dedi", "Sri", "Joko", "Rian", "Anisa", "Rudi", "Fitri", "Tono"];
const ID_LAST_NAMES = ["Prasetyo", "Wulandari", "Santoso", "Kurniawan", "Saputra", "Lestari", "Wijaya", "Hidayat", "Siregar", "Harahap", "Utami", "Nugroho", "Setiawan", "Pratiwi", "Putra"];

export default function SetoranGmail() {
  // --- Auth States ---
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [loginUser, setLoginUser] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // --- Active Tab States ---
  const [activeTab, setActiveTab] = useState("generate"); // generate | setoran | payment | admin-session | admin-payment
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Live Data States ---
  const [sessions, setSessions] = useState([]);
  const [emails, setEmails] = useState([]);
  const [payments, setPayments] = useState([]);

  // --- Email Generator States ---
  const [generateQty, setGenerateQty] = useState(10);
  const [generatedProfiles, setGeneratedProfiles] = useState([]);

  // --- Setoran States & Popup ---
  const [selectedSessionName, setSelectedSessionName] = useState("");
  const [inputEmailsText, setInputEmailsText] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [danaInputNumber, setDanaInputNumber] = useState("");

  // --- Admin Session Creator States ---
  const [newSessName, setNewSessName] = useState("");
  const [sDay, setSDay] = useState(1);
  const [sMonth, setSMonth] = useState(5);
  const [sYear, setSYear] = useState(2026);
  const [sHour, setSHour] = useState(8);
  const [sMin, setSMin] = useState(0);

  const [eDay, setEDay] = useState(10);
  const [eMonth, setEMonth] = useState(5);
  const [eYear, setEYear] = useState(2026);
  const [eHour, setEHour] = useState(23);
  const [eMin, setEMin] = useState(59);
  const [sessStatus, setSessStatus] = useState("Aktif");

  // --- Admin Session Detail State ---
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);

  // --- Load Data on Mount ---
  useEffect(() => {
    setSessions(getSessions());
    setEmails(getEmails());
    setPayments(getPayments());

    const savedUser = localStorage.getItem("sgm_current_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Set default session selection saat sessions berhasil diload
  useEffect(() => {
    const active = sessions.find(s => s.status === "Aktif");
    if (active) {
      setSelectedSessionName(active.name);
    } else if (sessions.length > 0) {
      setSelectedSessionName(sessions[0].name);
    }
  }, [sessions]);

  // --- Sync local storage data changes ---
  const refreshData = () => {
    setSessions(getSessions());
    setEmails(getEmails());
    setPayments(getPayments());
  };

  // --- Register Action ---
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const newUser = createUser(regUsername, regEmail, regPassword);
      setCurrentUser(newUser);
      localStorage.setItem("sgm_current_user", JSON.stringify(newUser));
      setRegUsername("");
      setRegEmail("");
      setRegPassword("");
    } catch (err) {
      setAuthError(err.message);
    }
  };

  // --- Login Action ---
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError("");

    // Admin Credentials
    if (
      (loginUser.toLowerCase() === "superadmin" || loginUser.toLowerCase() === "qwerty@admin.com") &&
      loginPassword === "superadmin"
    ) {
      const adminObj = {
        id: "admin",
        username: "SuperAdmin",
        email: "qwerty@admin.com",
        role: "admin"
      };
      setCurrentUser(adminObj);
      localStorage.setItem("sgm_current_user", JSON.stringify(adminObj));
      setLoginUser("");
      setLoginPassword("");
      return;
    }

    // User Credentials
    const users = getUsers();
    const matched = users.find(
      u =>
        (u.username.toLowerCase() === loginUser.toLowerCase() ||
          u.email.toLowerCase() === loginUser.toLowerCase()) &&
        u.password === loginPassword
    );

    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem("sgm_current_user", JSON.stringify(matched));
      setLoginUser("");
      setLoginPassword("");
    } else {
      setAuthError("Kombinasi login salah atau tidak terdaftar.");
    }
  };

  // --- Logout Action ---
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("sgm_current_user");
    setActiveTab("generate");
  };

  // --- Clipboard Helper ---
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    alert("Berhasil disalin ke clipboard!");
  };

  // --- Profile Generator Logic ---
  const generateEmailsList = () => {
    const qty = Math.min(Math.max(Number(generateQty) || 1, 1), 100);
    const temp = [];
    for (let i = 0; i < qty; i++) {
      const first = ID_FIRST_NAMES[Math.floor(Math.random() * ID_FIRST_NAMES.length)];
      const last = ID_LAST_NAMES[Math.floor(Math.random() * ID_LAST_NAMES.length)];
      const fullName = `${first} ${last}`;
      const birthYear = Math.floor(Math.random() * (2000 - 1995 + 1)) + 1995;
      const serial = Math.floor(Math.random() * 90 + 10);
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${birthYear}${serial}@gmail.com`;
      const pass = Math.random().toString(36).substring(2, 10) + "A1!";
      
      temp.push({ fullName, birthYear, gender: "Tidak diketahui", email, password: pass });
    }
    setGeneratedProfiles(temp);
  };

  // Format Text untuk "SALIN SEMUA DATA"
  const getFullDataString = () => {
    return generatedProfiles
      .map(
        p =>
          `Nama: ${p.fullName}\nTahun Lahir: ${p.birthYear}\nGender: ${p.gender}\nEmail: ${p.email}\nPassword: ${p.password}\n`
      )
      .join("\n--------------------\n");
  };

  // Format Text untuk "SALIN SEMUA" (Sesuai ketentuan format output list email)
  const getEmailsOutputString = () => {
    const listEmails = generatedProfiles.map(p => p.email).join(" ");
    return `LIST EMAIL ANDA\n${listEmails}\n\nRULES: Nama bebas nama orang Indonesia Tahun 1995-2000 Gender tidak diketahui Email harus sesuai nama akun`;
  };

  // --- Deposit (Setoran) Form Handlers ---
  const handleOpenSetoranConfirm = (e) => {
    e.preventDefault();
    if (!inputEmailsText.trim()) {
      alert("Masukkan daftar email terlebih dahulu.");
      return;
    }
    setShowConfirmPopup(true);
  };

  const handleProcessSetoran = () => {
    if (!danaInputNumber.trim()) {
      alert("Masukkan nomor DANA Anda.");
      return;
    }

    try {
      // Ekstrak string menjadi array alamat email
      const regexEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const foundEmails = inputEmailsText.match(regexEmail) || [];

      if (foundEmails.length === 0) {
        throw new Error("Tidak ada alamat email valid yang ditemukan.");
      }

      foundEmails.forEach(email => {
        createEmailEntry(currentUser.id, email, selectedSessionName);
      });

      alert(`Berhasil menyetorkan ${foundEmails.length} email.`);
      setInputEmailsText("");
      setShowConfirmPopup(false);
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Dynamic Pricing & Balance System ---
  const userAccEmailsCount = emails.filter(
    e => e.userId === currentUser?.id && e.status === "ACC"
  ).length;

  const calculateUserTierPrice = (count) => {
    if (count <= 25) return 2000;
    if (count <= 50) return 2500;
    return 3000;
  };

  const currentTierPrice = calculateUserTierPrice(userAccEmailsCount);
  const totalBalance = userAccEmailsCount * currentTierPrice;

  // Cek Status Request Penarikan Terakhir User
  const userPayments = payments.filter(p => p.userId === currentUser?.id);
  const latestPayment = userPayments[userPayments.length - 1];

  // Action Withdraw oleh User
  const handleRequestWithdraw = () => {
    const nomorDana = prompt("Masukkan nomor DANA Anda untuk penarikan:");
    if (!nomorDana) return;

    try {
      createPayment(currentUser.id, currentUser.username, totalBalance, nomorDana);
      alert("Pengajuan penarikan dana berhasil dibuat.");
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Admin Session Creation ---
  const handleCreateSessionSubmit = (e) => {
    e.preventDefault();
    try {
      createSession(
        newSessName,
        sDay, sMonth, sYear,
        sHour, sMin,
        eDay, eMonth, eYear,
        eHour, eMin,
        sessStatus
      );
      alert("Sesi baru berhasil dibuat.");
      setNewSessName("");
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Admin Session Actions ---
  const handleUpdateSessionStatus = (id, status) => {
    updateSessionStatus(id, status);
    refreshData();
    if (selectedSessionDetail && selectedSessionDetail.id === id) {
      setSelectedSessionDetail(prev => ({ ...prev, status }));
    }
  };

  // --- Admin Action: Approve / Reject Payment ---
  const handleAdminPaymentAction = (id, status) => {
    updatePaymentStatus(id, status);
    refreshData();
  };

  // --- Admin Action: ACC / DENIED Individu Gmail (Di dalam Detail Sesi) ---
  const handleUpdateGmailStatus = (id, status) => {
    updateEmailStatus(id, status);
    refreshData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 🟢 TOP NAVIGATION BAR */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
                SetoranGmail
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-4">
              {currentUser && (
                <>
                  <button
                    onClick={() => setActiveTab("generate")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      activeTab === "generate" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    Generate Email
                  </button>
                  <button
                    onClick={() => setActiveTab("setoran")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      activeTab === "setoran" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    Setoran
                  </button>
                  <button
                    onClick={() => setActiveTab("payment")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      activeTab === "payment" ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    Status Pembayaran
                  </button>

                  {/* Admin Specific Tabs */}
                  {currentUser.role === "admin" && (
                    <>
                      <button
                        onClick={() => { setActiveTab("admin-session"); setSelectedSessionDetail(null); }}
                        className={`px-3 py-2 rounded-md text-sm font-medium border border-indigo-500/30 transition ${
                          activeTab === "admin-session" ? "bg-violet-600 text-white" : "text-violet-300 hover:bg-violet-955/30"
                        }`}
                      >
                        🔧 Sesi Admin
                      </button>
                      <button
                        onClick={() => setActiveTab("admin-payment")}
                        className={`px-3 py-2 rounded-md text-sm font-medium border border-indigo-500/30 transition ${
                          activeTab === "admin-payment" ? "bg-violet-600 text-white" : "text-violet-300 hover:bg-violet-955/30"
                        }`}
                      >
                        💰 Request Payment
                      </button>
                    </>
                  )}

                  <div className="border-l border-slate-700 h-6 mx-2"></div>
                  <span className="text-slate-400 text-sm font-mono mr-2">
                    {currentUser.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-955/40 text-red-400 border border-red-900/40 px-3 py-1.5 rounded-md text-sm hover:bg-red-900/60 transition"
                  >
                    Keluar
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              {currentUser && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                >
                  <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && currentUser && (
          <div className="md:hidden bg-slate-900 px-2 pt-2 pb-4 space-y-1 border-t border-slate-800">
            <button
              onClick={() => { setActiveTab("generate"); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-slate-800"
            >
              Generate Email
            </button>
            <button
              onClick={() => { setActiveTab("setoran"); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-slate-800"
            >
              Setoran
            </button>
            <button
              onClick={() => { setActiveTab("payment"); setMobileMenuOpen(false); }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-slate-800"
            >
              Status Pembayaran
            </button>
            {currentUser.role === "admin" && (
              <>
                <button
                  onClick={() => { setActiveTab("admin-session"); setSelectedSessionDetail(null); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-violet-300 hover:bg-slate-800"
                >
                  🔧 Sesi Admin
                </button>
                <button
                  onClick={() => { setActiveTab("admin-payment"); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-violet-300 hover:bg-slate-800"
                >
                  💰 Request Payment
                </button>
              </>
            )}
            <div className="border-t border-slate-800 my-2 pt-2 flex items-center justify-between px-3">
              <span className="text-sm font-mono text-slate-400">{currentUser.username}</span>
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="bg-red-900/40 text-red-300 px-3 py-1 rounded text-sm"
              >
                Keluar
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 🔵 CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 🔒 NOT LOGGED IN PAGE */}
        {!currentUser && (
          <div className="max-w-md mx-auto mt-12 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">SetoranGmail</h2>
              <p className="mt-2 text-sm text-slate-400">
                {authMode === "login" ? "Masuk ke panel kerja Anda" : "Daftarkan akun kerja baru Anda"}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700/50 text-red-200 text-sm rounded-lg">
                ⚠️ {authError}
              </div>
            )}

            {authMode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Username / Email
                  </label>
                  <input
                    type="text"
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    placeholder="Contoh: budi123"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition"
                >
                  Masuk Akun
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={() => { setAuthMode("register"); setAuthError(""); }}
                    className="text-indigo-400 hover:underline font-semibold"
                  >
                    Daftar Baru
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Username unik
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    placeholder="budi123"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    placeholder="budi@domain.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                    Password (min. 6 karakter)
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition"
                >
                  Buat Akun & Masuk
                </button>
                <p className="text-center text-xs text-slate-400 mt-4">
                  Sudah memiliki akun?{" "}
                  <button
                    type="button"
                    onClick={() => { setAuthMode("login"); setAuthError(""); }}
                    className="text-indigo-400 hover:underline font-semibold"
                  >
                    Masuk di sini
                  </button>
                </p>
              </form>
            )}
          </div>
        )}

        {/* 🔐 WORKSPACE (LOGGED IN ONLY) */}
        {currentUser && (
          <div className="space-y-8">

            {/* TAB: GENERATE EMAIL */}
            {activeTab === "generate" && (
              <div className="space-y-8">
                
                {/* 💳 PREMIUM CARD: LIST PRICE */}
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-955 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                  <h3 className="text-lg font-bold uppercase tracking-wider text-indigo-300 mb-4">
                    💎 List Price Rate Pembayaran
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Skala Rendah</span>
                      <span className="text-2xl font-extrabold text-white mt-1">Rp 2.000 <span className="text-xs font-normal text-slate-400">/ ACC</span></span>
                      <p className="text-xs text-indigo-400 mt-2 font-medium">Pengumpulan 1 - 25 Gmail</p>
                    </div>
                    <div className="bg-slate-900/80 border border-indigo-500/40 p-4 rounded-xl flex flex-col justify-between shadow-lg relative">
                      <span className="absolute -top-2.5 right-3 bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">Sering Dipakai</span>
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Skala Menengah</span>
                      <span className="text-2xl font-extrabold text-indigo-300 mt-1">Rp 2.500 <span className="text-xs font-normal text-slate-400">/ ACC</span></span>
                      <p className="text-xs text-indigo-300 mt-2 font-medium">Pengumpulan 26 - 50 Gmail</p>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
                      <span className="text-xs text-slate-400 uppercase font-bold tracking-widest">Skala Premium</span>
                      <span className="text-2xl font-extrabold text-white mt-1">Rp 3.000 <span className="text-xs font-normal text-slate-400">/ ACC</span></span>
                      <p className="text-xs text-indigo-400 mt-2 font-medium">Pengumpulan 51 - 100 Gmail</p>
                    </div>
                  </div>
                </div>

                {/* 📋 RULES GMAIL CARD & GENERATOR */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Rules Panel */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md h-fit">
                    <h3 className="text-md font-bold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      ⚠️ Rules Gmail Wajib Dipenuhi
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-300">
                      <li className="flex items-start gap-2.5">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>Nama bebas</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>Gunakan nama orang Indonesia asli yang sopan</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>Tahun lahir diatur antara 1995 - 2000</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>Gender: Tidak diketahui</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>Email wajib serupa dengan nama akun asli</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>Hindari pembuatan nama random yang tidak jelas</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-amber-500 font-bold mt-0.5">•</span>
                        <span>Jangan menyelipkan karakter simbol yang aneh</span>
                      </li>
                    </ul>
                  </div>

                  {/* Generator Panel */}
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Generate Data Profile Akun Gmail</h3>
                      <p className="text-xs text-slate-400">Bantu buatkan data dummy pendukung untuk memudahkan pembuatan email baru Anda.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Jumlah Data Gmail</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={generateQty}
                          onChange={(e) => setGenerateQty(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          placeholder="Jumlah"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={generateEmailsList}
                          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-200"
                        >
                          Generate Sekarang
                        </button>
                      </div>
                    </div>

                    {generatedProfiles.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                          <span className="text-sm font-bold text-white uppercase tracking-wider font-sans">Hasil Generate Profile</span>
                          <button
                            onClick={() => copyText(getFullDataString())}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 font-medium transition"
                          >
                            📋 Salin Semua Data Lengkap
                          </button>
                        </div>

                        {/* Profiles Grid */}
                        <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-800 bg-slate-950 rounded-xl p-3">
                          {generatedProfiles.map((p, idx) => (
                            <div key={idx} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1">
                              <div className="flex justify-between font-bold text-indigo-400">
                                <span>{p.fullName}</span>
                                <span className="text-slate-500">Th. {p.birthYear}</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-slate-300">
                                <div>Email: <span className="font-mono text-white">{p.email}</span></div>
                                <div>Sandi: <span className="font-mono text-white">{p.password}</span></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Output format requested */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">List Email Anda</h4>
                            <button
                              onClick={() => copyText(getEmailsOutputString())}
                              className="text-indigo-400 hover:text-indigo-300 text-xs font-bold"
                            >
                              Salin Format Khusus
                            </button>
                          </div>
                          <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 space-y-2 select-all">
                            <p className="font-bold text-slate-400 uppercase">LIST EMAIL ANDA</p>
                            <p className="text-white text-sm whitespace-normal break-all leading-relaxed">
                              {generatedProfiles.map(p => p.email).join(" ")}
                            </p>
                            <p className="text-slate-400 mt-2 text-[10px] italic">
                              RULES: Nama bebas nama orang Indonesia Tahun 1995-2000 Gender tidak diketahui Email harus sesuai nama akun
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => copyText(getEmailsOutputString())}
                            className="w-full bg-indigo-900/40 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900/60 font-semibold py-2 rounded-lg transition"
                          >
                            SALIN SEMUA
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SETORAN */}
            {activeTab === "setoran" && (
              <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Penyetoran Akun Gmail</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Kirimkan daftar email yang sudah Anda buat sesuai syarat untuk diperiksa admin.
                  </p>
                </div>

                <form onSubmit={handleOpenSetoranConfirm} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Pilih Sesi Penyetoran
                    </label>
                    <select
                      value={selectedSessionName}
                      onChange={(e) => setSelectedSessionName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      {sessions.map((s, idx) => (
                        <option key={idx} value={s.name} disabled={s.status !== "Aktif"}>
                          {s.name} ({s.status})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1">Email hanya dapat disetor ke Sesi yang berstatus Aktif.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                      Masukkan List Gmail
                    </label>
                    <textarea
                      required
                      rows="8"
                      value={inputEmailsText}
                      onChange={(e) => setInputEmailsText(e.target.value)}
                      placeholder="budi.prasetyo1995@gmail.com&#10;siti.wulandari1998@gmail.com&#10;agus.santoso1997@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-4 text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    ></textarea>
                    <span className="text-xs text-slate-500">Anda dapat memisahkan setiap alamat email dengan spasi atau baris baru.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
                  >
                    Setorkan Gmail
                  </button>
                </form>

                {/* 💳 CONFIRMATION PAYMENT POPUP (MODAL MODERN) */}
                {showConfirmPopup && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
                      <div className="border-b border-slate-800 pb-3">
                        <h4 className="text-lg font-bold text-amber-400 uppercase tracking-wide">
                          KONFIRMASI PAYMENT
                        </h4>
                      </div>
                      
                      <div className="space-y-4 text-sm text-slate-300">
                        <div className="flex justify-between border-b border-slate-800/60 pb-2">
                          <span className="text-slate-400">Wallet:</span>
                          <span className="font-bold text-white text-right">DANA ONLY</span>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                            Nomor DANA Anda
                          </label>
                          <input
                            type="text"
                            required
                            value={danaInputNumber}
                            onChange={(e) => setDanaInputNumber(e.target.value)}
                            placeholder="Contoh: 08123456789"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-lg text-xs leading-relaxed text-slate-400">
                          <span className="font-semibold text-amber-500">Keterangan:</span> Sistem pembayaran langsung diproses setelah Gmail di ACC oleh pihak admin.
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => setShowConfirmPopup(false)}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg transition"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleProcessSetoran}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition"
                        >
                          Lanjutkan Setor
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: USER PAYMENT STATUS */}
            {activeTab === "payment" && (
              <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">Akumulasi Hasil Penyetoran</h3>
                  <p className="text-xs text-slate-400 mt-1">Pantau total email ACC, rate bayaran, dan ajukan penarikan ke saldo wallet.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Total Email di ACC</span>
                    <p className="text-3xl font-black text-white mt-1">{userAccEmailsCount} Gmail</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Saldo Terkumpul</span>
                    <p className="text-3xl font-black text-emerald-400 mt-1">Rp {totalBalance.toLocaleString()}</p>
                    <span className="text-[10px] text-slate-500">Tier rate saat ini: Rp {currentTierPrice} / email</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-6">
                  {latestPayment ? (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <span className="text-sm font-bold text-slate-300">Status Request Terakhir</span>
                        {latestPayment.status === "PENDING" && (
                          <span className="bg-amber-955 text-amber-300 text-xs px-2 py-0.5 rounded border border-amber-900 w-fit">
                            Menunggu admin memproses pembayaran.
                          </span>
                        )}
                        {latestPayment.status === "ACC" && (
                          <span className="bg-emerald-955 text-emerald-300 text-xs px-2 py-0.5 rounded border border-emerald-900 w-fit">
                            Pembayaran berhasil.
                          </span>
                        )}
                        {latestPayment.status === "TOLAK" && (
                          <span className="bg-red-955 text-red-300 text-xs px-2 py-0.5 rounded border border-red-900 w-fit">
                            Pembayaran ditolak.
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                        <div>Jumlah: <span className="font-bold text-slate-200">Rp {latestPayment.totalAmount.toLocaleString()}</span></div>
                        <div>Tujuan DANA: <span className="font-mono text-slate-200">{latestPayment.danaNumber}</span></div>
                        <div>Tanggal: <span className="text-slate-200">{latestPayment.dateRequested}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-400 text-center py-4">Belum ada pengajuan pembayaran aktif.</p>
                      <button
                        onClick={handleRequestWithdraw}
                        disabled={totalBalance <= 0}
                        className={`w-full py-3 rounded-lg font-semibold transition ${
                          totalBalance > 0 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        Ajukan Penarikan Dana (Withdraw)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: ADMIN WORKSPACE (🔧 ONLY VISIBLE TO ADMIN) */}
            {activeTab === "admin-session" && currentUser.role === "admin" && (
              <div className="space-y-8">
                
                {/* Switch back dari detail */}
                {selectedSessionDetail ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedSessionDetail(null)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg transition font-bold"
                        >
                          ← KEMBALI
                        </button>
                        <h3 className="text-xl font-bold text-white">Detail {selectedSessionDetail.name}</h3>
                      </div>
                      <span className="bg-indigo-955 text-indigo-300 border border-indigo-900 text-xs px-2.5 py-1 rounded-full font-bold w-fit">
                        Status: {selectedSessionDetail.status}
                      </span>
                    </div>

                    {/* Dashboard Detail */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* List Email ACC */}
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">List Email ACC</span>
                          <button
                            onClick={() => {
                              const accList = emails
                                .filter(e => e.sessionName === selectedSessionDetail.name && e.status === "ACC")
                                .map(e => e.email)
                                .join(" ");
                              copyText(accList || "Tidak ada email ACC");
                            }}
                            className="text-xs text-indigo-400 hover:underline"
                          >
                            Salin ACC
                          </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
                          {emails.filter(e => e.sessionName === selectedSessionDetail.name && e.status === "ACC").length === 0 ? (
                            <span className="text-slate-500">Kosong</span>
                          ) : (
                            emails
                              .filter(e => e.sessionName === selectedSessionDetail.name && e.status === "ACC")
                              .map((e, i) => <div key={i} className="text-emerald-300 break-all">{e.email}</div>)
                          )}
                        </div>
                      </div>

                      {/* List Email DENIED */}
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-red-400">List Email DENIED</span>
                          <button
                            onClick={() => {
                              const deniedList = emails
                                .filter(e => e.sessionName === selectedSessionDetail.name && e.status === "DENIED")
                                .map(e => e.email)
                                .join(" ");
                              copyText(deniedList || "Tidak ada email DENIED");
                            }}
                            className="text-xs text-indigo-400 hover:underline"
                          >
                            Salin DENIED
                          </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
                          {emails.filter(e => e.sessionName === selectedSessionDetail.name && e.status === "DENIED").length === 0 ? (
                            <span className="text-slate-500">Kosong</span>
                          ) : (
                            emails
                              .filter(e => e.sessionName === selectedSessionDetail.name && e.status === "DENIED")
                              .map((e, i) => <div key={i} className="text-red-300 break-all">{e.email}</div>)
                          )}
                        </div>
                      </div>

                      {/* List User Peserta */}
                      <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">List User Peserta</span>
                        <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
                          {Array.from(
                            new Set(
                              emails
                                .filter(e => e.sessionName === selectedSessionDetail.name)
                                .map(e => {
                                  const u = getUsers().find(usr => usr.id === e.userId);
                                  return u ? u.username : "Unknown";
                                })
                            )
                          ).length === 0 ? (
                            <span className="text-slate-500">Belum ada peserta</span>
                          ) : (
                            Array.from(
                              new Set(
                                emails
                                  .filter(e => e.sessionName === selectedSessionDetail.name)
                                  .map(e => {
                                    const u = getUsers().find(usr => usr.id === e.userId);
                                    return u ? u.username : "Unknown";
                                  })
                              )
                            ).map((name, i) => <div key={i} className="text-indigo-300">{name}</div>)
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Panel Interaktif Pengelolaan Gmail Masuk */}
                    <div className="border-t border-slate-800 pt-6">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Verifikasi Email Masuk</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 uppercase">
                              <th className="py-2">User</th>
                              <th className="py-2">Gmail Address</th>
                              <th className="py-2">Status</th>
                              <th className="py-2 text-right">Aksi Verifikasi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emails.filter(e => e.sessionName === selectedSessionDetail.name).length === 0 ? (
                              <tr>
                                <td colSpan="4" className="py-4 text-center text-slate-500">Tidak ada data setoran dalam sesi ini.</td>
                              </tr>
                            ) : (
                              emails
                                .filter(e => e.sessionName === selectedSessionDetail.name)
                                .map((em, idx) => {
                                  const u = getUsers().find(usr => usr.id === em.userId);
                                  return (
                                    <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-900/60">
                                      <td className="py-3 font-mono text-slate-300">{u ? u.username : "Unknown"}</td>
                                      <td className="py-3 font-mono text-white">{em.email}</td>
                                      <td className="py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                          em.status === "ACC" ? "bg-emerald-955 text-emerald-300" :
                                          em.status === "DENIED" ? "bg-red-955 text-red-300" : "bg-amber-955 text-amber-300"
                                        }`}>
                                          {em.status}
                                        </span>
                                      </td>
                                      <td className="py-3 text-right space-x-1.5">
                                        <button
                                          onClick={() => handleUpdateGmailStatus(em.id, "ACC")}
                                          className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2.5 py-1 rounded transition text-[10px] font-bold"
                                        >
                                          ACC
                                        </button>
                                        <button
                                          onClick={() => handleUpdateGmailStatus(em.id, "DENIED")}
                                          className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white px-2.5 py-1 rounded transition text-[10px] font-bold"
                                        >
                                          DENIED
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Panel 1: Buat Sesi Baru */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md h-fit">
                      <h3 className="text-md font-bold text-violet-400 uppercase tracking-wider mb-4">
                        ✨ Buat Sesi Baru
                      </h3>
                      <form onSubmit={handleCreateSessionSubmit} className="space-y-4 text-sm">
                        <div>
                          <label className="block text-xs text-slate-400 font-semibold uppercase mb-1">Nama Sesi</label>
                          <input
                            type="text"
                            required
                            value={newSessName}
                            onChange={(e) => setNewSessName(e.target.value)}
                            placeholder="Contoh: SESI D"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        {/* Waktu Mulai */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase block">Konfigurasi Mulai</span>
                          <div className="grid grid-cols-3 gap-1">
                            <input type="number" placeholder="Tgl" value={sDay} onChange={e => setSDay(e.target.value)} className="bg-slate-900 border border-slate-800 px-1 py-1 rounded text-center text-xs text-white" />
                            <input type="number" placeholder="Bln" value={sMonth} onChange={e => setSMonth(e.target.value)} className="bg-slate-900 border border-slate-800 px-1 py-1 rounded text-center text-xs text-white" />
                            <input type="number" placeholder="Thn" value={sYear} onChange={e => setSYear(e.target.value)} className="bg-slate-900 border border-slate-800 px-1 py-1 rounded text-center text-xs text-white" />
                          </div>
                          <div className="grid grid-cols-2 gap-1 pt-1">
                            <input type="number" placeholder="Jam" value={sHour} onChange={e => setSHour(e.target.value)} className="bg-slate-900 border border-slate-800 px-1 py-1 rounded text-center text-xs text-white" />
                            <input type="number" placeholder="Menit" value={sMin} onChange={e => setSMin(e.target.value)} className="bg-slate-900 border border-slate-800 px-1 py-1 rounded text-center text-xs text-white" />
                          </div>
                        </div>

                        {/* Waktu Selesai */}
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
                          <span className="text-[10px] font-bold text-red-400 uppercase block">Konfigurasi Selesai</span>
                          <div className="grid grid-cols-3 gap-1">
                            <input type="number" placeholder="Tgl" value={eDay} onChange={e => setEDay(e.target.value)} className="bg-slate-900 border border-slate-800 px-1 py-1 rounded text-center text-xs text-white" />
                            <input type="number" placeholder="Bln" value={eMonth} onChange={e => setEMonth(e.target.value)} className="bg-slate-900 border border-slate-800 px-1 py-1 rounded text-center text-xs text-white" />
                            <input type="number" placeholder="Thn" value={eYear} onChange={e => setEYear(e.target.value)} className="bg-slate-900 border border-slate-800 px-1 py-1 rounded text-center text-xs text-white" />
                          </div>
                          <div className="grid grid-cols-2 gap-1 pt-1">
                            <input type="number" placeholder="Jam" value={eHour} onChange={e => setEHour(e.target.value)} className="bg-slate-900 border border-slate-800 px-1 py-1 rounded text-center text-xs text-white" />
                            <input type="number" placeholder="Menit" value={eMin} onChange={e => setEMin(e.target.value)} className="bg-slate-900 border border-slate-800 px-1 py-1 rounded text-center text-xs text-white" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 font-semibold uppercase mb-1">Status Awal</label>
                          <select
                            value={sessStatus}
                            onChange={(e) => setSessStatus(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                          >
                            <option value="Aktif">Aktif</option>
                            <option value="Pause">Pause</option>
                            <option value="Ditutup">Ditutup</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 rounded-lg transition text-xs shadow-md"
                        >
                          Buat Sesi
                        </button>
                      </form>
                    </div>

                    {/* Panel 2 & 3: Lihat Sesi Aktif & Riwayat Sesi */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* Sub-Panel: Sesi Aktif */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                        <h3 className="text-md font-bold text-white uppercase tracking-wider mb-4">
                          🟢 Daftar Sesi Saat Ini
                        </h3>
                        <div className="space-y-4">
                          {sessions.filter(s => s.status === "Aktif").length === 0 ? (
                            <p className="text-xs text-slate-500 py-2">Tidak ada sesi yang sedang aktif.</p>
                          ) : (
                            sessions
                              .filter(s => s.status === "Aktif")
                              .map((sess, idx) => {
                                const submittedCount = emails.filter(e => e.sessionName === sess.name).length;
                                return (
                                  <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-white">{sess.name}</span>
                                        <span className="bg-emerald-955 text-emerald-300 border border-emerald-900 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                          Aktif
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-400">
                                        Mulai: <span className="text-slate-200">{sess.startDate} ({sess.startTime})</span> | Selesai: <span className="text-slate-200">{sess.endDate} ({sess.endTime})</span>
                                      </p>
                                      <p className="text-xs text-indigo-400 font-bold">
                                        Jumlah Gmail Disetor: {submittedCount} ACC/Pending/Denied
                                      </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        onClick={() => handleUpdateSessionStatus(sess.id, "Pause")}
                                        className="bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition"
                                      >
                                        PAUSE SESI
                                      </button>
                                      <button
                                        onClick={() => handleUpdateSessionStatus(sess.id, "Ditutup")}
                                        className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white px-3 py-1.5 rounded text-xs font-bold transition"
                                      >
                                        TUTUP SESI
                                      </button>
                                      <button
                                        onClick={() => setSelectedSessionDetail(sess)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold transition"
                                      >
                                        LIHAT SESI
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>

                      {/* Sub-Panel: Riwayat Sesi (Pause & Ditutup) */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                        <h3 className="text-md font-bold text-slate-400 uppercase tracking-wider mb-4">
                          📂 Riwayat Sesi Kerja
                        </h3>
                        <div className="divide-y divide-slate-800">
                          {sessions.filter(s => s.status !== "Aktif").length === 0 ? (
                            <p className="text-xs text-slate-500 py-2">Belum ada riwayat sesi.</p>
                          ) : (
                            sessions
                              .filter(s => s.status !== "Aktif")
                              .map((sess, idx) => {
                                const submittedCount = emails.filter(e => e.sessionName === sess.name).length;
                                return (
                                  <div key={idx} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white">{sess.name}</span>
                                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                                          sess.status === "Pause" ? "bg-amber-955 text-amber-300 border border-amber-900" : "bg-red-955 text-red-300 border border-red-900"
                                        }`}>
                                          STATUS: {sess.status.toUpperCase()}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-400">
                                        Waktu: {sess.startDate} s/d {sess.endDate} | Terkumpul: {submittedCount} Gmail
                                      </p>
                                    </div>

                                    <div className="flex gap-2">
                                      {sess.status === "Pause" && (
                                        <button
                                          onClick={() => handleUpdateSessionStatus(sess.id, "Aktif")}
                                          className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2 py-1 rounded text-xs font-bold transition"
                                        >
                                          AKTIFKAN KEMBALI
                                        </button>
                                      )}
                                      <button
                                        onClick={() => setSelectedSessionDetail(sess)}
                                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded text-xs font-bold transition border border-slate-700"
                                      >
                                        LIHAT SESI
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: ADMIN REQUEST PAYMENT */}
            {activeTab === "admin-payment" && currentUser.role === "admin" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">💰 Request Payment System</h3>
                  <p className="text-xs text-slate-400 mt-1">Daftar pengajuan penarikan dana (withdraw) dari para pekerja.</p>
                </div>

                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4 text-center">Belum ada pengajuan pembayaran masuk.</p>
                  ) : (
                    payments.map((p, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                          <span className="text-xs font-mono text-slate-400">ID: {p.id}</span>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.status === "PENDING" ? "bg-amber-955 text-amber-300" :
                            p.status === "ACC" ? "bg-emerald-955 text-emerald-300" : "bg-red-955 text-red-300"
                          }`}>
                            {p.status}
                          </span>
                        </div>

                        <div className="text-sm space-y-1">
                          <p className="text-white font-bold uppercase tracking-wider">
                            REQUEST PAYMENT FROM: <span className="text-indigo-400 font-mono font-normal">{p.username}</span>
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-300">
                            <div>TOTAL: <span className="font-bold text-emerald-400">Rp {p.totalAmount.toLocaleString()}</span></div>
                            <div>DANA: <span className="font-mono text-white">{p.danaNumber}</span></div>
                          </div>
                        </div>

                        {p.status === "PENDING" && (
                          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/50">
                            <button
                              onClick={() => handleAdminPaymentAction(p.id, "TOLAK")}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded transition"
                            >
                              TOLAK PAYMENT
                            </button>
                            <button
                              onClick={() => handleAdminPaymentAction(p.id, "ACC")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded transition"
                            >
                              ACC PAYMENT
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
            }
