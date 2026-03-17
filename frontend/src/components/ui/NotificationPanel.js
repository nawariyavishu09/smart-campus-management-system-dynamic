import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Megaphone, CheckCheck, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationPanel({ open, onClose, notifications = [] }) {
  const navigate = useNavigate();

  const handleView = (notif) => {
    onClose();
    navigate("/notices");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[80]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-[380px] bg-card border-l border-border/40 shadow-2xl z-[81] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-border/40 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Notifications</h3>
                  <p className="text-[10px] text-muted-foreground">{notifications.length} recent</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
                <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Bell className="w-7 h-7 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">All caught up!</p>
                  <p className="text-xs text-muted-foreground/60">No new notifications right now</p>
                </div>
              ) : (
                <div className="py-2">
                  {notifications.map((notif, i) => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group px-4 py-1"
                    >
                      <button
                        onClick={() => handleView(notif)}
                        className="w-full text-left p-4 rounded-2xl hover:bg-muted/50 transition-all duration-200 flex items-start gap-3"
                      >
                        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Megaphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold truncate">{notif.title}</p>
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notif.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-muted-foreground/60">
                              {new Date(notif.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                              View <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-5 py-4 border-t border-border/40">
              <button
                onClick={() => { onClose(); navigate("/notices"); }}
                className="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors flex items-center justify-center gap-1.5"
              >
                View All Notices <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
