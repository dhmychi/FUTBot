import React from "react";

const PrivacyPage: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4">
    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
    <div className="space-y-5 text-gray-300">
      <p>
        Futbotclub respects your privacy. We collect only the minimum data needed to operate our
        services, provide SBC solutions, and support users.
      </p>

      <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Account/contact details you provide when contacting support.</li>
        <li>Basic usage analytics to improve site performance and reliability.</li>
      </ul>

      <h2 className="text-xl font-semibold text-white">How We Use Information</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To deliver features such as squad planning and SBC solutions.</li>
        <li>To maintain, troubleshoot, and improve the service.</li>
        <li>To respond to your inquiries.</li>
      </ul>

      <h2 className="text-xl font-semibold text-white">Sharing</h2>
      <p>
        We do not sell your personal data. We may share limited data with service providers solely
        to operate our platform (e.g., hosting, analytics), under appropriate safeguards.
      </p>

      <h2 className="text-xl font-semibold text-white">Data Retention</h2>
      <p>
        We retain data only as long as necessary for the purposes above or as required by law.
      </p>

      <h2 className="text-xl font-semibold text-white">Contact</h2>
      <p>
        For privacy requests, contact <a className="text-blue-400" href="mailto:futbott97@gmail.com">futbott97@gmail.com</a>.
      </p>
    </div>
  </div>
);

export default PrivacyPage;
