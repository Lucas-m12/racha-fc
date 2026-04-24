"use client";
import { useState, type ReactNode } from "react";
import type { Player, Settings } from "@/lib/types";
import { AppShellContext, type ModalName } from "./AppShellContext";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { PhoneLoginModal } from "@/components/modals/PhoneLoginModal";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { PixModal } from "@/components/modals/PixModal";

interface AppShellProps {
  children: ReactNode;
  viewLabel: string;
  currentPlayer: Player | null;
  isAdmin: boolean;
  saldo: number;
  settings: Settings;
  allPlayers: Player[];
}

export function AppShell({
  children, viewLabel, currentPlayer, isAdmin, saldo, settings, allPlayers,
}: AppShellProps) {
  const [modal, setModal] = useState<ModalName>(null);
  const closeModal = () => setModal(null);
  return (
    <AppShellContext.Provider
      value={{
        currentPlayer,
        isAdmin,
        saldo,
        pixKey: settings.pixKey,
        pixOwner: settings.pixOwner,
        openModal: setModal,
      }}
    >
      <AppHeader viewLabel={viewLabel} />
      {children}
      <BottomNav />
      {modal === "phoneLogin" && (
        <PhoneLoginModal
          currentPlayer={currentPlayer}
          players={allPlayers}
          onClose={closeModal}
        />
      )}
      {modal === "settings" && (
        <SettingsModal
          settings={settings}
          isAdmin={isAdmin}
          onClose={closeModal}
        />
      )}
      {modal === "pix" && (
        <PixModal
          pixKey={settings.pixKey}
          pixOwner={settings.pixOwner}
          onClose={closeModal}
        />
      )}
    </AppShellContext.Provider>
  );
}
