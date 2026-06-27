import { useEffect, useState } from "react";
import api from "../../lib/api";
import { useToast } from "../../components/Toast";
import PasswordConfirmModal from "../../components/PasswordConfirmModal";

export default function OfflineRetailers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", whatsappNumber: "", address: "", notes: "" });
  const { notify } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/offline-customers", { params: { q } });
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [q]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/admin/offline-customers/${editing._id}`, form);
      notify("Retailer updated", "success");
    } else {
      await api.post("/admin/offline-customers", form);
      notify("Retailer added", "success");
    }
    setShowAdd(false);
    setEditing(null);
    setForm({ name: "", email: "", phone: "", whatsappNumber: "", address: "", notes: "" });
    load();
  };

  const handleDeleteConfirm = async (password) => {
    try {
      await api.delete(`/admin/offline-customers/${toDelete._id}`, { data: { password } });
      setToDelete(null);
      notify("Retailer deleted", "success");
      load();
    } catch {
      notify("Invalid deletion password", "error");
    }
  };

  const handleDelete = async () => {
    // Now handled by PasswordConfirmModal
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, email: item.email, phone: item.phone, whatsappNumber: item.whatsappNumber, address: item.address, notes: item.notes });
    setShowAdd(true);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offline Retailers</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Manage walk-in retailers</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search retailers..."
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-4 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            onClick={() => {
              setEditing(null);
              setForm({ name: "", email: "", phone: "", whatsappNumber: "", address: "", notes: "" });
              setShowAdd(!showAdd);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-900 text-white border border-gray-900 hover:bg-gray-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            {showAdd ? "Close" : "Add Retailer"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-top-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? "Edit Retailer" : "Add New Retailer"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Name</label>
              <input
                required
                type="text"
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Retailer name"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Phone</label>
              <input
                required
                type="text"
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">WhatsApp Number</label>
              <input
                type="text"
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                placeholder="WhatsApp number"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Email</label>
              <input
                type="email"
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Address</label>
              <textarea
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Address"
                rows="2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Notes</label>
              <textarea
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notes"
                rows="2"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setEditing(null);
                }}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-900 text-white border border-gray-900 hover:bg-gray-800"
              >
                {editing ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Phone</th>
              <th className="px-6 py-4 text-left">WhatsApp</th>
              <th className="px-6 py-4 text-left">Total Spent</th>
              <th className="px-6 py-4 text-left">Total Orders</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400">No retailers yet</td></tr>
            ) : items.map(item => (
              <tr key={item._id} className="group hover:bg-gray-50/50">
                <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-gray-600">{item.phone}</td>
                <td className="px-6 py-4 text-gray-600">{item.whatsappNumber || "-"}</td>
                <td className="px-6 py-4 font-bold text-gray-900">₹{item.totalSpent?.toLocaleString() || 0}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{item.totalOrders || 0}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => openEdit(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setToDelete(item)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toDelete && (
        <PasswordConfirmModal
          open={!!toDelete}
          title="Delete Offline Retailer"
          message="Enter deletion password to confirm permanent removal:"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
