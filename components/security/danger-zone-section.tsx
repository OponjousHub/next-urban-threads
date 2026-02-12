export default function DangerZoneSection() {
  return (
    <div className="border-t pt-4">
      <h3 className="text-red-600 font-medium">⚠ Danger Zone</h3>

      <div className="flex gap-3 mt-2">
        <button className="px-4 py-2 border border-red-500 text-red-600 rounded-lg">
          Logout Everywhere
        </button>

        <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
          Deactivate Account
        </button>
      </div>
    </div>
  );
}
