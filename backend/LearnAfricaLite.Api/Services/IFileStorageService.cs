namespace LearnAfricaLite.Api.Services;

public interface IFileStorageService
{
    /// <summary>Saves a file and returns its public URL (relative for local disk, absolute for cloud storage).</summary>
    Task<string> SaveAsync(Stream content, string fileName, string contentType, CancellationToken ct = default);
    Task DeleteAsync(string url, CancellationToken ct = default);
}

// Writes to the API's own local disk (wwwroot/uploads). Fine for local
// development, but Render's filesystem is ephemeral — anything saved here is
// lost on every redeploy or restart, so production uses SupabaseStorageService
// instead (selected in Program.cs based on whether Supabase:Url is configured).
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

    public Task DeleteAsync(string url, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(url) || !url.StartsWith("/uploads/"))
            return Task.CompletedTask;

        var fileName = Path.GetFileName(url);
        var fullPath = Path.Combine(_uploadsRoot, fileName);
        if (File.Exists(fullPath))
            File.Delete(fullPath);

        return Task.CompletedTask;
    }
}
