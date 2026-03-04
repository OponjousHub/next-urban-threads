import { prisma } from "@/utils/prisma";
import HeaderClient from "./headerClient";
import { getOptionalAuthPayload } from "@/lib/server/auth";

export default async function header() {
  const { role } = await getOptionalAuthPayload();

  return <HeaderClient role={role} />;
}
