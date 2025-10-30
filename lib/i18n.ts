export const translations = {
  id: {
    // Navigasi
    navigasi: {
      beranda: "Beranda",
      dashboard: "Dashboard",
      admin: "Panel Admin",
      keluar: "Keluar",
      masuk: "Masuk",
      daftar: "Daftar",
      lelangAktif: "Lelang Aktif",
      riwayat: "Riwayat",
      profil: "Profil",
      daftarBarang: "Daftar Barang",
      tambahBarang: "Tambah Barang",
      dataPenawar: "Data Penawar",
      penawaranSaya: "Penawaran Saya",
      riwayatPenawaran: "Riwayat Penawaran",
      kelolaPenawar: "Kelola Penawar",
    },

    // Beranda
    beranda: {
      judul: "Selamat Datang di Lelang Internal",
      subjudul:
        "Platform lelang profesional untuk mengelola dan menawar item. Bergabunglah dengan komunitas kami dan mulai menawar hari ini!",
      fitur1: {
        judul: "Lelang Adil",
        deskripsi:
          "Proses lelang transparan dengan pembaruan penawaran real-time",
      },
      fitur2: {
        judul: "Aman",
        deskripsi: "Data Anda dilindungi dengan keamanan standar industri",
      },
      fitur3: {
        judul: "Cepat & Mudah",
        deskripsi:
          "Antarmuka sederhana untuk manajemen lelang yang cepat dan mudah",
      },
    },

    // Autentikasi
    auth: {
      masuk: "Masuk",
      daftar: "Daftar",
      email: "Email",
      kataSandi: "Kata Sandi",
      nama: "Nama",
      konfirmasiKataSandi: "Konfirmasi Kata Sandi",
      suksesLogin: "Login berhasil",
      suksesDaftar: "Pendaftaran berhasil",
    },

    // Dashboard
    dashboard: {
      judul: "Dashboard",
      penawaranSaya: "Penawaran Saya",
      cari: "Cari lelang...",
      filter: {
        harga: "Filter Harga",
        status: "Filter Status",
        aktif: "Aktif",
        selesai: "Selesai",
      },
      urutkan: {
        terbaru: "Terbaru",
        terlama: "Terlama",
        namaAZ: "Nama A-Z",
        namaZA: "Nama Z-A",
      },
    },

    // Lelang
    lelang: {
      namaBarang: "Nama Barang",
      deskripsi: "Deskripsi Barang",
      hargaAwal: "Harga Awal",
      penawaranTertinggi: "Penawaran Tertinggi",
      penjual: {
        nama: "Nama Penjual",
        info: "Info Penjual",
      },
      penyelenggara: {
        nama: "Penyelenggara",
        info: "Info Penyelenggara",
      },
      penawar: {
        daftar: "Daftar Penawar",
        info: "Info Penawar",
      },
      penawaran: {
        tawar: "Tawar",
        ajukan: "Ajukan Penawaran",
        nominal: "Nominal Penawaran",
        terakhir: "Penawaran Terakhir",
      },
      waktu: {
        tersisa: "Waktu Tersisa",
        hari: "Hari",
        jam: "Jam",
        menit: "Menit",
        detik: "Detik",
        mulai: "Tanggal Mulai",
        selesai: "Tanggal Berakhir",
      },
    },

    // Admin Panel
    admin: {
      judul: "Panel Admin",
      lelang: {
        daftar: "Daftar Lelang",
        tambah: "Tambah Barang Lelang",
        ubah: "Ubah Data Barang",
        hapus: "Hapus Barang",
      },
      penawaran: {
        daftar: "Daftar Penawaran",
        ubahTertinggi: "Ubah Penawaran Tertinggi",
      },
      penawar: {
        data: "Data Penawar",
        ubah: "Ubah Data Penawar",
        nama: "Nama Penawar",
        jumlah: "Jumlah Penawaran",
        tanggal: "Tanggal",
      },
      barang: {
        foto: "Foto Barang",
        tambahFoto: "Tambah Foto",
        hapusFoto: "Hapus Foto",
        nama: "Nama Barang",
        status: "Status",
      },
    },

    // Umum/Common
    umum: {
      batal: "Batal",
      simpan: "Simpan",
      perbarui: "Perbarui",
      hapus: "Hapus",
      ubah: "Ubah",
      tambah: "Tambah",
      tutup: "Tutup",
      konfirmasi: "Konfirmasi",
      konfirmasiHapus: "Apakah Anda yakin?",
      sukses: "Berhasil",
      kesalahan: "Kesalahan",
      memuat: "Memuat...",
    },

    // Common
    "common.cancel": "Batal",
    "common.save": "Simpan",
    "common.update": "Perbarui",
    "common.delete": "Hapus",
    "common.edit": "Ubah",
    "common.add": "Tambah",
    "common.close": "Tutup",
    "common.confirm": "Konfirmasi",
    "common.are_you_sure": "Apakah Anda yakin?",
    "common.success": "Berhasil",
    "common.error": "Kesalahan",
    "common.loading": "Memuat...",

    // Footer
    "footer.copyright": "©2025 Lelang Internal. Semua hak cipta dilindungi.",
    "footer.supported_by": "Didukung oleh",
    "footer.partners": "Bekerja sama dengan:",

    // Footer
    footer: {
      hakCipta: "©2025 Lelang Internal. Semua hak cipta dilindungi.",
      dukungan: "Didukung oleh",
      mitra: "Bekerja sama dengan:",
    },
  },
};

export function t(key: string): string {
  // Direct lookup supports flat keys like "footer.copyright" stored at the top level
  const direct = (translations as any).id?.[key];
  if (typeof direct === "string") return direct;

  // Fallback to nested lookup for keys like "navigasi.beranda"
  const keys = key.split(".");
  let value: any = translations.id;

  for (const k of keys) {
    if (value == null) break;
    value = value[k];
  }

  return typeof value === "string" ? value : key;
}
