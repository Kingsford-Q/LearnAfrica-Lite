using System.Security.Cryptography;
using System.Text;

namespace LearnAfricaLite.Api.Services;

/// <summary>
/// RFC 6238 TOTP (the algorithm behind Google Authenticator, Authy, etc.) with no
/// external dependency. There's no QR-rendering library wired into this project,
/// so setup shows the Base32 secret / otpauth:// URI for manual entry — every
/// mainstream authenticator app supports "enter code manually" as a fallback to
/// scanning, so this isn't a degraded experience, just a text-first one.
/// </summary>
public static class TotpService
{
    private const string Base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private const int StepSeconds = 30;
    private const int Digits = 6;

    public static string GenerateSecret()
    {
        var bytes = RandomNumberGenerator.GetBytes(20); // 160 bits, standard TOTP key size
        return ToBase32(bytes);
    }

    public static string BuildOtpAuthUri(string secretBase32, string accountEmail, string issuer = "LearnAfrica Lite")
    {
        var label = Uri.EscapeDataString($"{issuer}:{accountEmail}");
        var issuerParam = Uri.EscapeDataString(issuer);
        return $"otpauth://totp/{label}?secret={secretBase32}&issuer={issuerParam}&digits={Digits}&period={StepSeconds}";
    }

    /// <summary>Accepts a code from the current or adjacent time step to tolerate clock drift.</summary>
    public static bool ValidateCode(string secretBase32, string code, int windowSteps = 1)
    {
        if (string.IsNullOrWhiteSpace(code) || code.Length != Digits || !code.All(char.IsDigit))
            return false;

        var key = FromBase32(secretBase32);
        var currentCounter = DateTimeOffset.UtcNow.ToUnixTimeSeconds() / StepSeconds;

        for (var offset = -windowSteps; offset <= windowSteps; offset++)
        {
            if (ComputeCode(key, currentCounter + offset) == code) return true;
        }
        return false;
    }

    private static string ComputeCode(byte[] key, long counter)
    {
        var counterBytes = BitConverter.GetBytes(counter);
        if (BitConverter.IsLittleEndian) Array.Reverse(counterBytes);

        using var hmac = new HMACSHA1(key);
        var hash = hmac.ComputeHash(counterBytes);

        var offset = hash[^1] & 0x0F;
        var binary = ((hash[offset] & 0x7F) << 24)
            | ((hash[offset + 1] & 0xFF) << 16)
            | ((hash[offset + 2] & 0xFF) << 8)
            | (hash[offset + 3] & 0xFF);

        var code = binary % (int)Math.Pow(10, Digits);
        return code.ToString().PadLeft(Digits, '0');
    }

    private static string ToBase32(byte[] data)
    {
        var sb = new StringBuilder();
        int bits = 0, value = 0;
        foreach (var b in data)
        {
            value = (value << 8) | b;
            bits += 8;
            while (bits >= 5)
            {
                sb.Append(Base32Alphabet[(value >> (bits - 5)) & 0x1F]);
                bits -= 5;
            }
        }
        if (bits > 0) sb.Append(Base32Alphabet[(value << (5 - bits)) & 0x1F]);
        return sb.ToString();
    }

    private static byte[] FromBase32(string base32)
    {
        base32 = base32.Trim().TrimEnd('=').ToUpperInvariant();
        var bytes = new List<byte>();
        int bits = 0, value = 0;
        foreach (var c in base32)
        {
            var index = Base32Alphabet.IndexOf(c);
            if (index < 0) continue;
            value = (value << 5) | index;
            bits += 5;
            if (bits >= 8)
            {
                bytes.Add((byte)((value >> (bits - 8)) & 0xFF));
                bits -= 8;
            }
        }
        return bytes.ToArray();
    }
}
