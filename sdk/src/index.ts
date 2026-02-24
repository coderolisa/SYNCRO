import axios, { type AxiosInstance } from "axios";
import { EventEmitter } from "node:events";

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billing_cycle: string;
  status: string;
  state: string; // Normalized
  nextRenewal?: string; // Normalized
  paymentMethod?: string; // Normalized
  renewal_url?: string;
  cancellation_url?: string;
  [key: string]: any;
}

export interface CancellationResult {
  success: boolean;
  status: "cancelled" | "failed" | "partial";
  subscription: Subscription;
  redirectUrl?: string;
  blockchain?: {
    synced: boolean;
    transactionHash?: string;
    error?: string;
  };
}

export class SyncroSDK extends EventEmitter {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: { apiKey: string; baseUrl?: string }) {
    super();
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: config.baseUrl || "http://localhost:3001/api",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Cancel a subscription programmatically
   * @param subscriptionId The ID of the subscription to cancel
   * @returns Cancellation result including status and optional redirect link
   */
  async cancelSubscription(
    subscriptionId: string,
  ): Promise<CancellationResult> {
    try {
      this.emit("cancelling", { subscriptionId });

      const response = await this.client.post(
        `/subscriptions/${subscriptionId}/cancel`,
      );
      const { data, blockchain } = response.data;

      const result: CancellationResult = {
        success: true,
        status: "cancelled",
        subscription: data,
        redirectUrl: data.cancellation_url || data.renewal_url,
        blockchain: blockchain,
      };

      this.emit("success", result);
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;

      const failedResult: any = {
        success: false,
        status: "failed",
        error: errorMessage,
      };

      this.emit("failure", { subscriptionId, error: errorMessage });
      throw new Error(`Cancellation failed: ${errorMessage}`);
    }
  }

  /**
   * Get subcription details
   */
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const response = await this.client.get(`/subscriptions/${subscriptionId}`);
    return this.normalizeSubscription(response.data.data);
  }

  /**
   * Fetch all user subscriptions with normalization and offline support
   */
  async getUserSubscriptions(): Promise<Subscription[]> {
    const cacheKey = `syncro_subs_${this.apiKey}`;

    try {
      let allSubscriptions: any[] = [];
      let offset = 0;
      const limit = 50;
      let hasMore = true;

      while (hasMore) {
        const response = await this.client.get("/subscriptions", {
          params: { limit, offset },
        });

        const { data, pagination } = response.data;
        allSubscriptions = [...allSubscriptions, ...data];

        if (
          pagination &&
          data.length > 0 &&
          allSubscriptions.length < pagination.total
        ) {
          offset += limit;
        } else {
          hasMore = false;
        }
      }

      const normalized = allSubscriptions.map((sub) =>
        this.normalizeSubscription(sub),
      );

      // Update cache
      this.updateCache(cacheKey, normalized);

      return normalized;
    } catch (error) {
      // Offline/Error support: Check cache
      const cached = this.getCache(cacheKey);
      if (cached) {
        console.warn(
          "SyncroSDK: Network error, returning cached subscriptions.",
        );
        return cached;
      }
      throw error;
    }
  }

  private normalizeSubscription(sub: any): Subscription {
    return {
      ...sub,
      state: sub.status,
      nextRenewal: sub.next_billing_date,
      paymentMethod: sub.payment_method || "Credit Card", // Default if not present
    };
  }

  private updateCache(key: string, data: Subscription[]): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(
          key,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          }),
        );
      }
    } catch (e) {
      // Silently fail if storage is full or unavailable
    }
  }

  private getCache(key: string): Subscription[] | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const cached = localStorage.getItem(key);
        if (cached) {
          return JSON.parse(cached).data;
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }
}

export default SyncroSDK;
