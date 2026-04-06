$ErrorActionPreference = 'Stop'

function Assert-True {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Resolve-AssetPath {
    param(
        [string]$AssetPath,
        [string]$RootPath
    )

    if ([string]::IsNullOrWhiteSpace($AssetPath)) {
        return $null
    }

    if ($AssetPath -match '^(https?:)?//') {
        return $null
    }

    return Join-Path $RootPath ($AssetPath -replace '/', '\')
}

function Get-ProjectGalleryItems {
    param(
        $Project
    )

    $groupedItems = foreach ($group in @($Project.galleryGroups)) {
        if (-not $group) {
            continue
        }

        foreach ($item in @($group.items)) {
            if ($item) {
                $item
            }
        }
    }

    if (@($groupedItems).Count -gt 0) {
        return @($groupedItems)
    }

    return @($Project.gallery)
}

function Get-ProjectGalleryCount {
    param(
        $Project
    )

    $groupedCount = 0
    foreach ($group in @($Project.galleryGroups)) {
        if (-not $group) {
            continue
        }

        $groupedCount += @($group.items | Where-Object { $_ }).Count
    }

    if ($groupedCount -gt 0) {
        return $groupedCount
    }

    return @($Project.gallery).Count
}

$root = $PSScriptRoot
$projectsPath = Join-Path $root 'projects.json'
$indexPath = Join-Path $root 'index.html'
$projectPagePath = Join-Path $root 'project.html'
$indexScriptPath = Join-Path $root 'js/portfolio-index.js'
$projectScriptPath = Join-Path $root 'js/project-page.js'
$legacyRedirectPath = Join-Path $root 'js/legacy-project-redirect.js'
$legacyBubblePagePath = Join-Path $root 'product_BubbleJam.html'
$stylesPath = Join-Path $root 'css/portfolio-ux.css'
$contentGuidePath = Join-Path $root 'PORTFOLIO-CONTENT.md'

Assert-True (Test-Path -LiteralPath $projectsPath) 'Missing projects.json'
Assert-True (Test-Path -LiteralPath $projectPagePath) 'Missing project.html'
Assert-True (Test-Path -LiteralPath $indexScriptPath) 'Missing js/portfolio-index.js'
Assert-True (Test-Path -LiteralPath $projectScriptPath) 'Missing js/project-page.js'
Assert-True (Test-Path -LiteralPath $legacyRedirectPath) 'Missing js/legacy-project-redirect.js'
Assert-True (Test-Path -LiteralPath $legacyBubblePagePath) 'Missing product_BubbleJam.html'
Assert-True (Test-Path -LiteralPath $stylesPath) 'Missing css/portfolio-ux.css'
Assert-True (Test-Path -LiteralPath $contentGuidePath) 'Missing PORTFOLIO-CONTENT.md'

$projects = Get-Content -LiteralPath $projectsPath -Raw | ConvertFrom-Json
Assert-True ($projects.projects.Count -ge 5) 'Expected at least 5 projects in projects.json'

$projectsBySlug = @{}
foreach ($project in $projects.projects) {
    Assert-True (-not [string]::IsNullOrWhiteSpace($project.slug)) "Project missing slug: $($project | ConvertTo-Json -Compress)"
    Assert-True (-not [string]::IsNullOrWhiteSpace($project.title)) "Project '$($project.slug)' missing title"
    Assert-True (-not [string]::IsNullOrWhiteSpace($project.summary)) "Project '$($project.slug)' missing summary"
    Assert-True (-not [string]::IsNullOrWhiteSpace($project.thumbnail)) "Project '$($project.slug)' missing thumbnail"

    $projectsBySlug[$project.slug] = $project

    foreach ($assetPath in @($project.thumbnail, $project.heroImage)) {
        $resolvedAssetPath = Resolve-AssetPath -AssetPath $assetPath -RootPath $root
        if ($resolvedAssetPath) {
            Assert-True (Test-Path -LiteralPath $resolvedAssetPath) "Project '$($project.slug)' references missing asset '$assetPath'"
        }
    }

    foreach ($galleryItem in @(Get-ProjectGalleryItems -Project $project)) {
        foreach ($assetPath in @($galleryItem.image, $galleryItem.fullImage)) {
            $resolvedAssetPath = Resolve-AssetPath -AssetPath $assetPath -RootPath $root
            if ($resolvedAssetPath) {
                Assert-True (Test-Path -LiteralPath $resolvedAssetPath) "Project '$($project.slug)' references missing gallery asset '$assetPath'"
            }
        }
    }
}

Assert-True (-not $projectsBySlug.ContainsKey('bubble-jam')) 'projects.json still exposes retired bubble-jam entry'
Assert-True (-not $projectsBySlug.ContainsKey('perfect-tidy')) 'projects.json still exposes retired perfect-tidy entry'
Assert-True ($projectsBySlug.ContainsKey('farm-match')) 'projects.json missing farm-match entry'
Assert-True ($projectsBySlug.ContainsKey('satisdom')) 'projects.json missing satisdom entry'
Assert-True ((@($projectsBySlug['farm-match'].legacySlugs)) -contains 'bubble-jam') 'farm-match is missing legacy bubble-jam mapping'
Assert-True ((@($projectsBySlug['satisdom'].legacySlugs)) -contains 'perfect-tidy') 'satisdom is missing legacy perfect-tidy mapping'
Assert-True ($projectsBySlug['farm-match'].video -eq 'https://drive.google.com/file/d/19SgqRr6oOtx2y5FhDHgH9FDQ3AhO8jeF/preview') 'farm-match video is not mapped to VI_Bubble.mp4'
Assert-True ($projectsBySlug['satisdom'].video -eq 'https://drive.google.com/file/d/1_thUFjzXz22vo3iAT_d92b5mwvyZyK8r/preview') 'satisdom video is not mapped to VI_PerfectTidy.mp4'
Assert-True ((Get-ProjectGalleryCount -Project $projectsBySlug['farm-match']) -eq 17) 'farm-match gallery was not synced to all folder images'
Assert-True ((Get-ProjectGalleryCount -Project $projectsBySlug['good-sort']) -eq 65) 'good-sort gallery was not synced to all folder images'
Assert-True ((Get-ProjectGalleryCount -Project $projectsBySlug['lunarfall-pixel-strategy']) -eq 4) 'lunarfall gallery was not synced to all folder images'
Assert-True ((Get-ProjectGalleryCount -Project $projectsBySlug['satisdom']) -eq 30) 'satisdom gallery was not synced to all folder images'
Assert-True ((Get-ProjectGalleryCount -Project $projectsBySlug['screw']) -eq 35) 'screw gallery was not synced to all folder images'
Assert-True ((Get-ProjectGalleryCount -Project $projectsBySlug['tank']) -eq 1) 'tank gallery should remain a single fallback image'

$indexHtml = Get-Content -LiteralPath $indexPath -Raw
$projectHtml = Get-Content -LiteralPath $projectPagePath -Raw
$indexScript = Get-Content -LiteralPath $indexScriptPath -Raw
$projectScript = Get-Content -LiteralPath $projectScriptPath -Raw
$legacyBubblePage = Get-Content -LiteralPath $legacyBubblePagePath -Raw

foreach ($requiredId in @(
    'portfolio-explorer',
    'portfolio-filters',
    'portfolio-spotlight',
    'portfolio-card-grid'
)) {
    Assert-True ($indexHtml.Contains("id=`"$requiredId`"")) "index.html missing #$requiredId"
}

Assert-True (-not $indexHtml.Contains('id="portfolio-carousel"')) 'index.html still contains retired carousel markup'
Assert-True ($indexHtml.Contains('js/media-source.js')) 'index.html missing media source resolver for homepage preview'
Assert-True (-not $indexScript.Contains('portfolio-carousel')) 'js/portfolio-index.js still contains retired carousel hooks'
Assert-True ($indexScript.Contains('data-portfolio-project')) 'js/portfolio-index.js missing project-card spotlight hook'
Assert-True ($indexScript.Contains('data-play-preview')) 'js/portfolio-index.js missing spotlight preview play hook'
Assert-True ($indexScript.Contains('data-stop-preview')) 'js/portfolio-index.js missing spotlight preview stop hook'
Assert-True ($indexScript.Contains('const hoverIntentDelay = 150;')) 'js/portfolio-index.js missing hover intent delay'
Assert-True ($indexScript.Contains('clearHoverIntent')) 'js/portfolio-index.js missing hover intent reset helper'
Assert-True ($indexScript.Contains("cardGridRoot.addEventListener('pointerenter'")) 'js/portfolio-index.js missing hover spotlight listener'
Assert-True ($indexScript.Contains("cardGridRoot.addEventListener('pointerleave'")) 'js/portfolio-index.js missing hover intent cancellation listener'
Assert-True ($indexScript.Contains("cardGridRoot.addEventListener('focusin'")) 'js/portfolio-index.js missing focus spotlight listener'
Assert-True ($indexScript.Contains("spotlightRoot.addEventListener('click'")) 'js/portfolio-index.js missing spotlight preview click handler'
Assert-True ($indexHtml.Contains('js/portfolio-index.js')) 'index.html missing portfolio index script'
Assert-True ($indexHtml.Contains('css/portfolio-ux.css')) 'index.html missing portfolio UX styles'
Assert-True ($projectHtml.Contains('data-project-page')) 'project.html missing project page marker'
Assert-True ($projectHtml.Contains('js/project-page.js')) 'project.html missing project page script'
Assert-True ($projectScript.Contains('findProjectBySlug')) 'js/project-page.js missing legacy slug resolver'
Assert-True ($projectScript.Contains('legacySlugs')) 'js/project-page.js missing legacy slug support'
Assert-True ($legacyBubblePage.Contains('project.html?slug=farm-match')) 'product_BubbleJam.html does not redirect to farm-match'
Assert-True ($legacyBubblePage.Contains('data-project-slug="farm-match"')) 'product_BubbleJam.html does not point legacy redirect at farm-match'

Write-Output 'Portfolio verification passed.'
