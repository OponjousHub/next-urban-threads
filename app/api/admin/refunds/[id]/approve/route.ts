import { approveRefund } from "@/app/lib/refunds/refund.service";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const result = await approveRefund(params.id);
  return Response.json(result);
}
