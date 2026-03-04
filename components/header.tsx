import { prisma } from "@/utils/prisma";
import HeaderClient from "./headerClient";
import { getAuthPayload } from "@/lib/server/auth";

export default async function header() {
  const { role } = await getAuthPayload();

  if (!role) {
    throw new Error("Unauthorized!");
  }

  return <HeaderClient role={role} />;
}
