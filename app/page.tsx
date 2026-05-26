import { getStoreMode } from "@/app/lib/storeMode";
import SingleVendorHome from "./lib/storeMode/single/page";
import MultiVendorHome from "./lib/storeMode/multi/page";

export default async function HomePage() {
  const mode = await getStoreMode();
  return mode === "SINGLE_VENDOR" ? <SingleVendorHome /> : <MultiVendorHome />;
}
