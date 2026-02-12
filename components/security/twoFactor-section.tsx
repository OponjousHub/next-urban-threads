export default function TwoFactorSection() {
  return (
    <div className="border-t pt-4">
      <h3 className="font-medium">Two-Factor Authentication</h3>

      <p className="text-sm text-gray-500 mt-1">Status: Not Enabled</p>

      <button className="mt-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
        Enable 2FA
      </button>
    </div>
  );
}
