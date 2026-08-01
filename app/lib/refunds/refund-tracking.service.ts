import { RefundStatus } from "@prisma/client";
import { prisma } from "@/utils/prisma";

type CreateRefundEventOptions = {
  tenantId: string;
  refundRequestId: string;
  status: RefundStatus;
  title: string;
  description?: string;
  metadata?: any;
};

export async function createRefundTrackingEvent({
  tenantId,
  refundRequestId,
  status,
  title,
  description,
  metadata,
}: CreateRefundEventOptions) {
  return prisma.refundTrackingEvent.create({
    data: {
      tenantId,
      refundRequestId,
      status,
      title,
      description,
      metadata,
    },
  });
}
