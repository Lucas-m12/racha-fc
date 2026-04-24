"use client";
import { createContext } from "react";
import type { Player } from "@/lib/types";

export type ModalName =
  | "phoneLogin"
  | "settings"
  | "pix"
  | "newMatch"
  | "newTransaction"
  | null;

export interface AppShellContextValue {
  currentPlayer: Player | null;
  isAdmin: boolean;
  saldo: number; // centavos
  pixKey: string;
  pixOwner: string;
  openModal: (m: ModalName) => void;
}

export const AppShellContext = createContext<AppShellContextValue | null>(null);
