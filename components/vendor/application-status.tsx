import Link from "next/link";
export function Pending() {
  return (
    <div className="mx-auto max-w-2xl py-20">
      <div className="rounded-xl border p-8 text-center">
        <div className="text-5xl mb-4">⏳</div>

        <h1 className="text-2xl font-bold">Application Under Review</h1>

        <p className="mt-3 text-muted-foreground">
          Your vendor application has been received and is currently being
          reviewed by our team.
        </p>
      </div>
    </div>
  );
}

export function Approved() {
  return (
    <div className="mx-auto max-w-2xl py-20">
      <div className="rounded-xl border p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>

        <h1 className="text-2xl font-bold">Application Approved</h1>

        <p className="mt-3 text-muted-foreground">
          Congratulations. You are now a vendor and can start selling.
        </p>

        <Link href="/vendor" className="mt-6 inline-flex">
          Go To Vendor Dashboard
        </Link>
      </div>
    </div>
  );
}

export function Rejected({ application: string }) {
  return (
    <div className="mx-auto max-w-2xl py-20">
      <div className="rounded-xl border p-8 text-center">
        <div className="text-5xl mb-4">❌</div>

        <h1 className="text-2xl font-bold">Application Rejected</h1>

        <p className="mt-3 text-muted-foreground">
          Unfortunately your application was not approved.
        </p>

        {application.rejectionReason && (
          <div className="mt-6 rounded-lg bg-muted p-4 text-left">
            <div className="font-semibold">Reason</div>

            <div>{application.rejectionReason}</div>
          </div>
        )}

        <Link href="/account/become-vendor" className="mt-6 inline-flex">
          Submit New Application
        </Link>
      </div>
    </div>
  );
}
