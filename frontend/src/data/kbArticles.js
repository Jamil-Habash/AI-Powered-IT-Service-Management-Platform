export const kbArticles = [
  {
    id: "vpn-timeout",
    icon: "vpn_key",
    category: "Network",
    title: "Fixing GlobalProtect VPN connection timeout",
    steps: [
      {
        title: "Check your internet connection",
        description:
          "Confirm you have a stable internet connection outside the VPN first — open any website in your browser. If your general internet is down, VPN won't connect regardless.",
      },
      {
        title: "Fully disconnect and quit GlobalProtect",
        description:
          'Right-click the GlobalProtect icon in your system tray/menu bar and select "Disconnect", then "Quit". Don\'t just close the window — the background process needs to fully stop.',
      },
      {
        title: "Restart the GlobalProtect application",
        description:
          "Reopen GlobalProtect from your Applications folder or Start menu. Wait for it to fully load before attempting to connect again.",
      },
      {
        title: "Reconnect using your assigned gateway",
        description:
          "Enter your company VPN portal address if prompted, then log in with your usual credentials. Choose the gateway closest to your physical location if given a choice.",
      },
      {
        title: "Restart your device if the timeout persists",
        description:
          "A full restart clears any stuck network adapters or cached VPN state that a simple reconnect won't fix.",
      },
      {
        title: "Still failing? Submit a ticket",
        description:
          "Include the exact error message shown, your operating system version, and whether this started recently or has never worked.",
      },
    ],
  },
  {
    id: "okta-mfa-reset",
    icon: "lock_reset",
    category: "Security",
    title: "Okta Multi-Factor authentication reset guide",
    steps: [
      {
        title: "Confirm you're locked out, not just delayed",
        description:
          "Okta Verify codes refresh every 30 seconds — make sure you're entering the current code, not one that just expired.",
      },
      {
        title: "Check for a backup MFA method",
        description:
          'On the Okta login screen, look for "Try another way" — you may have SMS or email backup verification set up that bypasses the broken authenticator.',
      },
      {
        title: "Reinstall Okta Verify if the app is broken",
        description:
          "Delete and reinstall the Okta Verify app on your phone. This will require re-enrolling your device, so have your employee ID ready.",
      },
      {
        title: "Request an admin-assisted reset",
        description:
          "If you have no working backup method and can't reinstall Okta Verify (e.g. lost phone), this requires IT to manually reset your MFA enrollment from the admin console.",
      },
      {
        title: "Submit a ticket with identity verification",
        description:
          "For security, include your employee ID and manager's name so IT can verify your identity before resetting MFA — this cannot be done from an anonymous or unverified request.",
      },
    ],
  },
  {
    id: "caldigit-firmware",
    icon: "devices",
    category: "Hardware",
    title: "CalDigit TS4 Thunderbolt display firmware patch",
    steps: [
      {
        title: "Check your current firmware version",
        description:
          "Download the CalDigit Thunderbolt Utility from the official CalDigit site and open it — it will show your dock's current firmware version at the top.",
      },
      {
        title: "Back up any dock-specific settings",
        description:
          "If you've customized port priorities or power settings on the dock, note them down — a firmware update can occasionally reset these to default.",
      },
      {
        title: "Download the latest firmware package",
        description:
          "Only download firmware directly from CalDigit's official support page for the TS4 model specifically — using firmware for a different dock model can brick the device.",
      },
      {
        title: "Connect the dock directly to your laptop",
        description:
          "Firmware updates should be done with the dock connected directly, not through another hub or dock, and with the laptop plugged into power.",
      },
      {
        title: "Run the update and do not disconnect",
        description:
          "Start the firmware update in the Thunderbolt Utility and wait for it to fully complete — interrupting a firmware flash can permanently damage the dock.",
      },
      {
        title: "Restart both the dock and your laptop",
        description:
          "After the update completes, unplug the dock for 10 seconds, reconnect it, then restart your laptop to ensure the new firmware is fully recognized.",
      },
    ],
  },
  {
    id: "displaylink-macos",
    icon: "laptop_mac",
    category: "macOS",
    title: "macOS Sonoma DisplayLink driver installation",
    steps: [
      {
        title: "Check macOS compatibility",
        description:
          "DisplayLink drivers need specific versions for each macOS release — confirm Sonoma is officially supported on DisplayLink's compatibility page before installing.",
      },
      {
        title: "Remove any old DisplayLink driver first",
        description:
          "Open System Settings → General → Login Items, and also check /Applications for a DisplayLink uninstaller — remove any existing installation before installing a new version to avoid conflicts.",
      },
      {
        title: "Download the correct driver package",
        description:
          "Get the driver directly from displaylink.com/downloads, selecting macOS as the platform — never use a driver bundled with third-party docking station software.",
      },
      {
        title: "Grant Screen Recording permission",
        description:
          "macOS requires DisplayLink to have Screen Recording permission to mirror/extend displays. Go to System Settings → Privacy & Security → Screen Recording and enable it for DisplayLink Manager.",
      },
      {
        title: "Restart your Mac",
        description:
          "DisplayLink drivers require a full restart to load correctly — a simple app relaunch isn't enough.",
      },
      {
        title: "Reconnect your external display",
        description:
          "After restarting, plug in your external display via the dock again and check System Settings → Displays to confirm it's detected.",
      },
    ],
  },
  {
    id: "bamboohr-license",
    icon: "badge",
    category: "Licensing",
    title: "Requesting software license seats via BambooHR",
    steps: [
      {
        title: "Confirm the software isn't already available",
        description:
          "Check your company's approved software catalog first — many common tools already have seats available without a new request.",
      },
      {
        title: "Get manager approval",
        description:
          "Most license requests over a certain cost threshold require your manager's sign-off before IT can proceed. Check with your manager first to avoid delays.",
      },
      {
        title: "Submit the request in BambooHR",
        description:
          'Navigate to the "IT Requests" section in BambooHR, select "Software License", and fill in the tool name, version, and business justification.',
      },
      {
        title: "Specify billing/cost center",
        description:
          "License costs are usually charged back to your department — include the correct cost center code so the request doesn't get stuck in finance review.",
      },
      {
        title: "Wait for procurement processing",
        description:
          "License purchases typically take 2-5 business days depending on the vendor and approval chain — this isn't an instant IT provisioning task.",
      },
      {
        title: "Still urgent? Escalate via ticket",
        description:
          "If you have a genuine business-blocking urgency, submit a High priority ticket referencing your BambooHR request number so IT can attempt to expedite.",
      },
    ],
  },
  {
    id: "outlook-duplicate-notifications",
    icon: "mail",
    category: "Productivity",
    title: "Office 365 Outlook duplicate notifications reset",
    steps: [
      {
        title: "Check for multiple active sessions",
        description:
          "Duplicate notifications often come from having Outlook open on desktop, web, and mobile simultaneously, each independently polling for new mail.",
      },
      {
        title: "Review notification settings per platform",
        description:
          "Check File → Options → Mail → Message Arrival in desktop Outlook, notification settings in the Outlook mobile app, and browser notification permissions for Outlook Web — duplicates usually mean more than one is enabled.",
      },
      {
        title: "Clear the Outlook notification cache",
        description:
          "On Windows, close Outlook completely, then delete the roaming notification cache folder (found under your Outlook profile's AppData directory) before reopening.",
      },
      {
        title: "Check for a faulty add-in",
        description:
          "Some third-party Outlook add-ins duplicate notification hooks. Go to File → Options → Add-ins and disable any non-Microsoft add-ins to test.",
      },
      {
        title: "Sign out and back into all devices",
        description:
          "A full sign-out/sign-in cycle on both desktop and mobile can clear a corrupted sync state that's causing the duplication.",
      },
      {
        title: "Submit a ticket if it persists across all devices",
        description:
          "If duplicates continue after trying the above, include which devices/platforms show duplicates and how many notifications you get per email.",
      },
    ],
  },
];
