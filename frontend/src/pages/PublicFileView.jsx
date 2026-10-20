import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { apiEndpoints } from "../util/apiEndpoints";
import { Download, AlertCircle, FileText, Copy, Share2 } from "lucide-react";
import { useParams } from "react-router-dom";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
const TEXT_EXTENSIONS = [
  "txt",
  "md",
  "csv",
  "json",
  "xml",
  "html",
  "css",
  "js",
  "ts",
  "java",
  "sql",
  "log",
  "yml",
  "yaml",
];
const OFFICE_EXTENSIONS = [
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "rtf",
  "odt",
  "ods",
  "odp",
];

const PublicFileView = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [textLoading, setTextLoading] = useState(false);
  const [textPreview, setTextPreview] = useState("");
  const [textPreviewError, setTextPreviewError] = useState("");

  const { fileId } = useParams();

  const previewProxyUrl = useMemo(
    () => apiEndpoints.PUBLIC_FILE_CONTENT(fileId),
    [fileId],
  );

  useEffect(() => {
    if (!fileId) {
      setError("Invalid file link.");
      return;
    }

    const getFile = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(apiEndpoints.PUBLIC_FILE_VIEW(fileId));
        setFile(res.data);
        setError(null);
      } catch (fetchError) {
        console.error("Error fetching file:", fetchError);
        setError("Could not retrieve the file. It may be invalid or removed.");
      } finally {
        setIsLoading(false);
      }
    };

    getFile();
  }, [fileId]);

  const getFileExtension = (fileName) => {
    if (!fileName || !fileName.includes(".")) return "";
    return fileName.split(".").pop().toLowerCase();
  };

  const getFileUrl = () => {
    if (!file) return null;
    return file.cloudinaryUrl || file.fileLocation || null;
  };

  const fileUrl = getFileUrl();
  const fileExt = getFileExtension(file?.name || "");
  const mimeType = (file?.type || file?.mimeType || "").toLowerCase();
  const isPDF = fileExt === "pdf" || mimeType.includes("pdf");
  const isImage =
    mimeType.startsWith("image/") || IMAGE_EXTENSIONS.includes(fileExt);
  const isText = mimeType.startsWith("text/") || TEXT_EXTENSIONS.includes(fileExt);
  const isOfficeDoc = OFFICE_EXTENSIONS.includes(fileExt);
  const hasStructuredPreview = isPDF || isImage || isText || isOfficeDoc;
  const googleDocsPreviewUrl = fileUrl
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`
    : null;

  useEffect(() => {
    setPdfLoading(true);
  }, [fileId]);

  useEffect(() => {
    let cancelled = false;
    setTextPreview("");
    setTextPreviewError("");

    if (!isText || !fileUrl) return undefined;

    const loadTextPreview = async () => {
      try {
        setTextLoading(true);
        const response = await axios.get(previewProxyUrl, { responseType: "text" });
        if (cancelled) return;
        const rawText =
          typeof response.data === "string"
            ? response.data
            : JSON.stringify(response.data, null, 2);
        setTextPreview(rawText);
      } catch (textError) {
        if (cancelled) return;
        console.error("Text preview error:", textError);
        setTextPreviewError("Unable to preview this text file in-browser.");
      } finally {
        if (!cancelled) setTextLoading(false);
      }
    };

    loadTextPreview();

    return () => {
      cancelled = true;
    };
  }, [isText, fileUrl, previewProxyUrl]);

  const handleDownload = () => {
    window.open(apiEndpoints.DOWNLOAD_FILE(fileId), "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = () => {
    const shareLink = window.location.href;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const shareLink = window.location.href;
    const fileName = file?.name || "Check out this file";
    const message = `${fileName}\n${shareLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const formatFileSize = (bytes) => {
    const fileSize = bytes || file?.size || 0;
    if (!fileSize || fileSize === 0) return "Unknown size";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.min(
      Math.floor(Math.log(fileSize) / Math.log(k)),
      sizes.length - 1,
    );
    return Math.round((fileSize / Math.pow(k, i)) * 100) / 100 + ` ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white rounded-lg shadow-lg p-8">
          <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || "File not found"}</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg transition hover:bg-blue-700"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600 flex-shrink-0" size={32} />
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 truncate">
                    {file.name}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatFileSize()} • {formatDate(file.uploadedAt)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                title="Share via WhatsApp"
              >
                <Share2 size={18} />
                <span className="hidden sm:inline text-sm">Share</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg flex-shrink-0"
              >
                <Download size={20} />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fileUrl && isPDF && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-gray-100 p-3 border-b border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">PDF Preview</p>
              <a
                href={previewProxyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Open in New Tab
              </a>
            </div>
            <div className="relative bg-gray-50" style={{ height: "700px" }}>
              {pdfLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-3"></div>
                    <p className="text-gray-600">Loading PDF...</p>
                  </div>
                </div>
              )}
              <iframe
                src={`${previewProxyUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                title={file.name}
                className="w-full h-full"
                onLoad={() => setPdfLoading(false)}
                onError={() => setPdfLoading(false)}
                style={{ border: "none" }}
              />
            </div>
          </div>
        )}

        {fileUrl && isImage && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8 flex justify-center p-8">
            <img
              src={previewProxyUrl}
              alt={file.name}
              className="max-h-96 object-contain"
            />
          </div>
        )}

        {fileUrl && isText && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-gray-100 p-3 border-b border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">Text Preview</p>
              <a
                href={previewProxyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Open Raw
              </a>
            </div>
            <div className="bg-gray-950 text-gray-100 p-4 overflow-auto" style={{ maxHeight: "700px" }}>
              {textLoading && <p className="text-sm text-gray-400">Loading text content...</p>}
              {!textLoading && textPreviewError && (
                <p className="text-sm text-red-400">{textPreviewError}</p>
              )}
              {!textLoading && !textPreviewError && (
                <pre className="text-sm whitespace-pre-wrap break-words">{textPreview || "(Empty file)"}</pre>
              )}
            </div>
          </div>
        )}

        {fileUrl && isOfficeDoc && googleDocsPreviewUrl && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="bg-gray-100 p-3 border-b border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">Document Preview</p>
              <a
                href={previewProxyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Open in New Tab
              </a>
            </div>
            <iframe
              src={googleDocsPreviewUrl}
              title={`${file.name}-doc-preview`}
              className="w-full"
              style={{ height: "700px", border: "none" }}
            />
          </div>
        )}

        {fileUrl && !hasStructuredPreview && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
            <p className="text-gray-700 mb-4">
              Preview is not available for this file type. You can open or download it.
            </p>
            <div className="flex justify-center gap-3">
              <a
                href={previewProxyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
              >
                Open File
              </a>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
              >
                Download File
              </button>
            </div>
          </div>
        )}

        {fileUrl && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Share This File</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                }`}
              >
                <Copy size={18} />
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
            >
              <Share2 size={18} />
              Share on WhatsApp
            </button>
          </div>
        )}

        {!fileUrl && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center mb-8">
            <AlertCircle size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Preview Not Available</h3>
            <p className="text-gray-500 mb-6">
              The file preview could not be loaded. Please download to view.
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Download size={18} />
              Download File
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8">File Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">File Name</label>
              <p className="text-gray-900 font-semibold break-all">{file.name}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">File Type</label>
              <p className="text-gray-900 font-semibold">{file.type || `.${fileExt}`}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">File Size</label>
              <p className="text-gray-900 font-semibold">{formatFileSize()}</p>
            </div>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">Shared Date</label>
              <p className="text-gray-900 font-semibold">{formatDate(file.uploadedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicFileView;
