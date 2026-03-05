// ─── Base URLs ────────────────────────────────────────────────────────────────

const ASSET_BASE = "https://service.securecash.com.au/branded";

export const LOGO = {
  securecash: `${ASSET_BASE}/logo.jpg`,
  edockets: `${ASSET_BASE}/edockets.jpg`,
} as const;

// ─── Data row ─────────────────────────────────────────────────────────────────

export const emailRow = (label: string, value: string): string => `
  <tr>
    <td valign="top" style="color:#ffffff;background-color:#c2a14b;padding:5px 9px 5px 9px;width:160px;">
      <strong>${label}</strong>
    </td>
    <td style="padding:5px 9px 5px 9px;">${value}</td>
  </tr>
  <tr><td colspan="2" style="height:2px;"></td></tr>
`;

// ─── Section heading ──────────────────────────────────────────────────────────

export const emailSection = (heading: string, body: string): string => `
  <h3 style="background:#eeeeee;padding:8px;margin-top:24px;">${heading}</h3>
  ${body}
`;

// ─── Header row ───────────────────────────────────────────────────────────────

export const emailHeader = (
  subtitle: string,
  logo: string = LOGO.securecash,
): string => `
  <tr>
    <td style="padding:0 0 12px 0;">
      <img src="${logo}" alt="Logo">
    </td>
    <td valign="middle" style="color:#bbbbbb;text-align:center;font-family:Helvetica,Arial,sans-serif;font-size:15px;">
      ${subtitle}
    </td>
  </tr>
`;

// ─── Footer signature ─────────────────────────────────────────────────────────

export const emailFooter = (
  email: string,
  logo: string = LOGO.securecash,
): string => `
  <tr>
    <td colspan="2" style="border:1px solid #dddddd;border-width:0 0 1px 0;">
      <table align="left" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <tr>
          <td width="240" style="padding:12px 0 12px 0;color:#222222;line-height:160%;text-align:center;font-family:Helvetica,Arial,sans-serif;font-size:15px;">
            <img src="${logo}" width="240" alt="Logo">
            <span><strong>SecureCash eDocket System</strong></span>
            <br /><span><em>"We Pickup &amp; Bank Your Money!"</em></span>
          </td>
          <td style="padding:16px 0 12px 40px;color:#222222;line-height:160%;text-align:left;font-family:Helvetica,Arial,sans-serif;font-size:15px;">
            <table align="left" border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td width="30"><img src="${ASSET_BASE}/email.png" style="margin:4px 0 0 0;" alt="Email"></td>
                <td>${email}</td>
              </tr>
              <tr>
                <td width="30"><img src="${ASSET_BASE}/phone.png" style="margin:4px 0 0 0;" alt="Phone"></td>
                <td>1300 SECURE</td>
              </tr>
              <tr>
                <td width="30"><img src="${ASSET_BASE}/website.png" style="margin:4px 0 0 0;" alt="Website"></td>
                <td><a href="https://www.securecash.com.au/" target="_blank" style="color:blue;">securecash.com.au</a></td>
              </tr>
              <tr>
                <td colspan="2">
                  Take 30 seconds to <a href="https://www.securecash.com.au/performance/" target="_blank">rate our performance</a>.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

// ─── Copyright row ────────────────────────────────────────────────────────────

const emailCopyright = (): string => `
  <tr>
    <td colspan="2" style="color:#666666;line-height:160%;text-align:center;font-family:Helvetica,Arial,sans-serif;font-size:15px;padding:12px 0 0 0;">
      &copy; 2005 Sky Wallet Pty Ltd ABN 39 668 299 027 Trading (Under License) as Secure Cash.
    </td>
  </tr>
`;

// ─── Full wrapper ─────────────────────────────────────────────────────────────

export const emailWrapper = (
  subtitle: string,
  body: string,
  options: {
    footerEmail?: string;
    logo?: string;
  } = {},
): string => {
  const {
    footerEmail = "customers@securecash.com.au",
    logo = LOGO.securecash,
  } = options;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="padding:12px;">
        <table align="left" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;">
          ${emailHeader(subtitle, logo)}
          <tr style="border:1px solid #dddddd;border-width:1px 0 1px 0;">
            <td colspan="2" style="padding:18px 12px 18px 12px;color:#222222;line-height:160%;text-align:left;font-family:Helvetica,Arial,sans-serif;font-size:15px;">
              ${body}
            </td>
          </tr>
          ${emailFooter(footerEmail, logo)}
          ${emailCopyright()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
