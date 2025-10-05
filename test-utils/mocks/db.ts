// Jest DB-Mock: liefert eine chainbare API mit Promises an den Enden,
// um echte Drizzle/PG-Queries in Tests zu vermeiden.
// Tests können weiterhin jest.spyOn/Mock-Implementierungen auf Methoden anwenden.

// Minimale Helper-Typen
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = any;

function createUpdateChain(state: AnyObj) {
  return {
    set: jest.fn(() => ({
      where: jest.fn(() => ({
        returning: jest.fn(async () => state.updateResultArray),
      })),
    })),
  };
}

function createInsertChain(state: AnyObj) {
  return {
    values: jest.fn(async () => state.insertResult),
  };
}

function createSelectChain(state: AnyObj) {
  const chain: AnyObj = {
    from: jest.fn(() => chain),
    where: jest.fn(() => chain),
    orderBy: jest.fn(() => chain),
    offset: jest.fn(() => chain),
    limit: jest.fn(() => ({ then: (res: (v: AnyObj[]) => void) => res(state.selectResult) })),
    then: (res: (v: AnyObj[]) => void) => res(state.selectResult),
  };
  return chain;
}

function createMockDb() {
  const state: AnyObj = {
    selectResult: [] as AnyObj[],
    updateResult: {},
    updateResultArray: [] as AnyObj[],
    insertResult: {},
    executeHandler: (q: AnyObj) => ({ rows: [] as AnyObj[] }),
  };

  const api: AnyObj = {
    // SELECT ... FROM ... WHERE ... LIMIT -> Promise<Array>
    select: jest.fn(() => createSelectChain(state)),

    // UPDATE ... SET ... WHERE ... -> Promise<any>
    update: jest.fn(() => createUpdateChain(state)),

    // INSERT ... VALUES (...) -> Promise<any>
    insert: jest.fn(() => createInsertChain(state)),

    // Optionale direkte Helfer (falls irgendwo genutzt)
    delete: jest.fn(() => ({ where: jest.fn(async () => ({})) })),

    // SQL-Execute Mock (für raw SQL via drizzle/sql`...`)
    execute: jest.fn(async (q: AnyObj) => state.executeHandler(q)),

    // Test-Hooks zum Setzen der Ergebnisse
    __setSelectResult: (rows: AnyObj[]) => {
      state.selectResult = rows;
    },
    __setUpdateResult: (val: AnyObj) => {
      state.updateResult = val;
    },
    __setUpdateResultArray: (arr: AnyObj[]) => {
      state.updateResultArray = arr;
    },
    __setInsertResult: (val: AnyObj) => {
      state.insertResult = val;
    },
    __setExecuteImpl: (impl: (q: AnyObj) => AnyObj) => {
      state.executeHandler = impl;
    },
    __resetExecuteMock: () => {
      state.executeHandler = () => ({ rows: [] });
    },
  };

  return api;
}

// Singleton-Mock, da die Produktiv-Implementierung ein Singleton liefert
const __mockDb = createMockDb();

// getDb als jest.fn, damit Tests .mockResolvedValue usw. nutzen können
export const getDb: jest.Mock = jest.fn(() => __mockDb as AnyObj);

// Optionaler direkter Export für Tests
export const __mockDbApi = __mockDb;
