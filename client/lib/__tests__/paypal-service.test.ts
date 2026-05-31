import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { PayPalService, getPayPalService } from "../paypal-service"

const originalEnv = process.env

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

describe("PayPalService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
    process.env = {
      ...originalEnv,
      PAYPAL_CLIENT_ID: "test-client",
      PAYPAL_CLIENT_SECRET: "test-secret",
      PAYPAL_MODE: "sandbox",
      PAYPAL_ENABLED: "true",
    }
  })

  afterEach(() => {
    process.env = originalEnv
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it("returns null when PAYPAL_ENABLED=false", () => {
    process.env.PAYPAL_ENABLED = "false"
    expect(getPayPalService()).toBeNull()
  })

  it("obtains an access token and creates an order", async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "token-abc", expires_in: 3600 }))
      .mockResolvedValueOnce(
        jsonResponse({
          id: "ORDER-ABC",
          status: "CREATED",
          links: [{ rel: "approve", href: "https://sandbox.paypal.com/approve", method: "GET" }],
        })
      )

    const service = new PayPalService({
      clientId: "id",
      clientSecret: "secret",
      mode: "sandbox",
    })

    const order = await service.createOrder(25.5, "usd", {
      userId: "user-1",
      planName: "Pro",
      returnUrl: "https://app.test/success",
      cancelUrl: "https://app.test/cancel",
    })

    expect(order.id).toBe("ORDER-ABC")
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][0]).toContain("/v2/checkout/orders")
  })

  it("captures an approved order and returns capture details", async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "token-abc", expires_in: 3600 }))
      .mockResolvedValueOnce(
        jsonResponse({
          id: "ORDER-ABC",
          status: "COMPLETED",
          purchase_units: [
            {
              payments: {
                captures: [
                  {
                    id: "CAPTURE-XYZ",
                    status: "COMPLETED",
                    amount: { currency_code: "USD", value: "25.50" },
                  },
                ],
              },
            },
          ],
        })
      )

    const service = new PayPalService({
      clientId: "id",
      clientSecret: "secret",
      mode: "sandbox",
    })

    const capture = await service.captureOrder("ORDER-ABC")
    expect(capture.purchase_units[0].payments.captures[0].id).toBe("CAPTURE-XYZ")
    expect(fetchMock.mock.calls[1][0]).toContain("/orders/ORDER-ABC/capture")
  })

  it("retries transient PayPal API failures", async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "token-abc", expires_in: 3600 }))
      .mockResolvedValueOnce(jsonResponse({ message: "upstream error" }, 503))
      .mockResolvedValueOnce(
        jsonResponse({
          id: "ORDER-RETRY",
          status: "CREATED",
          links: [],
        })
      )

    const service = new PayPalService({
      clientId: "id",
      clientSecret: "secret",
      mode: "sandbox",
    })

    const order = await service.createOrder(10, "usd", {
      userId: "user-1",
      planName: "Basic",
      returnUrl: "https://app.test/success",
      cancelUrl: "https://app.test/cancel",
    })

    expect(order.id).toBe("ORDER-RETRY")
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it("surfaces permanent API errors without retrying 4xx responses", async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ access_token: "token-abc", expires_in: 3600 }))
      .mockResolvedValueOnce(jsonResponse({ message: "invalid request" }, 400))

    const service = new PayPalService({
      clientId: "id",
      clientSecret: "secret",
      mode: "sandbox",
    })

    await expect(
      service.createOrder(10, "usd", {
        userId: "user-1",
        planName: "Basic",
        returnUrl: "https://app.test/success",
        cancelUrl: "https://app.test/cancel",
      })
    ).rejects.toThrow(/order creation failed/i)

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
