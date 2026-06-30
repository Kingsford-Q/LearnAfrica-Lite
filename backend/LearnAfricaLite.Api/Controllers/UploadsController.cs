using LearnAfricaLite.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LearnAfricaLite.Api.Controllers;

[ApiController]
[Route("api/uploads")]
[Authorize]
public class UploadsController(IFileStorageService fileStorage) : ControllerBase
{
    private static readonly string[] AllowedContentTypes =
    [
        "image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "video/mp4"
    ];
    private const long MaxBytes = 25 * 1024 * 1024;

    [HttpPost]
    [RequestSizeLimit(MaxBytes)]
    public async Task<ActionResult<object>> Upload(IFormFile file)
    {
        if (file.Length == 0) return BadRequest(new { message = "File is empty." });
        if (file.Length > MaxBytes) return BadRequest(new { message = "File exceeds the 25MB limit." });
        if (!AllowedContentTypes.Contains(file.ContentType))
            return BadRequest(new { message = "Unsupported file type." });

        await using var stream = file.OpenReadStream();
        var url = await fileStorage.SaveAsync(stream, file.FileName, file.ContentType);

        return new { url };
    }
}
