import { BrandLoader } from "@/components/ui/brand-loader";

/** Shown while this route's data is being fetched. */
export default function Loading() {
  return <BrandLoader label="Loading patterns" />;
}
