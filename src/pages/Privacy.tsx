import React from "react";

const PrivacyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <div className="space-y-5 text-gray-300">
      <p>
        Futbotclub respects your privacy. We do not collect or store personal customer data.
        Our tools are designed to run without requiring identifiable information.
      </p>

      <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
      <p>We do not collect personal data. If you choose to email us, we will use your message only to reply and will not retain it longer than necessary.</p>

      <h2 className="text-xl font-semibold text-white">How We Use Information</h2>
      <p>We do not process personal data. Communications you initiate are used solely to respond to you.</p>

      <h2 className="text-xl font-semibold text-white">Sharing</h2>
      <p>
        We do not sell, share, or transfer personal data. No tracking or profiling is performed.
      </p>

      <h2 className="text-xl font-semibold text-white">Data Retention</h2>
      <p>
        We do not retain personal data. Email correspondence may be periodically deleted as part of routine housekeeping.
      </p>

      <h2 className="text-xl font-semibold text-white">Contact</h2>
      <p>
        For privacy requests, contact <a className="text-blue-400" href="mailto:info@futbot.club">info@futbot.club</a>.
      </p>
    </div>
  </div>
);

export default PrivacyPage;
