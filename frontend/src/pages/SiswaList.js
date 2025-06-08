import { useEffect, useState } from "react";
import axios from axios;

import React from 'react'

const SiswaList = () => {
    const [siswa, setSiswa] = useState([]);

    useEffect(() => {
        axios.get('http://locahost:5000/api/siswa')
            .then(res => setSiswa(res.data))
            .catch(err => console.error(err))
    }, [])
  
    return (
        <div>
            <h2>Daftar Siswa</h2>
            <ul>
                {siswa.map(s => {
                    <li key={s.id}>{s.nama} - {s.kelas}</li>
                })}
            </ul>
    </div>
  )
}

export default SiswaList