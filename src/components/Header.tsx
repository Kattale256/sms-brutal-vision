
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="border-b-4 border-neo-black mb-6 pb-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">
            SMS ANALYZER
          </h1>
          <p className="text-neo-gray font-medium mt-1">Extract insights from your messages</p>
        </div>
        <div>
          <button className="neo-button bg-neo-yellow">
            IMPORT SMS
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
