<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { FiSearch, FiBell, FiSettings, FiMenu } from "react-icons/fi";
import { Waves } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
=======
// import React, { useState, useEffect } from "react";
// import { FiSearch, FiBell, FiSettings, FiMenu } from "react-icons/fi";
// import { Waves } from "lucide-react";
// import { useLocation } from "react-router-dom";
>>>>>>> 85f462c (Enhanced ui into Dark themed mode)

// export default function Navbar({ onSidebarToggle, isAdmin }) {
//   const [username, setUsername] = useState("User");
//   const [profilePic, setProfilePic] = useState(
//     "https://via.placeholder.com/40"
//   );

<<<<<<< HEAD
  const { pathname } = useLocation();
  const navigate = useNavigate();
=======
//   const { pathname } = useLocation();
>>>>>>> 85f462c (Enhanced ui into Dark themed mode)

//   useEffect(() => {
//     try {
//       const userData = JSON.parse(localStorage.getItem("user")) || {};
//       if (userData.name) {
//         setUsername(userData.name);
//         setProfilePic(
//           `https://ui-avatars.com/api/?name=${encodeURIComponent(
//             userData.name
//           )}&background=random`
//         );
//       } else if (userData.profilePic) {
//         setProfilePic(userData.profilePic);
//       }
//     } catch (error) {
//       console.error("Failed to parse user data from localStorage", error);
//     }
//   }, [pathname]);

//   return (
//     <nav className="w-full bg-white shadow-md px-6 py-3 flex justify-between items-center fixed top-0 z-50">
//       {/* Hamburger Menu + Logo */}
//       <div className="flex items-center space-x-3">
//         {onSidebarToggle && (
//           <button
//             onClick={onSidebarToggle}
//             className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
//             aria-label="Toggle sidebar"
//           >
//             <FiMenu className="h-6 w-6 text-gray-700" />
//           </button>
//         )}
//         <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
//           <Waves className="h-6 w-6 text-white" />
//         </div>
//         <div>
//           <h1
//             className="text-xl font-bold text-black-900 
//           "
//           >
//             BlueCarbon
//           </h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             {isAdmin ? "Admin Portal" : "Registry"}
//           </p>
//         </div>
//       </div>

//       {/* Search + Actions */}
//       <div className="flex items-center space-x-4">
//         {/* Search Bar */}
//         <div className="relative hidden md:block">
//           <input
//             type="text"
//             placeholder="Search projects..."
//             className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//           />
//           <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//         </div>

<<<<<<< HEAD
        {/* Action Icons */}
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-full hover:bg-gray-100 transition">
            <FiBell className="text-gray-600 hover:text-gray-900" size={20} />
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            onClick={() => navigate("/dashboard/settings")}
            aria-label="Open settings"
          >
            <FiSettings
              className="text-gray-600 hover:text-gray-900"
              size={20}
            />
          </button>
        </div>
=======
//         {/* Action Icons */}
//         <div className="flex items-center space-x-2">
//           <button className="p-2 rounded-full hover:bg-gray-100 transition">
//             <FiBell className="text-gray-600 hover:text-gray-900" size={20} />
//           </button>
//           <button className="p-2 rounded-full hover:bg-gray-100 transition">
//             <FiSettings
//               className="text-gray-600 hover:text-gray-900"
//               size={20}
//             />
//           </button>
//         </div>
>>>>>>> 85f462c (Enhanced ui into Dark themed mode)

//         {/* User Profile */}
//         <div className="flex items-center space-x-2">
//           <img
//             src={profilePic}
//             alt="Profile"
//             className="w-10 h-10 rounded-full object-cover"
//           />
//           <span className="text-gray-900 font-semibold dark:text-gray-200">
//             Welcome back, {username}
//           </span>
//         </div>
//       </div>
//     </nav>
//   );
// }
