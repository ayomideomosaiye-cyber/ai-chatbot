Add-Type -AssemblyName System.Drawing

function Render-WestyIcon([int]$size, [string]$outputPath) {
    $bitmap = New-Object System.Drawing.Bitmap($size, $size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Dark background chassis #0d1117
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 13, 17, 23))
    $graphics.FillRectangle($bgBrush, 0, 0, $size, $size)

    # Scaling factor
    $scale = [float]($size / 32.0)

    # Draw rounded rectangle border
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 255, 255, 255), [float]([Math]::Max(1.0, $scale * 1.0)))
    $graphics.DrawRectangle($borderPen, [float]($scale * 1.5), [float]($scale * 1.5), [float]($size - $scale * 3.0), [float]($size - $scale * 3.0))

    # Left wing (Teal)
    $leftBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 245, 212))
    $leftPoints = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF ([float](6.5 * $scale), [float](8.5 * $scale))),
        (New-Object System.Drawing.PointF ([float](10.0 * $scale), [float](23.5 * $scale))),
        (New-Object System.Drawing.PointF ([float](13.5 * $scale), [float](15.5 * $scale))),
        (New-Object System.Drawing.PointF ([float](10.0 * $scale), [float](8.5 * $scale)))
    )
    $graphics.FillPolygon($leftBrush, $leftPoints)

    # Right wing (Neon Purple)
    $rightBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 123, 44, 191))
    $rightPoints = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF ([float](25.5 * $scale), [float](8.5 * $scale))),
        (New-Object System.Drawing.PointF ([float](22.0 * $scale), [float](23.5 * $scale))),
        (New-Object System.Drawing.PointF ([float](18.5 * $scale), [float](15.5 * $scale))),
        (New-Object System.Drawing.PointF ([float](22.0 * $scale), [float](8.5 * $scale)))
    )
    $graphics.FillPolygon($rightBrush, $rightPoints)

    # Center apex chevron (White)
    $apexBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $apexPoints = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF ([float](16.0 * $scale), [float](11.5 * $scale))),
        (New-Object System.Drawing.PointF ([float](12.8 * $scale), [float](22.0 * $scale))),
        (New-Object System.Drawing.PointF ([float](19.2 * $scale), [float](22.0 * $scale)))
    )
    $graphics.FillPolygon($apexBrush, $apexPoints)

    # Micro core dot (Teal)
    $coreBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 245, 212))
    $r = [float](1.3 * $scale)
    $graphics.FillEllipse($coreBrush, [float](16.0 * $scale - $r), [float](18.5 * $scale - $r), [float]($r * 2), [float]($r * 2))

    $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
    Write-Host "Created $outputPath ($size x $size)"
}

Render-WestyIcon 192 "public/icon-192.png"
Render-WestyIcon 512 "public/icon-512.png"
