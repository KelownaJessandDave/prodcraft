(function () {
  const consentKey = "vr_analytics_consent";
  const pixelId = "1937478166927042";
  const config = window.vrAnalyticsConfig || {};
  let banner;
  let pixelLoaded = false;

  function getConsent() {
    try {
      return localStorage.getItem(consentKey);
    } catch (error) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(consentKey, value);
    } catch (error) {
      // The choice applies to this page even when storage is unavailable.
    }
  }

  function trackPendingLead() {
    if (!config.trackLead) return;

    try {
      const pendingLeadAt = Number(sessionStorage.getItem("vr_lead_pending_at"));
      const tenMinutes = 10 * 60 * 1000;

      if (pendingLeadAt && Date.now() - pendingLeadAt < tenMinutes) {
        window.fbq("track", "Lead");
      }

      sessionStorage.removeItem("vr_lead_pending_at");
    } catch (error) {
      // PageView tracking still works when browser storage is unavailable.
    }
  }

  function loadPixel() {
    if (pixelLoaded) return;
    pixelLoaded = true;

    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version="2.0";
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,"script",
    "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
    trackPendingLead();
  }

  function closeBanner() {
    if (!banner) return;
    banner.remove();
    banner = null;
  }

  function choose(value) {
    setConsent(value);
    closeBanner();
    if (value === "granted") loadPixel();
  }

  function showBanner() {
    if (banner) return;

    banner = document.createElement("section");
    banner.className = "consent-banner";
    banner.setAttribute("aria-label", "Analytics choices");
    banner.innerHTML = `
      <div class="consent-copy">
        <strong>Your privacy choices</strong>
        <p>With your permission, we use the Meta Pixel to measure visits and completed review requests. We do not send your form answers to Meta. <a href="privacy.html">Learn more</a>.</p>
      </div>
      <div class="consent-actions">
        <button class="button consent-decline" type="button" data-consent="denied">Decline</button>
        <button class="button button-primary" type="button" data-consent="granted">Allow analytics</button>
      </div>
    `;

    banner.querySelectorAll("[data-consent]").forEach((button) => {
      button.addEventListener("click", () => choose(button.dataset.consent));
    });

    document.body.appendChild(banner);
  }

  document.querySelectorAll("[data-cookie-settings]").forEach((button) => {
    button.addEventListener("click", showBanner);
  });

  if (getConsent() === "granted") {
    loadPixel();
  } else if (getConsent() !== "denied") {
    showBanner();
  }
})();
