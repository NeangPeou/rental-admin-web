const getFallbackDeviceName = () => {
  const ua = navigator.userAgent;
  let device = 'Web Browser';

  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Macintosh|MacIntel/i.test(ua)) return 'Mac';
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) {
    const match = ua.match(/Android.*?;\s([^;]+?)\sBuild/);
    return match ? match[1].trim() : 'Android Device';
  }
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'Linux PC';
  if (/CrOS/i.test(ua)) return 'Chromebook';

  return device;
};

export const getDeviceName = async () => {
  // Modern browsers (Chrome 90+, Edge, Opera, Samsung Internet)
  if (navigator.userAgentData) {
    try {
      const ua = await navigator.userAgentData.getHighEntropyValues([
        "platform",
        "platformVersion",
        "model",
        "brands",
        "mobile"
      ]);

      const { model, platform, mobile } = ua;

      // Mobile devices often expose real model
      if (mobile && model && model !== "") {
        return `${model} (${platform})`;
      }

      // Desktop or fallback
      const osMap = {
        "Windows": "Windows PC",
        "macOS": "Mac",
        "Linux": "Linux PC",
        "Chrome OS": "Chromebook"
      };

      const niceOS = osMap[platform] || platform || "PC";
      return mobile ? `${model || "Mobile Device"} (${platform})` : `${niceOS} Desktop`;

    } catch (err) {
      console.warn("High Entropy UA failed, using fallback", err);
      // Fall through to fallback
    }
  }

  // Old browsers or failed promise → use UA string parsing
  return getFallbackDeviceName();
};