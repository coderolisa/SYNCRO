"use client";

import { useState, useCallback } from "react";

export interface ConfirmationDialog {
  title: string;
  description: string;
  variant: "danger" | "warning" | "default";
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function useConfirmationDialog() {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog | null>(
    null
  );

  const showDialog = useCallback((dialog: ConfirmationDialog) => {
    setConfirmDialog(dialog);
  }, []);

  const hideDialog = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  return {
    confirmDialog,
    showDialog,
    hideDialog,
  };
}
