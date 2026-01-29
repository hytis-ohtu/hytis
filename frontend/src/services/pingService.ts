import { BASE_URL } from "../constants";

async function pingServer(): Promise<string> {
  const response = await fetch(`${BASE_URL}/ping`, {
    method: "GET",
  });

  return response.text();
}

export default pingServer;
