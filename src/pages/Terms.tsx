import React from "react";

const TermsPage: React.FC = () => (
  <div className="max-w-3xl mx-auto py-12 px-4">
    <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
    <div className="space-y-5 text-gray-300">
      <p>
        These Terms of Service ("Terms") govern your use of Futbotclub’s website and tools. Our
        services provide market insights, SBC (Squad Building Challenge) solutions, and utility
        features intended to assist players in planning and building squads. We do not provide or
        endorse any functionality that violates game terms or automates in-game actions.
      </p>

      <h2 className="text-xl font-semibold text-white">Acceptable Use</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Use the tools solely for lawful analysis, planning, and SBC solution guidance.</li>
        <li>No exploitation, manipulation, or circumvention of any third-party systems.</li>
        <li>Do not use the service in any manner that breaches third-party terms (including EA policies).</li>
        <li>Do not attempt to reverse engineer, abuse, or disrupt the service.</li>
      </ul>

      <h2 className="text-xl font-semibold text-white">No Affiliation</h2>
      <p>
        Futbotclub is an independent platform and is not affiliated with, endorsed by, or sponsored
        by EA Sports, Electronic Arts, or any related entity. All trademarks belong to their
        respective owners.
      </p>

      <h2 className="text-xl font-semibold text-white">Availability and Changes</h2>
      <p>
        We may update, improve, or discontinue features at any time. Access may be temporarily
        unavailable during maintenance or updates.
      </p>

      <h2 className="text-xl font-semibold text-white">Limitation of Liability</h2>
      <p>
        Futbotclub is provided on an "as is" basis. To the maximum extent permitted by law, we are not
        liable for indirect or consequential losses. Users are solely responsible for lawful use and
        adherence to applicable third-party terms.
      </p>

      <h2 className="text-xl font-semibold text-white">Contact</h2>
      <p>
        For questions about these Terms, contact us at <a className="text-blue-400" href="mailto:futbott97@gmail.com">futbott97@gmail.com</a>.
      </p>
    </div>
  </div>
);

export default TermsPage;
