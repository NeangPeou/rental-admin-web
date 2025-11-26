// utils/deviceDetector.js
const getFallbackDeviceName = () => {
  const ua = navigator.userAgent.toLowerCase();

  if (/windows/i.test(ua)) return "Windows PC";
  if (/macintosh|mac os x/i.test(ua)) return "Mac";
  if (/iphone/i.test(ua)) return "iPhone";
  if (/ipad/i.test(ua)) return "iPad";
  if (/android/i.test(ua)) {
    // Try to extract real model from UA (works on many Android devices)
    const androidModel = ua.match(/android.*?;\s([^);]+?)\sbuild/i);
    if (androidModel && androidModel[1]) {
      const model = androidModel[1].trim();
      // Clean up common junk
      if (model.includes("chrome") || model.includes("linux") || model === "mobile") {
        return "Android Device";
      }
      return model.includes("samsung") ? model : `${model} (Android)`;
    }
    return "Android Device";
  }
  if (/linux/i.test(ua) && !/android/i.test(ua)) return "Linux PC";
  if (/cros/i.test(ua)) return "Chromebook";

  return "Web Browser";
};

export const getDeviceName = async () => {
  // Try modern API first
  if (navigator.userAgentData) {
    try {
      const data = await navigator.userAgentData.getHighEntropyValues([
        "platform",
        "model",
        "mobile",
      ]);

      // Only trust model if it's not empty AND we're on mobile
      if (data.mobile && data.model && data.model.trim() !== "") {
        return `${data.model} (${data.platform})`;
      }

      // If model is empty (most Android), fall through
    } catch (err) {
      console.warn("User-Agent Client Hints failed:", err);
      // Continue to fallback
    }
  }

  // Ultimate fallback — works everywhere, including Android
  return getFallbackDeviceName();
};