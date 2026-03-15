interface AvatarProps {
  name: string;
}

export default function Avatar({ name }: AvatarProps) {
  const colors = [
    "bg-red-100 text-red-600",
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-purple-100 text-purple-600",
    "bg-orange-100 text-orange-600",
    "bg-indigo-100 text-indigo-600",
  ];

  // Generate stable color based on name
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${colors[index]}`}
    >
      {initials}
    </div>
  );
}
