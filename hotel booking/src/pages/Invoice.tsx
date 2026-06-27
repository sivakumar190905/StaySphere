import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Booking } from '../store/AppContext';
import { Printer, ArrowLeft, Globe, FileText, CheckCircle2 } from 'lucide-react';

export const Invoice: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!invoiceId) return;

      try {
        setLoading(true);
        // Normalize the ID: convert invoice code (INV-2026-xxxxx) to booking ID (STS-2026-xxxxx)
        let resolvedBookingId = invoiceId;
        if (invoiceId.toUpperCase().startsWith('INV-')) {
          resolvedBookingId = 'STS-' + invoiceId.substring(4);
        }

        const data = await api.bookings.getById(resolvedBookingId);
        setBooking(data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching booking details for invoice:', err);
        setError(err.message || 'Failed to load invoice details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
          <p className="text-slate-600 font-bold text-sm">Retrieving your secure invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <FileText size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Invoice Not Found</h2>
          <p className="text-slate-500 text-sm">
            {error || "We couldn't retrieve the requested invoice details. Please verify the URL or try again."}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all border-none cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Formatting variables
  const formattedInvoiceNumber = 'INV-' + booking.id.substring(4).toUpperCase();
  const subtotal = Math.round(booking.totalPrice / (booking.couponCode ? 1.0 : 1.12));
  const cgstAmount = booking.cgst ?? Math.round(booking.totalPrice * 0.06);
  const sgstAmount = booking.sgst ?? Math.round(booking.totalPrice * 0.06);
  const totalTaxes = cgstAmount + sgstAmount;

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6 print:m-0 print:p-0">
        
        {/* Navigation & Controls Actions (Hidden on Print) */}
        <div className="flex justify-between items-center no-print">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs font-extrabold text-slate-655 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-xs font-extrabold text-white bg-slate-900 hover:bg-brand-600 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <Printer size={14} /> Print Invoice
          </button>
        </div>

        {/* Invoice Printable Document Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xl space-y-8 print-card">
          
          {/* Header section with brand and meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-8">
            <div className="space-y-2">
              <h1 className="logo text-3xl font-black m-0 leading-none">
                <span className="logo-stay text-[#021B5B]">Stay</span>
                <span className="logo-sphere text-[#2563EB]">Sphere</span>
              </h1>
              <span className="text-slate-400 text-xxs font-extrabold block tracking-wider uppercase">
                Premium Hospitality Invoice
              </span>
            </div>
            
            <div className="sm:text-right space-y-2">
              <div className="flex sm:justify-end items-center gap-2">
                <span className="bg-emerald-50 text-emerald-700 text-xxs font-black px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={12} /> {booking.status}
                </span>
              </div>
              <p className="text-sm font-mono font-bold text-slate-800 m-0">
                Invoice No: <span className="text-brand-600">{formattedInvoiceNumber}</span>
              </p>
              <p className="text-xxs text-slate-400 font-bold m-0 uppercase tracking-wider">
                Date: {new Date(booking.createdAt || Date.now()).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Billing party and corporate address columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold text-slate-500 tracking-wide">
            <div className="space-y-2">
              <span className="text-slate-400 text-[10px] block font-black uppercase tracking-widest">Billed To:</span>
              <p className="text-slate-800 font-extrabold text-sm m-0">{booking.guestDetails.fullName}</p>
              <p className="text-slate-600 font-medium lowercase m-0">{booking.guestDetails.email}</p>
              <p className="text-slate-600 font-medium m-0">{booking.guestDetails.phone}</p>
            </div>
            
            <div className="md:text-right space-y-2">
              <span className="text-slate-400 text-[10px] block font-black uppercase tracking-widest">Corporate Entity:</span>
              <p className="text-slate-850 font-extrabold text-sm m-0">StaySphere Travel Technologies Private Limited</p>
              <p className="text-slate-600 font-medium m-0">UB City, Vittal Mallya Road</p>
              <p className="text-slate-650 font-medium m-0">Bangalore, Karnataka - 560001, India</p>
            </div>
          </div>

          {/* Optional corporate GST Details */}
          {booking.gstin && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-bold text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
              <div>
                <span className="text-slate-400 text-[9px] block uppercase tracking-widest mb-0.5">Registered Corporate Client</span>
                <span className="text-slate-800 font-extrabold">{booking.gstCompany}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-slate-400 text-[9px] block uppercase tracking-widest mb-0.5">Client GSTIN</span>
                <span className="text-slate-800 font-extrabold font-mono">{booking.gstin}</span>
              </div>
            </div>
          )}

          {/* Reservation / Stay Details Table */}
          <div className="space-y-4">
            <h3 className="text-slate-800 text-xs font-black uppercase tracking-wider border-b border-slate-100 pb-2">
              Stay & Accommodation Summary
            </h3>
            
            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wide">Property</span>
                  <span className="text-slate-800 font-extrabold">{booking.hotelName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wide">Accommodation Type</span>
                  <span className="text-slate-800 font-extrabold">{booking.roomName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-4 border-t border-slate-100/80">
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wide">Check-In Date</span>
                  <span className="text-slate-800 font-bold font-mono">{booking.checkIn}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wide">Check-Out Date</span>
                  <span className="text-slate-800 font-bold font-mono">{booking.checkOut}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wide">Guests</span>
                  <span className="text-slate-800 font-bold">{booking.guests} Guests</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wide">Rooms Reserved</span>
                  <span className="text-slate-800 font-bold">{booking.rooms} Room(s)</span>
                </div>
              </div>

              {booking.assignedRoomNumber && (
                <div className="pt-3 border-t border-slate-100/80 text-xs flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase tracking-wide">Assigned Room Number</span>
                  <span className="bg-blue-50 text-blue-700 font-black px-2.5 py-0.5 rounded text-xs">
                    Room {booking.assignedRoomNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing breakdown table */}
          <div className="space-y-4">
            <h3 className="text-slate-800 text-xs font-black uppercase tracking-wider border-b border-slate-100 pb-2">
              Billing Ledger Breakdown
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                    <th className="py-3 px-1">Description</th>
                    <th className="py-3 px-1 text-right">Tax Rate</th>
                    <th className="py-3 px-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  <tr>
                    <td className="py-4 px-1">
                      <p className="font-extrabold text-slate-800 m-0">Room Rental Charges</p>
                      <p className="text-slate-400 text-[10px] m-0">Standard lodging rate for {booking.roomName} at {booking.hotelName}</p>
                    </td>
                    <td className="py-4 px-1 text-right text-slate-400 font-mono">0.00%</td>
                    <td className="py-4 px-1 text-right text-slate-800 font-mono">₹{subtotal.toLocaleString('en-IN')}</td>
                  </tr>

                  {booking.discountAmount && (
                    <tr className="text-emerald-600">
                      <td className="py-4 px-1">
                        <p className="font-extrabold m-0">Promo Code Discount ({booking.couponCode})</p>
                        <p className="text-emerald-500/70 text-[10px] m-0">Promotional discount deduction</p>
                      </td>
                      <td className="py-4 px-1 text-right font-mono">0.00%</td>
                      <td className="py-4 px-1 text-right font-mono">-₹{booking.discountAmount.toLocaleString('en-IN')}</td>
                    </tr>
                  )}

                  {booking.cgst !== undefined ? (
                    <>
                      <tr>
                        <td className="py-4 px-1 text-slate-500">Central GST (CGST)</td>
                        <td className="py-4 px-1 text-right text-slate-400 font-mono">6.00%</td>
                        <td className="py-4 px-1 text-right text-slate-800 font-mono">₹{cgstAmount.toLocaleString('en-IN')}</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-1 text-slate-500">State GST (SGST)</td>
                        <td className="py-4 px-1 text-right text-slate-400 font-mono">6.00%</td>
                        <td className="py-4 px-1 text-right text-slate-800 font-mono">₹{sgstAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td className="py-4 px-1 text-slate-500">Estimated Goods & Services Tax (GST)</td>
                      <td className="py-4 px-1 text-right text-slate-400 font-mono">12.00%</td>
                      <td className="py-4 px-1 text-right text-slate-800 font-mono">₹{totalTaxes.toLocaleString('en-IN')}</td>
                    </tr>
                  )}

                  {/* Grand total summary */}
                  <tr className="font-extrabold text-sm text-slate-900 bg-slate-50/50">
                    <td className="py-4 px-3 uppercase tracking-wider text-xs">Total Guaranteed Amount</td>
                    <td className="py-4 px-1"></td>
                    <td className="py-4 px-3 text-right text-brand-600 font-mono text-sm font-black">
                      ₹{booking.totalPrice.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Terms & Legal notice */}
          <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row justify-between gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <Globe size={12} className="text-slate-300" />
              <span>staysphere.in</span>
            </div>
            <div>
              <span>Generated digitally on staysphere systems</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
