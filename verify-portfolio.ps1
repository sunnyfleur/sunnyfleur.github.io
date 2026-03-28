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

$root = $PSScriptRoot
$projectsPath = Join-Path $root 'projects.json'
$indexPath = Join-Path $root 'index.html'
$projectPagePath = Join-Path $root 'project.html'
$indexScriptPath = Join-Path $root 'js/portfolio-index.js'
$projectScriptPath = Join-Path $root 'js/project-page.js'
$legacyRedirectPath = Join-Path $root 'js/legacy-project-redirect.js'
$stylesPath = Join-Path $root 'css/portfolio-ux.css'
$contentGuidePath = Join-Path $root 'PORTFOLIO-CONTENT.md'

Assert-True (Test-Path -LiteralPath $projectsPath) 'Missing projects.json'
Assert-True (Test-Path -LiteralPath $projectPagePath) 'Missing project.html'
Assert-True (Test-Path -LiteralPath $indexScriptPath) 'Missing js/portfolio-index.js'
Assert-True (Test-Path -LiteralPath $projectScriptPath) 'Missing js/project-page.js'
Assert-True (Test-Path -LiteralPath $legacyRedirectPath) 'Missing js/legacy-project-redirect.js'
Assert-True (Test-Path -LiteralPath $stylesPath) 'Missing css/portfolio-ux.css'
Assert-True (Test-Path -LiteralPath $contentGuidePath) 'Missing PORTFOLIO-CONTENT.md'

$projects = Get-Content -LiteralPath $projectsPath -Raw | ConvertFrom-Json
Assert-True ($projects.projects.Count -ge 5) 'Expected at least 5 projects in projects.json'

$featuredProjects = @($projects.projects | Where-Object { $_.featured -eq $true })
Assert-True ($featuredProjects.Count -ge 2) 'Homepage carousel requires at least 2 featured projects.'

foreach ($project in $projects.projects) {
    Assert-True (-not [string]::IsNullOrWhiteSpace($project.slug)) "Project missing slug: $($project | ConvertTo-Json -Compress)"
    Assert-True (-not [string]::IsNullOrWhiteSpace($project.title)) "Project '$($project.slug)' missing title"
    Assert-True (-not [string]::IsNullOrWhiteSpace($project.summary)) "Project '$($project.slug)' missing summary"
    Assert-True (-not [string]::IsNullOrWhiteSpace($project.thumbnail)) "Project '$($project.slug)' missing thumbnail"
}

foreach ($project in $featuredProjects) {
    Assert-True (-not [string]::IsNullOrWhiteSpace($project.cardSummary)) "Featured project '$($project.slug)' missing cardSummary"
    Assert-True ($null -ne $project.homepageMeta) "Featured project '$($project.slug)' missing homepageMeta"
    Assert-True (-not [string]::IsNullOrWhiteSpace($project.homepageMeta.duration)) "Featured project '$($project.slug)' missing homepageMeta.duration"
    Assert-True (-not [string]::IsNullOrWhiteSpace($project.homepageMeta.linkLabel)) "Featured project '$($project.slug)' missing homepageMeta.linkLabel"
    Assert-True (($project.video) -or ($project.heroImage)) "Featured project '$($project.slug)' needs a video or heroImage for the homepage carousel."
}

$indexHtml = Get-Content -LiteralPath $indexPath -Raw
$projectHtml = Get-Content -LiteralPath $projectPagePath -Raw

foreach ($requiredId in @(
    'portfolio-carousel',
    'portfolio-carousel-track',
    'portfolio-carousel-prev',
    'portfolio-carousel-next',
    'portfolio-carousel-status'
)) {
    Assert-True ($indexHtml.Contains("id=`"$requiredId`"")) "index.html missing #$requiredId"
}

Assert-True ($indexHtml.Contains('js/portfolio-index.js')) 'index.html missing portfolio index script'
Assert-True ($indexHtml.Contains('css/portfolio-ux.css')) 'index.html missing portfolio UX styles'
Assert-True ($projectHtml.Contains('data-project-page')) 'project.html missing project page marker'
Assert-True ($projectHtml.Contains('js/project-page.js')) 'project.html missing project page script'

Write-Output 'Portfolio verification passed.'
