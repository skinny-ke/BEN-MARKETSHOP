import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaDownload, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaFilePowerpoint,
  FaFileAlt, FaSpinner, FaCheck
} from "react-icons/fa";

const fileTypeIcons = {
  pdf: FaFilePdf,
  jpg: FaFileImage,
  jpeg: FaFileImage,
  png: FaFileImage,
  gif: FaFileImage,
  webp: FaFileImage,
  doc: FaFileWord,
  docx: FaFileWord,
  xls: FaFileExcel,
  xlsx: FaFileExcel,
  ppt: FaFilePowerpoint,
  pptx: FaFilePowerpoint,
  txt: FaFileAlt,
  default: FaFileAlt
};

const fileTypeColors = {
  pdf: "text-red-500",
  jpg: "text-green-500",
  jpeg: "text-green-500",
  png: "text-green-500",
  gif: "text-green-500",
  webp: "text-green-500",
  doc: "text-blue-500",
  docx: "text-blue-500",
  xls: "text-green-600",
  xlsx: "text-green-600",
  ppt: "text-orange-500",
  pptx: "text-orange-500",
  txt: "text-gray-500",
  default: "text-gray-500"
};

export default function DownloadableContent({ files = [], productName = "Product", className = "", variant = "default" }) {
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());
  const [completedDownloads, setCompletedDownloads] = useState(new Set());
  const [progress, setProgress] = useState({});
  const [toasts, setToasts] = useState([]); // new: toast messages
  const [aggregateProgress, setAggregateProgress] = useState(0);

  const getFileExtension = (filename) => filename.split('.').pop().toLowerCase();
  const getFileIcon = (filename) => fileTypeIcons[getFileExtension(filename)] || fileTypeIcons.default;
  const getFileColor = (filename) => fileTypeColors[getFileExtension(filename)] || fileTypeColors.default;
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleDownload = async (file, updateAggregate = true) => {
    const fileId = `${file.name}-${file.size}`;
    if (downloadingFiles.has(fileId)) return;

    try {
      setDownloadingFiles(prev => new Set([...prev, fileId]));
      setProgress(prev => ({ ...prev, [fileId]: 0 }));

      // Simulate download with incremental progress
      for (let i = 1; i <= 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 150));
        setProgress(prev => ({ ...prev, [fileId]: i * 10 }));

        if (updateAggregate) {
          const totalProgress = files.reduce((sum, f) => sum + (f.name === file.name ? i * 10 : (progress[`${f.name}-${f.size}`] || 0)), 0);
          setAggregateProgress(Math.floor(totalProgress / files.length));
        }
      }

      const link = document.createElement('a');
      link.href = file.url || URL.createObjectURL(new Blob(['Sample content'], { type: 'text/plain' }));
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setCompletedDownloads(prev => new Set([...prev, fileId]));
      showToast(`${file.name} downloaded!`);

      setTimeout(() => {
        setCompletedDownloads(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
        setProgress(prev => {
          const newProg = { ...prev };
          delete newProg[fileId];
          return newProg;
        });
      }, 3000);

    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const variants = {
    default: "bg-white border border-gray-200 rounded-lg shadow-sm",
    card: "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-lg",
    minimal: "bg-transparent border-none"
  };

  if (!files || files.length === 0) return null;

  return (
    <motion.div 
      className={`p-4 ${variants[variant]} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FaDownload className="mr-2 text-green-600" />
          Downloadable Content
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Aggregate Progress Bar */}
      {aggregateProgress > 0 && aggregateProgress < 100 && (
        <div className="h-2 w-full bg-gray-200 rounded-full mb-3 overflow-hidden">
          <motion.div
            className="h-full bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${aggregateProgress}%` }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </div>
      )}

      <div className="space-y-3">
        {files.map((file, index) => {
          const fileId = `${file.name}-${file.size}`;
          const isDownloading = downloadingFiles.has(fileId);
          const isCompleted = completedDownloads.has(fileId);
          const FileIcon = getFileIcon(file.name);
          const fileColor = getFileColor(file.name);
          const fileProgress = progress[fileId] || 0;

          return (
            <motion.div
              key={index}
              className="flex flex-col p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`text-2xl ${fileColor}`}>
                    <FileIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{file.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 truncate">
                      <span>{formatFileSize(file.size || 0)}</span>
                      <span>•</span>
                      <span className="capitalize">{getFileExtension(file.name)}</span>
                      {file.description && (
                        <>
                          <span>•</span>
                          <span className="truncate">{file.description}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <motion.button
                  onClick={() => handleDownload(file)}
                  disabled={isDownloading}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isCompleted
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : isDownloading
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                  }`}
                  whileHover={!isDownloading ? { scale: 1.05 } : {}}
                  whileTap={!isDownloading ? { scale: 0.95 } : {}}
                >
                  {isCompleted ? (
                    <>
                      <FaCheck className="w-4 h-4" />
                      <span>Downloaded</span>
                    </>
                  ) : isDownloading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <FaDownload className="w-4 h-4" />
                      <span>Download</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Individual Progress Bar */}
              {isDownloading && (
                <div className="h-1 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${fileProgress}%` }}
                    transition={{ ease: "easeOut", duration: 0.2 }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Download All Button */}
      {files.length > 1 && (
        <motion.button
          onClick={() => files.forEach(file => handleDownload(file))}
          className="w-full mt-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center space-x-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaDownload className="w-4 h-4" />
          <span>Download All Files</span>
        </motion.button>
      )}

      {/* Toast Notifications */}
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50"
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Downloads are for personal use only. Please respect copyright and licensing terms.
      </p>
    </motion.div>
  );
}
