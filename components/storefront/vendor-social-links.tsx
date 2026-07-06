import Link from "next/link";

import { Globe, Instagram, Facebook, Youtube, Linkedin } from "lucide-react";

type Props = {
  vendor: {
    websiteUrl: string | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    twitterUrl: string | null;
    youtubeUrl: string | null;
    linkedinUrl: string | null;
    whatsapp: string | null;
  };
};

export default function VendorSocialLinks({ vendor }: Props) {
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {vendor.websiteUrl && (
        <Link
          href={vendor.websiteUrl}
          target="_blank"
          className="rounded-full border p-3 hover:bg-gray-100"
        >
          <Globe size={18} />
        </Link>
      )}

      {vendor.facebookUrl && (
        <Link
          href={vendor.facebookUrl}
          target="_blank"
          className="rounded-full border p-3 hover:bg-gray-100"
        >
          <Facebook size={18} />
        </Link>
      )}

      {vendor.instagramUrl && (
        <Link
          href={vendor.instagramUrl}
          target="_blank"
          className="rounded-full border p-3 hover:bg-gray-100"
        >
          <Instagram size={18} />
        </Link>
      )}

      {vendor.youtubeUrl && (
        <Link
          href={vendor.youtubeUrl}
          target="_blank"
          className="rounded-full border p-3 hover:bg-gray-100"
        >
          <Youtube size={18} />
        </Link>
      )}

      {vendor.linkedinUrl && (
        <Link
          href={vendor.linkedinUrl}
          target="_blank"
          className="rounded-full border p-3 hover:bg-gray-100"
        >
          <Linkedin size={18} />
        </Link>
      )}

      {vendor.whatsapp && (
        <Link
          href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          className="rounded-full border p-3 hover:bg-gray-100"
        >
          💬
        </Link>
      )}
    </div>
  );
}
