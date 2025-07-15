import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [siswa, setSiswa] = useState([]);

  //State Input
  const [nisn, setNisn] = useState("");
  const [namaDepan, setNamaDepan] = useState("");
  const [namaBelakang, setNamaBelakang] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tglLahir, setTglLahir] = useState(""); // format YYYY-MM-DD untuk input type="date"
  const [alamat, setAlamat] = useState("");

  // State untuk melacak siswa yang sedang diedit (null jika tidak ada)
  const [editingSiswa, setEditingSiswa] = useState(null);

  const API_URL = "http://localhost:5000";

  const fetchSiswa = async () => {
    try {
      // PERBAIKAN: Menggunakan backtick (`) untuk template literal
      const response = await fetch(`${API_URL}/siswa`); // Perbaiki sintaksis di sini
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`); // Perbaiki sintaksis di sini
      }
      const data = await response.json();
      setSiswa(data);
    } catch (error) {
      console.error("Error Fetching Siswa: ", error);
    }
  };

  useEffect(() => {
    fetchSiswa();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah refresh halaman default form

    // Objek data siswa yang akan dikirim ke backend
    const siswaData = {
      nisn,
      nama_depan: namaDepan,
      nama_belakang: namaBelakang,
      jenis_kelamin: jenisKelamin,
      tempat_lahir: tempatLahir,
      tgl_lahir: tglLahir,
      alamat,
    };

    try {
      let response;
      if (editingSiswa) {
        // Jika dalam mode edit, kirim permintaan PUT ke endpoint update
        response = await fetch(`${API_URL}/siswa/${editingSiswa.nisn}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(siswaData), // Kirim semua data yang diupdate
        });
      } else {
        // Jika tidak dalam mode edit, kirim permintaan POST ke endpoint tambah
        response = await fetch(`${API_URL}/siswa`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(siswaData),
        });
      }

      // Periksa apakah respons dari backend berhasil
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      // Reset semua state form setelah berhasil
      setNisn("");
      setNamaDepan("");
      setNamaBelakang("");
      setJenisKelamin("");
      setTempatLahir("");
      setTglLahir("");
      setAlamat("");
      setEditingSiswa(null); // Keluar dari mode edit
      fetchSiswa(); // Muat ulang daftar siswa untuk menampilkan perubahan
    } catch (error) {
      console.error("Error submitting siswa:", error.message);
      alert(`Error: ${error.message}`); // Tampilkan pesan error ke user
    }
  };

  // Fungsi untuk menangani penghapusan siswa
  const handleDelete = async (nisnToDelete) => {
    // Konfirmasi sebelum menghapus (opsional, bisa diganti dengan modal kustom)
    if (!window.confirm("Apakah Anda yakin ingin menghapus siswa ini?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/siswa/${nisnToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      fetchSiswa(); // Muat ulang daftar siswa setelah penghapusan
    } catch (error) {
      console.error("Error deleting siswa:", error.message);
      alert(`Error: ${error.message}`); // Tampilkan pesan error ke user
    }
  };

  // Fungsi untuk mengisi form dengan data siswa saat tombol "Edit" diklik
  const handleEdit = (siswaToEdit) => {
    setNisn(siswaToEdit.nisn);
    setNamaDepan(siswaToEdit.nama_depan);
    setNamaBelakang(siswaToEdit.nama_belakang);
    setJenisKelamin(siswaToEdit.jenis_kelamin);
    setTempatLahir(siswaToEdit.tempat_lahir);
    // Format tanggal dari database (YYYY-MM-DDTHH:MM:SS.sssZ) menjadi YYYY-MM-DD
    setTglLahir(
      siswaToEdit.tgl_lahir ? siswaToEdit.tgl_lahir.split("T")[0] : ""
    );
    setAlamat(siswaToEdit.alamat);
    setEditingSiswa(siswaToEdit); // Set siswa yang sedang diedit
  };

  // Render komponen
  return (
    <div className="App">
      <h1>Manajemen Siswa SIPP</h1>

      {/* Form untuk menambah/mengedit siswa */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="NISN"
          value={nisn}
          onChange={(e) => setNisn(e.target.value)}
          required
          // Nonaktifkan input NISN saat dalam mode edit karena NISN adalah primary key
          disabled={!!editingSiswa}
        />
        <input
          type="text"
          placeholder="Nama Depan"
          value={namaDepan}
          onChange={(e) => setNamaDepan(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nama Belakang (Opsional)"
          value={namaBelakang}
          onChange={(e) => setNamaBelakang(e.target.value)}
        />
        <select
          value={jenisKelamin}
          onChange={(e) => setJenisKelamin(e.target.value)}
          required
        >
          <option value="">Pilih Jenis Kelamin</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
        <input
          type="text"
          placeholder="Tempat Lahir"
          value={tempatLahir}
          onChange={(e) => setTempatLahir(e.target.value)}
          required
        />
        <input
          type="date"
          placeholder="Tanggal Lahir"
          value={tglLahir}
          onChange={(e) => setTglLahir(e.target.value)}
          required
        />
        <textarea
          placeholder="Alamat"
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          required
        ></textarea>

        {/* Tombol submit yang berubah teks tergantung mode (tambah/edit) */}
        <button type="submit">
          {editingSiswa ? "Update Siswa" : "Tambah Siswa"}
        </button>
        {/* Tombol "Batal Edit" hanya muncul saat dalam mode edit */}
        {editingSiswa && (
          <button
            onClick={() => {
              // Reset semua state form dan keluar dari mode edit
              setNisn("");
              setNamaDepan("");
              setNamaBelakang("");
              setJenisKelamin("");
              setTempatLahir("");
              setTglLahir("");
              setAlamat("");
              setEditingSiswa(null);
            }}
          >
            Batal Edit
          </button>
        )}
      </form>

      <h2>Daftar Siswa</h2>
      {/* Tampilkan pesan jika tidak ada data atau sedang memuat */}
      {siswa.length === 0 ? (
        <p>Memuat data siswa atau belum ada data.</p>
      ) : (
        // Tabel untuk menampilkan data siswa
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>NISN</th>
              <th>Nama Depan</th>
              <th>Nama Belakang</th>
              <th>Jenis Kelamin</th>
              <th>Tempat Lahir</th>
              <th>Tanggal Lahir</th>
              <th>Alamat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {siswa.map((s) => (
              // Gunakan NISN sebagai key karena diasumsikan unik
              <tr key={s.nisn}>
                <td>{s.id}</td>
                <td>{s.nisn}</td>
                <td>{s.nama_depan}</td>
                <td>{s.nama_belakang}</td>
                <td>{s.jenis_kelamin}</td>
                <td>{s.tempat_lahir}</td>
                {/* Format tanggal untuk tampilan (ambil hanya bagian tanggal) */}
                <td>{s.tgl_lahir ? s.tgl_lahir.split("T")[0] : ""}</td>
                <td>{s.alamat}</td>
                <td>
                  {/* Tombol Edit dan Hapus untuk setiap baris siswa */}
                  <button onClick={() => handleEdit(s)}>Edit</button>
                  <button onClick={() => handleDelete(s.nisn)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
