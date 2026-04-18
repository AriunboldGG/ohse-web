"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function FacebookMessenger() {
  // Use guest mode - no Page ID required for demo/testing
  const [isGuestMode] = useState(true);
  const pageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID || "";

  useEffect(() => {
    // In guest mode, we'll create a simple chat widget that doesn't require Facebook SDK
    if (isGuestMode && !pageId) {
      // Guest mode - create a simple contact chat widget
      return;
    }

    // If Page ID is provided, use real Facebook Messenger
    if (!pageId) {
      return;
    }

    // Check if script is already loaded
    if (document.getElementById("facebook-jssdk")) {
      // If SDK is already loaded, just initialize
      if (window.FB) {
        window.FB.init({
          xfbml: true,
          version: "v21.0",
        });
        window.FB.XFBML.parse();
      }
      return;
    }

    // Initialize Facebook SDK callback
    window.fbAsyncInit = function () {
      if (window.FB) {
        window.FB.init({
          xfbml: true,
          version: "v21.0",
        });

        // Initialize Customer Chat Plugin
        window.FB.CustomerChat.init({
          page_id: pageId,
          theme_color: "#8DC63F",
          logged_in_greeting: "Сайн байна уу! Бид танд туслахдаа баяртай байна.",
          logged_out_greeting: "Сайн байна уу! Бид танд туслахдаа баяртай байна.",
        });
      }
    };

    // Load the Facebook SDK script
    (function (d, s, id) {
      const fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      const js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/mn_MN/sdk/xfbml.customerchat.js";
      js.async = true;
      js.defer = true;
      if (fjs && fjs.parentNode) {
        fjs.parentNode.insertBefore(js, fjs);
      }
    })(document, "script", "facebook-jssdk");
  }, [pageId, isGuestMode]);

  // Guest mode - show a simple contact chat widget (no Facebook Page ID needed)
  if (isGuestMode && !pageId) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {
            window.open("mailto:info@bayan-undur.mn?subject=Асуулт", "_blank");
          }}
          className="bg-[#0084FF] hover:bg-[#0066CC] text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 cursor-pointer flex items-center justify-center"
          aria-label="Холбогдох"
          title="Холбогдох"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>
    );
  }

  // Real Facebook Messenger mode
  if (!pageId) {
    return null;
  }

  return (
    <div
      className="fb-customerchat"
      data-page_id={pageId}
      data-theme_color="#8DC63F"
      data-logged_in_greeting="Сайн байна уу! Бид танд туслахдаа баяртай байна."
      data-logged_out_greeting="Сайн байна уу! Бид танд туслахдаа баяртай байна."
    ></div>
  );
}

