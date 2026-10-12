import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  MessageCircle,
  Clock,
  Trash2,
  CheckCircle,
  Eye,
  X,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface StoredInquiry {
  id: string;
  fullName: string;
  phone: string;
  category: string;
  subject: string;
  message: string;
  preferredContact: 'Phone Call' | 'WhatsApp' | 'Either';
  status: 'new' | 'in-progress' | 'resolved' | 'archived';
  createdAt: string;
  notes?: string;
}

interface InquiriesManagerProps {
  inquiries: StoredInquiry[];
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: StoredInquiry['status'], notes?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const InquiriesManager: React.FC<InquiriesManagerProps> = ({
  inquiries,
  onRefresh,
  onUpdateStatus,
  onDelete,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [selectedInquiry, setSelectedInquiry] = useState<StoredInquiry | null>(null);
  const [internalNotes, setInternalNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const filtered = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    const matchesSearch =
      search === '' ||
      inq.fullName.toLowerCase().includes(search.toLowerCase()) ||
      inq.phone.includes(search) ||
      inq.message.toLowerCase().includes(search.toLowerCase()) ||
      inq.subject.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openDetails = (inq: StoredInquiry) => {
    setSelectedInquiry(inq);
    setInternalNotes(inq.notes || '');
  };

  const handleStatusChange = async (newStatus: StoredInquiry['status']) => {
    if (!selectedInquiry) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(selectedInquiry.id, newStatus, internalNotes);
      setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus, notes: internalNotes } : null));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(selectedInquiry.id, selectedInquiry.status, internalNotes);
      setSelectedInquiry((prev) => (prev ? { ...prev, notes: internalNotes } : null));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this customer inquiry?')) {
      await onDelete(id);
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Full Name', 'Phone', 'Category', 'Subject', 'Preferred Contact', 'Status', 'Message', 'Notes'];
    const rows = inquiries.map((i) => [
      i.id,
      new Date(i.createdAt).toLocaleString(),
      `"${i.fullName.replace(/"/g, '""')}"`,
      `"${i.phone.replace(/"/g, '""')}"`,
      `"${i.category.replace(/"/g, '""')}"`,
      `"${i.subject.replace(/"/g, '""')}"`,
      i.preferredContact,
      i.status,
      `"${i.message.replace(/"/g, '""')}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tatari_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cleanPhoneForWhatsApp = (phoneStr: string) => {
    // Strip non-numeric, replace leading 0 with 234 if Nigerian
    let cleaned = phoneStr.replace(/\D/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = '234' + cleaned.slice(1);
    }
    return cleaned;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#D8CEC0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#C9A45C] mb-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Showroom Leads</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1511] font-normal">
            Customer Contact & Booking Inquiries
          </h2>
          <p className="text-xs text-[#3A271C]/70">
            Real inquiries submitted through the public website contact form, stored permanently in the database.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-full border border-[#D8CEC0] bg-white hover:bg-[#F6F1E8] text-[#3A271C] transition-colors"
            title="Refresh Inquiries"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full border border-[#5A3E2B] text-[#5A3E2B] hover:bg-[#5A3E2B] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: `All (${inquiries.length})` },
            { id: 'new', label: `New (${inquiries.filter((i) => i.status === 'new').length})` },
            { id: 'in-progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${
                statusFilter === item.id
                  ? 'bg-[#1C1511] text-[#F6F1E8]'
                  : 'bg-white text-[#3A271C] border border-[#D8CEC0] hover:bg-[#F6F1E8]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#3A271C]/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, phone, message..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-[#D8CEC0] bg-white text-xs text-[#1C1511] focus:outline-none focus:ring-1 focus:ring-[#C9A45C]"
          />
        </div>
      </div>

      {/* Inquiries Table / List */}
      <div className="bg-white rounded-2xl border border-[#D8CEC0] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F6F1E8] border-b border-[#D8CEC0] text-[#5A3E2B] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Message Preview</th>
                <th className="py-3.5 px-4">Preferred</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE4D8]">
              {filtered.map((inq) => {
                const dateFormatted = new Date(inq.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <tr key={inq.id} className="hover:bg-[#F6F1E8]/40 transition-colors">
                    <td className="py-4 px-4 text-[#3A271C]/70 whitespace-nowrap font-mono">{dateFormatted}</td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#1C1511]">{inq.fullName}</div>
                      <div className="text-[11px] text-[#5A3E2B] font-mono mt-0.5">{inq.phone}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-[#F6F1E8] text-[#5A3E2B] px-2 py-0.5 rounded text-[10px] font-mono">
                        {inq.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-medium text-[#1C1511] truncate">{inq.subject}</div>
                      <div className="text-[11px] text-[#3A271C]/70 truncate font-light">{inq.message}</div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1 text-[11px]">
                        {inq.preferredContact === 'WhatsApp' ? (
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span>{inq.preferredContact}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          inq.status === 'new'
                            ? 'bg-amber-100 text-amber-800'
                            : inq.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : inq.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => openDetails(inq)}
                          className="p-1.5 rounded-lg bg-[#F6F1E8] hover:bg-[#5A3E2B] hover:text-white text-[#5A3E2B]"
                          title="View Full Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inq.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-10 text-center text-xs text-[#3A271C]/60 font-light">
            No inquiries found for this status or search query.
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 bg-[#1C1511]/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-[#D8CEC0] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#ECE4D8]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#C9A45C] font-semibold">
                  Inquiry ID: {selectedInquiry.id}
                </span>
                <h3 className="font-serif text-2xl text-[#1C1511] font-normal">{selectedInquiry.fullName}</h3>
              </div>
              <button onClick={() => setSelectedInquiry(null)} className="p-1 text-[#3A271C]/60 hover:bg-[#F6F1E8] rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Contacts */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(selectedInquiry.phone)}?text=${encodeURIComponent(
                  `Hello ${selectedInquiry.fullName}, this is Tatari Furniture responding to your inquiry regarding ${selectedInquiry.subject}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#25D366] text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`tel:${selectedInquiry.phone}`}
                className="inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#1C1511] text-[#F6F1E8] text-xs font-semibold uppercase tracking-wider hover:bg-[#3A271C] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Phone</span>
              </a>
            </div>

            {/* Inquiry Details */}
            <div className="space-y-3 bg-[#F6F1E8]/30 p-4 rounded-xl border border-[#D8CEC0] text-xs">
              <div className="flex justify-between">
                <span className="text-[#3A271C]/60 font-semibold">Phone:</span>
                <span className="font-mono text-[#1C1511] font-medium">{selectedInquiry.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3A271C]/60 font-semibold">Furniture Interest:</span>
                <span className="font-semibold text-[#5A3E2B]">{selectedInquiry.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3A271C]/60 font-semibold">Preferred Channel:</span>
                <span>{selectedInquiry.preferredContact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3A271C]/60 font-semibold">Received At:</span>
                <span>{new Date(selectedInquiry.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
                Subject
              </label>
              <div className="p-3 rounded-lg bg-stone-50 border border-[#D8CEC0] text-xs font-medium text-[#1C1511]">
                {selectedInquiry.subject}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
                Customer Message
              </label>
              <div className="p-3.5 rounded-lg bg-stone-50 border border-[#D8CEC0] text-xs leading-relaxed text-[#1C1511] whitespace-pre-wrap font-light">
                {selectedInquiry.message}
              </div>
            </div>

            {/* Status & Staff Notes */}
            <div className="pt-2 border-t border-[#ECE4D8] space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-2">
                  Workflow Status
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['new', 'in-progress', 'resolved', 'archived'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(st)}
                      className={`py-2 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        selectedInquiry.status === st
                          ? 'bg-[#1C1511] text-white border-[#1C1511]'
                          : 'bg-white text-[#3A271C] border-[#D8CEC0] hover:bg-[#F6F1E8]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-[#5A3E2B] mb-1">
                  Internal Staff Notes
                </label>
                <textarea
                  rows={2}
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Record showroom visit details, customer callbacks, or order quotation..."
                  className="w-full p-2.5 rounded-lg border border-[#D8CEC0] text-xs text-[#1C1511]"
                />
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleSaveNotes}
                  className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#C9A45C] hover:text-[#5A3E2B]"
                >
                  {isUpdating ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
