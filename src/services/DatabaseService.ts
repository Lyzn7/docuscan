import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export const initDatabase = async () => {
    db = await SQLite.openDatabaseAsync('docuscan.db');
    await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      thumbnailUri TEXT,
      pageCount INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY NOT NULL,
      documentId TEXT NOT NULL,
      imageUri TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      FOREIGN KEY (documentId) REFERENCES documents (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS document_meta (
      documentId TEXT PRIMARY KEY NOT NULL,
      saveType TEXT NOT NULL,
      folderPath TEXT NOT NULL,
      imagesPath TEXT,
      pdfPath TEXT,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY (documentId) REFERENCES documents (id) ON DELETE CASCADE
    );
  `);
};

export const getDatabase = () => db;
