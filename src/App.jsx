import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Home from './pages/Home';

// Lazy load tools
const MergePDF = React.lazy(() => import('./pages/MergePDF'));
const SplitPDF = React.lazy(() => import('./pages/SplitPDF'));
const RemovePages = React.lazy(() => import('./pages/RemovePages'));
const ExtractPages = React.lazy(() => import('./pages/ExtractPages'));
const OrganizePDF = React.lazy(() => import('./pages/OrganizePDF'));
const ProtectPDF = React.lazy(() => import('./pages/ProtectPDF'));
const UnlockPDF = React.lazy(() => import('./pages/UnlockPDF'));
const RotatePDF = React.lazy(() => import('./pages/RotatePDF'));
const PageNumbers = React.lazy(() => import('./pages/PageNumbers'));
const AddWatermark = React.lazy(() => import('./pages/AddWatermark'));
const ImagesToPDF = React.lazy(() => import('./pages/ImagesToPDF'));
const PDFToImages = React.lazy(() => import('./pages/PDFToImages'));
const CompressPDF = React.lazy(() => import('./pages/CompressPDF'));
const ScanToPDF = React.lazy(() => import('./pages/ScanToPDF'));
const SignPDF = React.lazy(() => import('./pages/SignPDF'));
const RepairPDF = React.lazy(() => import('./pages/RepairPDF'));
const RedactPDF = React.lazy(() => import('./pages/RedactPDF'));
const HTMLToPDF = React.lazy(() => import('./pages/HTMLToPDF'));
const ComparePDF = React.lazy(() => import('./pages/ComparePDF'));
const TextToPDF = React.lazy(() => import('./pages/TextToPDF'));
const OCRPDF = React.lazy(() => import('./pages/OCRPDF'));
const OfficeToPDF = React.lazy(() => import('./pages/OfficeToPDF'));
const PDFToWord = React.lazy(() => import('./pages/PDFToWord'));
const PDFToExcel = React.lazy(() => import('./pages/PDFToExcel'));
const PDFToPowerPoint = React.lazy(() => import('./pages/PDFToPowerPoint'));
const PDFToPDFA = React.lazy(() => import('./pages/PDFToPDFA'));
const EditPDF = React.lazy(() => import('./pages/EditPDF'));
const CropPDF = React.lazy(() => import('./pages/CropPDF'));
const ComingSoon = React.lazy(() => import('./pages/ComingSoon'));

const Loading = () => (
  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
    Loading tool...
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="merge-pdf" element={<Suspense fallback={<Loading />}><MergePDF /></Suspense>} />
        <Route path="split-pdf" element={<Suspense fallback={<Loading />}><SplitPDF /></Suspense>} />
        <Route path="remove-pages" element={<Suspense fallback={<Loading />}><RemovePages /></Suspense>} />
        <Route path="extract-pages" element={<Suspense fallback={<Loading />}><ExtractPages /></Suspense>} />
        <Route path="organize-pdf" element={<Suspense fallback={<Loading />}><OrganizePDF /></Suspense>} />
        <Route path="protect-pdf" element={<Suspense fallback={<Loading />}><ProtectPDF /></Suspense>} />
        <Route path="unlock-pdf" element={<Suspense fallback={<Loading />}><UnlockPDF /></Suspense>} />
        <Route path="rotate-pdf" element={<Suspense fallback={<Loading />}><RotatePDF /></Suspense>} />
        <Route path="page-numbers" element={<Suspense fallback={<Loading />}><PageNumbers /></Suspense>} />
        <Route path="watermark" element={<Suspense fallback={<Loading />}><AddWatermark /></Suspense>} />
        <Route path="jpg-to-pdf" element={<Suspense fallback={<Loading />}><ImagesToPDF /></Suspense>} />
        <Route path="pdf-to-jpg" element={<Suspense fallback={<Loading />}><PDFToImages /></Suspense>} />
        <Route path="compress-pdf" element={<Suspense fallback={<Loading />}><CompressPDF /></Suspense>} />
        <Route path="scan-pdf" element={<Suspense fallback={<Loading />}><ScanToPDF /></Suspense>} />
        <Route path="sign-pdf" element={<Suspense fallback={<Loading />}><SignPDF /></Suspense>} />
        <Route path="repair-pdf" element={<Suspense fallback={<Loading />}><RepairPDF /></Suspense>} />
        <Route path="redact-pdf" element={<Suspense fallback={<Loading />}><RedactPDF /></Suspense>} />
        <Route path="html-to-pdf" element={<Suspense fallback={<Loading />}><HTMLToPDF /></Suspense>} />
        <Route path="compare-pdf" element={<Suspense fallback={<Loading />}><ComparePDF /></Suspense>} />
        <Route path="text-to-pdf" element={<Suspense fallback={<Loading />}><TextToPDF /></Suspense>} />
        <Route path="ocr-pdf" element={<Suspense fallback={<Loading />}><OCRPDF /></Suspense>} />

        {/* Office Routes */}
        <Route path="word-to-pdf" element={<Suspense fallback={<Loading />}><OfficeToPDF /></Suspense>} />
        <Route path="excel-to-pdf" element={<Suspense fallback={<Loading />}><OfficeToPDF /></Suspense>} />
        <Route path="powerpoint-to-pdf" element={<Suspense fallback={<Loading />}><OfficeToPDF /></Suspense>} />

        {/* PDF to Office & Advanced Editing */}
        <Route path="pdf-to-word" element={<Suspense fallback={<Loading />}><PDFToWord /></Suspense>} />
        <Route path="pdf-to-excel" element={<Suspense fallback={<Loading />}><PDFToExcel /></Suspense>} />
        <Route path="pdf-to-powerpoint" element={<Suspense fallback={<Loading />}><PDFToPowerPoint /></Suspense>} />
        <Route path="pdf-to-pdfa" element={<Suspense fallback={<Loading />}><PDFToPDFA /></Suspense>} />
        <Route path="edit-pdf" element={<Suspense fallback={<Loading />}><EditPDF /></Suspense>} />
        <Route path="crop-pdf" element={<Suspense fallback={<Loading />}><CropPDF /></Suspense>} />

        <Route path="*" element={<Suspense fallback={<Loading />}><ComingSoon title="Tool Coming Soon" /></Suspense>} />
      </Route>
    </Routes>
  );
}

export default App;
