import { get as a128_0x37cc61 } from "./requester.js";
export async function fetchAppRuntimeInfoFromServer() {
  const _0x162f85 = await a128_0x37cc61("/api/v2/runtime/info", {
    provider: "local"
  });
  return _0x162f85;
}