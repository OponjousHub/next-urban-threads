// import Image from "next/image";
// import { cloudinaryUrl } from "@/lib/cloudinary-url";

// type ProductCardProps = {
//   name: string;
//   image: string;
//   price: number;
// };

// export default function ProductCard({ name, image, price }: ProductCardProps) {
//   return (
//     <div className="rounded-lg border p-4">
//       <Image
//         src={cloudinaryUrl(image, 400, 400)}
//         alt={name}
//         width={400}
//         height={400}
//         className="rounded-md"
//       />
//       <h3 className="mt-2 font-semibold">{name}</h3>
//       <p className="text-gray-600">₦{price.toLocaleString()}</p>
//     </div>
//   );
// }
