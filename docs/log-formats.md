# 📄 Supported Log Formats & Threat Classification Matrix

The Smart Log Analyzer engine processes text-based operational log files line-by-line.

---

## 📑 File Constraints & Validation Rules

- **Allowed Extensions**: `.log`, `.txt`, `.out`
- **Max File Size**: `10 MB`
- **Encoding**: UTF-8 text streams

---

## 🔍 Pattern Matchers & Keyword Rules

1. **Total Entries**: Every valid line increments total logs count.
2. **System Errors**: Lines containing `ERROR` increment error count.
3. **Authentication Failures**: Lines containing `Failed password` increment failed login count and extract the target IPv4 address using regex.

---

## 🛡️ IP Risk Evaluation Matrix

When an IP address accumulates **more than 5 failed login attempts** (`attemptCount > 5`), it is flagged as a suspicious threat:

| Attempt Count | Risk Level | Mitigation Recommendation |
| :--- | :--- | :--- |
| `> 15` | **CRITICAL** | Immediately block IP at firewall level and trigger incident response workflow. |
| `> 10` | **HIGH** | Block IP address and reset associated user accounts. |
| `> 5` | **MEDIUM** | Flag for security monitoring and enforce CAPTCHA / Rate limiting. |
| `<= 5` | **LOW** | Normal threshold. Monitor login attempts. |

---

## 🚦 Overall System Risk Status

| Condition | System Status | Dashboard Indicator |
| :--- | :--- | :--- |
| `suspiciousIpCount > 3` OR `failedLogins > 20` | **CRITICAL_ALERT** | Crimson Pulse Dot |
| `suspiciousIpCount > 0` OR `errorCount > 5` OR `failedLogins > 5` | **ELEVATED_RISK** | Amber Pulse Dot |
| Otherwise | **NORMAL** | Emerald Pulse Dot |
