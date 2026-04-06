export default function PromoBanner() {
  return (
    <section className="px-6 py-10">
      <div className="bg-primary text-white rounded-xl p-8 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">
            Up to 50% off selected items
          </h3>
          <p className="text-sm opacity-80">Limited time offer</p>
        </div>

        <button className="bg-white text-primary px-6 py-2 rounded-lg">
          Shop Now
        </button>
      </div>
    </section>
  );
}
