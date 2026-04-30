import Link from "next/link";

type MobileDrawerProps = {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function MobileDrawer({
  menuOpen,
  setMenuOpen,
  categories,
}: MobileDrawerProps) {
  return (
    <>
      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* DRAWER */}
      <div
        className={`fixed top-0 left-0 h-full w-[270px] bg-white shadow-xl z-[9999] transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex flex-col gap-5 text-lg font-medium">
          <button onClick={() => setMenuOpen(false)}>✕ Close</button>

          <Link href="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-lg hover:text-[var(--color-primary)] transition"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
