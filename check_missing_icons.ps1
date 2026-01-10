$expeditionsFile = "c:\Users\Joeri\Desktop\Two Point Planner\src\data\expeditions.ts"
$iconsDir = "c:\Users\Joeri\Desktop\Two Point Planner\public\assets\expedition-icons"

# Read the expeditions data
$expeditionsContent = Get-Content $expeditionsFile -Raw

# Extract all expedition names
$names = [regex]::Matches($expeditionsContent, 'name:\s*"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }

# Convert name to filename format
function ConvertNameToFilename {
    param([string]$name)
    
    # Replace spaces with hyphens
    $result = $name -replace ' ', '-'
    # Replace apostrophes with %27
    $result = $result -replace "'", '%27'
    # Replace & with n
    $result = $result -replace '&', 'n'
    
    return "$result.webp"
}

# Get existing icon files
$existingFiles = Get-ChildItem $iconsDir -Name

# Create a hashtable for quick lookup (case-insensitive)
$existingMap = @{}
$existingFiles | ForEach-Object { $existingMap[$_.ToLower()] = $_ }

# Check each expedition
$missing = @()
$foundCount = 0
$excludedExps = @("Fairydale (Destroyed)", "Goldrush Stream", "Farflung Caves", "Under Wilds")

foreach ($name in $names) {
    if ($excludedExps -contains $name) {
        continue
    }
    
    $expectedFilename = ConvertNameToFilename $name
    $expectedFilenameLower = $expectedFilename.ToLower()
    
    if ($existingMap.ContainsKey($expectedFilenameLower)) {
        $foundCount++
    } else {
        $missing += @{ ExpeditionName = $name; ExpectedFilename = $expectedFilename }
    }
}

Write-Host "Total expeditions: $($names.Count)"
Write-Host "Excluded from check: $($excludedExps.Count)"
Write-Host "Found icons: $foundCount"
Write-Host "Missing icons: $($missing.Count)"
Write-Host ""

if ($missing.Count -gt 0) {
    Write-Host "Missing Icons:"
    Write-Host "=============="
    $missing | Sort-Object -Property ExpeditionName | ForEach-Object {
        Write-Host "$($_.ExpeditionName) -> $($_.ExpectedFilename)"
    }
} else {
    Write-Host "All expeditions have matching icons!"
}
