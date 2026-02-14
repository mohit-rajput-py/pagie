import { openDB } from 'idb';

const DB_NAME = 'pagie-db';
const DB_VERSION = 3; // Bump to 3 for 'root' migration
const STORE_NAME = 'nodes';

const ROOT_ID = "root";

/**
 * database initialization and schema definition
 */
export async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        async upgrade(db, oldVersion, newVersion, transaction) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('parentId', 'parentId', { unique: false });
                store.createIndex('updatedAt', 'updatedAt', { unique: false });
            }

            // Migration V2 -> V3: Convert parentId: null -> "root"
            if (oldVersion < 3) {
                const store = transaction.objectStore(STORE_NAME);
                let cursor = await store.openCursor();
                while (cursor) {
                    const node = cursor.value;
                    if (node.parentId === null || node.parentId === undefined) {
                        const updated = { ...node, parentId: ROOT_ID };
                        await cursor.update(updated);
                    }
                    cursor = await cursor.continue();
                }
            }
        },
    });
}

/**
 * HELPER: Generate a unique name if a duplicate exists in the same folder
 */
async function ensureUniqueName(store, parentId, name, type) {
    const validParentId = (!parentId) ? ROOT_ID : parentId; // Default to root
    const index = store.index('parentId');

    // Now validParentId is always a string "root" or uuid, so IDBKeyRange.only works.
    const params = IDBKeyRange.only(validParentId);

    const siblings = await index.getAll(params);

    let candidate = name;
    let counter = 1;

    while (siblings.some(node => node.name === candidate && node.type === type)) {
        candidate = `${name} (${counter})`;
        counter++;
    }

    return candidate;
}

/**
 * HELPER: Check if newParentId is a descendant of nodeId (Cycle Check)
 */
async function isDescendant(store, nodeId, potentialDescendantId) {
    if (!potentialDescendantId || potentialDescendantId === ROOT_ID) return false;
    if (nodeId === potentialDescendantId) return true;

    let currentId = potentialDescendantId;
    while (currentId && currentId !== ROOT_ID) {
        const node = await store.get(currentId);
        if (!node) break;
        if (node.parentId === nodeId) return true;
        if (node.id === nodeId) return true;
        currentId = node.parentId;
    }
    return false;
}

/**
 * CORE: Get all nodes in a folder
 */
export async function getFolderContents(parentId = null) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('parentId');

    const validParentId = (!parentId) ? ROOT_ID : parentId;
    const nodes = await index.getAll(IDBKeyRange.only(validParentId));

    // Sort: Folders first, then alphabetical (case-insensitive)
    return nodes.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });
}

/**
 * CORE: Get Breadcrumbs (Ancestor Path)
 */
export async function getBreadcrumbs(folderId) {
    if (!folderId || folderId === ROOT_ID) return [];

    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    const crumbs = [];
    let currentId = folderId;
    let safetyGuard = 0;

    while (currentId && currentId !== ROOT_ID && safetyGuard < 50) {
        const node = await store.get(currentId);
        if (!node) break;

        crumbs.unshift({ id: node.id, name: node.name });
        currentId = node.parentId;
        safetyGuard++;
    }

    return crumbs;
}

/**
 * CORE: Get Single Node
 */
export async function getNode(id) {
    const db = await initDB();
    return db.get(STORE_NAME, id);
}

/**
 * ACTION: Create Node (Atomic with Name Check)
 */
export async function createNode(nodeTemplate) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Ensure parentId is safe
    const parentId = (!nodeTemplate.parentId) ? ROOT_ID : nodeTemplate.parentId;
    const type = nodeTemplate.type || 'file';
    const baseName = nodeTemplate.name || (type === 'folder' ? "New Folder" : "Untitled");

    // 1. Ensure Unique Name
    const uniqueName = await ensureUniqueName(store, parentId, baseName, type);

    const now = new Date().toISOString();
    const newNode = {
        ...nodeTemplate,
        id: nodeTemplate.id || crypto.randomUUID(),
        name: uniqueName,
        type,
        parentId,
        createdAt: now,
        updatedAt: now,
        content: nodeTemplate.content || ""
    };

    await store.add(newNode);
    await tx.done;

    return newNode.id;
}

/**
 * ACTION: Rename Node (Atomic with Name Check)
 */
export async function renameNode(id, newName) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const node = await store.get(id);
    if (!node) throw new Error("Node not found");

    if (node.name === newName) return; // No change

    // Check uniqueness in current folder
    const uniqueName = await ensureUniqueName(store, node.parentId, newName, node.type);

    const updatedNode = {
        ...node,
        name: uniqueName,
        updatedAt: new Date().toISOString()
    };

    await store.put(updatedNode);
    await tx.done;
}

/**
 * ACTION: Update File Content
 */
export async function updateFileContent(id, content) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const node = await store.get(id);
    if (!node) throw new Error("Node not found");

    node.content = content;
    node.updatedAt = new Date().toISOString();

    await store.put(node);
    await tx.done;
}

/**
 * ACTION: Move Node (Atomic with Cycle & Name Check)
 */
export async function moveNode(id, targetParentId) {
    const safeTargetId = (!targetParentId) ? ROOT_ID : targetParentId;

    if (id === safeTargetId) throw new Error("Cannot move into self");

    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const node = await store.get(id);
    if (!node) throw new Error("Node not found");

    if (node.parentId === safeTargetId) return; // Already there

    // 1. Cycle Check (if moving folder)
    if (node.type === 'folder') {
        if (await isDescendant(store, id, safeTargetId)) {
            throw new Error("Cannot move folder into its own descendant");
        }
    }

    // 2. Name Uniqueness in Destination
    const uniqueName = await ensureUniqueName(store, safeTargetId, node.name, node.type);

    node.parentId = safeTargetId;
    node.name = uniqueName;
    node.updatedAt = new Date().toISOString();

    await store.put(node);
    await tx.done;
}

/**
 * ACTION: Delete Node (Atomic Recursive)
 */
export async function deleteNode(id) {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('parentId');

    // BFS to find all descendants
    const toDelete = [id];
    let queue = [id];

    while (queue.length > 0) {
        const currentId = queue.shift();
        // Get immediate children using 'only' because they are valid keys now (uuids)
        const children = await index.getAll(IDBKeyRange.only(currentId));

        for (const child of children) {
            toDelete.push(child.id);
            if (child.type === 'folder') {
                queue.push(child.id);
            }
        }
    }

    // Batch delete
    await Promise.all(toDelete.map(nodeId => store.delete(nodeId)));

    await tx.done;
}
