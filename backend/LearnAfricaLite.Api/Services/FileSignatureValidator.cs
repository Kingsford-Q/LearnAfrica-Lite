namespace LearnAfricaLite.Api.Services;

/// <summary>
/// Verifies an uploaded file's actual byte signature matches its declared content-type,
/// and maps content-type to a fixed, trusted file extension. Both the client-supplied
/// Content-Type header and filename are attacker-controlled and must never be trusted
/// on their own — a request can claim "image/png" while uploading arbitrary bytes with
/// an ".html" filename, which a naive save-by-client-extension would happily serve back
/// as executable HTML from the same origin (stored XSS).
/// </summary>
public static class FileSignatureValidator
{
    private static readonly Dictionary<string, string> ExtensionByContentType = new()
    {
        ["image/jpeg"] = ".jpg",
        ["image/png"] = ".png",
        ["image/webp"] = ".webp",
        ["image/gif"] = ".gif",
        ["application/pdf"] = ".pdf",
        ["video/mp4"] = ".mp4",
    };

    public static bool IsKnownContentType(string contentType) => ExtensionByContentType.ContainsKey(contentType);

    public static string ExtensionFor(string contentType) => ExtensionByContentType[contentType];

    /// <summary>Reads just enough of the stream to check its magic bytes, then rewinds it.</summary>
    public static async Task<bool> MatchesSignatureAsync(Stream stream, string contentType, CancellationToken ct = default)
    {
        var header = new byte[16];
        var read = await stream.ReadAsync(header, 0, header.Length, ct);
        stream.Position = 0;
        if (read < 4) return false;

        return contentType switch
        {
            "image/jpeg" => header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF,
            "image/png" => read >= 8 && header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47
                && header[4] == 0x0D && header[5] == 0x0A && header[6] == 0x1A && header[7] == 0x0A,
            "image/webp" => read >= 12 && header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
                && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P',
            "image/gif" => read >= 6 && header[0] == 'G' && header[1] == 'I' && header[2] == 'F'
                && header[3] == '8' && (header[4] == '7' || header[4] == '9') && header[5] == 'a',
            "application/pdf" => header[0] == '%' && header[1] == 'P' && header[2] == 'D' && header[3] == 'F',
            // MP4/ISO-BMFF: a 4-byte box size followed by an "ftyp" box type at offset 4.
            "video/mp4" => read >= 8 && header[4] == 'f' && header[5] == 't' && header[6] == 'y' && header[7] == 'p',
            _ => false,
        };
    }
}
