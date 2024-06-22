import { Button } from 'antd';
import React, { useEffect } from 'react';
import { useState } from 'react';
import { FaRedo, FaUndo } from 'react-icons/fa';

export interface IUndoRedoProps {
  activeUrl: string;
  setActiveUrl: (url: string) => void;
}

const UNDO_LOCALSTORAGE_STACK_NAME = 'undoStack';
const REDO_LOCALSTORAGE_STACK_NAME = 'redoStack';
const LAST_LOCALSTORAGE_ENTRY_NAME = 'lastActive';

export const clearLocalStorage = () => {
  localStorage.removeItem(UNDO_LOCALSTORAGE_STACK_NAME);
  localStorage.removeItem(REDO_LOCALSTORAGE_STACK_NAME);
  localStorage.removeItem(LAST_LOCALSTORAGE_ENTRY_NAME);
};

export const UndoRedo: React.FC<IUndoRedoProps> = ({ activeUrl, setActiveUrl }) => {
  const [command, setCommand] = useState<'undo' | 'redo' | undefined>();
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [currentActive, setCurrentActive] = useState<string>(activeUrl);

  useEffect(() => {
    const undoStack = localStorage.getItem(UNDO_LOCALSTORAGE_STACK_NAME);
    const redoStack = localStorage.getItem(REDO_LOCALSTORAGE_STACK_NAME);
    const lastActive = localStorage.getItem(LAST_LOCALSTORAGE_ENTRY_NAME);

    if (undoStack) setUndoStack(JSON.parse(undoStack));
    if (redoStack) setRedoStack(JSON.parse(redoStack));
    if (lastActive) setCurrentActive(lastActive);

    const undoShortcut = (e: KeyboardEvent) => (e.ctrlKey || e.metaKey) && e.code === 'KeyZ' && setCommand('undo');
    const redoShortcut = (e: KeyboardEvent) =>
      (((e.ctrlKey || e.metaKey) && e.code === 'KeyY') || (e.metaKey && e.altKey && e.code === 'KeyZ')) && setCommand('redo');

    window.addEventListener('keydown', undoShortcut);
    window.addEventListener('keydown', redoShortcut);

    return () => {
      window.removeEventListener('keydown', undoShortcut);
      window.removeEventListener('keydown', redoShortcut);
    };
  }, []);

  useEffect(() => {
    if (undoStack.length === 0 && redoStack.length === 0) {
      if (currentActive !== activeUrl && currentActive === '') {
        setCurrentActive(activeUrl);
        return;
      }
    }
    if (activeUrl === currentActive || activeUrl == undoStack[undoStack.length - 1]) return;

    const newUndoStack = [...undoStack, currentActive];
    setUndoStack(newUndoStack);
    setRedoStack([]);
    setCurrentActive(activeUrl);
  }, [activeUrl]);

  const canUndo = undoStack.length > 0 && activeUrl !== undoStack[undoStack.length - 1];

  const undo = () => {
    if (!canUndo) return;
    const newRedoStack = [...redoStack, currentActive];
    const newActive = undoStack.pop() as string;
    setUndoStack(undoStack);
    setRedoStack(newRedoStack);
    setCurrentActive(newActive);
    setActiveUrl(newActive);

    localStorage.setItem(UNDO_LOCALSTORAGE_STACK_NAME, JSON.stringify(undoStack));
    localStorage.setItem(REDO_LOCALSTORAGE_STACK_NAME, JSON.stringify(newRedoStack));
    localStorage.setItem(LAST_LOCALSTORAGE_ENTRY_NAME, newActive);
  };

  const canRedo = redoStack.length > 0 && activeUrl !== redoStack[redoStack.length - 1];

  // handling the event listeners
  useEffect(() => {
    if (command === 'undo') {
      undo();
      setCommand(undefined);
    } else if (command === 'redo') {
      redo();
      setCommand(undefined);
    }
  }, [command]);

  const redo = () => {
    if (!canRedo) return;
    const newUndoStack = [...undoStack, currentActive];
    const newActive = redoStack.pop() as string;
    setUndoStack(newUndoStack);
    setRedoStack(redoStack);
    setCurrentActive(newActive);
    setActiveUrl(newActive);

    localStorage.setItem(UNDO_LOCALSTORAGE_STACK_NAME, JSON.stringify(newUndoStack));
    localStorage.setItem(REDO_LOCALSTORAGE_STACK_NAME, JSON.stringify(redoStack));
    localStorage.setItem(LAST_LOCALSTORAGE_ENTRY_NAME, newActive);
  };

  return (
    <div style={{ position: 'absolute', bottom: 10, left: 'calc(50vw - 95px)', right: 'calc(50vw - 95px)' }}>
      <div style={{ width: 190, justifyContent: 'space-between', display: 'flex' }}>
        <Button onClick={undo} disabled={!canUndo}>
          Undo <FaUndo />
        </Button>
        <Button onClick={redo} disabled={!canRedo}>
          <FaRedo /> Redo
        </Button>
      </div>
    </div>
  );
};
