import {
  DockerContainersAPI,
  DockerImagesAPI,
  DockerSocket,
} from "@hallmaster/docker.js";

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

(async function () {
  const socket = new DockerSocket();
  await socket.init();

  const dockerImagesAPI = new DockerImagesAPI(socket);

  console.log("Downloading busybox image...");
  await dockerImagesAPI.create({
    fromImage: "busybox",
    tag: "latest",
  });
  console.log("busybox image downloaded.");

  const dockerContainersAPI = new DockerContainersAPI(socket);

  const createdContainer = await dockerContainersAPI.create(
    {
      Image: "busybox:latest",
      Cmd: ["sh", "-c", "while true; do echo working; sleep 1; done"],
      Labels: {
        "@hallmaster/docker.js": "true",
      },
    },
    "busybox-stream-stats-test",
  );

  await dockerContainersAPI.start(createdContainer.Id);

  await sleep(2000);

  console.log("--- STREAM STATS BEGIN ---");

  const stream = await dockerContainersAPI.stats(createdContainer.Id, {
    stream: true,
  });

  let received = 0;
  stream.on("data", (stats) => {
    received += 1;
    const cpuDelta =
      stats.cpu_stats.cpu_usage.total_usage -
      stats.precpu_stats.cpu_usage.total_usage;
    console.log(
      `[${stats.read}] pids=${stats.pids_stats.current} cpu_delta=${cpuDelta} mem=${stats.memory_stats.usage}`,
    );
  });

  stream.on("error", (err) => {
    console.error("Stream error:", err);
  });

  await sleep(10000);

  console.log(`\n--- STREAM STATS END (received ${received} samples) ---`);

  stream.destroy();

  console.log("Killing test container");
  await dockerContainersAPI.kill(createdContainer.Id);
  console.log("Test container killed");

  console.log("Removing test container");
  await dockerContainersAPI.remove(createdContainer.Id);
  console.log("Test container removed");
})();
