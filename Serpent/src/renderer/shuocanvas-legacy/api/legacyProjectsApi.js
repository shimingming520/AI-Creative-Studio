import { get as a91_0x44dfbe, post as a91_0x1aec84, del as a91_0x253c54 } from "./requester.js";
export async function getProjects() {
  try {
    const _0x375f07 = await a91_0x44dfbe("/api/projects", {
      provider: "local"
    });
    if (Array.isArray(_0x375f07)) {
      return _0x375f07;
    } else {
      return [];
    }
  } catch (_0x456085) {
    console.error("Failed to get projects:", _0x456085);
    return [];
  }
}
export async function createProject(_0x57ce42, _0x5abe48) {
  try {
    await a91_0x1aec84("/api/projects", {
      id: _0x57ce42,
      name: _0x5abe48
    }, {
      provider: "local"
    });
    return _0x57ce42;
  } catch (_0x1ad13a) {
    console.error("Failed to create project:", _0x1ad13a);
    return null;
  }
}
export async function deleteProject(_0x36d5e2) {
  try {
    await a91_0x253c54("/api/projects?id=" + _0x36d5e2, {
      provider: "local"
    });
    return true;
  } catch (_0x4c2eec) {
    console.error("Failed to delete project:", _0x4c2eec);
    return false;
  }
}