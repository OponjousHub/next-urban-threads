export default function ActiveSessionsSection() {
  return (
    <div className="border-t pt-4 space-y-3">
      <h3 className="font-medium">Active Sessions</h3>

      <div className="border rounded-lg p-3">
        <p className="font-medium">Chrome on Windows</p>
        <p className="text-sm text-gray-500">Lagos, Nigeria</p>
        <p className="text-xs text-green-600">Current Device</p>
      </div>

      <div className="border rounded-lg p-3 flex justify-between">
        <div>
          <p className="font-medium">iPhone Safari</p>
          <p className="text-sm text-gray-500">Last active: 2 hours ago</p>
        </div>

        <button className="text-red-600 text-sm">Log out</button>
      </div>

      <button className="text-sm underline">
        Log out of all other devices
      </button>
    </div>
  );
}
