// // src/components/ProjectCard.js

// import React from "react";

// const ProjectCard = ({ project }) => {
//   // Add a check to ensure the project object exists before destructuring
//   if (!project) {
//     return null; // or return a placeholder like <div>No project data</div>
//   }

//   const { name, location, image, status } = project;

//   // Function to get the correct background color for the status tag
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Approved":
//         return "bg-green-500";
//       case "Pending":
//         return "bg-yellow-500";
//       case "Monitoring":
//         return "bg-blue-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
//       <div className="relative h-48">
//         <img
//           src={image || "https://via.placeholder.com/400x300.png?text=No+Image"}
//           alt={name}
//           className="w-full h-full object-cover"
//         />
//         <div className={`absolute top-4 right-4 text-white text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(status)}`}>
//           {status}
//         </div>
//       </div>
//       <div className="p-4">
//         <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
//         <p className="text-sm text-gray-500 mt-1">{location}</p>
//       </div>
//     </div>
//   );
// };

// export default ProjectCard;