import { openDB } from 'idb';

const DB_NAME = 'pagie-db';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

/**
 * Initialize the database
 */
export async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                });
                // Create an index on updatedAt for sorting
                store.createIndex('updatedAt', 'updatedAt');
            }
        },
    });
}

/**
 * Save a document (create or update)
 * @param {Object} doc - Document object
 * @returns {Promise<string>} - Document ID
 */
export async function saveDocument(doc) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const now = new Date().toISOString();
    const docToSave = {
        ...doc,
        updatedAt: now,
        createdAt: doc.createdAt || now,
    };

    await store.put(docToSave);
    await tx.done;
    return docToSave.id;
}

/**
 * Get all documents
 * @returns {Promise<Array>} - Array of documents sorted by updatedAt desc
 */
export async function getDocuments() {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('updatedAt');

    // Get all documents
    // Note: IDB cursor logic for complex sorting might be needed if list is huge,
    // but for a text editor, getting all and sorting in JS is usually fine for < 1000 docs.
    // Alternatively, openCursor(null, 'prev') on the index iterates in reverse order.

    const docs = [];
    let cursor = await index.openCursor(null, 'prev');

    while (cursor) {
        docs.push(cursor.value);
        cursor = await cursor.continue();
    }

    return docs;
}

/**
 * Get a single document by ID
 * @param {string} id 
 * @returns {Promise<Object|null>}
 */
export async function getDocument(id) {
    const db = await initDB();
    return db.get(STORE_NAME, id);
}

/**
 * Delete a document by ID
 * @param {string} id 
 */
export async function deleteDocument(id) {
    const db = await initDB();
    await db.delete(STORE_NAME, id);
}
