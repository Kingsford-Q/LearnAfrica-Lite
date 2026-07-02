using System.Net;
using System.Net.Mail;

namespace LearnAfricaLite.Api.Services;

public interface IEmailService
{
    Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default);
}

/// <summary>
/// Sends mail over SMTP when Email:SmtpHost is configured (production, via env-provided
/// config). When it isn't configured — the default for local development, since nobody
/// wants to stand up a mail server just to run "dotnet run" — it logs the message instead
/// so the recipient (e.g. a password-reset link) is still visible to the developer.
/// </summary>
public class SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger) : IEmailService
{
    public async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct = default)
    {
        var host = config["Email:SmtpHost"];
        if (string.IsNullOrWhiteSpace(host))
        {
            logger.LogInformation(
                "Email:SmtpHost not configured — logging email instead of sending.\nTo: {To}\nSubject: {Subject}\nBody: {Body}",
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
}
