import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Product, Supplier } from '../../types';
import { formatINR } from '../../utils/currency';
import { findProductByBarcode } from '../../utils/barcode';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Truck,
  Building2,
  CheckCircle2,
  X,
  Phone,
  Mail,
  DollarSign,
  Download,
  ScanLine,
  QrCode,
  Search,
  Zap,
  Sparkles
} from 'lucide-react';

export const AdminInventory: React.FC = () => {
  const { activeAdminId, refreshDataFlag, triggerRefresh, addToast } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // User-defined low stock threshold state
  const [stockThreshold, setStockThreshold] = useState<number>(10);
  const [showOnlyLowStock, setShowOnlyLowStock] = useState<boolean>(false);

  // Stock Replenishment / Purchase Entry Modal
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState<Product | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(20);
  const [unitCostPrice, setUnitCostPrice] = useState(50);
  const [selectedSupplierName, setSelectedSupplierName] = useState('');

  // Supplier Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: ''
  });

  // Barcode Scan Mode State
  const [isScanModeOpen, setIsScanModeOpen] = useState(false);
  const [scannedCodeInput, setScannedCodeInput] = useState('');
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [selectedScanProductIds, setSelectedScanProductIds] = useState<string[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraControlsRef = useRef<{ stop: () => void } | null>(null);

  const availableProductsForScan = products.filter((p) => !selectedScanProductIds.includes(p.product_id));

  const stopCamera = () => {
    cameraControlsRef.current?.stop();
    cameraControlsRef.current = null;
    cameraVideoRef.current?.srcObject &&
      (cameraVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null;
    setIsCameraOpen(false);
    setIsCameraStarting(false);
  };

  const startCamera = async () => {
    if (!cameraVideoRef.current) return;

    setCameraError('');
    setIsCameraOpen(true);
    setIsCameraStarting(true);

    try {
      const reader = new BrowserMultiFormatReader();
      cameraControlsRef.current = await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        },
        cameraVideoRef.current,
        (result) => {
          if (!result) return;

          const scannedValue = result.getText();
          stopCamera();
          setScannedCodeInput(scannedValue);
          handleProcessBarcodeScan(scannedValue);
        }
      );
      setIsCameraStarting(false);
    } catch (error: any) {
      stopCamera();
      setCameraError(
        error?.name === 'NotAllowedError'
          ? 'Camera permission was blocked. Allow camera access in the browser address bar and try again.'
          : error?.name === 'NotFoundError'
            ? 'No camera was found on this device.'
            : error?.name === 'NotReadableError'
              ? 'The camera is already being used by another app. Close it and try again.'
              : 'Camera could not start. Use HTTPS or localhost, then try again.'
      );
    }
  };

  const handleProcessBarcodeScan = (codeToSearch: string) => {
    const query = codeToSearch.trim().toLowerCase();
    if (!query) return;

    setIsScanningActive(true);

    setTimeout(() => {
      setIsScanningActive(false);
      const matched = findProductByBarcode(products, codeToSearch, selectedScanProductIds);

      if (matched) {
        if (selectedScanProductIds.includes(matched.product_id)) {
          addToast('Already Added', `${matched.product_name} is already selected in this scan set and will not appear again.`, 'error');
          return;
        }

        setSelectedScanProductIds((prev) => [...prev, matched.product_id]);
        setScannedProduct(matched);
        setHighlightedProductId(matched.product_id);
        setShowOnlyLowStock(false);

        addToast(
          'Barcode Item Located!',
          `Matched ${matched.product_name} (${matched.product_id}) | Stock: ${matched.stock} units`
        );

        setTimeout(() => {
          const rowElem = document.getElementById(`product-row-${matched.product_id}`);
          if (rowElem) {
            rowElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      } else {
        setScannedProduct(null);
        addToast('Scan Error', `No inventory item matches SKU/Barcode "${codeToSearch}".`, 'error');
      }
    }, 400);
  };

  const fetchData = async () => {
    setLoading(true);
    const [prods, supps] = await Promise.all([
      api.getProducts({ admin_owner: activeAdminId }),
      api.getSuppliers(activeAdminId)
    ]);
    setProducts(prods);
    setSuppliers(supps);
    if (supps.length > 0) setSelectedSupplierName(supps[0].supplier_name);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeAdminId, refreshDataFlag]);

  const handleOpenPurchaseEntry = (p: Product) => {
    setSelectedProductForPurchase(p);
    setUnitCostPrice(Math.round(p.price * 0.6));
    setPurchaseQuantity(25);
    setIsPurchaseModalOpen(true);
  };

  const handleExecuteStockPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForPurchase) return;

    try {
      const totalPurchaseCost = purchaseQuantity * unitCostPrice;

      // 1. Update product stock level
      await api.updateProduct(selectedProductForPurchase.product_id, {
        stock: selectedProductForPurchase.stock + purchaseQuantity
      });

      // 2. Log automatically as a "Product Purchase" expense in Vyapar expense engine!
      await api.createExpense({
        admin_id: activeAdminId,
        category: 'Product Purchase',
        description: `Stock Purchase: ${purchaseQuantity}x ${selectedProductForPurchase.product_name} from ${selectedSupplierName || 'Supplier'}`,
        amount: totalPurchaseCost,
        date: new Date().toISOString().split('T')[0]
      });

      addToast(
        'Stock Replenished & Expense Logged',
        `Added +${purchaseQuantity} units. Logged ${formatINR(totalPurchaseCost)} purchase expense.`
      );

      setIsPurchaseModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      addToast('Replenishment Error', err.message, 'error');
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createSupplier({
      supplier_name: newSupplier.company,
      contact_person: newSupplier.name,
      phone: newSupplier.phone,
      email: newSupplier.email,
      address: newSupplier.address,
      admin_id: activeAdminId
    });
    addToast('Supplier Saved', `Added vendor ${newSupplier.company}`);
    setIsSupplierModalOpen(false);
    setNewSupplier({ name: '', company: '', phone: '', email: '', address: '' });
    fetchData();
  };

  const handleExportCSV = () => {
    if (displayedProducts.length === 0) {
      addToast('Export Warning', 'No inventory items available to export.', 'error');
      return;
    }

    const headers = [
      'Product ID',
      'Product Name',
      'Category',
      'Price (₹)',
      'Current Stock',
      'Warning Status',
      'Unit',
      'Division Owner'
    ];

    const csvRows = [
      headers.join(','),
      ...displayedProducts.map((p) => {
        const warningStatus = p.stock < stockThreshold ? `CRITICAL LOW (<${stockThreshold})` : 'Normal Stock';
        const nameEscaped = `"${p.product_name.replace(/"/g, '""')}"`;
        const categoryEscaped = `"${p.category.replace(/"/g, '""')}"`;
        return [
          p.product_id,
          nameEscaped,
          categoryEscaped,
          (p.price ?? 0).toFixed(2),
          p.stock,
          `"${warningStatus}"`,
          `"${p.unit || 'unit'}"`,
          p.admin_owner
        ].join(',');
      })
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute(
      'download',
      `inventory_stock_report_${activeAdminId}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);

    addToast('Stock CSV Exported', `Downloaded report with ${displayedProducts.length} product records.`);
  };

  const isLowStock = (p: Product) => p.stock < stockThreshold;
  const lowStockProducts = products.filter(isLowStock);
  const displayedProducts = showOnlyLowStock ? lowStockProducts : products;

  const closeScanModal = () => {
    stopCamera();
    setIsScanModeOpen(false);
    setSelectedScanProductIds([]);
    setScannedProduct(null);
    setScannedCodeInput('');
    setCameraError('');
  };

  useEffect(() => () => stopCamera(), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-serif-display">
            Inventory & Stock Control Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Monitor stock thresholds, set custom warning indicators, log purchases, and export CSV reports
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsScanModeOpen(true)}
            className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-amber-300 font-black text-xs rounded-2xl shadow transition flex items-center gap-2 border border-amber-500/40 hover:border-amber-400"
          >
            <ScanLine className="w-4 h-4 text-amber-400" /> Barcode Scan Mode
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-2xl shadow transition flex items-center gap-2 border border-yellow-300"
          >
            <Download className="w-4 h-4 text-slate-950" /> Export Stock CSV
          </button>

          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-black text-xs rounded-2xl shadow transition flex items-center gap-2 border border-amber-500/30"
          >
            <Building2 className="w-4 h-4 text-amber-400" /> Add Vendor Supplier
          </button>
        </div>
      </div>

      {/* Red Low Stock Warning Banner */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-rose-900 dark:text-rose-200 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-2xl font-bold shrink-0 shadow-md">
              <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-rose-950 dark:text-rose-100 font-serif-display flex items-center gap-2">
                <span>Critical Inventory Warning</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-black">
                  {lowStockProducts.length} items &lt; {stockThreshold} units
                </span>
              </h4>
              <p className="text-xs text-rose-800 dark:text-rose-300 font-medium mt-0.5">
                Items highlighted in red have fallen below your user-defined threshold ({stockThreshold} units). Click <b>"Replenish Stock"</b> to restock and auto-log purchase expense.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs shadow transition shrink-0 self-end sm:self-center"
          >
            {showOnlyLowStock ? 'Show All Products' : `View ${lowStockProducts.length} Critical Items`}
          </button>
        </div>
      )}

      {/* Threshold Configuration Card */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-amber-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-800 dark:text-amber-400 rounded-xl border border-amber-300/40">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-xs font-serif-display uppercase tracking-wider">
              Set Low Stock Warning Threshold
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Products with stock below this number will be visually highlighted in red
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-stone-200 dark:border-slate-700">
            {[5, 10, 15, 25].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setStockThreshold(preset)}
                className={`px-2.5 py-1 text-xs font-black rounded-lg transition ${stockThreshold === preset ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700'}`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Custom:</span>
            <input
              type="number"
              min="1"
              max="1000"
              value={stockThreshold}
              onChange={(e) => setStockThreshold(Math.max(1, Number(e.target.value)))}
              className="w-20 px-3 py-1.5 bg-white dark:bg-slate-800 border-2 border-rose-400 dark:border-rose-600 rounded-xl text-xs font-mono font-black text-rose-700 dark:text-rose-300 text-center focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <span className="text-xs font-bold text-slate-500">units</span>
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-amber-200/60 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold font-serif-display text-slate-900 dark:text-white text-sm">
              Inventory Levels ({displayedProducts.length} Products shown)
            </h3>
            {showOnlyLowStock && (
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-extrabold text-[10px] rounded-full">
                Filtered: &lt;{stockThreshold} units
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="text-xs font-bold px-3 py-1 bg-amber-50 dark:bg-slate-800 text-amber-900 dark:text-amber-300 hover:bg-amber-100 rounded-xl transition border border-amber-200 dark:border-slate-700 flex items-center gap-1"
              title="Download stock list as CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" /> Export CSV
            </button>

            <button
              onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
              className={`text-xs font-extrabold px-3 py-1 rounded-xl transition ${showOnlyLowStock ? 'bg-slate-900 text-amber-300' : 'text-amber-800 dark:text-amber-400 hover:underline'}`}
            >
              {showOnlyLowStock ? 'Show All Products' : 'Filter Low Stock Only'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-amber-200/60 dark:border-slate-800 bg-amber-50/40 dark:bg-slate-800/50 text-amber-900/80 dark:text-slate-400 uppercase font-extrabold text-[10px]">
                <th className="py-3 px-4">Item & Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Retail Price</th>
                <th className="py-3 px-4">Available Units</th>
                <th className="py-3 px-4">Warning Status</th>
                <th className="py-3 px-4 text-right">Replenish Entry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100/60 dark:divide-slate-800">
              {displayedProducts.map((p) => {
                const isLow = isLowStock(p);
                const isHighlighted = highlightedProductId === p.product_id;

                return (
                  <tr
                    key={p.product_id}
                    id={`product-row-${p.product_id}`}
                    className={
                      isHighlighted
                        ? 'bg-amber-300/80 dark:bg-amber-950/90 ring-4 ring-amber-500 border-l-8 border-l-amber-600 transition-all duration-300 shadow-md'
                        : isLow
                          ? 'bg-rose-50/90 dark:bg-rose-950/40 hover:bg-rose-100/90 dark:hover:bg-rose-900/50 border-l-4 border-l-rose-600 transition'
                          : 'hover:bg-amber-50/40 dark:hover:bg-slate-800/50 transition'
                    }
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.product_name} className="w-10 h-10 rounded-xl object-contain bg-white p-1 border border-stone-200 shadow-sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={isLow ? 'font-black text-rose-950 dark:text-rose-100 text-sm' : 'font-extrabold'}>{p.product_name}</span>
                            {isHighlighted && (
                              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider animate-pulse border border-yellow-300">
                                SCANNED TARGET
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block">SKU: {p.product_id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300">{p.category}</td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{formatINR(p.price ?? 0)}</td>

                    <td className="py-3.5 px-4 font-mono">
                      {isLow ? (
                        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-black text-sm">
                          <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce shrink-0" />
                          <span>{p.stock} units</span>
                        </div>
                      ) : (
                        <span className="text-slate-900 dark:text-white font-extrabold text-sm">
                          {p.stock} units
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 w-fit shadow-sm animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-white" />
                          CRITICAL WARNING (&lt;{stockThreshold})
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Sufficient Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenPurchaseEntry(p)}
                        className={`px-3.5 py-1.5 rounded-xl font-black text-xs shadow transition inline-flex items-center gap-1 ${isLow ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-400' : 'bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/30'}`}
                      >
                        <Plus className="w-3.5 h-3.5" /> Replenish Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Directory */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Registered Vendor Suppliers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.supplier_id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{sup.company}</span>
                <span className="text-[10px] text-indigo-500 font-mono font-bold">{sup.supplier_id}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">Contact Person: <b>{sup.name}</b></p>
              <p className="text-slate-500 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> {sup.phone} | <Mail className="w-3.5 h-3.5" /> {sup.email}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Replenishment Entry Modal */}
      {isPurchaseModalOpen && selectedProductForPurchase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border p-6 space-y-4 relative">
            <button onClick={() => setIsPurchaseModalOpen(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
              Stock Replenishment Entry
            </h3>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border text-xs flex items-center gap-3">
              <img src={selectedProductForPurchase.image} alt="prod" className="w-10 h-10 rounded object-contain bg-white p-1" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{selectedProductForPurchase.product_name}</h4>
                <p className="text-slate-500">Current Stock: <b>{selectedProductForPurchase.stock} units</b></p>
              </div>
            </div>

            <form onSubmit={handleExecuteStockPurchase} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Supplier</label>
                <select
                  value={selectedSupplierName}
                  onChange={(e) => setSelectedSupplierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                >
                  {suppliers.map((s) => (
                    <option key={s.supplier_id} value={s.company}>{s.company} ({s.name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity to Purchase</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={unitCostPrice}
                    onChange={(e) => setUnitCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-mono dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border text-xs text-indigo-900 dark:text-indigo-200">
                Total Purchase Expense: <b className="font-mono text-sm">{formatINR(purchaseQuantity * unitCostPrice)}</b>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-1">
                  Executing this will update inventory stock AND automatically record a "Product Purchase" expense entry in Vyapar P&L reports.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow"
                >
                  Confirm Purchase & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border p-6 space-y-4 relative">
            <button onClick={() => setIsSupplierModalOpen(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Add New Supplier Vendor</h3>

            <form onSubmit={handleAddSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Vendor Name</label>
                <input
                  type="text"
                  required
                  value={newSupplier.company}
                  onChange={(e) => setNewSupplier({ ...newSupplier, company: e.target.value })}
                  placeholder="e.g. Apex Tech Supply Corp"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Person Name</label>
                <input
                  type="text"
                  required
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="e.g. Michael Scott"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl">
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scan Mode Modal */}
      {isScanModeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-slate-100 w-full max-w-xl rounded-3xl shadow-2xl border border-amber-500/40 p-6 space-y-5 relative overflow-hidden">
            <button
              onClick={closeScanModal}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40 shadow">
                <ScanLine className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg font-serif-display flex items-center gap-2">
                  <span>Inventory Barcode Scan Mode</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-black uppercase tracking-wider">
                    Laser Active
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Point handheld USB barcode gun or enter SKU/code below to automatically locate and highlight the inventory product.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">
                Use your device camera to scan a product barcode, or continue with the USB scanner below.
              </p>
              <button
                type="button"
                onClick={isCameraOpen ? stopCamera : startCamera}
                disabled={isCameraStarting}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-xl shadow transition shrink-0"
              >
                {isCameraStarting ? 'Starting Camera...' : isCameraOpen ? 'Stop Camera' : 'Use Camera'}
              </button>
            </div>

            {/* Camera viewport */}
            <div className="relative h-40 bg-slate-950 rounded-2xl border-2 border-dashed border-amber-500/40 flex flex-col items-center justify-center overflow-hidden shadow-inner">
              <video
                ref={cameraVideoRef}
                autoPlay
                muted
                playsInline
                className={`absolute inset-0 h-full w-full object-cover ${isCameraOpen ? 'block' : 'hidden'}`}
              />
              {isCameraOpen ? (
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-16 border-2 border-amber-400 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.7)]">
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-rose-500 shadow-[0_0_12px_#ef4444] animate-pulse" />
                </div>
              ) : (
                <>
                  <QrCode className="w-10 h-10 text-slate-700/80 mb-1" />
                  <p className="text-[11px] font-mono font-bold text-amber-400/90 text-center tracking-wider uppercase">
                    {isCameraStarting ? 'Requesting Camera Permission...' : isScanningActive ? 'Decoding Optical Pattern...' : 'Camera is off'}
                  </p>
                </>
              )}
            </div>

            {cameraError && (
              <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] font-semibold text-rose-300">
                {cameraError}
              </p>
            )}

            {/* Input Barcode / SKU field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessBarcodeScan(scannedCodeInput);
              }}
              className="space-y-3"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ScanLine className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    value={scannedCodeInput}
                    onChange={(e) => setScannedCodeInput(e.target.value)}
                    placeholder="Scan barcode, SKU, or product ID e.g. 096168522623"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 text-amber-200 placeholder-slate-500 border border-amber-500/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-500/30 text-xs font-mono font-bold"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow transition border border-yellow-300 flex items-center gap-1.5 shrink-0"
                >
                  <Search className="w-4 h-4 text-slate-950" /> Locate Item
                </button>
              </div>
            </form>

            {/* Quick Simulate Buttons for All Products */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                Quick Barcode Test Simulator (Click product to simulate laser scan):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-950 rounded-xl border border-slate-800">
                {availableProductsForScan.length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-mono">All products in this scan set have already been selected.</p>
                ) : (
                  availableProductsForScan.map((p) => (
                    <button
                      key={p.product_id}
                      type="button"
                      onClick={() => {
                        setScannedCodeInput(p.product_id);
                        handleProcessBarcodeScan(p.product_id);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition border ${scannedProduct?.product_id === p.product_id
                        ? 'bg-amber-500 text-slate-950 border-yellow-300 shadow font-black'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-700'
                        }`}
                    >
                      {p.product_id} ({p.product_name.slice(0, 14)})
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Last Scanned Result Card */}
            {scannedProduct && (
              <div className="p-4 bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <img
                    src={scannedProduct.image}
                    alt={scannedProduct.product_name}
                    className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-amber-400"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm font-serif-display">{scannedProduct.product_name}</h4>
                    <p className="text-xs text-amber-300/90 font-mono">
                      SKU: <b>{scannedProduct.product_id}</b> | Price: <b>{formatINR(scannedProduct.price)}</b>
                    </p>
                    <p className="text-xs text-emerald-400 font-extrabold mt-0.5">
                      Available Stock: {scannedProduct.stock} units
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleOpenPurchaseEntry(scannedProduct);
                    closeScanModal();
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition shrink-0 border border-yellow-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Replenish
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
