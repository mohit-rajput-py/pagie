import { useState, useEffect, useCallback, useRef } from 'react';
import { saveDocument, getDocuments, deleteDocument, getDocument } from '@/lib/db';

const AUTOSAVE_DELAY = 1000; // 1 second debounce

export function useDocuments() {
    const [documents, setDocuments] = useState([]);
    const [activeDocId, setActiveDocId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ref to track if we're currently saving to avoid race conditions or excess writes
    const saveTimeoutRef = useRef(null);
    const activeDocRef = useRef(null);

    // Load initial documents
    useEffect(() => {
        async function loadDocs() {
            try {
                const docs = await getDocuments();
                if (docs.length > 0) {
                    setDocuments(docs);
                    // Load last active doc from localStorage or default to first
                    const lastActiveId = localStorage.getItem('lastActiveDocId');
                    if (lastActiveId && docs.find(d => d.id === lastActiveId)) {
                        setActiveDocId(lastActiveId);
                    } else {
                        setActiveDocId(docs[0].id);
                    }
                } else {
                    // No docs, create welcome doc
                    const welcomeDoc = {
                        id: Date.now().toString(),
                        title: "Welcome to Pagie",
                        content: `<h1>Welcome to Pagie</h1>
<p>This document is saved locally in your browser using IndexedDB.</p>
<p>Try editing it or creating a new one!</p>`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    await saveDocument(welcomeDoc);
                    setDocuments([welcomeDoc]);
                    setActiveDocId(welcomeDoc.id);
                }
            } catch (err) {
                console.error("Failed to load documents:", err);
            } finally {
                setLoading(false);
            }
        }
        loadDocs();
    }, []);

    // Update activeDocRef whenever activeDocId or documents change
    useEffect(() => {
        const activeDoc = documents.find(d => d.id === activeDocId);
        activeDocRef.current = activeDoc;
        if (activeDocId) {
            localStorage.setItem('lastActiveDocId', activeDocId);
        }
    }, [activeDocId, documents]);

    // Debounced save function
    const debouncedSave = useCallback((docToSave) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await saveDocument(docToSave);
                console.log("Auto-saved document:", docToSave.id);
            } catch (err) {
                console.error("Auto-save failed:", err);
            }
        }, AUTOSAVE_DELAY);
    }, []);

    // Immediate save (for unload or explicit save)
    const saveImmediate = useCallback(async (docToSave) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        if (docToSave) {
            try {
                await saveDocument(docToSave);
            } catch (err) {
                console.error("Immediate save failed:", err);
            }
        }
    }, []);

    // Handle document content change
    const updateCurrentDocument = useCallback((content, title) => {
        setDocuments(prevDocs => {
            const newDocs = prevDocs.map(doc => {
                if (doc.id === activeDocId) {
                    const updatedDoc = {
                        ...doc,
                        content,
                        title: title || doc.title,
                        updatedAt: new Date().toISOString()
                    };
                    debouncedSave(updatedDoc);
                    return updatedDoc;
                }
                return doc;
            });
            return newDocs;
        });
    }, [activeDocId, debouncedSave]);

    // Create new document
    const createDocument = useCallback(async () => {
        const newDoc = {
            id: Date.now().toString(),
            title: "Untitled",
            content: "<p></p>",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Optimistic update
        setDocuments(prev => [newDoc, ...prev]);
        setActiveDocId(newDoc.id);

        // Persist
        await saveImmediate(newDoc);
    }, [saveImmediate]);

    // Delete document
    const removeDocument = useCallback(async (id) => {
        // Optimistic update
        setDocuments(prev => {
            const newDocs = prev.filter(d => d.id !== id);
            if (activeDocId === id) {
                setActiveDocId(newDocs.length > 0 ? newDocs[0].id : null);
            }
            return newDocs;
        });

        // Persist removal
        await deleteDocument(id);

        // If we deleted the last doc, create a new one?
        // Let's leave it empty for now or handle in UI, 
        // but the effect above might re-create one if we reload and have nothing.
    }, [activeDocId]);

    // Save on unload
    useEffect(() => {
        const handleUnload = () => {
            if (activeDocRef.current) {
                // We can't use async here reliably, but IDB is async. 
                // Best effort is to assume debounced save caught most things, 
                // or trigger a specific synchronous save if possible (not with IDB).
                // Since IDB is async, we can't block unload. 
                // Reliance on aggressive debouncing (short delay) is usually key here.
                // However, we can try to fire an async save and hope browser keeps thread alive slightly,
                // but modern browsers might kill it.
                // A common pattern is to save on visibilitychange to 'hidden'.
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    // Save on visibility change (more reliable for mobile/tab switch)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && activeDocRef.current) {
                saveImmediate(activeDocRef.current);
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [saveImmediate]);

    // Rename document
    const renameDocument = useCallback((id, newTitle) => {
        setDocuments(prev => prev.map(doc => {
            if (doc.id === id) {
                const updatedDoc = { ...doc, title: newTitle, updatedAt: new Date().toISOString() };
                debouncedSave(updatedDoc);
                return updatedDoc;
            }
            return doc;
        }));
    }, [debouncedSave]);

    // Duplicate document
    const duplicateDocument = useCallback(async (id) => {
        const docToClone = documents.find(d => d.id === id);
        if (!docToClone) return;

        const newDoc = {
            ...docToClone,
            id: Date.now().toString(),
            title: `${docToClone.title} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setDocuments(prev => {
            const index = prev.findIndex(d => d.id === id);
            const newDocs = [...prev];
            newDocs.splice(index + 1, 0, newDoc);
            return newDocs;
        });

        await saveImmediate(newDoc);
    }, [documents, saveImmediate]);

    const activeDocument = documents.find(d => d.id === activeDocId);

    return {
        documents,
        activeDocId,
        activeDocument,
        loading,
        setDocuments, // Expose for reordering or manual updates if needed
        setActiveDocId,
        createDocument,
        updateCurrentDocument,
        renameDocument,
        duplicateDocument,
        removeDocument,
        saveImmediate
    };
}
