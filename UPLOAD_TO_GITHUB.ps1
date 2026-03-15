# ============================================
# 🚀 Smart Campus - GitHub Upload Script
# ============================================
# Yeh script automatically sab kuch upload kar dega!

# Color coding for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error-Custom { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning-Custom { Write-Host $args -ForegroundColor Yellow }

Write-Info "╔════════════════════════════════════════════╗"
Write-Info "║  Smart Campus - GitHub Upload Script 🚀    ║"
Write-Info "╚════════════════════════════════════════════╝"
Write-Info ""

# Step 1: GitHub Username Lao
Write-Info "📝 GitHub Username Enter Karo:"
Write-Warning-Custom "   (Example: nawarab123 ya aapka GitHub username)"
$github_username = Read-Host "Your GitHub Username"

if ([string]::IsNullOrEmpty($github_username)) {
    Write-Error-Custom "❌ GitHub Username required!"
    exit
}

Write-Success "✓ GitHub Username: $github_username"
Write-Info ""

# Step 2: Repository Name Confirm Karo
$repo_name = "smart-campus-management-system_dynamic"
Write-Info "📦 Repository Name: $repo_name"
Write-Info "   (Isko GitHub par banaya hoga)"
Write-Info ""

# Step 3: Git Check Karo
Write-Info "🔍 Git Installation Check Kar Rahe Hain..."
try {
    $git_version = git --version
    Write-Success "✓ Git Installed: $git_version"
}
catch {
    Write-Error-Custom "❌ Git installed nahi hai!"
    Write-Error-Custom "   git-scm.com se download karo aur install karo"
    exit
}
Write-Info ""

# Step 4: Project Directory
$project_dir = "c:\Users\nawar\Downloads\App Building\smart-campus-management-system-main\smart-campus-management-system-main"
Write-Info "📂 Project Directory: $project_dir"

if (!(Test-Path $project_dir)) {
    Write-Error-Custom "❌ Project directory nahi mil rahi!"
    exit
}
Write-Success "✓ Project directory found"
Write-Info ""

# Step 5: Directory change karo
Write-Info "➡️  Project directory mein ja rahe hain..."
cd $project_dir
Write-Success "✓ Directory changed"
Write-Info ""

# Step 6: Git Initialize
Write-Info "🔧 Git Initialize Kar Rahe Hain..."
git init
Write-Success "✓ Git initialized"
Write-Info ""

# Step 7: GitHub Remote Add Karo
Write-Info "🔗 GitHub Repository Link Kar Rahe Hain..."
$repo_url = "https://github.com/$github_username/$repo_name.git"
Write-Info "   URL: $repo_url"
Write-Warning-Custom "   (Pehle GitHub par repository banao!)"
Write-Info ""

git remote add origin $repo_url
Write-Success "✓ Remote repository added"
Write-Info ""

# Step 8: Git Configuration
Write-Info "⚙️  Git Configuration Kar Rahe Hain..."
$user_email = Read-Host "📧 Apna Email Enter Karo (GitHub email)"
git config user.email "$user_email"
git config user.name "$github_username"
Write-Success "✓ Git configured"
Write-Info ""

# Step 9: .gitignore Check
Write-Info "📋 .gitignore File Check Kar Rahe Hain..."
if (!(Test-Path ".gitignore")) {
    Write-Warning-Custom "⚠️  .gitignore nahi hai, banate hain..."
    
    $gitignore_content = @"
# Python
__pycache__/
*.py[cod]
*`$py.class
*.so
.Python
env/
venv/
.venv
*.egg-info/
dist/
build/
.env

# Node
node_modules/
npm-debug.log
yarn-error.log
build/
dist/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Dependencies
*.lock
package-lock.json
yarn.lock

# Logs
logs/
*.log

# Database
*.db
*.sqlite3
*.sqlite

# Environment
.env
.env.local
.env.*.local
"@
    
    $gitignore_content | Out-File -Encoding UTF8 ".gitignore"
    Write-Success "✓ .gitignore created"
}
else {
    Write-Success "✓ .gitignore already exists"
}
Write-Info ""

# Step 10: Add All Files
Write-Info "📦 Sab Files Add Kar Rahe Hain..."
Write-Info "   (Yeh thoda time le sakta hai - wait karo...)"
git add .
Write-Success "✓ All files added"
Write-Info ""

# Step 11: Check Status
Write-Info "📊 Git Status Check Kar Rahe Hain..."
$status = git status --short
$file_count = ($status | Measure-Object -Line).Lines
Write-Info "   Total Files: $file_count"
Write-Success "✓ Status checked"
Write-Info ""

# Step 12: Commit
Write-Info "💾 Commit Kar Rahe Hain..."
$commit_message = "Initial commit: Smart Campus Management System"
git commit -m "$commit_message"
Write-Success "✓ Commit successful"
Write-Info ""

# Step 13: Branch Name
Write-Info "🌿 Main Branch Setup Kar Rahe Hain..."
git branch -M main
Write-Success "✓ Branch renamed to main"
Write-Info ""

# Step 14: Push to GitHub
Write-Warning-Custom "⚠️  Push Karne Ke Liye GitHub Authentication Required!"
Write-Warning-Custom "    Browser window khule ga - GitHub login karo!"
Write-Info ""
Write-Info "⏳ Pushing to GitHub..."
Write-Info "   (Internet connection ensure karo!)"

try {
    git push -u origin main
    Write-Success "✓ Push successful!"
}
catch {
    Write-Error-Custom "❌ Push failed!"
    Write-Error-Custom "   Reasons:"
    Write-Error-Custom "   1. Repository GitHub par nahi banaya?"
    Write-Error-Custom "   2. Internet connection issue?"
    Write-Error-Custom "   3. GitHub credentials wrong?"
    Write-Info ""
    Write-Info "   Manual push ke liye:"
    Write-Info "   git push -u origin main"
    exit
}
Write-Info ""

# Step 15: Final Status
Write-Info "🎉 Upload Complete!"
Write-Success "════════════════════════════════════════════"
Write-Success "✓ Project successfully uploaded to GitHub!"
Write-Success "════════════════════════════════════════════"
Write-Info ""

# Show final URLs
Write-Info "📱 Your GitHub URLs:"
Write-Success "   Repository: https://github.com/$github_username/$repo_name"
Write-Success "   Frontend: https://github.com/$github_username/$repo_name/tree/main/frontend"
Write-Success "   Backend: https://github.com/$github_username/$repo_name/tree/main/backend"
Write-Info ""

# Next Steps
Write-Info "📋 Next Steps:"
Write-Info "   1. Vercel.com par jaao"
Write-Info "   2. 'New Project' → 'Import Git Repository'"
Write-Info "   3. Ab yeh repository import kar sakte ho!"
Write-Info "   4. GitHub login karo → repository select karo"
Write-Info "   5. Automatic deployment! ✓"
Write-Info ""

Write-Success "🎊 Congratulations! Ab deployment ke liye ready ho!"
Write-Info ""

# Pause
Read-Host "Press Enter to close"
