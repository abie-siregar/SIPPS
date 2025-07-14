import React, { useState, useEffect, FormEvent } from "react";

type SiswaType = {
  nisn: string;
  nama_depan: string;
  nama_belakang?: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tgl_lahir: string;
  alamat: string;
};

function SiswaManagement() {
  const [siswa, setSiswa] = useState<SiswaType[]>([]);

  const [nisn, setNisn] = useState("");
  const [namaDepan, setNamaDepan] = useState("");
  const [namaBelakang, setNamaBelakang] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [alamat, setAlamat] = useState("");

  const [editingSiswa, setEditingSiswa] = useState<SiswaType | null>(null);

  const API_URL = "http://localhost:5000";

  const fetchSiswa = async () => {
    try {
      const response = await fetch(`${API_URL}/siswa`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setSiswa(data);
    } catch (error) {
      console.error("Error Fetching Siswa: ", error);
    }
  };

  useEffect(() => {
    fetchSiswa();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const siswaData: SiswaType = {
      nisn,
      nama_depan: namaDepan,
      nama_belakang: namaBelakang,
      jenis_kelamin: jenisKelamin,
      tempat_lahir: tempatLahir,
      tgl_lahir: tglLahir,
      alamat,
    };

    try {
      let response: Response;
      if (editingSiswa) {
        response = await fetch(`${API_URL}/siswa/${editingSiswa.nisn}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(siswaData),
        });
      } else {
        response = await fetch(`${API_URL}/siswa`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(siswaData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      setNisn("");
      setNamaDepan("");
      setNamaBelakang("");
      setJenisKelamin("");
      setTempatLahir("");
      setTglLahir("");
      setAlamat("");
      setEditingSiswa(null);
      fetchSiswa();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error submitting siswa:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleDelete = async (nisnToDelete: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus siswa ini?")) return;

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

      fetchSiswa();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error deleting siswa:", error.message);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleEdit = (siswaToEdit: SiswaType) => {
    setNisn(siswaToEdit.nisn);
    setNamaDepan(siswaToEdit.nama_depan);
    setNamaBelakang(siswaToEdit.nama_belakang ?? "");
    setJenisKelamin(siswaToEdit.jenis_kelamin);
    setTempatLahir(siswaToEdit.tempat_lahir);
    setTglLahir(siswaToEdit.tgl_lahir?.split("T")[0] ?? "");
    setAlamat(siswaToEdit.alamat);
    setEditingSiswa(siswaToEdit);
  };

  return (
    <div className="App px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Manajemen Siswa SIPP
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow-lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="NISN"
            value={nisn}
            onChange={(e) => setNisn(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg"
            disabled={!!editingSiswa}
          />
          <input
            type="text"
            placeholder="Nama Depan"
            value={namaDepan}
            onChange={(e) => setNamaDepan(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            placeholder="Nama Belakang"
            value={namaBelakang}
            onChange={(e) => setNamaBelakang(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg"
          />
          <select
            value={jenisKelamin}
            onChange={(e) => setJenisKelamin(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg"
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
            className="p-3 border border-gray-300 rounded-lg"
          />
          <input
            type="date"
            value={tglLahir}
            onChange={(e) => setTglLahir(e.target.value)}
            required
            className="p-3 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder="Alamat"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            required
            className="col-span-2 p-3 border border-gray-300 rounded-lg resize-y"
          ></textarea>
        </div>

        <div className="flex justify-center gap-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400"
          >
            {editingSiswa ? "Update Siswa" : "Tambah Siswa"}
          </button>
          {editingSiswa && (
            <button
              onClick={() => {
                setNisn("");
                setNamaDepan("");
                setNamaBelakang("");
                setJenisKelamin("");
                setTempatLahir("");
                setTglLahir("");
                setAlamat("");
                setEditingSiswa(null);
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400"
            >
              Batal Edit
            </button>
          )}
        </div>
      </form>

      <h2 className="text-2xl font-semibold text-center text-gray-700 mt-8">
        Daftar Siswa
      </h2>

      {siswa.length === 0 ? (
        <p className="text-center text-gray-500">
          Tidak ada siswa untuk ditampilkan.
        </p>
      ) : (
        <table className="min-w-full table-auto mt-4">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-6 py-3 text-left">NISN</th>
              <th className="px-6 py-3 text-left">Nama Depan</th>
              <th className="px-6 py-3 text-left">Nama Belakang</th>
              <th className="px-6 py-3 text-left">Jenis Kelamin</th>
              <th className="px-6 py-3 text-left">Tempat Lahir</th>
              <th className="px-6 py-3 text-left">Tanggal Lahir</th>
              <th className="px-6 py-3 text-left">Alamat</th>
              <th className="px-6 py-3 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {siswa.map((siswaItem) => (
              <tr key={siswaItem.nisn} className="border-b hover:bg-gray-100">
                <td className="px-6 py-4">{siswaItem.nisn}</td>
                <td className="px-6 py-4">{siswaItem.nama_depan}</td>
                <td className="px-6 py-4">{siswaItem.nama_belakang}</td>
                <td className="px-6 py-4">{siswaItem.jenis_kelamin}</td>
                <td className="px-6 py-4">{siswaItem.tempat_lahir}</td>
                <td className="px-6 py-4">{siswaItem.tgl_lahir}</td>
                <td className="px-6 py-4">{siswaItem.alamat}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEdit(siswaItem)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(siswaItem.nisn)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SiswaManagement;
