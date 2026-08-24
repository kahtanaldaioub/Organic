import { Link } from 'react-router-dom';

const footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span>
                <img 
    src="/logo1.svg"           /* use absolute path from public folder */
    alt="organic Logo" 
    className="h-8 w-auto md:h-10"   /* responsive height, auto width */
  /></span>
            <span className="font-semibold">Organic</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
          </div>
          <p className="text-sm text-center md:text-right">
            © 2025 Organic. Empowering local agriculture.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default footer;