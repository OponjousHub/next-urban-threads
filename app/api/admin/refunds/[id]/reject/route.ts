// import { rejectRefund } from "@/app/lib/refunds/refund.service";

// export async function POST(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     const { id } = await params;

//     const body = await req.json();

//     const reason = body?.reason;

//     if (typeof reason !== "string" || !reason.trim()) {
//       return Response.json(
//         {
//           success: false,
//           message: "A reason is required when rejecting a refund.",
//         },
//         { status: 400 },
//       );
//     }

//     const result = await rejectRefund(id, reason);

//     return Response.json(result);
//   } catch (error) {
//     console.error("REJECT REFUND ERROR:", error);

//     return Response.json(
//       {
//         success: false,
//         message:
//           error instanceof Error ? error.message : "Failed to reject refund.",
//       },
//       { status: 500 },
//     );
//   }
// }
