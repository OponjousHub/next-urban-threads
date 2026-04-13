export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      <p className="text-gray-600 mb-8">
        Have questions? We'd love to hear from you.
      </p>

      <form className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border p-3 rounded-md"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full border p-3 rounded-md"
        />
        <textarea
          placeholder="Your Message"
          className="w-full border p-3 rounded-md h-32"
        />
        <button className="bg-black text-white px-6 py-2 rounded-md">
          Send Message
        </button>
      </form>
    </div>
  );
}
