import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { Prisma } from "@prisma/client";
// import { getServerSession } from "next-auth";
import AuthController from "@/modules/auth/auth.controller";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    // const session = await getServerSession();

    // if (!session?.user?.id) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized: missing token!",
        },
        { status: 401 }
      );
    }

    // const result = AuthController.verifyToken(token);
    const userId = AuthController.getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { items, shippingAddress, paymentMethod } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // Fetch products from DB
    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map((i: any) => i.productId) },
      },
    });

    // let totalAmount = 0;

    // const orderItems = items.map((item: any) => {
    //   const product = products.find((p) => p.id === item.productId);
    //   if (!product) throw new Error("Product not found");

    //   totalAmount += product.price.toNumber() * item.quantity;

    //   return {
    //     productId: product.id,
    //     quantity: item.quantity,
    //     price: product.price,
    //   };
    // });

    let totalAmount = new Prisma.Decimal(0);

    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Product not found");

      const lineTotal = product.price.mul(item.quantity);
      totalAmount = totalAmount.plus(lineTotal);

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddress,
        paymentMethod,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}
