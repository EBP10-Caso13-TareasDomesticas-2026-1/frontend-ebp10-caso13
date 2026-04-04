// // Ubicación: /app/test/page.jsx
// // Para verla: http://localhost:3000/test

// "use client"; // necesario porque usamos useState

// import { useState } from "react";
// import LogOut from "@/components/ui/LogOut";
// import Button from "@/components/ui/Button";

// export default function TestPage() {

//   // Controla si el modal está abierto o cerrado
//   const [showModal, setShowModal] = useState(false);

//   return (
//     <div className="p-8 flex flex-col gap-4 max-w-sm">

//       <h1>Testing: Modal</h1>

//       {/* Botón para abrir el modal */}
//       <Button variant="danger" onClick={() => setShowModal(true)}>
//         Cerrar sesión
//       </Button>

//       {/* El modal — solo se muestra cuando showModal es true */}
//       <LogOut
//         isOpen={showModal}
//         onConfirm={() => {
//           alert("✅ Confirmado — aquí iría el logout real");
//           setShowModal(false);
//         }}
//         onCancel={() => setShowModal(false)}
//       />

//     </div>
//   );
// }

// <div>
//   {/*
//     para hacer la prueba con un ususario que no tiene grupo se escribe en la consola de la página: 
//   window.localStorage.setItem(
//     "homesync_sesion",
//     JSON.stringify({
//       token: "mock_token_4",
//       idUsuario: 4,
//       nombre: "David Sanchez",
//       correo: "david.sanchez@homesync.com"
//     })
//   );
//   window.location.reload();

//   y para probar con un usuario con grupo se cmabian los datos por cualquira de los otros usuarios.
//   */}
  
  
// </div> 
