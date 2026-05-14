import { DockerImagesAPI, DockerSocket } from "@hallmaster/docker.js";

(async function () {
  const socket = new DockerSocket();
  await socket.init();

  const api = new DockerImagesAPI(socket);

  console.log("Case 1: existing public image (nginx:latest)");
  const t1 = Date.now();
  try {
    await api.verify({ fromImage: "nginx", tag: "latest" });
    console.log(`verified in ${Date.now() - t1}ms`);
  } catch (e) {
    console.log(
      `  ✗ unexpected error: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  console.log("Case 2: non-existent public image (nginx:does-not-exist-tag)");
  const t2 = Date.now();
  try {
    await api.verify({ fromImage: "nginx", tag: "does-not-exist-tag" });
    console.log("should have thrown");
  } catch (e) {
    console.log(
      `rejected in ${Date.now() - t2}ms: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  console.log("Case 3: non-existent repository (this-repo-does-not-exist-xyz)");
  const t3 = Date.now();
  try {
    await api.verify({
      fromImage: "this-repo-does-not-exist-xyz",
      tag: "latest",
    });
    console.log("should have thrown");
  } catch (e) {
    console.log(
      `rejected in ${Date.now() - t3}ms: ${e instanceof Error ? e.message : String(e)}`,
    );
  }

  console.log("Case 4: private registry with invalid credentials");
  const t4 = Date.now();
  try {
    await api.verify({
      fromImage: "localhost:5001/admin/dockerjs-test-image0",
      tag: "latest",
      auth: {
        serveraddress: "localhost:5001",
        username: "admin",
        password: "wrong-password",
      },
    });
    console.log("should have thrown");
  } catch (e) {
    console.log(
      `rejected in ${Date.now() - t4}ms: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
})().catch((e) => {
  console.error("Unhandled error:", e);
  process.exit(1);
});
