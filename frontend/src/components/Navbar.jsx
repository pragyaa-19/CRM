import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-between items-center p-6 bg-white shadow-sm">
      <div className="text-2xl font-bold text-blue-600">CRM</div>

      <div className="flex gap-6">
        <Link
          to="/" className="text-gray-600 hover:text-blue-600 font-medium">
          About
        </Link>
        <Link
          to="/login" className="text-gray-600 hover:text-blue-600 font-medium">
          Log In
        </Link>

        <Link
      to="/signup"
      className="text-gray-600 hover:text-blue-600 font-medium"
    >
      Get Started
    </Link>
      </div>
    </nav>
  );
}

export default Navbar;