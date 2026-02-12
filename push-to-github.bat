@echo off
echo ========================================
echo Credential Store - Push to GitHub
echo ========================================
echo.

echo Step 1: Checking git status...
git status
echo.

echo Step 2: Adding all changes...
git add -A
echo.

echo Step 3: Committing changes...
git commit -m "v1.3.0: Add dynamic groups, folder delete, and security enhancements - Add dynamic groups management system (admin only) - Add folder delete functionality with safety checks - Enhance document security by proxying S3 through backend - Fix UserManager with hardcoded groups (admin, senior, junior, DevOps) - Remove AWS credentials from repository - Update documentation and changelog"
echo.

echo Step 4: Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo Done! Check above for any errors.
echo ========================================
pause
