import a726_0x597187, { createLegacyKernelStore } from "./legacyKernelStore.js";
import { createFacadeStore, createFacadeStoreFromCore } from "./facadeStore.js";
const facadeStore = createFacadeStoreFromCore(a726_0x597187);
const {
  graphStore,
  uiStore,
  workspaceStore
} = facadeStore.getDomainStores();
function createStore() {
  return createFacadeStore();
}
function createDomainStores() {
  const _0x358d01 = createLegacyKernelStore();
  const _0x2d9569 = createFacadeStoreFromCore(_0x358d01);
  return _0x2d9569.getDomainStores();
}
export { facadeStore, graphStore, uiStore, workspaceStore, a726_0x597187 as legacyKernelStore, createStore, createDomainStores, createLegacyKernelStore };
export default facadeStore;