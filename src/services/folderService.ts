/**
 * Folder Service
 * Manages folders (pitch projects) and their tracks in localStorage
 */

export interface FolderMetadata {
  client?: string;
  film?: string;
  description?: string;
  color?: string;
}

export interface Folder {
  id: string;
  name: string;
  trackIds: string[]; // Array of track IDs
  trackCache?: Record<string, { // Cache of track information by track ID
    id: number;
    title: string;
    artist: string;
    album: string;
    duration: string;
    thumbnail?: string;
  }>;
  client?: string;
  film?: string;
  description?: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'viola_folders';

/** Demo folders for Guest users - single Viola starter kit */
export const DEMO_FOLDERS: Folder[] = [
  {
    id: 'demo-viola',
    name: 'Viola',
    trackIds: [],
    client: 'Viola',
    film: 'Viola Project',
    description:
      'Viola is an AI music workspace for sync teams and the creative tastemakers. Locate, Shortlist, and Clear the right tracks without losing your day and sanity.',
    color: 'purple',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const DEFAULT_FOLDERS: Folder[] = [
  {
    id: 'viola-1',
    name: 'Viola',
    trackIds: [],
    client: 'Viola',
    film: 'Viola Project',
    description:
      'Viola is an AI music workspace for sync teams and the creative tastemakers. Locate, Shortlist, and Clear the right tracks without losing your day and sanity.',
    color: 'purple',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

/**
 * Get demo folders (for Guest users)
 */
export const getDemoFolders = (): Folder[] => DEMO_FOLDERS;

/**
 * Get demo folder by ID (for Guest users)
 */
export const getDemoFolderById = (id: string): Folder | null =>
  DEMO_FOLDERS.find(f => f.id === id) || null;

/**
 * Get all folders from localStorage
 */
export const getFolders = (): Folder[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default folders if nothing exists
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FOLDERS));
    return DEFAULT_FOLDERS;
  } catch (error) {
    console.error('Error loading folders:', error);
    return DEFAULT_FOLDERS;
  }
};

/**
 * Save folders to localStorage
 */
export const saveFolders = (folders: Folder[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  } catch (error) {
    console.error('Error saving folders:', error);
  }
};

/**
 * Create a new folder with optional metadata
 */
export const createFolder = (
  name: string,
  metadata?: Partial<FolderMetadata>
): Folder => {
  const folders = getFolders();
  const newFolder: Folder = {
    id: crypto.randomUUID(),
    name: name.trim(),
    trackIds: [],
    client: metadata?.client ?? "",
    film: metadata?.film ?? "",
    description: metadata?.description ?? "",
    color: metadata?.color ?? "red",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  folders.push(newFolder);
  saveFolders(folders);
  return newFolder;
};

/**
 * Get a folder by ID
 */
export const getFolderById = (id: string): Folder | null => {
  const folders = getFolders();
  return folders.find(f => f.id === id) || null;
};

/**
 * Update folder name
 */
export const updateFolderName = (id: string, name: string): void => {
  const folders = getFolders();
  const folder = folders.find(f => f.id === id);
  if (folder) {
    folder.name = name.trim();
    folder.updatedAt = Date.now();
    saveFolders(folders);
  }
};

/**
 * Update folder metadata (client, film, description, color)
 */
export const updateFolderMetadata = (
  id: string,
  metadata: Partial<FolderMetadata>
): void => {
  const folders = getFolders();
  const folder = folders.find(f => f.id === id);
  if (folder) {
    if (metadata.client !== undefined) folder.client = metadata.client;
    if (metadata.film !== undefined) folder.film = metadata.film;
    if (metadata.description !== undefined) folder.description = metadata.description;
    if (metadata.color !== undefined) folder.color = metadata.color;
    folder.updatedAt = Date.now();
    saveFolders(folders);
  }
};

/**
 * Add track IDs to a folder
 * @param trackCache - Optional cache of track information to store with the track IDs
 */
export const addTracksToFolder = (
  folderId: string, 
  trackIds: string[], 
  trackCache?: Record<string, { id: number; title: string; artist: string; album: string; duration: string; thumbnail?: string }>
): void => {
  const folders = getFolders();
  const folder = folders.find(f => f.id === folderId);
  if (folder) {
    // Add track IDs that don't already exist
    const newTrackIds = trackIds.filter(id => !folder.trackIds.includes(id));
    folder.trackIds = [...folder.trackIds, ...newTrackIds];
    
    // Merge track cache if provided
    if (trackCache) {
      if (!folder.trackCache) {
        folder.trackCache = {};
      }
      folder.trackCache = { ...folder.trackCache, ...trackCache };
    }
    
    folder.updatedAt = Date.now();
    saveFolders(folders);
  }
};

/**
 * Remove track IDs from a folder
 */
export const removeTracksFromFolder = (folderId: string, trackIds: string[]): void => {
  const folders = getFolders();
  const folder = folders.find(f => f.id === folderId);
  if (folder) {
    folder.trackIds = folder.trackIds.filter(id => !trackIds.includes(id));
    folder.updatedAt = Date.now();
    saveFolders(folders);
  }
};

/**
 * Delete a folder
 */
export const deleteFolder = (id: string): void => {
  const folders = getFolders();
  const filtered = folders.filter(f => f.id !== id);
  saveFolders(filtered);
};


