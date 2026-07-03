using System.Net.Http.Headers;

namespace LearnAfricaLite.Api.Services;

// Stores uploads in a Supabase Storage bucket instead of local disk, so files
// survive Render restarts/redeploys (Render's own filesystem is ephemeral).
// Selected automatically in Program.cs when Supabase:Url is configured; local
// development with no Supabase config keeps using LocalFileStorageService.
public class SupabaseStorageService(IHttpClientFactory httpClientFactory, IConfiguration config) : IFileStorageService
{
    private string SupabaseUrl => config["Supabase:Url"]!.TrimEnd('/');
    private string ServiceRoleKey => config["Supabase:ServiceRoleKey"]!;
    private string Bucket => config["Supabase:StorageBucket"] ?? "uploads";

    public async Task<string> SaveAsync(Stream content, string fileName, string contentType, CancellationToken ct = default)
    {
        var ext = FileSignatureValidator.ExtensionFor(contentType);
        var objectPath = $"{Guid.NewGuid():N}{ext}";

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ServiceRoleKey);

        using var streamContent = new StreamContent(content);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        var response = await client.PostAsync(
            $"{SupabaseUrl}/storage/v1/object/{Bucket}/{objectPath}", streamContent, ct);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            throw new InvalidOperationException($"Supabase Storage upload failed ({response.StatusCode}): {body}");
        }

        return $"{SupabaseUrl}/storage/v1/object/public/{Bucket}/{objectPath}";
    }

    public async Task DeleteAsync(string url, CancellationToken ct = default)
    {
        var marker = $"/storage/v1/object/public/{Bucket}/";
        var index = url.IndexOf(marker, StringComparison.Ordinal);
        if (index < 0) return; // not one of ours (e.g. a pre-existing local-disk URL)

        var objectPath = url[(index + marker.Length)..];

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", ServiceRoleKey);
        await client.DeleteAsync($"{SupabaseUrl}/storage/v1/object/{Bucket}/{objectPath}", ct);
    }
}
