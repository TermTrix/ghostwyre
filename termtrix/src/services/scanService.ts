import axios, { AxiosInstance } from "axios";
import Error from "next/error";

interface ScanRequestType {
  query: string;
}

class ScanService {
  private baseURL: string;
  private client: AxiosInstance;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "";
    this.client = axios.create({
      baseURL: this.baseURL,
      responseType: "json",
    });
  }

  async scanRequest(req: ScanRequestType) {
    try {
      const response = await this.client.post("/scan-target", {
        target: req.query,
      });

      console.log(response.data);
    } catch (error) {}
  }
}

export default new ScanService();
