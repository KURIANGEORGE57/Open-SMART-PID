import { useEffect } from 'react';
import { useDiagramStore } from '../store/diagramStore';

/**
 * Keyboard Shortcuts Hook
 *
 * Implements global keyboard shortcuts for the P&ID editor:
 * - Ctrl+Z: Undo
 * - Ctrl+Shift+Z / Ctrl+Y: Redo
 * - Delete / Backspace: Delete selected elements
 * - Ctrl+S: Save diagram
 * - Ctrl+A: Select all
 * - Escape: Clear selection
 *
 * @param onSave - Callback function to execute when Ctrl+S is pressed
 */
export function useKeyboardShortcuts(onSave?: () => void) {
  const {
    undo,
    redo,
    deleteSelected,
    selectAll,
    clearSelection,
    selectedIds,
  } = useDiagramStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Don't trigger shortcuts when typing in input fields (except Escape)
      if (isInputField && event.key !== 'Escape') {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      // Undo: Ctrl+Z (but not Ctrl+Shift+Z)
      if (modifier && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y
      if (modifier && ((event.key === 'z' && event.shiftKey) || event.key === 'y')) {
        event.preventDefault();
        redo();
        return;
      }

      // Save: Ctrl+S
      if (modifier && event.key === 's') {
        event.preventDefault();
        if (onSave) {
          onSave();
        }
        return;
      }

      // Select All: Ctrl+A
      if (modifier && event.key === 'a') {
        event.preventDefault();
        selectAll();
        return;
      }

      // Delete: Delete or Backspace (only if not in input field)
      if ((event.key === 'Delete' || event.key === 'Backspace') && !isInputField) {
        event.preventDefault();
        if (selectedIds.length > 0) {
          deleteSelected();
        }
        return;
      }

      // Clear selection: Escape
      if (event.key === 'Escape') {
        event.preventDefault();
        clearSelection();
        return;
      }
    };

    // Attach event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, deleteSelected, selectAll, clearSelection, selectedIds, onSave]);
}
