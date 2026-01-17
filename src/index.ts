import DockerSocket from "./DockerSocket";

(async function () {
  const socket = new DockerSocket();

  await socket.init();

  console.log(await socket.info());

  // await socket.authenticate(
  //   "ghcr.io",
  //   "github_username",
  //   "github_pat",
  // );
  // console.log(socket.token);
})();
