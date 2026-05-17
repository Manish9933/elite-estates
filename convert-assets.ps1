# Elite Estates - Asset Format Fixer Script
# This script converts the JPEG assets masquerading as .png to true PNGs.
# It uses .NET/GDI+ and properly disposes of file handles to avoid file-locking issues.

Add-Type -AssemblyName System.Drawing

$files = @(
    'assets\icon.png',
    'assets\splash.png',
    'assets\adaptive-icon.png',
    'assets\favicon.png'
)

Write-Host "Starting asset verification and conversion..." -ForegroundColor Cyan

foreach ($f in $files) {
    $fullPath = Join-Path (Get-Location) $f
    if (-not (Test-Path $fullPath)) {
        Write-Warning "File not found: $f"
        continue
    }

    Write-Host "Processing: $f..." -ForegroundColor Yellow

    try {
        # 1. Load the existing image (which GDI+ will read-lock)
        $img = [System.Drawing.Image]::FromFile($fullPath)
        
        # 2. Create a brand-new bitmap copy in memory (this unlinks it from the original file stream)
        $bmp = New-Object System.Drawing.Bitmap($img)
        
        # 3. Dispose of the original image immediately to release the file lock on $fullPath
        $img.Dispose()

        # 4. Save the bitmap to a temporary PNG file
        $tempPath = $fullPath + ".tmp"
        $bmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # 5. Dispose of the bitmap memory representation
        $bmp.Dispose()

        # 6. Delete the original JPEG masquerader
        Remove-Item $fullPath -Force

        # 7. Rename the temp PNG to the original file name
        Rename-Item $tempPath (Split-Path $fullPath -Leaf)

        Write-Host "Successfully converted $f to a true PNG file!" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to convert $f. Error: $_"
    }
}

Write-Host "`nAll assets processed. You can now run 'npx expo-doctor' to verify." -ForegroundColor Cyan
