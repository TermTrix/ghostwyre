import axios, { AxiosInstance } from "axios";

interface ScanRequestType {
  query: string;
  session:string
}

interface ConnectClient {
  client_id: string;
}

class ScanService {
  private baseURL: string;
  private client: AxiosInstance;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "";
    this.client = axios.create({
      baseURL: this.baseURL,
      responseType: "json",
      withCredentials:true
    });
  }

  async Connect(): Promise<ConnectClient> {
    try {
      const response = await this.client.get("/connect");
      const data = response.data;
      console.log(data,"DATA");
      
      return data;
    } catch (error) {
      console.log("[ERROR DURING CLIENT CONNECT]", error);
      throw error;
    }
  }

  // Non-streaming entry point. The chat flow does NOT use this — it runs the
  // agent over the socket, which is the only path that can stream progress back.
  async scanRequest(req: ScanRequestType) {
    try {
      const response = await this.client.post("/scan-target", {
        target: req.query,
        session: req.session,
      });

      console.log(response.data);
    } catch (error) {
      console.log("[ERROR DURING SCAN REQUEST]", error);
      throw error;
    }
  }
}

export default new ScanService();
