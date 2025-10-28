import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

const Currency = ({ value }) => <span>KSh {Number(value || 0).toLocaleString()}</span>;

export default function OrderReceipt() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get(`/api/orders/${id}/receipt`);
        setData(res.data);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const onPrint = () => {
    window.print();
  };

  if (loading) return <div className="p-6">Loading receipt…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Order Receipt</h1>
        <button onClick={onPrint} className="px-4 py-2 bg-emerald-600 text-white rounded">Print</button>
      </div>

      <div className="border rounded p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm opacity-70">Order ID</p>
            <p className="font-mono text-sm break-all">{data.orderId}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Paid At</p>
            <p>{data.paidAt ? new Date(data.paidAt).toLocaleString() : 'Not paid'}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Payment Status</p>
            <p className="capitalize">{data.paymentStatus}</p>
          </div>
          <div>
            <p className="text-sm opacity-70">Payment Reference</p>
            <p className="font-mono text-sm break-all">{data.paymentReference || '—'}</p>
          </div>
        </div>
      </div>

      <div className="border rounded p-4 mb-4">
        <p className="mb-2 text-sm opacity-70">Customer</p>
        <p className="font-medium">{data.user?.name}</p>
        <p className="text-sm">{data.user?.email}</p>
      </div>

      <div className="border rounded p-4">
        <p className="mb-2 font-medium">Items</p>
        <div className="divide-y">
          {(data.items || []).map((i, idx) => (
            <div key={idx} className="py-2 flex items-center justify-between">
              <div>
                <p className="font-medium">{i.name}</p>
                <p className="text-sm opacity-70">Qty {i.qty}</p>
              </div>
              <p className="font-medium"><Currency value={i.price * i.qty} /></p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="opacity-70">Total</p>
          <p className="font-semibold"><Currency value={data.totalAmount} /></p>
        </div>
      </div>
    </div>
  );
}


