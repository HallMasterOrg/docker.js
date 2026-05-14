export interface DockerContainerLog {
  content: string;
  stream: "STDOUT" | "STDERR";
  // RFC3339Nano
  timestamp?: string;
}
