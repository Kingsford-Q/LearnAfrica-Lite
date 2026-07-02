namespace LearnAfricaLite.Api.Services;

public interface IFileStorageService
{
    /// <summary>Saves a file and returns its public-relative URL (e.g. "/uploads/abc.jpg").</summary>
    Task<string> SaveAsync(Stream content, string fileName, string contentType, CancellationToken ct = default);
    void Delete(string relativeUrl);
}

public class LocalFileStorageService(IWebHostEnvironment env) : IFileStorageService
{
    private readonly string _uploadsRoot = Path.Combine(env.ContentRootPath, "wwwroot", "uploads");

    public async Task<string> SaveAsync(Stream content, string fileName, string contentType, CancellationToken ct = default)
    {
        Directory.CreateDirectory(_uploadsRoot);

        // The saved extension is derived from the verified content-type, never from the
        // client-supplied filename — see FileSignatureValidator for why that matters.
        var ext = FileSignatureValidator.ExtensionFor(contentType);
        var safeName = $"{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(_uploadsRoot, safeName);

        await using var fileStream = File.Create(fullPath);
        await content.CopyToAsync(fileStream, ct);

        return $"/uploads/{safeName}";
    }

    public void Delete(string relativeUrl)
    {
        if (string.IsNullOrWhiteSpace(relativeUrl) || !relativeUrl.StartsWith("/uploads/"))
            return;

        var fileName = Path.GetFileName(relativeUrl);
        var fullPath = Path.Combine(_uploadsRoot, fileName);
        if (File.Exists(fullPath))
            File.Delete(fullPath);
    }
}
