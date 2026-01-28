import React from "react";
import "./ViewSubscriptionModel.css";
import { FaTimes, FaTrashAlt, FaEdit } from "react-icons/fa";
import { useTranslation } from "react-i18next"; // for i18n
import { getCurrencySymbol } from "../../helper_functions/CurrencyFormate";

const ViewSubscriptionModel = ({
  id,
  planDetails,
  billingDetails,
  type = "plan",
  onDelete,
  onEdit,
  onClose
}) => {
  const { t } = useTranslation();
  console.log("planDetails___", planDetails);
  console.log("billingDetails___", billingDetails);
const formatLabel = (text = "") => {
if (!text) return "";


return text
.toString()
.replace(/[_\-.]+/g, " ") // replace _, -, . with space
.replace(/\s+/g, " ") // remove extra spaces
.trim()
.split(" ")
.map(
(word) => word.charAt(0).toUpperCase() + word.slice(1)
)
.join(" ");
};
  return (
    <div className="modal-overlay" onClick={onClose} >
      <div className="plan-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px ' }}>
        {/* Top Section */}
        <div className="model-top">
          <div className="modal-header">
            <button className="modal-close" onClick={onClose}>
              <FaTimes />
            </button>
            <span className="modal-id">{t("ID")}#{formatLabel(id)}</span>
          </div>
        </div>

        {/* Body */}
        <div className="model-body">
          <div className="modal-content">
            <h3 className="modal-title">
              {type === "plan" ? t("Plan Details") : t("Billing Details")}
            </h3>

            <div className="details-box">
              {type === "billing" ? (
                <>
                  <div className="details-row">
                    <span>{t("Company Name")}</span>
                    <span>{billingDetails.companyName}</span>
                  </div>

                  <div className="details-row">
                    <span>{t("Plan Name")}</span>
                    <span>{billingDetails.plan}</span>
                  </div>

                  <div className="details-row">
                    <span>{t("Amount")}</span>
                    <span>{getCurrencySymbol(billingDetails.currency)}{billingDetails.amount}</span>
                  </div>

                  <div className="details-row">
                    <span>{t("Billing Cycle")}</span>
                    <span>{billingDetails.duration}</span>
                  </div>

                  <div className="details-row">
                    <span>{t("Start - End Date")}</span>
                    <span>{billingDetails.dates}</span>
                  </div>

                  <div className="details-row">
                    <span>{t("Status")}</span>
                    <span
                      className={`status-badge ${billingDetails.status === "Paid" ? "active" : "inactive"
                        }`}
                    >
                      ● {t(billingDetails.status)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <>
                    <div className="details-row">
                      <span>{t("Plan")}</span>
                      <span>{planDetails.plan}</span>
                    </div>

                    <div className="details-row">
                      <span>{t("Trial Period")}</span>
                      <span>{planDetails.trial}</span>
                    </div>

                    <div className="details-row">
                      <span>{t("Amount")}</span>
                      <span>
                        {getCurrencySymbol(planDetails.currency)}
                        {planDetails.amount}
                      </span>
                    </div>

                    <div className="details-row">
                      <span>{t("Max Users")}</span>
                      <span>{planDetails.users}</span>
                    </div>

                    <div className="details-row">
                      <span>{t("Duration")}</span>
                      <span>{planDetails.duration}</span>
                    </div>

                    <div className="details-row">
                      <span>{t("Status")}</span>
                      <span
                        className={`status-badge ${planDetails.status.toLowerCase()}`}
                      >
                        ● {t(planDetails.status)}
                      </span>
                    </div>

                    {/* ✅ New Section: Features */}
                    {planDetails.features && planDetails.features.length > 0 && (
                      <div className="details-row features-section">
                        <span>{t("Features")}</span>
                        <div className="features-list">
                          {/* <ul>
                            {planDetails.features.map((feature, index) => (
                              <li key={index}>• {formatLabel(feature)}</li>
                            ))}
                          </ul> */}
                          <ul>
{planDetails.features.flatMap((feature, index) =>
feature
.split("•") // split combined strings
.map(f => f.trim()) // clean spaces
.filter(Boolean) // remove empty
.map((f, i) => (
<li key={`${index}-${i}`}>
• {formatLabel(f)}
</li>
))
)}
</ul>
                        </div>
                      </div>
                    )}
                  </>

                </>
              
              )}
            </div>
          </div>

      
        </div>
      </div>
    </div>
  );
};

export default ViewSubscriptionModel;
