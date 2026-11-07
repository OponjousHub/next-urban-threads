import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus, RefundStatus } from "@prisma/client";

import { prisma } from "@/utils/prisma";
import { requireAdminOrOwner } from "@/lib/server/auth";
import { sendEmail } from "@/app/lib/email/sendEmail";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let user;
  let tenant;

  try {
    ({ user, tenant } = await requireAdminOrOwner());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";

    return NextResponse.json(
      { error: message },
      { status: message === "Forbidden" ? 403 : 401 },
    );
  }

  try {
    const body = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    if (!reason || reason.length < 5 || reason.length > 1000) {
      return NextResponse.json(
        { error: "Please provide a reason between 5 and 1000 characters." },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id,
          tenantId: tenant.id,
        },
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          refundStatus: true,
          customerEmail: true,
        },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (order.paymentStatus !== PaymentStatus.PAID) {
        throw new Error("ORDER_NOT_PAID");
      }

      if (
        order.status !== OrderStatus.PENDING &&
        order.status !== OrderStatus.PROCESSING
      ) {
        throw new Error("ORDER_NOT_ELIGIBLE");
      }

      const existingRequest = await tx.cancellationRequest.findUnique({
        where: { orderId: order.id },
      });

      if (existingRequest) {
        if (existingRequest.status !== "WITHDRAWN") {
          throw new Error("CANCELLATION_REQUEST_EXISTS");
        }

        if (
          order.refundStatus !== RefundStatus.NONE &&
          order.refundStatus !== RefundStatus.REJECTED &&
          order.refundStatus !== RefundStatus.CANCELLED
        ) {
          throw new Error("REFUND_ALREADY_EXISTS");
        }

        // Preserve the previous refund record, but release its
        // association so a fresh refund can use this invitation.
        await tx.refundRequest.updateMany({
          where: {
            cancellationRequestId: existingRequest.id,
          },
          data: {
            cancellationRequestId: null,
          },
        });

        const cancellationRequest = await tx.cancellationRequest.update({
          where: {
            id: existingRequest.id,
          },
          data: {
            requestedByAdminId: user.id,
            reason,
            status: "AWAITING_CUSTOMER",
          },
        });

        return {
          order,
          cancellationRequest,
        };
      }

      if (order.refundStatus !== RefundStatus.NONE) {
        throw new Error("REFUND_ALREADY_EXISTS");
      }

      const cancellationRequest = await tx.cancellationRequest.create({
        data: {
          orderId: order.id,
          tenantId: tenant.id,
          requestedByAdminId: user.id,
          reason,
        },
      });

      return {
        order,
        cancellationRequest,
      };
    });

    // Email is sent after the database transaction succeeds.
    // An email failure must not undo the saved cancellation request.
    let emailSent = false;

    const escapeHtml = (value: string) =>
      value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };

        return entities[character];
      });

    try {
      const baseUrl = (
        process.env.NEXT_PUBLIC_APP_URL || "https://www.raynta.com"
      ).replace(/\/$/, "");

      const orderUrl = `${baseUrl}/dashboard/order/${result.order.id}`;

      await sendEmail({
        to: result.order.customerEmail,
        subject: `Action required: Cancellation request for order ${result.order.id}`,
        category: "orders",
        idempotencyKey: `admin-cancellation-request:${result.cancellationRequest.id}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#222;line-height:1.6">
            <h2>Cancellation request for your order</h2>

            <p>
              We are contacting you because the store has requested cancellation
              of your order <strong>${escapeHtml(result.order.id)}</strong>.
            </p>

            <p><strong>Reason provided by the store:</strong></p>

            <p style="padding:14px;background:#f5f5f5;border-radius:6px">
              ${escapeHtml(reason).replace(/\n/g, "<br />")}
            </p>

            <p>
              <strong>Important:</strong> Your order has not yet been cancelled.
              To recover your payment, please sign in to your account and submit
              a refund request for this order.
            </p>

            <p>
              <a href="${escapeHtml(orderUrl)}"
                 style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:5px">
                View order and request refund
              </a>
            </p>

            <p>If you have questions, please contact the store.</p>
          </div>
        `,
      });

      emailSent = true;
    } catch (emailError) {
      console.error(
        "Cancellation request saved, but customer email failed:",
        emailError,
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: emailSent
          ? "Cancellation request sent to the customer."
          : "Cancellation request saved, but the customer email could not be sent.",
        cancellationRequest: result.cancellationRequest,
        emailSent,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create request";

    const errors: Record<string, { status: number; message: string }> = {
      ORDER_NOT_FOUND: { status: 404, message: "Order not found." },
      ORDER_NOT_PAID: { status: 400, message: "Only paid orders qualify." },
      ORDER_NOT_ELIGIBLE: {
        status: 400,
        message: "Cancellation can only be requested before shipment.",
      },
      REFUND_ALREADY_EXISTS: {
        status: 409,
        message: "This order already has a refund in progress or completed.",
      },
      CANCELLATION_REQUEST_EXISTS: {
        status: 409,
        message: "A cancellation request already exists for this order.",
      },
    };

    const knownError = errors[message];

    if (knownError) {
      return NextResponse.json(
        { error: knownError.message },
        { status: knownError.status },
      );
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A cancellation request already exists for this order." },
        { status: 409 },
      );
    }

    console.error("Admin cancellation request error:", error);

    return NextResponse.json(
      { error: "Unable to create the cancellation request." },
      { status: 500 },
    );
  }
}
