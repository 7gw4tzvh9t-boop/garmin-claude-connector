import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { DiaryEntry, Product, UserProfile } from "../types";

interface VeganGainsDB extends DBSchema {
  entries: {
    key: string;
    value: DiaryEntry;
    indexes: { "by-date": string };
  };
  products: {
    key: string;
    value: Product;
  };
  profile: {
    key: string;
    value: UserProfile;
  };
}

let dbPromise: Promise<IDBPDatabase<VeganGainsDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<VeganGainsDB>("vegangains", 1, {
      upgrade(db) {
        const entries = db.createObjectStore("entries", { keyPath: "id" });
        entries.createIndex("by-date", "date");
        db.createObjectStore("products", { keyPath: "barcode" });
        db.createObjectStore("profile", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

export async function addEntry(entry: DiaryEntry): Promise<void> {
  const db = await getDb();
  await db.put("entries", entry);
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("entries", id);
}

export async function getEntriesForDate(date: string): Promise<DiaryEntry[]> {
  const db = await getDb();
  return db.getAllFromIndex("entries", "by-date", date);
}

export async function cacheProduct(product: Product): Promise<void> {
  if (!product.barcode) return;
  const db = await getDb();
  await db.put("products", product);
}

export async function getCachedProduct(
  barcode: string,
): Promise<Product | undefined> {
  const db = await getDb();
  return db.get("products", barcode);
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDb();
  await db.put("profile", profile);
}

export async function getProfile(): Promise<UserProfile | undefined> {
  const db = await getDb();
  return db.get("profile", "me");
}

export function todayIso(): string {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}
