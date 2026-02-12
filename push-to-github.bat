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
git commit -m "v1.3.0: Complete dynamic groups system with automatic cleanup - Fully dynamic groups in UserManager, DocumentManager, FolderManager - Automatic permission cleanup when groups are deleted - Smart permission display (hide empty permissions) - Folder delete functionality - Document security enhancements - All components now synchronized with Groups table"
echo.

echo Step 4: Pushing to GitHub...
git push origin main
echo.

echo ========================================
echo Done! Check above for any errors.
echo ========================================
pause
