import { get as a188_0x3cfb24, post as a188_0x184f65 } from "./requester.js";
const VIDEO_REPLICATION_WORKSPACE_USER_FILE = "/api/v2/user/video-replication-workspace.json";
export async function fetchVideoReplicationWorkspaceFromServer() {
  return await a188_0x3cfb24(VIDEO_REPLICATION_WORKSPACE_USER_FILE, {
    allow404Null: true,
    provider: "local"
  });
}
export async function saveVideoReplicationWorkspaceToServer(_0x50946a) {
  return await a188_0x184f65(VIDEO_REPLICATION_WORKSPACE_USER_FILE, _0x50946a || {}, {
    provider: "local"
  });
}