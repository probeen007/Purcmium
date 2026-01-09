import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Upload,
    Download,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Eye,
    FileText,
    Loader,
    Plus,
    Check
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminBulkImport = () => {
    const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Results
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [newCategories, setNewCategories] = useState({});
    const [setCategoryMappings] = useState({});
    const [importResults, setImportResults] = useState(null);

    // Download CSV template
    const handleDownloadTemplate = async () => {
        try {
            const response = await adminAPI.get('/import/template', {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'product-import-template.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Template downloaded successfully');
        } catch (error) {
            console.error('Template download error:', error);
            toast.error('Failed to download template');
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv')) {
                toast.error('Please select a CSV file');
                return;
            }
            setFile(selectedFile);
        }
    };

    // Upload and preview CSV
    const handleUploadPreview = async () => {
        if (!file) {
            toast.error('Please select a CSV file');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('csvFile', file);

            const response = await adminAPI.post('/import/preview', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setPreviewData(response.data.data);

                // Initialize new categories with defaults
                const newCatInit = {};
                response.data.data.categoryResolution.newCategories.forEach(cat => {
                    newCatInit[cat.slug] = {
                        name: cat.originalName,
                        slug: cat.slug,
                        image: '',
                        description: '',
                        order: 0
                    };
                });
                setNewCategories(newCatInit);

                setStep(2);
                toast.success(`Preview loaded: ${response.data.data.validRows} valid products`);
            }
        } catch (error) {
            console.error('Preview error:', error);
            toast.error(error.response?.data?.error?.message || 'Failed to preview CSV');
        } finally {
            setLoading(false);
        }
    };

    // Execute import
    const handleExecuteImport = async () => {
        if (!previewData) return;

        // Validate all new categories have required fields
        const incompleteCats = Object.entries(newCategories).filter(
            ([slug, data]) => !data.image || data.image.trim() === ''
        );

        if (incompleteCats.length > 0) {
            toast.error(`Please provide images for all new categories (${incompleteCats.length} remaining)`);
            return;
        }

        try {
            setLoading(true);

            // Prepare new categories array
            const newCatsArray = Object.values(newCategories).filter(cat => cat.slug);

            const response = await adminAPI.post('/import/execute', {
                products: previewData.products,
                newCategories: newCatsArray
            });

            if (response.data.success) {
                setImportResults(response.data.data);
                setStep(3);
                toast.success(`Import completed! ${response.data.data.productsCreated} products created`);
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error(error.response?.data?.error?.message || 'Failed to execute import');
        } finally {
            setLoading(false);
        }
    };

    // Reset to start
    const handleReset = () => {
        setStep(1);
        setFile(null);
        setPreviewData(null);
        setNewCategories({});
        setCategoryMappings({});
        setImportResults(null);
    };

    // Update new category field
    const updateNewCategory = (slug, field, value) => {
        setNewCategories(prev => ({
            ...prev,
            [slug]: {
                ...prev[slug],
                [field]: value
            }
        }));
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Bulk Product Import</h1>
                    <p className="text-gray-600">
                        Import multiple products at once using CSV files
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 flex items-center justify-center">
                    <div className="flex items-center space-x-4">
                        <StepIndicator number={1} label="Upload CSV" active={step === 1} completed={step > 1} />
                        <div className="h-0.5 w-16 bg-gray-300" />
                        <StepIndicator number={2} label="Preview & Resolve" active={step === 2} completed={step > 2} />
                        <div className="h-0.5 w-16 bg-gray-300" />
                        <StepIndicator number={3} label="Results" active={step === 3} completed={step > 3} />
                    </div>
                </div>

                {/* Step 1: Upload */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Upload CSV File</h2>

                            {/* Download Template */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-blue-900 mb-1">Need a template?</h3>
                                        <p className="text-sm text-blue-700 mb-3">
                                            Download our CSV template with example products and required format
                                        </p>
                                        <button
                                            onClick={handleDownloadTemplate}
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download CSV Template
                                        </button>
                                    </div>
                                    <FileText className="w-8 h-8 text-blue-400" />
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <div className="mb-4">
                                    <label className="cursor-pointer">
                                        <span className="text-primary-600 hover:text-primary-700 font-medium">
                                            Choose CSV file
                                        </span>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="text-gray-600"> or drag and drop</span>
                                </div>
                                {file && (
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 py-2 px-4 rounded">
                                        <FileText className="w-4 h-4" />
                                        {file.name}
                                    </div>
                                )}
                            </div>

                            {/* Requirements */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">CSV Requirements:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Required columns: title, categories, shortDescription, description, images, affiliateLinks</li>
                                    <li>• Categories: Comma-separated names (e.g., "Electronics,Gaming")</li>
                                    <li>• Images: Pipe-separated URLs (e.g., "url1.jpg|url2.jpg")</li>
                                    <li>• Affiliate Links: JSON array with network, url, price, isPrimary fields</li>
                                    <li>• Maximum file size: 10MB</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleUploadPreview}
                                disabled={!file || loading}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4" />
                                        Preview Import
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Preview */}
                {step === 2 && previewData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Summary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <StatCard
                                label="Total Products"
                                value={previewData.totalRows}
                                icon={FileText}
                                color="blue"
                            />
                            <StatCard
                                label="Valid Products"
                                value={previewData.validRows}
                                icon={CheckCircle}
                                color="green"
                            />
                            <StatCard
                                label="Invalid Products"
                                value={previewData.invalidRows}
                                icon={XCircle}
                                color="red"
                            />
                            <StatCard
                                label="New Categories"
                                value={previewData.categoryResolution.totalNew}
                                icon={Plus}
                                color="yellow"
                            />
                        </div>

                        {/* New Categories to Create */}
                        {previewData.categoryResolution.totalNew > 0 && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                    New Categories Detected - Action Required
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    The following categories don't exist in your database. Please provide required information to create them:
                                </p>

                                <div className="space-y-4">
                                    {previewData.categoryResolution.newCategories.map((cat) => (
                                        <div key={cat.slug} className="border border-gray-200 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Category Name (from CSV)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={cat.originalName}
                                                        disabled
                                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Image URL <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="https://example.com/category-icon.svg"
                                                        value={newCategories[cat.slug]?.image || ''}
                                                        onChange={(e) => updateNewCategory(cat.slug, 'image', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">SVG/PNG with transparent background recommended</p>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Description (optional, max 200 chars)
                                                    </label>
                                                    <textarea
                                                        placeholder="Brief description of this category..."
                                                        value={newCategories[cat.slug]?.description || ''}
                                                        onChange={(e) => updateNewCategory(cat.slug, 'description', e.target.value)}
                                                        maxLength={200}
                                                        rows={2}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Display Order
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={newCategories[cat.slug]?.order || 0}
                                                        onChange={(e) => updateNewCategory(cat.slug, 'order', parseInt(e.target.value) || 0)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Products Preview Table */}
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Products Preview</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {previewData.products.slice(0, 20).map((product) => (
                                            <tr key={product.rowNumber} className={!product.isValid ? 'bg-red-50' : ''}>
                                                <td className="px-6 py-4 text-sm text-gray-900">{product.rowNumber}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{product.title}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="flex flex-wrap gap-1">
                                                        {product.categories.map((cat, idx) => (
                                                            <span
                                                                key={idx}
                                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${cat.exists
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                    }`}
                                                            >
                                                                {cat.exists ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                                                {cat.originalName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    ₹{product.calculatedPrice.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {product.isValid ? (
                                                        <span className="text-green-600 flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Valid
                                                        </span>
                                                    ) : (
                                                        <div>
                                                            <span className="text-red-600 flex items-center gap-1 mb-1">
                                                                <XCircle className="w-4 h-4" />
                                                                Invalid
                                                            </span>
                                                            {product.errors.length > 0 && (
                                                                <ul className="text-xs text-red-600">
                                                                    {product.errors.map((err, idx) => (
                                                                        <li key={idx}>• {err}</li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}
                                                    {product.warnings.length > 0 && (
                                                        <div className="mt-1 text-xs text-yellow-600">
                                                            {product.warnings.map((warn, idx) => (
                                                                <div key={idx}>⚠ {warn}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {previewData.products.length > 20 && (
                                    <div className="px-6 py-3 bg-gray-50 text-sm text-gray-600 text-center">
                                        Showing first 20 of {previewData.products.length} products
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between">
                            <button
                                onClick={handleReset}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExecuteImport}
                                disabled={loading || previewData.validRows === 0}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        Import {previewData.validRows} Products
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Results */}
                {step === 3 && importResults && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-sm p-6"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Completed!</h2>
                            <p className="text-gray-600">
                                Your bulk import has been processed successfully
                            </p>
                        </div>

                        {/* Results Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-3xl font-bold text-green-600 mb-1">
                                    {importResults.productsCreated}
                                </div>
                                <div className="text-sm text-gray-600">Products Created</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-3xl font-bold text-blue-600 mb-1">
                                    {importResults.categoriesCreated}
                                </div>
                                <div className="text-sm text-gray-600">Categories Created</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-3xl font-bold text-yellow-600 mb-1">
                                    {importResults.productsSkipped}
                                </div>
                                <div className="text-sm text-gray-600">Products Skipped</div>
                            </div>
                        </div>

                        {/* Errors */}
                        {importResults.errors && importResults.errors.length > 0 && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <h3 className="text-sm font-medium text-red-900 mb-2">Errors ({importResults.errors.length})</h3>
                                <ul className="text-sm text-red-700 space-y-1 max-h-60 overflow-y-auto">
                                    {importResults.errors.map((err, idx) => (
                                        <li key={idx}>
                                            Row {err.row}: {err.title} - {err.error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleReset}
                                className="btn-primary"
                            >
                                Import More Products
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </AdminLayout>
    );
};

// Step Indicator Component
const StepIndicator = ({ number, label, active, completed }) => (
    <div className="flex flex-col items-center">
        <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${completed
                    ? 'bg-green-500 text-white'
                    : active
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                }`}
        >
            {completed ? <CheckCircle className="w-6 h-6" /> : number}
        </div>
        <div className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-500'}`}>
            {label}
        </div>
    </div>
);

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        yellow: 'bg-yellow-50 text-yellow-600',
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};

export default AdminBulkImport;
