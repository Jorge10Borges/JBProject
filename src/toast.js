// Toast notification utility
export function showToast(message, type = "success") {
  let toast = document.getElementById("toast-notification");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-notification";
    toast.className = "fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white text-sm transition-opacity duration-300 opacity-0 pointer-events-none";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.remove("bg-green-600", "bg-red-600", "opacity-0", "opacity-100");
  toast.classList.add(type === "error" ? "bg-red-600" : "bg-green-600", "opacity-100");
  toast.style.pointerEvents = "auto";
  setTimeout(() => {
    toast.classList.add("opacity-0");
    toast.classList.remove("opacity-100");
    toast.style.pointerEvents = "none";
  }, 2500);
}
