import React, { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, CheckCircle2, Trash2, MessageSquare, Clock, RefreshCw } from 'lucide-react';
import { queryApi, type CustomerQuery } from '../../api/query.api.js';
import { useAppDispatch } from '../../store/index.js';
import { showErrorToast, showSuccessToast } from '../../store/toastSlice.js';
import { ConfirmModal } from '../common/ConfirmModal.js';

export const AdminQueriesView: React.FC = () => {
  const dispatch = useAppDispatch();
  const [queries, setQueries] = useState<CustomerQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryToDelete, setQueryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQueries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await queryApi.getAllQueries();
      setQueries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load queries');
      dispatch(showErrorToast(err.message || 'Failed to load inquiries'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'new' | 'read' | 'replied') => {
    try {
      const res = await queryApi.updateQueryStatus(id, newStatus);
      setQueries((prev) =>
        prev.map((q) => (q._id === id ? { ...q, status: res.query.status } : q))
      );
      dispatch(showSuccessToast(`Inquiry marked as ${newStatus}`));
    } catch (err: any) {
      dispatch(showErrorToast(err.message || 'Failed to update inquiry status'));
    }
  };

  const confirmDelete = async () => {
    if (!queryToDelete) return;
    setIsDeleting(true);
    try {
      await queryApi.deleteQuery(queryToDelete);
      setQueries((prev) => prev.filter((q) => q._id !== queryToDelete));
      dispatch(showSuccessToast('Inquiry deleted successfully'));
      setQueryToDelete(null);
    } catch (err: any) {
      dispatch(showErrorToast(err.message || 'Failed to delete inquiry'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Customer Inquiries & Messages
          </h2>
          <p className="text-xs text-gray-500">
            Messages sent from the website contact form, stored directly in the database.
          </p>
        </div>
        <button
          onClick={fetchQueries}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {isLoading && queries.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading customer queries...</div>
      ) : queries.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-400 space-y-2">
          <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
          <p>No customer inquiries received yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 space-y-4">
          {queries.map((q) => (
            <div key={q._id} className="pt-4 first:pt-0 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                    {q.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{q.name}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <a href={`mailto:${q.email}`} className="text-blue-600 hover:underline">
                          {q.email}
                        </a>
                      </span>
                      {q.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{q.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 mr-2">
                    <Clock className="w-3 h-3" />
                    {new Date(q.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {/* Status Dropdown */}
                  <select
                    value={q.status}
                    onChange={(e) =>
                      handleStatusChange(q._id, e.target.value as 'new' | 'read' | 'replied')
                    }
                    className={`text-[10px] font-semibold px-2 py-1 rounded-full border cursor-pointer ${
                      q.status === 'new'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : q.status === 'read'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>

                  <button
                    onClick={() => setQueryToDelete(q._id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete inquiry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 leading-relaxed border border-gray-100">
                {q.message}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(queryToDelete)}
        title="Delete Customer Inquiry?"
        message="Are you sure you want to delete this client message? This will permanently remove it from the system."
        confirmLabel="Delete Message"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setQueryToDelete(null)}
      />
    </div>
  );
};
