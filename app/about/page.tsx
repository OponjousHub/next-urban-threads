import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

const DEFAULT_ABOUT_TITLE = "About Us";

const DEFAULT_ABOUT_DESCRIPTION =
  "We are committed to bringing you quality products, a seamless shopping experience, and service you can trust.";

const DEFAULT_ABOUT_STORY = `Our Story

Our journey began with a simple idea — to make discovering and purchasing quality products easier, more enjoyable, and more reliable.

We believe shopping should be more than simply finding a product. It should be an experience built around quality, convenience, trust, and excellent service.

That's why we carefully select our products and continuously work to improve the way we serve our customers.

From the moment you discover a product to the moment it arrives at your doorstep, our goal is to provide a smooth and dependable shopping experience.

We are committed to building lasting relationships with our customers and earning your trust with every order.

Thank you for choosing us and becoming part of our journey.`;

export default async function AboutPage() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found!");
  }

  /*
  |--------------------------------------------------------------------------
  | Use saved tenant content when available.
  |
  | If the store is still completely new and the admin has not saved
  | the About page yet, show the same professional defaults used in
  | the admin settings.
  |--------------------------------------------------------------------------
  */

  const title = tenant.aboutTitle?.trim() || DEFAULT_ABOUT_TITLE;

  const description =
    tenant.aboutDescription?.trim() || DEFAULT_ABOUT_DESCRIPTION;

  const story = tenant.aboutStory?.trim() || DEFAULT_ABOUT_STORY;

  const image = tenant.aboutImage?.trim() || null;

  /*
  |--------------------------------------------------------------------------
  | Split the story into paragraphs.
  |
  | The admin About editor uses a textarea, so paragraphs are separated
  | by blank lines.
  |--------------------------------------------------------------------------
  */

  const storyParagraphs = story
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="bg-white text-gray-900">
      <div className="mx-auto max-w-6xl space-y-20 px-6 py-20 lg:px-8 lg:py-24">
        {/* ========================================================= */}
        {/* PAGE HEADER */}
        {/* ========================================================= */}

        <section className="space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
            About Us
          </p>

          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>

          {description && (
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
              {description}
            </p>
          )}
        </section>

        {/* ========================================================= */}
        {/* ABOUT IMAGE */}
        {/* ========================================================= */}

        {image && (
          <section>
            <div className="overflow-hidden rounded-3xl border border-gray-100">
              <img
                src={image}
                alt="About our store"
                className="h-[300px] w-full object-cover md:h-[420px]"
              />
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* OUR STORY */}
        {/* ========================================================= */}

        {storyParagraphs.length > 0 && (
          <section className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-gray-400">
                Our Story
              </p>

              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                More than just shopping
              </h2>
            </div>

            <div className="space-y-5 text-lg leading-8 text-gray-700">
              {storyParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* DIVIDER */}
        {/* ========================================================= */}

        <div className="border-t border-gray-100" />

        {/* ========================================================= */}
        {/* CUSTOMER-FOCUSED CLOSING SECTION */}
        {/* ========================================================= */}

        <section className="mx-auto max-w-3xl space-y-5 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Thank you for choosing us
          </h2>

          <p className="text-lg leading-relaxed text-gray-600">
            We appreciate your trust and look forward to giving you a shopping
            experience you can rely on.
          </p>
        </section>
      </div>
    </div>
  );
}
