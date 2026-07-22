import { Menu } from 'lucide-react';

const Navbar = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm shrink-0">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="mr-3 p-2 -ml-2 rounded-md text-gray-600 hover:bg-gray-100 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="h-8 w-auto mr-3 hidden sm:block md:hidden lg:block" />
        <h2 className="text-xl font-bold text-gray-800 lg:hidden">Ngap Finance</h2>
        <h2 className="text-xl font-semibold text-gray-800 hidden lg:block">Overview</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* User Profile Mockup */}
        <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white font-bold shadow-sm">
            AD
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700">Admin</p>
            <p className="text-xs text-gray-500">Super Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;