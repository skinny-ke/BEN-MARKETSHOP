// Add 'whileHover' to timeline steps and fade-in for errors
{error && (
  <motion.p 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-red-600 mt-2 text-sm"
  >
    {error}
  </motion.p>
)}

{order.timeline.length === 0 ? (
  <p className="text-gray-500 dark:text-gray-400">Timeline is not available for this order yet.</p>
) : (
  <div className="space-y-4">
    {order.timeline.map((step, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
      >
        <div className="flex-shrink-0">{getStatusIcon(step.status, step.completed)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${getStatusColor(step.status, step.completed)}`}>
              {step.title}
            </h4>
            <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(step.timestamp)}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{step.description}</p>
        </div>
      </motion.div>
    ))}
  </div>
)}
