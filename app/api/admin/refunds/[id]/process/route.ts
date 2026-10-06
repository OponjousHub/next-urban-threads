// import { NextResponse } from "next/server";
// import { processRefund } from "@/app/lib/refunds/refund.service";

// export async function POST(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     const { id } = await params;

//     if (!id) {
//       return NextResponse.json(
//         {
//           success: false,
//           message: "Refund ID is required.",
//         },
//         { status: 400 },
//       );
//     }

//     const result = await processRefund(id);

//     return NextResponse.json(result, { status: 200 });
//   } catch (error) {
//     console.error("[PROCESS_REFUND_ERROR]", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message:
//           error instanceof Error ? error.message : "Failed to process refund.",
//       },
//       { status: 500 },
//     );
//   }
// }
import { NextResponse } from "next/server";

import { processRefund } from "@/app/lib/refunds/refund.service";

type RefundOption = "ITEMS_ONLY" | "ITEMS_PLUS_SHIPPING";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Refund ID is required.",
        },
        { status: 400 },
      );
    }

    const body = await req.json().catch(() => ({}));

    const refundOption: RefundOption =
      body?.refundOption === "ITEMS_PLUS_SHIPPING"
        ? "ITEMS_PLUS_SHIPPING"
        : "ITEMS_ONLY";

    const result = await processRefund(id, refundOption);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[PROCESS_REFUND_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to process refund.",
      },
      { status: 500 },
    );
  }
}
