"use client";

import Link from "next/link";

import { Globe } from "lucide-react";

import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
  FaXTwitter,
  FaLinkedin,
} from "react-icons/fa6";

type Props = {
  vendor: {
    websiteUrl?: string | null;
    facebookUrl?: string | null;
    instagramUrl?: string | null;
    youtubeUrl?: string | null;
    whatsapp?: string | null;
  };
};

export default function VendorSocialLinks({ vendor }: Props) {
  console.log("VENDOR SOCIAL LINKS", vendor);
  const links = [
    {
      href: vendor.websiteUrl,
      label: "Website",
      icon: Globe,
      color: "",
    },
    {
      href: vendor.facebookUrl,
      label: "Facebook",
      icon: FaFacebook,
      color: "text-blue-500",
    },
    {
      href: vendor.instagramUrl,
      label: "Instagram",
      icon: FaInstagram,
      color: "text-pink-500",
    },
    {
      href: vendor.youtubeUrl,
      label: "YouTube",
      icon: FaYoutube,
      color: "text-red-500",
    },
    {
      href: vendor.whatsapp
        ? `https://wa.me/${vendor.whatsapp.replace(/\D/g, "")}`
        : null,
      label: "WhatsApp",
      icon: FaWhatsapp,
      color: "text-green-500",
    },
  ].filter((item) => item.href);

  if (!links.length) return null;

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {links.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href!}
            target="_blank"
            rel="noopener noreferrer"
            className="
              group
              inline-flex
              items-center
              gap-3
              rounded-full
              border
              border-white/50
              bg-white/10
              px-6
              py-3
              backdrop-blur-md
              text-white
              transition-all
              duration-300
              hover:bg-white
              hover:text-black
              hover:shadow-xl
              hover:scale-105
            "
          >
            <Icon
              className={`h-5 w-5 ${item.color} transition-transform duration-300 group-hover:scale-110`}
            />

            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
