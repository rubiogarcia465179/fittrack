// Web shim de @react-native-async-storage/async-storage (localStorage, mismo API).
let mem = {};
try { mem = JSON.parse(localStorage.getItem('fittrack.storage') || '{}'); } catch {}
function persist() { try { localStorage.setItem('fittrack.storage', JSON.stringify(mem)); } catch {} }
const AsyncStorage = {
  getItem: async (k) => mem[k] !== undefined ? mem[k] : null,
  setItem: async (k, v) => { mem[k] = String(v); persist(); },
  removeItem: async (k) => { delete mem[k]; persist(); },
  clear: async () => { mem = {}; persist(); },
  getAllKeys: async () => Object.keys(mem),
  multiGet: async (ks) => ks.map((k) => [k, mem[k] !== undefined ? mem[k] : null]),
  multiSet: async (pairs) => { for (const [k, v] of pairs) mem[k] = String(v); persist(); },
};
module.exports = AsyncStorage;
module.exports.default = AsyncStorage;
