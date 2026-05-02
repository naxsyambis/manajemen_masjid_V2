import React from 'react';
import NavbarPublic from '/src/components/NavbarPublic';
import FooterPublic from '/src/components/FooterPublic';
import KegiatanLengkap from './KegiatanLengkap'; 

const ListKegiatan = () => {
  return (
    <>
      <NavbarPublic />

      <main className="pt-10 pb-10">
        <KegiatanLengkap />
      </main>

      <FooterPublic />
    </>
  );
};

export default ListKegiatan;