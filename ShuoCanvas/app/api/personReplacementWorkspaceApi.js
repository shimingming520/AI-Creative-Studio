import { get as a108_0x4f3705, post as a108_0x1c6385 } from "./requester.js";
const PERSON_REPLACEMENT_WORKSPACE_USER_FILE = "/api/v2/user/person-replacement-workspace.json";
export async function fetchReplacementStudioWorkspaceFromServer() {
  return await a108_0x4f3705(PERSON_REPLACEMENT_WORKSPACE_USER_FILE, {
    allow404Null: true,
    provider: "local"
  });
}
export async function saveReplacementStudioWorkspaceToServer(_0x5b9796) {
  return await a108_0x1c6385(PERSON_REPLACEMENT_WORKSPACE_USER_FILE, _0x5b9796 || {}, {
    provider: "local"
  });
}
export const fetchPersonReplacementWorkspaceFromServer = fetchReplacementStudioWorkspaceFromServer;
export const savePersonReplacementWorkspaceToServer = saveReplacementStudioWorkspaceToServer;