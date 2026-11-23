import React from 'react';
import { App as BancoFeApp } from '../../../src/client/App';

export const BancoFeHub: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100">
      <BancoFeApp />
    </div>
  );
};

export default BancoFeHub;
