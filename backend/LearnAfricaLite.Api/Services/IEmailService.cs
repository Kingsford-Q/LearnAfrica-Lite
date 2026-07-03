using System.Net;
using System.Net.Http.Json;
using System.Net.Mail;

namespace LearnAfricaLite.Api.Services;

public interface IEmailService
{
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
}

/// <summary>
/// Sends mail through whichever provider is configured, in order of least setup
/// friction: Resend's HTTP API (Email:ResendApiKey -- just an API key, no mail
/// server to stand up) first, then raw SMTP (Email:SmtpHost) as a fallback for
/// anyone who already has SMTP credentials. When NEITHER is configured -- the
/// default for local development, and the reason "forgot password" emails never
/// arrived in production before Email:ResendApiKey was set -- it just logs the
/// message instead so the recipient (e.g. a password-reset link) is still visible
/// to the developer rather than silently vanishing.
/// </summary>
public class SmtpEmailService(IConfiguration config, IHttpClientFactory httpClientFactory, ILogger<SmtpEmailService> logger) : IEmailService
{
    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        var resendApiKey = config["Email:ResendApiKey"];
        if (!string.IsNullOrWhiteSpace(resendApiKey))
        {
            await SendViaResendAsync(resendApiKey, toEmail, subject, htmlBody, ct);
            return;
        }

        var host = config["Email:SmtpHost"];
        if (string.IsNullOrWhiteSpace(host))
        {
            logger.LogInformation(
                "No email provider configured (Email:ResendApiKey / Email:SmtpHost) — logging email instead of sending.\nTo: {To}\nSubject: {Subject}\nBody: {Body}",
                toEmail, subject, htmlBody);
            return;
        }

        var port = int.TryParse(config["Email:SmtpPort"], out var p) ? p : 587;
        var user = config["Email:SmtpUser"];
        var password = config["Email:SmtpPassword"];
        var fromAddress = config["Email:FromAddress"] ?? user ?? "no-reply@learnafricalite.com";
        var fromName = config["Email:FromName"] ?? "LearnAfrica Lite";

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = true,
            Credentials = string.IsNullOrWhiteSpace(user) ? null : new NetworkCredential(user, password),
        };

        using var message = new MailMessage
        {
            From = new MailAddress(fromAddress, fromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
        };
        message.To.Add(toEmail);

        await client.SendMailAsync(message, ct);
    }

    private async Task SendViaResendAsync(string apiKey, string toEmail, string subject, string htmlBody, CancellationToken ct)
    {
        var fromAddress = config["Email:FromAddress"] ?? "no-reply@learnafricalite.com";
        var fromName = config["Email:FromName"] ?? "LearnAfrica Lite";

        var client = httpClientFactory.CreateClient();
        client.BaseAddress = new Uri("https://api.resend.com/");
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

        var response = await client.PostAsJsonAsync("emails", new
        {
            from = $"{fromName} <{fromAddress}>",
            to = new[] { toEmail },
            subject,
            html = htmlBody,
        }, ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("Resend email send failed ({Status}) for {To}: {Body}", response.StatusCode, toEmail, body);
        }
    }
}
