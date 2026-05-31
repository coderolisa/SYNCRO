import { describe, it, expect, vi, beforeEach } from "vitest"
import { PaymentService } from "../payment-service"
import { mockSupabaseClient, mockStripeClient } from "../test-utils/mocks"
import { createClient } from "../supabase/server"
import { getStripeInstance } from "../stripe-config"

// Mock the dependencies
vi.mock("../supabase/server", () => ({
  createClient: vi.fn(),
}))

vi.mock("../stripe-config", () => ({
  getStripeInstance: vi.fn(),
  stripeConfig: {},
}))

vi.mock("../paypal-service", () => ({
  getPayPalService: vi.fn(),
}))

import { getPayPalService } from "../paypal-service"

describe("PaymentService", () => {
  let supabase: any
  let stripe: any

  beforeEach(() => {
    vi.clearAllMocks()
    supabase = mockSupabaseClient()
    stripe = mockStripeClient()
    
    vi.mocked(createClient).mockResolvedValue(supabase as any)
    vi.mocked(getStripeInstance).mockReturnValue(stripe as any)
  })

  describe("Stripe Provider", () => {
    it("should process a successful Stripe payment and save to DB", async () => {
      const service = new PaymentService({ provider: "stripe", apiKey: "test_key" })
      const amount = 100
      const metadata = { userId: "user_123", planName: "Premium" }

      stripe.paymentIntents.create.mockResolvedValue({
        id: "pi_123",
        status: "succeeded",
      })

      const result = await service.processPayment(amount, "usd", "pm_123", metadata)

      expect(result.success).toBe(true)
      expect(result.transactionId).toBe("pi_123")
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000,
          currency: "usd",
          payment_method: "pm_123",
        })
      )
      
      // Verify DB insert
      expect(supabase.from).toHaveBeenCalledWith("payments")
      expect(supabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          amount,
          transaction_id: "pi_123",
          provider: "stripe",
          user_id: "user_123",
        })
      )
    })

    it("should handle Stripe payment failure and NOT save to DB", async () => {
      const service = new PaymentService({ provider: "stripe" })
      
      stripe.paymentIntents.create.mockRejectedValue(new Error("Card declined"))

      const result = await service.processPayment(100, "usd", "pm_fail")

      expect(result.success).toBe(false)
      expect(result.error).toBe("Card declined")
      
      // Verify NO DB insert
      expect(supabase.insert).not.toHaveBeenCalled()
    })

    it("should return error if Stripe is not configured", async () => {
      vi.mocked(getStripeInstance).mockReturnValue(null as any)
      const service = new PaymentService({ provider: "stripe" })
      
      const result = await service.processPayment(100, "usd", "pm_123")
      
      expect(result.success).toBe(false)
      expect(result.error).toBe("Stripe not configured")
    })
  })

  describe("PayPal Provider", () => {
    beforeEach(() => {
      process.env.PAYPAL_CLIENT_ID = "test-client"
      process.env.PAYPAL_CLIENT_SECRET = "test-secret"
      process.env.PAYPAL_ENABLED = "true"
    })

    it("should create a PayPal order and save pending payment with order ID", async () => {
      vi.mocked(getPayPalService).mockReturnValue({
        createOrder: vi.fn().mockResolvedValue({
          id: "ORDER-123",
          links: [{ rel: "approve", href: "https://paypal.com/approve/ORDER-123" }],
        }),
        captureOrder: vi.fn(),
        refundCapture: vi.fn(),
      } as any)

      const service = new PaymentService({ provider: "paypal" })
      const result = await service.processPayment(50, "usd", "new-order", {
        userId: "u1",
        planName: "Pro",
      })

      expect(result.success).toBe(true)
      expect(result.requiresAction).toBe(true)
      expect(result.transactionId).toBe("ORDER-123")
      expect(supabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50,
          provider: "paypal",
          status: "pending",
          transaction_id: "ORDER-123",
          metadata: expect.objectContaining({
            provider_transaction_id: "ORDER-123",
          }),
        })
      )
    })

    it("should capture an approved PayPal order and finalize DB with capture ID", async () => {
      const captureOrder = vi.fn().mockResolvedValue({
        purchase_units: [
          {
            payments: {
              captures: [{ id: "CAPTURE-456", status: "COMPLETED" }],
            },
          },
        ],
      })

      vi.mocked(getPayPalService).mockReturnValue({
        createOrder: vi.fn(),
        captureOrder,
        refundCapture: vi.fn(),
      } as any)

      const finalizeSelect = vi.fn().mockResolvedValue({ data: [{ id: "pay-row-1" }], error: null })
      const finalizeEq2 = vi.fn().mockReturnValue({ select: finalizeSelect })
      const finalizeEq1 = vi.fn().mockReturnValue({ eq: finalizeEq2 })
      const finalizeUpdate = vi.fn().mockReturnValue({ eq: finalizeEq1 })

      vi.mocked(createClient).mockResolvedValue({
        from: vi.fn(() => ({
          insert: supabase.insert,
          update: finalizeUpdate,
        })),
      } as any)

      const service = new PaymentService({ provider: "paypal" })
      const result = await service.processPayment(50, "usd", "order_ORDER-123", {
        userId: "u1",
        planName: "Pro",
      })

      expect(result.success).toBe(true)
      expect(result.transactionId).toBe("CAPTURE-456")
      expect(captureOrder).toHaveBeenCalledWith("ORDER-123")
      expect(finalizeUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "succeeded",
          transaction_id: "CAPTURE-456",
          metadata: expect.objectContaining({
            provider_transaction_id: "CAPTURE-456",
            paypal_order_id: "ORDER-123",
          }),
        })
      )
    })

    it("should handle PayPal capture failure and mark payment failed in DB", async () => {
      vi.mocked(getPayPalService).mockReturnValue({
        createOrder: vi.fn(),
        captureOrder: vi.fn().mockResolvedValue({
          purchase_units: [
            {
              payments: {
                captures: [{ id: "CAPTURE-DECLINED", status: "DECLINED" }],
              },
            },
          ],
        }),
        refundCapture: vi.fn(),
      } as any)

      const service = new PaymentService({ provider: "paypal" })
      const result = await service.processPayment(50, "usd", "order_ORDER-999", {
        userId: "u1",
        planName: "Pro",
      })

      expect(result.success).toBe(false)
      expect(supabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "failed",
        })
      )
    })

    it("should fail when PayPal is not configured", async () => {
      vi.mocked(getPayPalService).mockReturnValue(null)

      const service = new PaymentService({ provider: "paypal" })
      const result = await service.processPayment(50, "usd", "new-order", { userId: "u1" })

      expect(result.success).toBe(false)
      expect(result.error).toContain("not configured")
      expect(supabase.insert).not.toHaveBeenCalled()
    })
  })

  describe("Mock Provider", () => {
    it("should process a successful mock payment and save to DB", async () => {
      const service = new PaymentService({ provider: "mock" })
      
      const result = await service.processPayment(10, "usd", "none")

      expect(result.success).toBe(true)
      expect(result.transactionId).toContain("mock_")
      expect(supabase.insert).toHaveBeenCalled()
    })
  })

  describe("Refunds", () => {
    it("should refund a Stripe payment and update DB", async () => {
      const service = new PaymentService({ provider: "stripe" })
      stripe.refunds.create.mockResolvedValue({ id: "re_123" })

      const result = await service.refundPayment("pi_123")

      expect(result.success).toBe(true)
      expect(result.transactionId).toBe("re_123")
      expect(stripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: "pi_123",
      })
      
      // Verify DB update
      expect(supabase.update).toHaveBeenCalledWith({ status: "refunded" })
      expect(supabase.eq).toHaveBeenCalledWith("transaction_id", "pi_123")
    })

    it("should handle Stripe refund failure", async () => {
      const service = new PaymentService({ provider: "stripe" })
      stripe.refunds.create.mockRejectedValue(new Error("Refund failed"))

      const result = await service.refundPayment("pi_123")

      expect(result.success).toBe(false)
      expect(result.error).toBe("Refund failed")
      expect(supabase.update).not.toHaveBeenCalled()
    })

    it("should successfully refund for non-stripe providers (fallback)", async () => {
      const service = new PaymentService({ provider: "mock" })
      
      const result = await service.refundPayment("some_id")

      expect(result.success).toBe(true)
      expect(result.transactionId).toContain("refund_")
    })
  })

  describe("Database Error Handling", () => {
    it("should catch and log database errors but return successful payment result", async () => {
      const service = new PaymentService({ provider: "mock" })
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      
      // Mock DB insert to fail
      supabase.insert.mockRejectedValue(new Error("DB Connection Error"))

      const result = await service.processPayment(100, "usd", "pm_123")

      expect(result.success).toBe(true) // Payment still succeeded
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to save payment to database:",
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })
})
