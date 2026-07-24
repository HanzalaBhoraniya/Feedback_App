import os from "os";

function findIP() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const idk = iface[i];
      if (
        idk.family === "IPv4" &&
        idk.address != "127.0.0.1" &&
        !idk.internal
      ) {
        return idk.address;
      }
    }
    return "0.0.0.0";
  }
}

export { findIP };
