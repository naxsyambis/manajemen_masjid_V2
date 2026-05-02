import React from 'react';
import NavbarPublic from '../../../components/NavbarPublic';
import FooterPublic from '../../../components/FooterPublic';
import ProgramLengkap from './ProgramLengkap'; 

const ListProgram = () => {
  return (
    <>
      <NavbarPublic />

      <main className="pt-5 pb-5">
        <ProgramLengkap />
      </main>

      <FooterPublic />
    </>
  );
};

export default ListProgram;