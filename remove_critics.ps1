$root = "e:\Sut.Resources\my-Own-sites\ramzi-lyrics-studio-1"
$files = @(
    "$root\src\data\lyricsSongs.ts",
    "$root\src\data\videosData.ts",
    "$root\src\pages\SongsPage.tsx",
    "$root\src\pages\MelodiesPage.tsx"
)
foreach ($path in $files) {
    $text = [IO.File]::ReadAllText($path)
    $before = ([Regex]::Matches($text, 'critics')).Count
    # Remove multi-line critics blocks (critics: [\n...\n],)
    $text = [Regex]::Replace($text, "\r?\n[ \t]*critics: \[\r?\n(?:[ \t]*`"[^`"]*`",?\r?\n)*[ \t]*\],?", '')
    # Remove single-line critics (critics: [...],)
    $text = [Regex]::Replace($text, "\r?\n[ \t]*critics: \[[^\r\n]*\],?", '')
    $after = ([Regex]::Matches($text, 'critics')).Count
    [IO.File]::WriteAllText($path, $text, [System.Text.Encoding]::UTF8)
    $name = Split-Path $path -Leaf
    Write-Host "OK $name : removed $($before - $after) occurrences"
}
Write-Host "All done!"
