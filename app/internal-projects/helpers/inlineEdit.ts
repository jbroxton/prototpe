"use client";

import { useState } from 'react';

export function useInlineEdit() {
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  function start(cellId: string, value: string) {
    setEditingCell(cellId);
    setEditValue(value ?? "");
    setErrorMessage(null);
  }

  function end() {
    setEditingCell(null);
    setSaving(false);
  }

  function onKeyDown(
    e: React.KeyboardEvent,
    doSave: () => Promise<void> | void,
    doCancel?: () => void,
  ) {
    if (e.key === 'Enter') {
      e.preventDefault();
      void doSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      (doCancel || end)();
    }
  }

  function onBlur(doSave: () => Promise<void> | void) {
    return () => {
      if (!saving) void doSave();
    };
  }

  function onError(message: string) {
    setErrorMessage(message);
    setSaving(false);
  }

  return {
    editingCell,
    editValue,
    errorMessage,
    saving,
    setEditValue,
    setSaving,
    start,
    end,
    onKeyDown,
    onBlur,
    onError,
  };
}

export default useInlineEdit;

