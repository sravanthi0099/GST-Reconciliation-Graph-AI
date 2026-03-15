def generate_gst_explanation(vendor):

    reasons = []

    high_ratio = vendor["high_count"] / vendor["total_invoices"]

    if vendor["high_count"] >= 3:
        reasons.append(
            f"{vendor['high_count']} invoices are classified as HIGH risk."
        )

    if vendor["medium_count"] >= 2:
        reasons.append(
            f"{vendor['medium_count']} invoices are classified as MEDIUM risk."
        )

    if high_ratio > 0.5:
        reasons.append(
            "More than half of the invoices from this supplier are high risk."
        )

    risk_level = "LOW"

    if vendor["risk_score"] > 70:
        risk_level = "HIGH"
    elif vendor["risk_score"] > 40:
        risk_level = "MEDIUM"

    explanation = (
        f"This supplier has a GST risk score of {vendor['risk_score']}%. "
        f"The system detected unusual invoice patterns compared with other vendors."
    )

    recommendation = "No immediate action required."

    if risk_level == "HIGH":
        recommendation = "Immediate audit and GST filing verification recommended."

    elif risk_level == "MEDIUM":
        recommendation = "Monitor this supplier and verify invoice authenticity."

    return {
        "risk_level": risk_level,
        "explanation": explanation,
        "reasons": reasons,
        "recommendation": recommendation
    }