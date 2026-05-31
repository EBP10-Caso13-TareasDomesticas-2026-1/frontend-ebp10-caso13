"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/layout/AppLayout";
import Button from "@/components/ui/Button";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import StatsCard from "@/components/ui/StatsCard";
import MemberCard from "@/components/ui/MemberCard";
import { useAuth } from "@/hooks/useAuth";
import { useGroup } from "@/hooks/useGroup";
import groupService from "@/services/groupService";

function normalizarRanking(rankingData = [], grupoMiembros = []) {
  const data = Array.isArray(rankingData) ? rankingData : rankingData?.ranking || [];

  const mapData = data.map((item) => {
    const usuarioId = item.idUsuario || item.usuarioId;
    const miembroGrupo = grupoMiembros.find((m) => m.usuarioId === usuarioId) || {};
    
    return {
      ...miembroGrupo,
      ...item,
      id: miembroGrupo.id || item.id,
      usuarioId: usuarioId,
      puntaje: item.puntos ?? item.puntaje ?? 0,
      nombre: item.nombre || miembroGrupo.nombre || "Usuario desconocido",
      tareasCompletadas: item.tareasCompletadas ?? 0,
    };
  });

  const lista = [...mapData].sort((a, b) => {
    if (b.puntaje !== a.puntaje) return b.puntaje - a.puntaje;
    return (a.nombre || "").localeCompare(b.nombre || "", "es", {
      sensitivity: "base",
    });
  });

  lista.forEach((miembro, index) => {
    if (index === 0) {
      miembro.puesto = 1;
      return;
    }
    const anterior = lista[index - 1];
    miembro.puesto = anterior.puntaje === miembro.puntaje ? anterior.puesto : index + 1;
  });

  return lista;
}

function GroupDetailsContent() {
  const router = useRouter();
  const { usuario, token, logout } = useAuth();
  const { grupo, rolActual, loading: loadingGroup } = useGroup();

  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
  const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [selectedMemberName, setSelectedMemberName] = useState("");
  const [newAdminSelected, setNewAdminSelected] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const esAdmin = rolActual === "admin";

  // ─── Cargar ranking ──────────────────────────────────────────

  useEffect(() => {
    const cargarRanking = async () => {
      if (!token || !grupo?.id) {
        setLoading(false);
        return;
      }

      if (loadingGroup) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const rankingData = await groupService.obtenerRanking(grupo.id, token);
        setRanking(normalizarRanking(rankingData, grupo?.miembros || []));
      } catch (err) {
        console.error("Error cargando ranking:", err);
        setError(err.message || "Error al cargar el ranking");
        setRanking([]);
      } finally {
        setLoading(false);
      }
    };

    cargarRanking();
  }, [grupo?.id, token, loadingGroup, reloadKey]);

  // ─── Handlers ────────────────────────────────────────────────

  const handleDeleteMember = async (memberId) => {
    const member = ranking.find((m) => m.id === memberId);
    if (!member) return;

    setSelectedMemberId(memberId);
    setSelectedMemberName(member.nombre);
    setShowDeleteMemberModal(true);
  };

  const confirmDeleteMember = async () => {
    if (!selectedMemberId) return;

    try {
      setLoadingDelete(true);
      setModalError(null);
      await groupService.eliminarMiembro(selectedMemberId, token);

      // Remover de la lista local
      setRanking((prev) => normalizarRanking(prev.filter((m) => m.id !== selectedMemberId), grupo?.miembros || []));
      setShowDeleteMemberModal(false);
      setSelectedMemberId(null);
      setSelectedMemberName("");
    } catch (err) {
      console.error("Error eliminando miembro:", err);
      setModalError(err.message || "Error al eliminar miembro");
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleLeaveGroup = () => {
    if (esAdmin && ranking.length > 1) {
      // Si es admin y hay otros miembros, mostrar selector
      setShowLeaveGroupModal(true);
    } else if (!esAdmin || ranking.length === 1) {
      // Si no es admin o es el único, abandonar directamente
      setShowLeaveGroupModal(true);
    }
  };

  const confirmLeaveGroup = async () => {
    if (esAdmin && ranking.length > 1 && !newAdminSelected) {
      setModalError("Debes seleccionar un nuevo administrador para continuar.");
      return;
    }

    try {
      setLoadingDelete(true);
      setModalError(null);

      const miembroActual = ranking.find((m) => m.usuarioId === usuario?.idUsuario);
      if (!miembroActual) throw new Error("No se encontró tu membresía");

      const nuevoAdminId = esAdmin && newAdminSelected ? newAdminSelected : null;
      await groupService.abandonarGrupo(miembroActual.id, nuevoAdminId, token);

      setShowLeaveGroupModal(false);
      setNewAdminSelected(null);

      // Limpiar contexto y redirigir
      setTimeout(() => {
        router.push("/bienvenida");
      }, 500);
    } catch (err) {
      console.error("Error abandonando grupo:", err);
      setModalError(err.message || "Error al abandonar el grupo");
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // ─── Data helpers ────────────────────────────────────────────

  const currentUserRanking = ranking.find(
    (r) => r.usuarioId === usuario?.idUsuario
  );
  const lideresRanking = ranking.filter((member) => member.puesto <= 3);
  const restoRanking = ranking.filter((member) => member.puesto > 3);

  // ─── Navbar content ──────────────────────────────────────────

  const navbarContent = (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">{grupo?.nombre}</span>
      <Button
        variant="secondary"
        onClick={() => router.push("/tablero")}
      >
        ← Volver al Tablero
      </Button>
      <Button variant="primary" onClick={() => setShowLogoutModal(true)}>
        Cerrar sesión
      </Button>
    </div>
  );

  // ─── Renderizar ──────────────────────────────────────────────

  if (loadingGroup || loading) {
    return (
      <AppLayout navbarContent={navbarContent}>
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-500">Cargando detalles del grupo...</div>
        </div>
      </AppLayout>
    );
  }

  if (!grupo) {
    return (
      <AppLayout navbarContent={navbarContent}>
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-500">Grupo no encontrado</div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout navbarContent={navbarContent}>
        <div className="w-full py-8 px-4 md:px-6 max-w-4xl mx-auto">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-semibold mb-2">No fue posible cargar el ranking.</p>
            <p className="text-sm mb-4">{error}</p>
            <Button
              variant="secondary"
              onClick={() => setReloadKey((prev) => prev + 1)}
            >
              Reintentar
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout navbarContent={navbarContent}>
      <div className="w-full py-8 px-4 md:px-6 max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {grupo.nombre}
            </h1>
            <p className="text-gray-600">
              {grupo.descripcion || "Grupo familiar"}
            </p>
          </div>

          {esAdmin && (
            <Button
              variant="secondary"
              onClick={() => {
                const codigo =
                  grupo.codigoInvitacion || "Código no disponible";
                router.push(`/grupo/invitar?codigo=${codigo}`);
              }}
              className="w-full sm:w-auto"
            >
              + Invitar Miembros
            </Button>
          )}
        </div>

        {/* Mi Desempeño */}
        <div className="mb-8">
          <StatsCard ranking={currentUserRanking} stats={currentUserRanking} />
        </div>

        {/* Miembros del grupo */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Miembros del Grupo ({ranking.length})
            </h2>
          </div>

          {ranking.length === 0 ? (
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600">No hay miembros en este grupo.</p>
            </div>
          ) : (
            <>
              {lideresRanking.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                    Podio de desempeño
                  </h3>
                  <div className="space-y-3">
                    {lideresRanking.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        esAdmin={esAdmin}
                        isCurrentUser={member.usuarioId === usuario?.idUsuario}
                        onDelete={handleDeleteMember}
                        onLeave={handleLeaveGroup}
                        loadingDelete={loadingDelete}
                      />
                    ))}
                  </div>
                </div>
              )}

              {restoRanking.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                    Resto de integrantes
                  </h3>
                  <div className="space-y-3">
                    {restoRanking.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        esAdmin={esAdmin}
                        isCurrentUser={member.usuarioId === usuario?.idUsuario}
                        onDelete={handleDeleteMember}
                        onLeave={handleLeaveGroup}
                        loadingDelete={loadingDelete}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {ranking.length > 0 && ranking.every((m) => m.tareasCompletadas === 0) && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
              📋 Aún no hay tareas completadas. ¡Comienza a organizar las tareas del hogar!
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL ELIMINAR MIEMBRO ─────────────────────────────── */}
      <ConfirmationModal
        isOpen={showDeleteMemberModal}
        icon={<img src="/usuario-eliminar.svg" alt="Eliminar" className="w-8 h-8" />}
        title="Eliminar Miembro"
        description={`¿Deseas eliminar a ${selectedMemberName}? Esta acción no se puede deshacer.`}
        error={modalError}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDeleteMember}
        onCancel={() => {
          setShowDeleteMemberModal(false);
          setModalError(null);
        }}
        variant="danger"
      />

      {/* ─── MODAL ABANDONAR GRUPO ──────────────────────────────── */}
      <ConfirmationModal
        isOpen={showLeaveGroupModal}
        icon={<img src="/salida-grupo.svg" alt="Abandonar" className="w-8 h-8" />}
        title={esAdmin && ranking.length > 1 ? "Abandonar Grupo" : "Abandonar Grupo"}
        description={
          esAdmin && ranking.length > 1
            ? "Eres administrador. Debes seleccionar un nuevo administrador antes de abandonar."
            : "¿Deseas abandonar el grupo? Esta acción no se puede deshacer."
        }
        error={modalError}
        confirmText="Abandonar"
        cancelText="Cancelar"
        onConfirm={confirmLeaveGroup}
        confirmDisabled={esAdmin && ranking.length > 1 && !newAdminSelected}
        onCancel={() => {
          setShowLeaveGroupModal(false);
          setNewAdminSelected(null);
          setModalError(null);
        }}
        variant="danger"
        showMemberSelector={esAdmin && ranking.length > 1}
        members={
          esAdmin && ranking.length > 1
            ? ranking.filter((m) => m.usuarioId !== usuario?.idUsuario)
            : []
        }
        selectedMemberId={newAdminSelected}
        onMemberChange={setNewAdminSelected}
      />

      {/* ─── MODAL LOGOUT ───────────────────────────────────────── */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        icon={<img src="/salida.png" alt="Logout" className="w-8 h-8" />}
        title="Cerrar sesión"
        description="¿Deseas cerrar sesión?"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        variant="danger"
      />
    </AppLayout>
  );
}

export default function GroupDetailsPage() {
  return (
    <ProtectedRoute>
      <GroupDetailsContent />
    </ProtectedRoute>
  );
}
