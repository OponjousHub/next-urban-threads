import { rejectRefund } from "@/app/lib/refunds/refund.service";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const param = await params;

  const result = await rejectRefund(param.id);
  return Response.json(result);
}
