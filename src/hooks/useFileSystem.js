import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getFolderContents,
    getBreadcrumbs,
    createNode,
    renameNode,
    deleteNode,
    moveNode,
    updateFileContent,
    getNode
} from '@/lib/db';

/**
 * Production-Grade File System Hook
 * Handles all FS state, race conditions, and error states.
 */
export function useFileSystem() {
    // UI State
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const [viewState, setViewState] = useState({
        nodes: [],
        breadcrumbs: [],
        isLoading: true,
        error: null
    });

    // Active File State
    const [activeFileId, setActiveFileId] = useState(null);
    const [activeFile, setActiveFile] = useState(null);

    // Refs for cleanup and race condition handling
    // We increment a 'request ID' to ignore stale responses
    const fetchRequestId = useRef(0);

    // ---- Data Fetching ----

    const refreshFolder = useCallback(async (folderIdToFetch = currentFolderId) => {
        const requestId = ++fetchRequestId.current;
        setViewState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Parallel fetch for speed
            const [nodes, crumbs] = await Promise.all([
                getFolderContents(folderIdToFetch),
                getBreadcrumbs(folderIdToFetch)
            ]);

            // Race Condition Check: If newer request started, ignore this one
            if (requestId === fetchRequestId.current) {
                setViewState({
                    nodes,
                    breadcrumbs: crumbs,
                    isLoading: false,
                    error: null
                });
            }
        } catch (err) {
            console.error("FS Fetch Error:", err);
            if (requestId === fetchRequestId.current) {
                setViewState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: "Failed to load folder"
                }));
            }
        }
    }, [currentFolderId]);

    // Initial Load & Navigation Effect
    useEffect(() => {
        refreshFolder(currentFolderId);
    }, [currentFolderId, refreshFolder]);

    // Active File Loading Effect
    useEffect(() => {
        let mounted = true;
        async function loadActiveFile() {
            if (!activeFileId) {
                setActiveFile(null);
                return;
            }
            try {
                const file = await getNode(activeFileId);
                if (mounted) {
                    if (file) {
                        setActiveFile(file);
                    } else {
                        // File not found (maybe deleted?). Close it.
                        setActiveFile(null);
                        setActiveFileId(null);
                    }
                }
            } catch (error) {
                console.error("Failed to load active file", error);
            }
        }
        loadActiveFile();
        return () => { mounted = false; };
    }, [activeFileId]);


    // ---- Actions (Atomic & Optimistic-Free for Safety) ----

    const navigate = useCallback((folderId) => {
        setCurrentFolderId(folderId);
    }, []);

    const createFolder = useCallback(async (name = "New Folder") => {
        try {
            const id = await createNode({
                name,
                type: 'folder',
                parentId: currentFolderId
            });
            await refreshFolder(); // Refresh to show new folder (and unique name)
            return id;
        } catch (err) {
            console.error("Create Folder Failed:", err);
            throw err;
        }
    }, [currentFolderId, refreshFolder]);

    const createFile = useCallback(async (name = "Untitled", content = "") => {
        try {
            const id = await createNode({
                name,
                type: 'file',
                parentId: currentFolderId,
                content
            });
            await refreshFolder();
            setActiveFileId(id); // Auto-open
            return id;
        } catch (err) {
            console.error("Create File Failed:", err);
            throw err;
        }
    }, [currentFolderId, refreshFolder]);

    const renameItem = useCallback(async (id, newName) => {
        try {
            await renameNode(id, newName);
            await refreshFolder();
            // If we renamed the active file, update it immediately
            if (activeFileId === id) {
                setActiveFile(prev => prev ? { ...prev, name: newName } : null);
            }
        } catch (err) {
            console.error("Rename Failed:", err);
            throw err;
        }
    }, [activeFileId, refreshFolder]);

    const deleteItem = useCallback(async (id) => {
        try {
            await deleteNode(id);
            await refreshFolder();
            if (activeFileId === id) {
                setActiveFileId(null);
            }
        } catch (err) {
            console.error("Delete Failed:", err);
            throw err;
        }
    }, [activeFileId, refreshFolder]);

    const moveItem = useCallback(async (id, targetParentId) => {
        try {
            await moveNode(id, targetParentId);
            await refreshFolder();
        } catch (err) {
            console.error("Move Failed:", err);
            alert(err.message); // Simple alert for now, real app would use toast
        }
    }, [refreshFolder]);

    const saveFileContent = useCallback(async (id, content) => {
        try {
            await updateFileContent(id, content);
            // Update local state to avoid jumpiness if needed, 
            // though editor usually manages own state.
            if (activeFileId === id) {
                setActiveFile(prev => prev ? { ...prev, content } : null);
            }
        } catch (err) {
            console.error("Save Failed:", err);
        }
    }, [activeFileId]);

    return {
        // State
        currentFolderId,
        nodes: viewState.nodes,
        breadcrumbs: viewState.breadcrumbs,
        loading: viewState.isLoading,
        error: viewState.error,
        activeFileId,
        activeFile,

        // Actions
        navigate,
        createFolder,
        createFile,
        renameItem,
        deleteItem,
        moveItem,
        saveFileContent,
        setActiveFileId
    };
}
